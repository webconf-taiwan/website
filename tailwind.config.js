/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
    './error.vue',
    './assets/**/*.css',
    './assets/**/*.scss',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Noto Sans TC"',
          'Mina',
          ...defaultTheme.fontFamily.sans.filter(font => font !== 'sans-serif'),
          'sans-serif',
        ],
      },
      height: {
        screen: ['100vh', '100dvh'],
      },
      minHeight: {
        screen: ['100vh', '100dvh'],
      },
      colors: {
        'primary-green': '#00FFCC',
        'gradient-bg-start': '#000033',
        'gradient-bg-end': '#006666',
      },
      fontSize: {
        h3: ['24px', { lineHeight: '120%', fontWeight: '500' }],
        h4: ['20px', { lineHeight: '160%', fontWeight: '700' }],
        h5: ['18px', { lineHeight: '160%', fontWeight: '500' }],
        body: ['16px', { lineHeight: '160%', fontWeight: '400' }],
        BTN: ['20px', { lineHeight: '150%', fontWeight: '500' }],
        display: ['32px', { lineHeight: '120%', fontWeight: '400' }],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
}
