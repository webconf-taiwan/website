// https://nuxt.com/docs/api/configuration/nuxt-config
import path from 'node:path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineNuxtConfig({
  ssr: true,

  compatibilityDate: '2026-05-19',

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
        { rel: 'icon', sizes: '32x32', href: `${process.env.APP_BASE_URL}/favicon.ico` },
        { rel: 'icon', type: 'image/svg+xml', href: `${process.env.APP_BASE_URL}/favicon.svg` },
        { rel: 'apple-touch-icon', href: `${process.env.APP_BASE_URL}/apple-touch-icon.png` },
        { rel: 'manifest', href: `${process.env.APP_BASE_URL}/manifest.webmanifest` },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap' }
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
        '@imgly/background-removal'
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
