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
  ],
  css: ['@/assets/css/main.css'],

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
            'lottie': ['lottie-web'],
            'lenis': ['lenis'],
            'vue-vendor': ['vue', 'vue-router'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
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

  site,
  ogImage,
})
