# Webconf

WebConf Taiwan 2026 官網。首頁是「一鏡到底」：整頁只有一群粒子（自製的 WebGPU Particle Life 引擎），沿著捲動在幾個關鍵影格之間連續變形。

## 技術棧

- [Nuxt 4](https://nuxt.com/)（SSR、`app/` 目錄結構）
- [Vue 3](https://vuejs.org/)
- [Tailwind CSS 3](https://tailwindcss.com/) + 設計 token（`text-zh-*`、`brand` / `gray` / `txt`）
- [Pinia](https://pinia.vuejs.org/)
- [VueUse](https://vueuse.org/)
- [GSAP](https://gsap.com/) + ScrollTrigger
- [Lenis](https://lenis.darkroom.engineering/)（滑順滾動，GSAP ticker 驅動）
- [Bootstrap Icons](https://icons.getbootstrap.com/)（SVG sprite）
- [class-variance-authority](https://cva.style/docs)
- 自製粒子引擎 `public/particle-kit/`（WebGPU；沒有 WebGPU 時退回 canvas2D）
- [MediaPipe Tasks Vision](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker)（首頁互動彩蛋的手勢、綠幕）
- [@nuxtjs/seo](https://nuxtseo.com/)、[@nuxt/fonts](https://fonts.nuxt.com/)
- 部署：Cloudflare Workers（SSR），見 [docs/deploy-cloudflare.md](docs/deploy-cloudflare.md)

## 專案結構

```
webconf/
├── app/
│   ├── app.vue               # 根元件（SEO、Layout、svg sprite）
│   ├── error.vue             # Nuxt 錯誤頁
│   ├── layouts/default.vue   # Header / Footer / portal 層級
│   ├── pages/                # 路由頁面（index 是一鏡到底首頁；agenda、about、people…）
│   ├── components/
│   │   ├── Atom/             # Button、Icon、Image、Video
│   │   ├── Common/           # Plate、ChapterNav、Agenda*…
│   │   ├── Home/             # 首頁各區塊、粒子場、人像、裝飾圖
│   │   ├── Layout/Page/      # Header、Footer、Loading、Transition
│   │   └── OgImage/、SEO.vue、Error.vue
│   ├── composables/          # useFadeIn、useParticle*、useSiteData、useViewportMode…
│   ├── constants/
│   │   ├── routes.js         # 路由常數
│   │   └── data/*.json       # 全站內容（沒有後台，見「內容資料」）
│   ├── utils/                # particleFieldLooks、particleTiers、fetch…
│   ├── plugins/              # $gsap、$ScrollTrigger、$lenis
│   ├── stores/all.js         # 全域 Pinia store
│   └── assets/               # Tailwind CSS、設計 token、Bootstrap Icons
├── public/
│   ├── particle-kit/         # 粒子引擎（零依賴 IIFE，無 build step）
│   ├── speakers/、source_images/、figma/、sponsors/…   # 圖片（.webp + 同名 .png，見「圖片規範」）
│   └── favicon、manifest
├── docs/                     # 實作說明（粒子效能、部署、點雲原理…）
├── scripts/                  # postinstall 用（複製 MediaPipe wasm）
└── nuxt.config.ts
```

## 快速開始

```bash
# 安裝依賴
yarn install

# 複製環境變數
cp .env.template .env

# 開發
yarn dev
```

瀏覽器開啟 [http://localhost:3000](http://localhost:3000)。

> dev server 開很久（熱更新累積）可能因 `JavaScript heap out of memory` 自己崩掉，
> 症狀是突然連不上 localhost:3000。用大一點的堆重開即可：
> `NODE_OPTIONS=--max-old-space-size=8192 yarn dev`

## 環境變數

| 變數 | 說明 |
|------|------|
| `APP_TITLE` | 網站標題 |
| `APP_DESC` | 網站描述 |
| `APP_DEFAULT_LANG` | `<html lang>`、og:locale |
| `APP_URL` | 網站完整網址 |
| `APP_BASE_URL` | Nuxt `app.baseURL`（通常 `/`） |
| `APP_API` | API base URL（SSR 私有 / 瀏覽器 public） |
| `WEB_SEARCH` | `YES` 允許搜尋引擎索引，否則 `noindex` |
| `SHOW_CONSOLE_LOG` | `YES` 保留 `console.log`，production build 否則移除 |

## 指令

```bash
yarn dev       # 開發伺服器
yarn build     # production build
yarn preview   # 預覽 build 結果
yarn generate  # 靜態產生
```

`yarn install` 之後會自動跑 `nuxt prepare`，並把 MediaPipe 的 wasm 複製到 `public/mediapipe/wasm/`（`postinstall`；該目錄已 gitignore，不進版控）。

## 內容資料

全站內容是**靜態 JSON**（主辦方不做後台），放在 `app/constants/data/`，由 `useSiteData` 讀取。改內容就是改檔案、重新部署。

| 檔案 | 內容 |
|------|------|
| `index.json` | 首頁各區塊的版面文案（hero、about、venue、ticket、code of conduct…） |
| `speakers.json` | 講者名單 |
| `sponsors.json` | 贊助商 |
| `faq.json` | FAQ |
| `agenda.json` | 議程 |
| `global.json` | Header / Footer |

講者、贊助商、FAQ 各自是完整名單，首頁只挑 `show_on_home: true` 的出來（要把某人從首頁收起來就改這個值，不用把資料剪掉）。

講者欄位：

| 欄位 | 說明 |
|------|------|
| `id`、`name`、`org`、`role`、`tag`、`skills` | 顯示文字；有第二個身分時用 `extra: { org, role }` |
| `portrait` | 人像原圖（`/speakers/speaker-NN.webp`），**粒子取樣的來源** |
| `portrait_static` | 手機靜態圖（`/speakers/speaker-particle-NN.webp`），見下面「首頁與粒子系統」 |
| `show_on_home` | 是否出現在首頁 |

## 首頁與粒子系統

以 1024px 為界（`useViewportMode`，與 Tailwind 的 `lg` 對齊）：

| | ≥ 1024px（桌機） | < 1024px（手機／平板） |
|---|---|---|
| 粒子場 | `HomeField`：一張 fixed canvas 貫穿整頁，沿捲動在六個影格間連續變形 | `HomeMobileField`：只服務 hero 與票券區 |
| PL.II（About）、PL.IV/V（Venue、FAQ） | 粒子畫在背後那張 canvas 上 | 沒有 canvas，底色不透明 |
| PL.III（Speaker）人像 | 是那張 canvas 的一個影格 | 觀景框裡的 `HomeSpeakerPortrait` |
| 裝飾圖 | 無 | `HomeDeco`（見下） |

**效能分級**：`useParticleQuality` 先用 navigator 訊號決定開場檔位，再在執行期量幀時間，撐不住就往下降（只降不升）。檔位表在 `app/utils/particleTiers.js`，原理與實測見 [docs/particle-performance.md](docs/particle-performance.md)。

**人像靜態圖（只限手機，視窗 < 768px）**：`SpeakerPortrait` 只有在手機「夠好」（檔位還在滿檔、有 WebGPU）時才跑粒子；沒有 WebGPU、有省流量等負面訊號、或執行期被降檔，就改用 `portrait_static` 的靜態圖，完全不載粒子套件、不建引擎。換人動畫與觀景框線同一拍（淡出並由中心縮小 → 換圖 → 由中心放大並淡入）。平板與窄桌機視窗一律維持粒子。

**暫停**：引擎暫停時 canvas 保留最後一幀。手機版的首頁粒子場只有在 hero 或票券區（IntersectionObserver）才跑，離開就暫停；人像那張只在觀景框進畫面時跑。兩種版面都會在切分頁、閒置（桌機 10 秒、觸控 60 秒）時暫停；桌機那張貫穿整頁的 canvas 則是全程運行。

**除錯網址參數**（正式站也能用，值有白名單，打錯字就當沒帶）：

| 參數 | 說明 |
|------|------|
| `?hero-animation=<id 或編號>` | 指定 hero 效果：`cobalt-cells`、`biolum-drift`、`parchment-herbarium`、`fluoro-swarm`、`coral-membrane`；不帶則隨機 |
| `?venue-effect=plasma` | PL.IV 場地效果，預設 `cellular` |
| `?tier=0~3` | 強制手機效能檔位（3 = 滿檔；小於 3 時手機寬度下人像走靜態圖） |
| `?fps=1` | 顯示引擎自帶的 fps overlay |
| `?tool=1` | 開啟粒子調參面板 |

### 手機／平板裝飾圖

`<HomeDeco>`（`app/components/Home/Deco.vue`）放在 About、Venue、FAQ 底部的靜態點畫圖：從下一區的分隔線後面「探出來」，桌機不顯示（`lg:hidden`）。

- 進場：從右邊（或下方）滑入 + 淡入，之後跟著捲動做視差（往下沉一點，被分隔線遮住）
- 定位、裁切、`bottom` 要填多少、三層動畫為什麼不能疊在同一個元素，都寫在元件檔頭
- ⚠️ 呼叫端的區塊要加 `isolate`（見下面「Tailwind 注意事項」）

## 圖片規範

**所有點陣圖用 `.webp`，而且每個 `.webp` 旁邊必須有同名 `.png` 當 fallback**（約定：`/x/foo.webp` 一定有 `/x/foo.png`）。不支援 WebP 的裝置會自動退回 PNG：

- 粒子取樣器（`public/particle-kit/particle-image.js` 的 `loadImage`）：WebP 載入失敗就換 `.png`
- 靜態人像（`SpeakerPortrait` 的 `resolveImage`）、裝飾圖（`<picture>`）：同上

新增圖片時兩個檔都要放。`favicon`、`apple-touch-icon` 維持 PNG / SVG。

轉檔用 `cwebp`（`brew install webp`）。**不要縮小尺寸**（會重採樣、動到點畫的質感）：

```bash
# 平滑的照片（speaker-NN、side…）
cwebp -q 90 -alpha_q 100 -m 6 -sharp_yuv in.png -o in.webp

# 細顆粒的點畫圖（speaker-particle-NN、venue、faq、home-deco-*）
cwebp -near_lossless 40 -z 9 -alpha_q 100 -m 6 in.png -o in.webp
```

為什麼點畫圖要用 near-lossless：有損 WebP 的色度取樣會把「黑底上的彩色顆粒」壓到 36dB 以下，調高 `-q` 也沒用。`-alpha_q 100` 一律要給（取樣器靠透明度判斷主體邊界）。轉完拿黑底合成後的 PSNR 對原圖比，目標 ≥ 43dB。

## 進場動畫（`data-fade`）

```html
<h2 data-fade="in">標題</h2>
```

```js
// 每個區塊自己呼叫一次（傳 root 的 ref，掛載與清理都交給它）
const sectionRef = ref(null)
useFadeIn(sectionRef, { step: 0.12 })
```

- 標了 `data-fade="in"` 的元素，**每一個各自**在自己的頂邊進到視窗 **90%** 處時淡入（`ScrollTrigger.batch`）；同時進來的會自動 stagger。跟 case-2026-ntcart / focasa 的 `aosFadeIn` 是同一套做法
- 預設只播一次；`{ once: false }` 進出視窗都重播
- 初始的 `opacity: 0` 是 JS 設的、不是寫在 CSS：JS 沒跑起來時文字仍然看得見。`prefers-reduced-motion` 時不做動畫、直接顯示
- 內容換掉但區塊沒離開畫面（例如 FAQ 換頁）用 `fadeInNow`
- ⚠️ 不要把 `data-fade` 標在「自己已經用 transform / 行內 `opacity` 做動畫」的元素上（gsap 會互相蓋掉），改包一層外層再標

完整用法與原理見 [`app/composables/useFadeIn.js`](app/composables/useFadeIn.js) 檔頭。

## Tailwind 注意事項

- **z-index 是自訂刻度**（`tailwind.config.cjs`）：只有 `-10`、`0`~`5`、`25`、`50`、`75`、`100`、`auto`。**沒有 `z-10`**，寫了也不會產生任何 CSS（不會報錯）。要任意值用 `z-[500]`
- 因此 `relative z-10` **不會**建立層疊上下文。需要層疊上下文（例如讓子層用 `z-[-1]` 藏在文字後面）請用 `isolate`

## 核心元件

| 元件 | 說明 |
|------|------|
| `AtomButton` | CVA 樣式按鈕，支援 `href` 轉 `NuxtLink` |
| `AtomIcon` | SVG sprite icon，`<AtomIcon name="search" />` |
| `AtomImage` | 圖片元件（loading / error 狀態） |
| `AtomVideo` | 原生 video / YouTube |
| `CommonPlate` | 區塊的卷號標籤（`PL. I  III.  SPEAKER`）與分隔線 |
| `HomeDeco` | 手機／平板裝飾圖（進場 + 視差），見上面 |
| `SEO` | `useSeoMeta` 封裝，全站或單頁覆寫 |
| `Error` | 錯誤畫面元件 |
| `LayoutPageHeader` | 頂部導覽 |
| `LayoutPageFooter` | 頁尾 |
| `LayoutPageLoading` | 全頁蓋板 loading |

元件採 Nuxt 自動匯入，無需手動 `import`。

## Pinia

```js
const allStore = useAllStore()
const { count, windowWidth, pageLoading } = storeToRefs(allStore)

allStore.increment()
```

## API 請求

`utils/fetch.js` 提供命令式 `$fetch` 封裝，依 HTTP status 判斷成功與否：

```js
const { success, statusCode, data, error } = await fetchFn({
  apiPath: '/posts',
  query: { page: 1 },
  token: 'your-token'
})

if (!success && statusCode === 404) {
  // 處理找不到
}
```

SSR 走 `config.APP_API`，瀏覽器端走 `config.public.APP_API`。

## GSAP

```js
const { $gsap, $ScrollTrigger } = useNuxtApp()

onMounted(() => {
  $gsap.from('.hero', { opacity: 0, y: 32, duration: 0.8 })
})
```

## Lenis

`app/plugins/lenis.client.js` 會自動建立滑順滾動實例，並用 GSAP ticker 驅動：

```js
const { $lenis } = useNuxtApp()

$lenis.scrollTo('#target')
```

Modal / drawer 內需要阻止 Lenis 滾動穿透時，加上：

```html
<div data-lenis-prevent>
  ...
</div>
```

## Layout Portal 層級

`app/layouts/default.vue` 預留 Teleport 掛載點：

| ID | 用途 | z-index |
|----|------|---------|
| `#subField` | dropdown / tooltip | `z-[500]` |
| `#cookieField` | cookie banner | `z-[1000]` |
| `#sideField` | drawer / sidebar | `z-[1001]` |
| `#modalsField` | modal | `z-[1002]` |
| `#loadingField` | 全頁 loading | `z-[1005]` |

## Icons

Icon 來自 Bootstrap Icons，統一 `currentColor`。新增 icon：

```bash
cp node_modules/bootstrap-icons/icons/heart.svg app/assets/icons/
```

## 文件

`docs/` 是各功能的實作說明（為什麼這樣做、踩過的坑、實測數字）：

| 文件 | 內容 |
|------|------|
| [particle-performance.md](docs/particle-performance.md) | 手機端粒子效能：成本模型、分級降載、人像靜態圖模式、圖片格式 |
| [point-cloud-effect.md](docs/point-cloud-effect.md) | 點雲視覺效果原理筆記（Particle Life 引擎） |
| [living-particle-motion.md](docs/living-particle-motion.md) | 讓粒子場「活起來」的動態效果要領 |
| [deploy-cloudflare.md](docs/deploy-cloudflare.md) | 部署到 Cloudflare Workers（SSR） |
| [greenscreen.md](docs/greenscreen.md) | 虛擬綠幕（瀏覽器即時換背景） |
