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
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt'
  ],

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
        },
        {
          name: 'robots',
          content: process.env.WEB_SEARCH === 'YES'
            ? 'index, follow'
            : 'noindex, nofollow'
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
  }
})
