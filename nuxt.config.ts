import { appDescription } from './constants'
import { speakers } from './constants/speakers'
import { getAllAgendaIds } from './utils/index'

const speakersAvatarPrerenderRoutes = speakers.flatMap(speaker => [
  `/_ipx/f_webp&q_80&blur_5&s_32x32${speaker.avatar}`,
  `/_ipx/f_webp${speaker.avatar}`,
])

const singleAgendaRoutes = getAllAgendaIds().map(id => `/agenda/${id}`)

export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxt/content',
    '@nuxtjs/device',
    '@nuxtjs/seo',
    'nuxt-marquee',
    'shadcn-nuxt',
    'dayjs-nuxt',
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

  dayjs: {
    locales: ['zh-tw'],
    plugins: ['relativeTime', 'utc', 'timezone', 'isSameOrAfter'],
    defaultLocale: 'zh-tw',
    defaultTimezone: 'Asia/Taipei',
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
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
  },

  site: {
    url: 'https://webconf.tw/',
    name: '2024 WebConf Taiwan 技術研討會',
    defaultLocale: 'zh-TW',
  },

  sitemap: {
    sources: [
      '/api/__sitemap__/urls',
    ],
  },

  ogImage: {
    fonts: ['Noto+Sans+TC:700'],
  },

  content: {
    documentDriven: false,
    ignores: ['drafts'],
  },

  nitro: {
    prerender: {
      routes: [
        ...speakersAvatarPrerenderRoutes,
        '/_ipx/_/logo-words.svg',
        '/_ipx/_/drawer/drawer-top-decorate-lg.svg',
        '/_ipx/_/drawer/drawer-top-decorate.svg',
        ...singleAgendaRoutes,
        '/sitemap.xml',
      ],
    },
  },

  $production: {
    app: {
      head: {
        script: [
          {
            'src': 'https://a.5xcamp.us/script.js',
            'defer': true,
            'data-website-id': '41664933-5ac4-4e59-ad44-2b69cc1dbbf4',
          },
        ],
      },
    },
  },

  compatibilityDate: '2024-09-24',
})
