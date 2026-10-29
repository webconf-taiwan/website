# WebConf Taiwan 2023

url: https://2023.webconf.tw

## Project Setup

1. Clone this project
2. run `npm install` to install needed packages.
3. run `npm run dev` to launch a local development server

maintained by hi@webconf.tw, all PRs are welcome :)

## Cloudflare Workers

The site is a Vite-built Vue app. Wrangler serves the generated `dist/` files
as static assets; client-side pages use hash URLs such as `/#/agenda`.

```sh
npm ci
npm run deploy
```

`npm run deploy` builds the site before deploying it. The Worker is named
`webconf-2023` and is available at `https://webconf-2023.cann.workers.dev`.
The custom domain `2023.webconf.tw` is declared in `wrangler.jsonc` and is
already bound to the Worker.

推送 `2023` 分支後，GitHub Actions 會執行 `npm ci`、`npm run build`，再部署 Worker。首次使用前，請在 GitHub repository 的 Actions secrets 設定 `CLOUDFLARE_ACCOUNT_ID` 與 `CLOUDFLARE_API_TOKEN`。API token 需有目標 Cloudflare 帳戶的 Workers 編輯權限。
