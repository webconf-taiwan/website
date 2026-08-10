# 部署到 Cloudflare Workers（Nuxt 4 SSR）— 實作說明

> 相關檔案：`wrangler.jsonc`（根目錄）、`nuxt.config.ts` 的 `nitro` 區塊、`.gitignore`。
> 正式網域 `webconf2026.jordanttc.com`，production 分支 `deploy/2026-main`。

以 **Cloudflare Workers**（不是 Pages）跑真正的 SSR，設定用 **`wrangler.jsonc` 進版控**，
由 **Workers Builds（Git 整合）** 自動部署。全程不需要在本機打 wrangler 指令。

---

## 1. 為什麼是 Workers 而不是 Pages / 靜態

先說實話：**目前這個 app 用 `nuxt generate` 產出的結果幾乎等價。** 全 repo 沒有 `server/` 目錄、
沒有任何 `useFetch`/`useAsyncData`，`app/pages/people.vue` 的 `$fetch` 也都在 `onMounted` 裡（client
only）。所以今天上 Workers 並不會比靜態多渲染任何東西。

選 Workers 的理由是**之後**：`app/utils/fetch.js` 已經寫好 SSR/CSR 分流的 base URL 選擇
（`import.meta.server ? config.APP_API : config.public.APP_API`）與 WordPress 的 `preview_id`
慣例。等內容接上 CMS，這套要能在伺服器端跑才有意義 —— 那時候不用再搬一次家。

至於 **Pages vs Workers**：Cloudflare 已經把 Workers 當主線在推，Pages 進入維護模式，
新專案沒有理由選 Pages。

---

## 2. `wrangler.jsonc` 和 Git 自動部署不衝突（很多人誤會這點）

直覺會以為「寫 `wrangler.jsonc` = 要用 CLI 部署」。實際上相反 ——
**Workers Builds 就是去讀 repo 裡的 `wrangler.jsonc`**，CLI 只是同一份設定的另一個入口。

build 時的實際流程（nitropack 2.13.4，`node_modules/nitropack/dist/presets/cloudflare/utils.mjs`）：

1. `writeWranglerConfig()` 用 `findNearestFile` 讀根目錄的 `wrangler.jsonc`
2. 跟 Nitro 算出來的 `main` / `assets` 用 `defu` 合併
   （順序 `defu(overrides, ctxConfig, userConfig, defaults)` — 你寫的值贏過 Nitro 的預設）
3. 產出 `.output/server/wrangler.json`
4. 再寫 `.wrangler/deploy/config.json` 指向它 —— 這是 Cloudflare 的
   **redirected configuration** 機制
5. 之後在根目錄跑 `npx wrangler deploy`（Workers Builds 的預設 deploy command）就會自動跟著走

### ⚠️ `main` 和 `assets` 不要寫進 `wrangler.jsonc`

只有 Nitro 知道 build 完的路徑。你寫了會被強制覆蓋並跳警告。它會自己填：

```json
"main":   "index.mjs",
"assets": { "binding": "ASSETS", "directory": "../public" }
```

---

## 3. 設定檔

### `nuxt.config.ts`

```ts
nitro: {
  preset: 'cloudflare_module',
  cloudflare: {
    deployConfig: true,
    nodeCompat: true
  }
}
```

- **`cloudflare_module`** — Workers + static assets 的 preset，輸出
  `.output/server/index.mjs` + `.output/public/`。
- **`deployConfig: true`** — 關鍵。`writeWranglerConfig()` 只在它為 true 時才跑。在 Cloudflare CI
  裡 std-env 會偵測環境自動打開，但**本機預設是關的**。明確寫死，本機 build 才驗證得到部署設定
  產不產得出來，否則問題只會在 CI 才爆。
- **`nodeCompat: true`** — 自動補上 `nodejs_compat` + `no_nodejs_compat_v2` flags。

### `wrangler.jsonc`

`name` 決定預設網址 `webconf-2026.<子網域>.workers.dev`。`routes` 裡的 `custom_domain: true`
會在 deploy 當下自動於 `jordanttc.com` zone 建立 proxied CNAME 並簽憑證 —— **DNS 不用手動加記錄**。

### `package.json`

`wrangler` 進 devDependencies（目前 4.120.0）。不釘的話 Workers Builds 的 `npx wrangler deploy`
每次抓最新版、版本無聲漂移；順便讓 `wrangler.jsonc` 的 `$schema` 在編輯器裡生效。

### `.gitignore`

加 `.wrangler`（build 產生的 deploy config，不進版控）。`wrangler.jsonc` 本身**要**進版控。

---

## 4. 🔥 最大的地雷：環境變數必須是「build 時」變數

`nuxt.config.ts` 是在 **build 階段**讀 `process.env`，不是 runtime：`app.baseURL`、`app.head` 的
title / description / lang / og:locale / robots、`runtimeConfig` 的預設值，全部都是。

而 `.env` 有進 `.gitignore`，Cloudflare 拿不到。所以這些一定要設在 Workers Builds 的
**build variables**，跟 Worker 的 runtime variables 是**兩個不同的地方**。

### 特別是 `APP_BASE_URL`

漏設的話 `app.baseURL` 會變成**字串 `"undefined"`**，Nitro 的 publicDir 變
`.output/public/undefined/`，而 assets directory 是用 baseURL 的路徑段數反推的
（`utils.mjs` 裡的 `"..".repeat(...)`）—— 結果是**整站 404，而且 build 完全不報錯**。
這是最難查的一種壞法。build 完先確認 `.output/public/` 底下沒有 `undefined/` 目錄。

| 變數 | 值 | 備註 |
|---|---|---|
| `APP_BASE_URL` | `/` | **漏了整站 404** |
| `APP_URL` | `https://webconf2026.jordanttc.com` | og / canonical |
| `APP_TITLE` | `Webconf` | |
| `APP_DESC` | （正式描述） | |
| `APP_DEFAULT_LANG` | `zh-TW` | |
| `APP_API` | `https://webconf2026.jordanttc.com/api` | 目前沒人呼叫，先佔位 |
| `WEB_SEARCH` | `NO` | 上線前保持 `NO` → `noindex, nofollow`；開站當天改 `YES` |
| `SHOW_CONSOLE_LOG` | `NO` | 讓 vite esbuild 清掉 `console.log` / `console.info` |
| `NODE_VERSION` | `22` | 對齊本機 v22.18.0 |
| `YARN_VERSION` | `1.22.22` | **不設會 install 失敗**，見下 |

### ⚠️ Yarn 版本：不釘會在 Install 階段就掛掉

Cloudflare build image 預設給 **Yarn 4.x**，但本專案的 `yarn.lock` 是 **v1 格式**
（檔案第二行 `# yarn lockfile v1`）。Yarn 4 會自動「幫你升級」lockfile，然後在 CI 的
immutable 模式下拒絕這個改動，自相矛盾地失敗：

```
YN0087: Migrated your project to the latest Yarn version 🚀
YN0028: The lockfile would have been modified by this install, which is explicitly forbidden.
Failed: error occurred while installing tools or dependencies
```

兩道保險都要做：

1. build variable `YARN_VERSION=1.22.22`
2. `package.json` 的 `"packageManager": "yarn@1.22.22"` —— 讓這個資訊留在 repo 裡，
   不是只存在於某個人的 Dashboard 設定中

驗證方式（本機）：`yarn install --frozen-lockfile` 要能過。

之後若要在**不重 build** 的情況下換 API 位置，可在 `wrangler.jsonc` 的 `vars` 加
`NUXT_APP_API` / `NUXT_PUBLIC_APP_API` 覆蓋 `runtimeConfig`。現階段不需要。

---

## 5. repo 權限：協作者沒辦法自己接 GitHub

`webconf-taiwan/website` 在別人的 organization 底下。Cloudflare 走的是 **GitHub App 安裝**，
而 GitHub App 是裝在 **organization 層級**的 —— 一般協作者按不下去，只能送出 **Request**
等 org owner 核准。

| 做法 | SSR | 自動部署 | 卡點 |
|---|---|---|---|
| A. 請 org owner 核准 Cloudflare GitHub App | ✅ | ✅ | 要等別人 |
| **B. 自己帳號開 private repo 當 deploy remote** | ✅ | ✅ | 要自己同步 |
| C. Dashboard 建空 Worker + 本機 `wrangler deploy` | ✅ | ❌ | 每次手動 |

**目前採 B。** 不是 fork，是多一個部署專用 remote：

```bash
git remote add deploy git@github.com:<你的帳號>/webconf-2026.git
git push deploy <來源分支>:deploy/2026-main
```

`webconf-taiwan/website` 仍是唯一的真實來源，只是多推一份到自己的 private repo 給 Cloudflare 看。
Workers Builds 完全支援 private repo。之後要交接時，請 org owner 裝 App、把 Cloudflare 指回官方
repo 即可，**`wrangler.jsonc` 一個字都不用改**。

> Dashboard 的 **Upload your static files** 不要選 —— 那只上傳靜態資產、不含 Worker script，
> 等於放棄 SSR。**Start with Hello World!** 也不建議當起手式：會先產生一個沒有 `wrangler.jsonc`
> 的部署版本，之後接 git 反而多一層要對齊的狀態。直接走 **Continue with GitHub**。

---

## 6. Dashboard 操作

1. **Compute (Workers) → Create → Import a repository** → 授權 GitHub → 選 repo
2. **Build 設定**
   - Build command: `yarn build`
   - Deploy command: `npx wrangler deploy`
   - Root directory: `/`
   - install 是自動的，會跑 `postinstall`（`nuxt prepare && node scripts/copy-mediapipe-wasm.mjs`）。
     **這步不能省** —— `public/mediapipe/wasm/` 有進 `.gitignore`，那 32MB 的 wasm 只存在於 build 當下。
3. **Settings → Build → Branch control** → production branch 從 `main` 改成 **`deploy/2026-main`**
   - 非 production 分支預設跑 `wrangler versions upload` 產 preview URL；不要就在同一頁關掉
4. **Settings → Build → Variables** → 設上表那 9 個
5. 第一次部署後先開 `webconf-2026.<子網域>.workers.dev` 確認能動
6. 自訂網域已經寫在 `wrangler.jsonc` 裡，deploy 當下自動生效；到 DNS 分頁確認 `webconf2026`
   的 proxied CNAME 出現即可（憑證通常幾分鐘內好）

---

## 7. 已知風險

- **22.8MB 的 wasm 貼著上限。** `.output/public/_nuxt/ort-wasm-simd-threaded.*.wasm`，來自
  `onnxruntime-web@1.21.0`（被 `app/pages/people.vue` 的 `@imgly/background-removal` 拉進來）。
  Cloudflare **單檔上限 25 MiB**，只剩約 9% 餘裕 —— `onnxruntime-web` 一升版就可能直接部署失敗。
  版本現在是釘死的，**不要動**。
- **檔案數** 59 個，免費方案上限 20,000，沒問題。
- **不要加 COOP / COEP headers。** `people.vue` 的 `@imgly/background-removal` 沒有設
  `publicPath`，模型是從 imgly 的 CDN 抓的；字型也是外部載入。加了 `require-corp` 兩者都會壞。
  （這是 `@imgly` 和 `@mediapipe` 的又一個差別 —— 後者 wasm/模型自架，見 `greenscreen.md`。）
- **Worker script 大小**：免費方案 3 MiB gzip、付費 10 MiB。因為 `@imgly` / `@mediapipe` 都是在
  `onMounted` 裡動態 import，理論上只會進 client bundle；build 後仍要確認 `.output/server` 沒被汙染。
- **`_headers`** Workers 原生支援，Nitro 會依 `routeRules` 產生 `.output/public/_headers`。
  `nuxt.config.ts` 沒有自訂 `routeRules`，但 Nuxt 內建了 `/_nuxt/*` 的
  `cache-control: public, max-age=31536000, immutable`，所以產出的是那三條而不是空檔 —— 正常。

---

## 8. 驗證

### 本機 build

```bash
APP_BASE_URL=/ APP_URL=https://webconf2026.jordanttc.com \
APP_TITLE=Webconf APP_DEFAULT_LANG=zh-TW WEB_SEARCH=NO SHOW_CONSOLE_LOG=NO \
yarn build
```

要看到：

```bash
cat .output/server/wrangler.json       # 含 main / assets / nodejs_compat
cat .wrangler/deploy/config.json       # 指向上面那份
ls .output/public/                     # 不能有 undefined/ 目錄
find .output/public -size +20M         # 確認沒有檔案逼近 25 MiB
du -sh .output/server                  # server bundle 沒被 wasm 汙染
```

### 本機預覽

```bash
npx wrangler dev    # 會自動跟著 .wrangler/deploy/config.json 走
```

### 線上

- `curl -s https://webconf2026.jordanttc.com | head -50` — HTML 裡要看得到實際內容
  （證明是 SSR，不是空殼）
- 逐頁開 `/`、`/about`、`/contact`、`/people`、`/greenscreen`
- `/people` 與 `/greenscreen` 開 DevTools Network，確認 wasm / 模型載得到、Console 沒錯
- 上線前確認 response 裡有 `noindex, nofollow`

---

## 9. 排查對照表

| 症狀 | 原因 |
|---|---|
| Install 階段 `YN0028: The lockfile would have been modified` | 沒釘 `YARN_VERSION=1.22.22`，CI 用了 Yarn 4 去讀 v1 lockfile |
| 全站 404、資產路徑多一層 `/undefined/` | build variables 漏了 `APP_BASE_URL=/` |
| `<title>` 顯示 `undefined` | 漏了 `APP_TITLE`（其他 `APP_*` 同理） |
| `<html>` 沒有 `lang`、`og:locale` 消失 | 漏了 `APP_DEFAULT_LANG=zh-TW` |
| favicon / manifest 抓不到，href 是 `//favicon.ico` | `APP_BASE_URL` 的結尾斜線和路徑的開頭斜線疊成 `//`，被當成 protocol-relative URL（`https://favicon.ico/`）。`nuxt.config.ts` 用 `assetBase` 去尾斜線處理，不要改回 `process.env.APP_BASE_URL` 直接拼 |
| 部署失敗，訊息提到單檔大小 | ORT wasm 超過 25 MiB，檢查 `onnxruntime-web` 是否被升版 |
| build 成功但沒有部署設定 | `nitro.cloudflare.deployConfig` 沒開 |
| `main`/`assets is overridden` 警告 | `wrangler.jsonc` 裡誤寫了 `main` 或 `assets`，刪掉 |
| `/people` 去背失敗但本機正常 | imgly CDN 被擋，或誤加了 COEP header |
| push 了卻沒觸發部署 | Branch control 還指著 `main`，不是 `deploy/2026-main` |
| 搜尋引擎收錄了測試站 | `WEB_SEARCH` 不是 `NO` |
