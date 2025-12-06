import { visualizer } from 'rollup-plugin-visualizer'
import { site, sitemap } from './config/seo.config'

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

  nitro: {
    // 啟用頁面預渲染
    prerender: {
      routes: [
        '/',
        // '/agenda' 使用 SSR，不進行預渲染
        '/speakers',
        '/sponsors',
        '/staff',
        '/history',
        ...Array.from({ length: 43 }, (_, i) => `/agenda/${i + 1}`),
        ...Array.from({ length: 43 }, (_, i) => `/speakers/${i + 1}`),
        '/agenda/3/4',
        '/agenda/33/34',
        '/agenda/00/23/24',
      ],
    },
    routeRules: {
      // 議程頁面不進行預渲染，使用 SSR 動態渲染
      '/agenda': {
        prerender: false,
      },

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
