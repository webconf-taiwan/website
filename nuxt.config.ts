import {
  appDescription,
  ogDescription,
  ogTitle,
} from './constants/index'

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

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
    transpile: ['@headlessui/vue'],
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
