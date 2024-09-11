import {
  appDescription,
  ogDescription,
  ogTitle,
} from './constants/index'

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxt/fonts', '@nuxt/image'],

  plugins: [
    '~/plugins/lenis.client.ts',
  ],

  fonts: {
    families: [
      {
        name: 'Mina',
        weights: ['400', '700'],
      },
      {
        name: 'Noto Sans TC',
        weights: ['400', '500', '700'],
      },
    ],
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  css: ['@/assets/css/main.css'],

  pinia: {
    storesDirs: ['./store/**'],
  },

  build: {
    transpile: ['@headlessui/vue', 'gsap'],
  },

  app: {
    head: {
      meta: [
        { name: 'description', content: appDescription },
        { property: 'og:title', content: ogTitle },
        { property: 'og:description', content: ogDescription },
      ],
    },
  },

  compatibilityDate: '2024-08-27',
})
