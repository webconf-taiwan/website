## WebConf.TW

### 2013 網站部署

這個分支使用 Cloudflare Workers Static Assets，沒有伺服器程式或建置步驟。

```sh
npm ci
npm run dev
npm run deploy
```

`wrangler.jsonc` 將網站根目錄作為靜態檔來源，並保留 `.html` 網址；`_redirects` 讓 `/` 顯示 `index.html`。`.assetsignore` 排除 Git、部署設定與套件，避免公開這些檔案。自訂網域為 `2013.webconf.tw`，由 Cloudflare Workers 管理。

推送 `2013` 分支後，GitHub Actions 會安裝套件並部署 Worker；這個純靜態網站不需建置。首次使用前，請在 GitHub repository 的 Actions secrets 設定 `CLOUDFLARE_ACCOUNT_ID` 與 `CLOUDFLARE_API_TOKEN`。API token 需有目標 Cloudflare 帳戶的 Workers 編輯權限。
