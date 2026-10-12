import { cp } from 'node:fs/promises'
import { resolve } from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'
import { site, sitemap } from './config/seo.config'
import { AGENDA_LIST } from './constants/agenda'

// 議程卡片的講者頭像（AgendaCard 的 43×60 與 2x 的 86×120）。
// 靜態部署只會產生預渲染 HTML 裡出現過的 /_ipx 網址，議程頁預設只渲染 12/12，
// 切到 12/13 才在瀏覽器渲染的頭像從沒被產生，上線後會 404，所以在這裡補進預渲染清單
const agendaAvatarRoutes = [...new Set(
  AGENDA_LIST.flatMap(agenda => agenda.speakerInfo?.map(speaker => speaker.avatarUrl) ?? []),
)].flatMap(avatarUrl => ['s_43x60', 's_86x120'].map(size => `/_ipx/${size}${encodeURI(avatarUrl)}`))

// @nuxt/image 預設讓 IPX 去讀伺服器輸出外面的靜態檔目錄。
// Vercel、Zeabur 這類 serverless 平台的函式跟靜態檔分開部署，函式裡讀不到，
// 沒預渲染過的縮圖一律 IPX_FILE_NOT_FOUND，只在瀏覽器渲染的圖（切換分頁、切換日期才出現的）上線後全部 404。
// 所以不分平台，建置時都把 public/ 複製進伺服器輸出，讓 IPX 改讀這份；
// 預渲染不受影響，@nuxt/image 在預渲染時會另外指向專案的 public/

/** IPX 讀原圖的目錄；Nitro 打包後以伺服器輸出的入口檔為基準解析，所以是相對於 serverDir */
const IPX_SOURCE_DIR = './ipx-source'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  modules: [
    '@nuxtjs/storybook',
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxtjs/seo',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/scripts',
    'nuxt-typed-router',
    '@vueuse/nuxt',
    'nuxt-marquee',
    '@nuxt/content',
    'nuxt-toast',
    '@nuxtjs/device',
  ],
  css: ['@/assets/css/main.css'],

  features: {
    inlineStyles: false,
  },

  // nuxt-content 相關生成設定(a 標籤外部連結自動開啟新分頁)
  content: {
    build: {
      markdown: {
        rehypePlugins: {
          'rehype-external-links': {
            options: {
              target: '_blank',
              rel: ['noopener', 'noreferrer'],
            },
          },
        },
      },
    },
  },

  // nuxt-icon 自定義圖標設定
  icon: {
    customCollections: [{
      prefix: 'custom-icon',
      dir: './public/images/icon',
    }],
  },

  // Google Fonts 設定
  fonts: {
    families: [
      {
        name: 'Noto Sans TC',
        provider: 'google',
        weights: [400, 600, 700],
        styles: ['normal'],
        subsets: ['chinese-traditional'],
        display: 'swap',
        preload: true,
      },
      // izitoast CSS 使用 Lato，明確設定讓 @nuxt/fonts 以 woff2 下載，覆蓋自動發現的 .woff 版本
      {
        name: 'Lato',
        provider: 'google',
        weights: [400],
        styles: ['normal', 'italic'],
        display: 'swap',
      },
    ],
  },

  // 全域設定
  // 頁面切換動畫採用舊動畫先移除之後，再進來新動畫
  app: {
    head: {
      link: [
        { rel: 'icon', href: 'https://webconf.tw/images/seo/favicon.ico?v=2025' },
        { rel: 'apple-touch-icon', href: 'https://webconf.tw/images/seo/appleTouchIcon.png?v=2025' },
      ],
      meta: [
        { name: 'theme-color', content: 'black' },
      ],
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
  },

  build: {
    transpile: ['gsap'],
  },

  image: {
    provider: 'ipx',
    ipx: {
      maxAge: 60 * 60 * 24 * 30,
      fs: { dir: IPX_SOURCE_DIR },
    },
  },

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'gsap': ['gsap'],
            'lenis': ['lenis'],
            'p5-vendor': ['p5'],
            'vue-vendor': ['vue', 'vue-router'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      exclude: ['lottie-web'],
    },
    plugins: process.env.NODE_ENV === 'production'
      ? [
          visualizer({
            filename: 'stats/client.html',
            template: 'treemap',
            gzipSize: true,
            brotliSize: true,
            open: true,
          }) as any,
        ]
      : [],
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
      ...(process.env.NODE_ENV === 'production' && {
        cssnano: {
          preset: 'default',
        },
      }),
    },
  },

  hooks: {
    // 用 hook() 追加，不能寫在 nitro.hooks.compiled：
    // 那會蓋掉 Vercel preset 自己的 compiled（產生 .vercel/output/config.json），部署就找不到輸出
    'nitro:init': function (nitro) {
      // 純靜態輸出（nuxt generate）與預渲染用的建置不會在執行時跑 IPX
      if (nitro.options.static || nitro.options.preset === 'nitro-prerender')
        return

      nitro.hooks.hook('compiled', async () => {
        await cp(
          resolve(nitro.options.rootDir, 'public'),
          resolve(nitro.options.output.serverDir, IPX_SOURCE_DIR),
          { recursive: true },
        )
      })
    },
  },

  nitro: {
    // 啟用頁面預渲染
    prerender: {
      routes: [
        '/',
        '/agenda',
        '/speakers',
        '/sponsors',
        '/staff',
        '/history',
        ...Array.from({ length: 43 }, (_, i) => `/agenda/${i + 1}`),
        ...Array.from({ length: 44 }, (_, i) => `/speakers/${i + 1}`),
        '/agenda/3/4',
        '/agenda/33/34',
        '/agenda/00/23/24',
        ...agendaAvatarRoutes,
      ],
    },
    routeRules: {
      // 原始圖片路徑快取(背景圖片使用)
      '/images/**': {
        headers: { 'Cache-Control': 'public, max-age=2592000, s-maxage=2592000' },
      },

      // IPX 處理的圖片路徑
      '/_ipx/**': {
        headers: { 'Cache-Control': 'public, max-age=2592000, s-maxage=2592000' },
      },
    },
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
  },

  site,
  sitemap,
})
