# webconf-2026-api

Hono + D1 後端，跟根目錄的 Nuxt 網站是**同一個 git repo、不同 Cloudflare Worker**，各自獨立部署，互不影響。

## 首次設定

```bash
cd backend
yarn install

# 建立實體 D1 資料庫（只需執行一次）
yarn db:create
```

`db:create` 會回傳 `database_id`，貼到 `wrangler.jsonc` 裡 `d1_databases[0].database_id`。沒貼的話 `dev` / `deploy` 會直接報錯，不會誤連到別的資料庫。

## 資料庫歸屬

現有的 `database_id`（`webconf-2026-api-db`）是建在 gui 自己的 Cloudflare 帳號底下，純開發用，本機 `--local` 開發完全不受影響。

前端網站目前是掛在開發夥伴的 Cloudflare 帳號部署，所以正式上線前要先決定 D1／這個 Worker 最終要留在哪個帳號：

- **搬到夥伴的帳號**：現有 D1 建在別的帳號，其他人 `git pull` 下來即使看得到 `database_id`，也連不上（D1 存取權綁帳號，不是綁設定檔），需要重新在目標帳號 `wrangler d1 create` 一次、把資料匯過去。
- **把兩人都加進同一個共用帳號**：Cloudflare Dashboard → Account Home → Manage Account → Members 互相邀請即可，不用搬資料庫。

哪個方案都不會動到已經寫好的程式碼或 schema，決定好了再處理即可，不急。

## 開發

```bash
yarn dev          # 本機起 Worker，D1 用 wrangler 內建的本機 SQLite
yarn typecheck     # tsc --noEmit
```

## 部署

```bash
yarn deploy
```

首次部署後會拿到 `*.workers.dev` 網址；要接自訂網域（例如 `api.webconf2026.jordanttc.com`）的話，打開 `wrangler.jsonc` 裡註解掉的 `routes` 區塊。

若之後要接 Cloudflare Workers Builds 自動部署，記得在 Cloudflare dashboard 另外新建一個 Workers Builds 專案、指向同一個 repo，但把 **Root directory** 設成 `backend`（根目錄的 Nuxt 網站是另一個獨立的 Workers Builds 專案）。

## 資料庫變更

見 [`migrations/README.md`](./migrations/README.md)。

## 目錄結構

```
backend/
├── src/
│   ├── index.ts       # Hono app 進入點，掛各資源的路由
│   └── routes/         # 依資源拆檔，一個資源一支
├── migrations/          # D1 schema migrations（wrangler d1 migrations 產生）
├── wrangler.jsonc        # Worker 設定，含 D1 binding
└── package.json
```
