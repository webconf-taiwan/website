# Webconf

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

## 專案結構

```
webconf/
├── app/
│   ├── app.vue              # 根元件（SEO、Layout、svg sprite）
│   ├── error.vue            # Nuxt 錯誤頁
│   ├── layouts/default.vue  # Header / Footer / portal 層級
│   ├── pages/               # 路由頁面
│   ├── components/          # Atom、Layout/Page、SEO、Error
│   ├── assets/              # Tailwind CSS、設計 token、Bootstrap Icons
│   ├── constants/routes.js  # 路由常數
│   ├── plugins/             # $gsap、$ScrollTrigger、$lenis
│   ├── stores/all.js        # 全域 Pinia store
│   └── utils/fetch.js       # API 請求工具
├── public/                  # favicon、manifest
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

## 核心元件

| 元件 | 說明 |
|------|------|
| `AtomButton` | CVA 樣式按鈕，支援 `href` 轉 `NuxtLink` |
| `AtomIcon` | SVG sprite icon，`<AtomIcon name="search" />` |
| `AtomImage` | 圖片元件（loading / error 狀態） |
| `AtomVideo` | 原生 video / YouTube |
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
| `#subField` | dropdown / tooltip | `z-30` |
| `#cookieField` | cookie banner | `z-40` |
| `#sideField` | drawer / sidebar | `z-50` |
| `#modalsField` | modal | `z-[60]` |
| `#loadingField` | 全頁 loading | `z-[70]` |

## Icons

Icon 來自 Bootstrap Icons，統一 `currentColor`。新增 icon：

```bash
cp node_modules/bootstrap-icons/icons/heart.svg app/assets/icons/
```