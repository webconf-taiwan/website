import { readdirSync, readFileSync } from 'node:fs'
import { cp } from 'node:fs/promises'
import { resolve } from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'
import { site, sitemap } from './config/seo.config'
import { AGENDA_LIST } from './constants/agenda'
import { CONF_LINKS } from './constants/confLinks'

// 議程卡片的講者頭像（AgendaCard 的 43×60 與 2x 的 86×120）。
// 靜態部署只會產生預渲染 HTML 裡出現過的 /_ipx 網址，議程頁預設只渲染 12/12，
// 切到 12/13 才在瀏覽器渲染的頭像從沒被產生，上線後會 404，所以在這裡補進預渲染清單
const agendaAvatarRoutes = [...new Set(
  AGENDA_LIST.flatMap(agenda => agenda.speakerInfo?.map(speaker => speaker.avatarUrl) ?? []),
)].flatMap(avatarUrl => ['s_43x60', 's_86x120'].map(size => `/_ipx/${size}${encodeURI(avatarUrl)}`))

// <NuxtImg placeholder> 的模糊小圖；modifier 順序要跟 @nuxt/image 產生的網址一模一樣才會命中
const PLACEHOLDER_MODIFIERS = 'q_50&blur_3&s_10x10'

// 講者彈窗的照片（SpeakerDialogImageDesktop／Mobile 的 350×498、2x 的 700×996，加上模糊小圖）。
// 彈窗只在瀏覽器打開，預渲染 HTML 裡沒有這些網址，以前全部在 Zeabur 上執行時才由 IPX 現場縮圖；
// 一進議程頁就排進上百張，伺服器一張張轉、又沒快取，照片要好幾秒才出來。
// 建置時先產好成靜態檔，伺服器直接回檔案
const speakerPhotoSources = [...new Set(
  readdirSync(resolve(import.meta.dirname, 'content'))
    .filter(file => file.endsWith('.md'))
    .map(file => readFileSync(resolve(import.meta.dirname, 'content', file), 'utf8').match(/^image:(.*)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, ''))
    .filter((image): image is string => Boolean(image)),
)]
const speakerDialogPhotoRoutes = speakerPhotoSources.flatMap(image =>
  [PLACEHOLDER_MODIFIERS, 's_350x498', 's_700x996'].map(modifiers => `/_ipx/${modifiers}${encodeURI(image)}`),
)

// 歷屆回顧的封面圖沒指定尺寸（modifier 是 _），原圖在瀏覽器掛上後才抓，一樣只會在執行時現場處理
const historyImageRoutes = CONF_LINKS.flatMap(link =>
  ['_', PLACEHOLDER_MODIFIERS].map(modifiers => `/_ipx/${modifiers}${encodeURI(link.img)}`),
)

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
        { rel: 'icon', href: 'https://2025.webconf.tw/images/seo/favicon.ico?v=2025' },
        { rel: 'apple-touch-icon', href: 'https://2025.webconf.tw/images/seo/appleTouchIcon.png?v=2025' },
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
      maxAge: 0,
      fs: { dir: IPX_SOURCE_DIR },
    },
  },

  vite: {
    build: {
      rollupOptions: {
        // @nuxt/fonts 1.x 每份用到字型的 CSS 都會重登記同一批字型檔，檔名與內容相同，覆蓋無害
        // 用 onLog 而非 onwarn：Nuxt 的 server build 自帶 onwarn，會蓋掉這裡的設定
        onLog(level, log, handler) {
          if (log.code === 'FILE_NAME_CONFLICT' && log.message.includes('_nuxt/fonts/'))
            return
          handler(level, log)
        },
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
            open: false,
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

      // 社群分享圖（ogImage）只放在 meta 給社群平台直接抓，不會經過 IPX 縮圖；
      // 一共 30 多 MB，複製進來只會讓部署的映像檔變大、上傳下載變慢
      const publicDir = resolve(nitro.options.rootDir, 'public')
      const ogImageDir = resolve(publicDir, 'images/ogImage')

      nitro.hooks.hook('compiled', async () => {
        await cp(
          publicDir,
          resolve(nitro.options.output.serverDir, IPX_SOURCE_DIR),
          { recursive: true, filter: source => source !== ogImageDir },
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
        ...speakerDialogPhotoRoutes,
        ...historyImageRoutes,
      ],
    },
    routeRules: {
      // 頁面每次都回伺服器確認，部署後馬上拿到新版
      '/**': {
        headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' },
      },

      // 檔名帶 hash，可以長期快取
      '/_nuxt/**': {
        headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
      },

      // 圖片檔名沒帶 hash，換圖或改檔名後要馬上看得到，所以也每次確認
      '/images/**': {
        headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' },
      },

      // IPX 處理的圖片路徑：快取一天，之後一週內先用舊的、背景再更新。
      // 以前每次都回伺服器確認，彈窗照片、頭像同一頁重複出現也要一張張問一次；
      // 換圖時最慢隔天生效，急的話改檔名
      '/_ipx/**': {
        headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
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
