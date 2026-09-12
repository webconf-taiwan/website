// https://nuxt.com/docs/api/configuration/nuxt-config
import path from 'node:path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// app.baseURL 需要結尾的斜線（'/'），但拼接資源路徑時要去掉，
// 否則 '/' + '/favicon.ico' = '//favicon.ico'，那是 protocol-relative URL，
// 瀏覽器會當成 https://favicon.ico/ 這個「主機」去抓，全部失效。
const assetBase = `${process.env.APP_BASE_URL || '/'}`.replace(/\/+$/, '')

export default defineNuxtConfig({
  ssr: true,

  compatibilityDate: '2026-05-19',

  // ⚠️ 這個檔案原本有「兩個」nitro 鍵（這裡一個、檔案末端一個 compressPublicAssets），
  // 而物件字面量後面的會整個覆蓋前面的 —— 所以下面這些設定一直是被丟掉的。
  // 症狀：本機 `nuxt build` 印的是 `Nitro preset: node-server`，不是這裡寫的
  // cloudflare_module，而且 nodeCompat / deployConfig 都沒有生效。
  // CF CI 上因為平台自己會帶 preset 所以 build 仍然會過，才一直沒被發現。
  // 已經合併成一個，別再拆開。
  nitro: {
    // Cloudflare Workers（含 static assets）。輸出 .output/server/index.mjs + .output/public
    preset: 'cloudflare_module',
    cloudflare: {
      // 讓 build 產生 .output/server/wrangler.json 與 .wrangler/deploy/config.json，
      // 根目錄的 wrangler.jsonc 會被讀進來合併。在 CF CI 會自動開啟，這裡寫死是為了本機行為一致。
      deployConfig: true,
      nodeCompat: true
    },
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/seo',
    '@vueuse/nuxt'
  ],

  // OG 圖模板要顯示中文，nuxt-og-image 內建只有 Inter（拉丁字），中文字會變成缺字方框，
  // 得靠 @nuxt/fonts 額外抓一套支援繁中的字型，並在 OgImage/Default 模板裡指定套用。
  fonts: {
    families: [
      { name: 'Noto Sans TC', weights: [400, 700], global: true }
    ]
  },

  // @nuxtjs/seo 統一管理 robots / sitemap / schema.org / og:image / canonical。
  // indexable 綁現有 WEB_SEARCH 開關：機器人 meta、robots.txt、sitemap 收錄都跟著這顆旗標走，
  // 不用再各處各自判斷一次。
  site: {
    url: process.env.APP_URL,
    name: process.env.APP_TITLE,
    description: process.env.APP_DESC,
    defaultLocale: process.env.APP_DEFAULT_LANG,
    indexable: process.env.WEB_SEARCH === 'YES'
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: process.env.APP_TITLE,
      logo: '/logo-webconf.svg'
    }
  },

  // nuxt-og-image 預設不會自動幫每個頁面加 og:image，要靠 route rule 開啟才會套用
  // app/components/OgImage/Default.takumi.vue，並依各頁 title/description 自動產圖。
  // 頁面沒各自呼叫 defineOgImage() 時的保底，用 Default 模板產生通用的 WebConf 卡片圖。
  routeRules: {
    '/**': { ogImage: {} },
    // ⚠️ /index-old 是被一鏡到底版取代的舊首頁（三張 canvas），整頁文案與首頁
    // 的資料一模一樣 —— 不擋的話就是一份重複內容。
    // 用 route rule 而不是頁面裡的 useHead robots meta：只有 route rule 會同時被
    // nuxt-robots（robots.txt + meta）與 nuxt-sitemap 讀到。實測 useHead 那條
    // meta 有生效、但 sitemap.xml 仍然收錄了 /index-old。
    '/index-old': { robots: false },
    // /wall、/echo 是現場大螢幕的裝置頁（要開相機 / 麥克風、沒有頁首頁尾），
    // 不是給搜尋的內容頁。
    '/wall': { robots: false },
    '/echo': { robots: false },
    // /particle-studio 是內部工具（把照片轉成粒子靜態圖），不是給搜尋的內容頁。
    '/particle-studio': { robots: false }
  },

  app: {
    baseURL: `${process.env.APP_BASE_URL}`,
    head: {
      title: process.env.APP_TITLE,
      htmlAttrs: {
        lang: process.env.APP_DEFAULT_LANG
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        {
          name: 'description',
          content: process.env.APP_DESC
        },
        {
          property: 'og:locale',
          content: process.env.APP_DEFAULT_LANG
        }
      ],
      link: [
        { rel: 'icon', sizes: '32x32', href: `${assetBase}/favicon.ico` },
        { rel: 'icon', type: 'image/svg+xml', href: `${assetBase}/favicon.svg` },
        { rel: 'apple-touch-icon', href: `${assetBase}/apple-touch-icon.png` },
        { rel: 'manifest', href: `${assetBase}/manifest.webmanifest` },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // ⚠️ 字重要對齊設計稿的 16 個文字樣式（Figma 變數 en/* zh/* common/*），少一個就會
        // 變成瀏覽器合成的假粗體 —— CJK 襯線體的合成粗體會把字腔塞死，跟真 Bold 差很多。
        //   Noto Serif TC 700  zh/h3 zh/h4 zh/h5 都是 Bold（講者名、FAQ 問題、hero 場地日期）
        //   Noto Sans TC 400   zh/body_lg zh/body_md
        //   Noto Sans TC 500   zh/btn（按鈕）
        // ⚠️ Noto Sans TC 原本是 nuxt-fonts 自動解析進來的（只給 400/700），沒有 500，
        //    所以按鈕的 Medium 也是合成的。這裡明確宣告就拿回控制權。
        // ⚠️ font-serif 的 stack 是 Inria Serif → Noto Serif TC，Inria 沒有中文字，
        //    所以「用 font-serif 寫中文」的地方也會掉到 Noto Serif TC 700。
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=Inria+Serif:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Noto+Sans+TC:wght@400;500&family=Noto+Serif+TC:wght@300;400;500;600;700&display=swap' }
      ],
      noscript: [{ innerHTML: '此網站需要開啟 JavaScript' }]
    }
  },

  runtimeConfig: {
    APP_API: process.env.APP_API,
    public: {
      APP_TITLE: process.env.APP_TITLE,
      APP_DESC: process.env.APP_DESC,
      APP_URL: process.env.APP_URL,
      APP_BASE_URL: process.env.APP_BASE_URL,
      APP_DEFAULT_LANG: process.env.APP_DEFAULT_LANG,
      WEB_SEARCH: process.env.WEB_SEARCH,
      APP_API: process.env.APP_API
    }
  },

  css: ['~/assets/css/tailwind.css'],

  vite: {
    optimizeDeps: {
      include: [
        'class-variance-authority',
        'gsap',
        'lenis',
        // 動態載入的去背套件：預打包成單一 chunk，dev 才不會 @fs 404（模型/wasm 仍執行期抓）
        '@imgly/background-removal',
        // 綠幕即時分割：同理預打包（wasm/模型從 public/mediapipe 自架載入）
        '@mediapipe/tasks-vision'
      ]
    },
    esbuild: {
      pure: process.env.SHOW_CONSOLE_LOG === 'YES' ? [] : ['console.log', 'console.info']
    },
    plugins: [
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'app/assets/icons')],
        symbolId: '[dir]/[name]',
        customDomId: '__svg__icons__dom__'
      })
    ]
  },

  build: {
    transpile: ['gsap', 'lenis']
  },

  devtools: {
    enabled: true
  },
})
