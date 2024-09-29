import {
  appDescription,
  speakers,
} from './constants'

const speakersAvatarPrerenderRoutes = speakers.flatMap(speaker => [
  `/_ipx/f_webp&q_80&blur_5&s_32x32${speaker.avatar}`,
  `/_ipx/f_webp${speaker.avatar}`,
])

export default defineNuxtConfig({
  devtools: { enabled: false },

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
      htmlAttrs: {
        lang: 'zh-Hant',
      },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: appDescription },
      ],
      link: [
        { rel: 'stylesheet', href: 'https://unpkg.com/aos@next/dist/aos.css' },
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      ],
    },
  },

  nitro: {
    prerender: {
      routes: [
        ...speakersAvatarPrerenderRoutes,
        '/_ipx/_/logo-words.svg',
        '/_ipx/_/drawer/drawer-top-decorate-lg.svg',
        '/_ipx/_/drawer/drawer-top-decorate.svg',
      ],
    },
  },

  compatibilityDate: '2024-09-24',
})
