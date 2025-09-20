import { visualizer } from 'rollup-plugin-visualizer'
import { ogImage, site } from './config/seo.config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/storybook',
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxtjs/seo',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/scripts',
    'nuxt-typed-router',
    'shadcn-nuxt',
    '@vueuse/nuxt',
    'nuxt-marquee',
  ],
  css: ['@/assets/css/main.css'],

  features: {
    inlineStyles: false,
  },

  // Google Fonts 設定
  fonts: {
    families: [
      {
        name: 'Noto Sans TC',
        provider: 'google',
        weights: [400, 600],
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
        { rel: 'icon', href: 'https://webconf.tw/favicon.ico', sizes: 'any' }, // 絕對路徑
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }, // 絕對路徑，Apple 設備加入主畫面的圖片
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
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
  },

  site,
  ogImage,
})
