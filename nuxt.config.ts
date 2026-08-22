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

  nitro: {
    // Cloudflare Workers（含 static assets）。輸出 .output/server/index.mjs + .output/public
    preset: 'cloudflare_module',
    cloudflare: {
      // 讓 build 產生 .output/server/wrangler.json 與 .wrangler/deploy/config.json，
      // 根目錄的 wrangler.jsonc 會被讀進來合併。在 CF CI 會自動開啟，這裡寫死是為了本機行為一致。
      deployConfig: true,
      nodeCompat: true
    }
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
    '/**': { ogImage: {} }
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
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=Inria+Serif:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Noto+Serif+TC:wght@300;400;500;600&display=swap' }
      ],
      noscript: [{ innerHTML: '此網站需要開啟 JavaScript' }]
    }
  },

  runtimeConfig: {
    APP_API: process.env.APP_API,
    // server-only：只有 server/api/admin/* 這幾支代理路由會讀到，不會被打進瀏覽器端 bundle。
    // 後台頁面（app/pages/admin/）透過這層代理呼叫 backend/ 的 Hono + D1 API，
    // 瀏覽器全程不直接碰 backend，session cookie 也只發在這個網站的 origin 上。
    adminApiUrl: process.env.ADMIN_API_URL || 'http://localhost:8787',
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

  nitro: {
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
  },
})
