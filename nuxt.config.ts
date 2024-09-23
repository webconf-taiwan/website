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
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/icon',
    'shadcn-nuxt',
    'nuxt-marquee',
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

  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  css: ['@/assets/css/main.css'],

  pinia: {
    storesDirs: ['./stores/**'],
  },

  build: {
    transpile: ['@headlessui/vue', 'gsap'],
  },

  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: appDescription },
        { property: 'og:title', content: ogTitle },
        { property: 'og:description', content: ogDescription },
      ],
      link: [
        { rel: 'stylesheet', href: 'https://unpkg.com/aos@next/dist/aos.css' },
      ],
    },
  },

  compatibilityDate: '2024-08-27',
})
