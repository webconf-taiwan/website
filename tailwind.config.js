const defaultTheme = require('tailwindcss/defaultTheme')
const animate = require('tailwindcss-animate')

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  safelist: ['dark'],
  prefix: '',
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
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
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
        'border': 'hsl(var(--border))',
        'input': 'hsl(var(--input))',
        'ring': 'hsl(var(--ring))',
        'background': 'hsl(var(--background))',
        'foreground': 'hsl(var(--foreground))',
        'primary': {
          'DEFAULT': 'hsl(var(--primary))',
          'foreground': 'hsl(var(--primary-foreground))',
          'green': 'hsla(168, 100%, 50%, 1)',
          'mid-green': 'hsla(170, 100%, 35%, 1)',
          'dark-green': 'hsla(180, 100%, 18%, 1)',
          'deep-green': 'hsla(194, 96%, 19%, 1)',
        },
        'secondary': {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        'destructive': {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        'muted': {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        'accent': {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        'popover': {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        'card': {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'gradient-bg-start': '#000033',
        'gradient-bg-end': '#006666',
        'footer-border': '#444444',
      },
      borderRadius: {
        xl: 'calc(var(--radius) + 4px)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'collapsible-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.2s ease-in-out',
        'collapsible-up': 'collapsible-up 0.2s ease-in-out',
      },
      fontSize: {
        'h3': ['20px', { lineHeight: '120%', fontWeight: '500' }],
        'h4': ['18px', { lineHeight: '160%', fontWeight: '700' }],
        'h5': ['16px', { lineHeight: '160%', fontWeight: '500' }],
        'body': ['14px', { lineHeight: '160%', fontWeight: '400' }],
        'BTN': ['16px', { lineHeight: '150%', fontWeight: '500' }],
        'display': ['24px', { lineHeight: '120%', fontWeight: '400' }],
        'md-h3': ['24px', { lineHeight: '120%', fontWeight: '500' }],
        'md-h4': ['20px', { lineHeight: '160%', fontWeight: '700' }],
        'md-h5': ['18px', { lineHeight: '160%', fontWeight: '500' }],
        'md-body': ['16px', { lineHeight: '160%', fontWeight: '400' }],
        'md-BTN': ['20px', { lineHeight: '150%', fontWeight: '500' }],
        'md-display': ['32px', { lineHeight: '120%', fontWeight: '400' }],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
    animate,
  ],
}
