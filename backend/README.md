# webconf-2026-api

Hono + D1 後端，跟根目錄的 Nuxt 網站是**同一個 git repo、不同 Cloudflare Worker**，各自獨立部署，互不影響。

## 首次設定

```bash
cd backend
yarn install

# 建立實體 D1 資料庫（只需執行一次）
yarn db:create
```

`db:create` 會回傳 `database_id`，貼到 `wrangler.jsonc` 裡 `d1_databases[0].database_id` 的 TODO 位置。沒貼的話 `dev` / `deploy` 會直接報錯，不會誤連到別的資料庫。

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
