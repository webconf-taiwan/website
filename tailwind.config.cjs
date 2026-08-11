/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{vue,js,ts}'
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1680px',
      '3xl': '1920px'
    },
    fontFamily: {
      // A · English serif — 標題與英文內文
      serif: ['"Inria Serif"', '"Noto Serif TC"', 'serif'],
      // B · 中文襯線 — 正文、抒情
      zh: ['"Noto Serif TC"', '"Inria Serif"', 'serif'],
      // C · Mono — 數字、座標、標籤
      mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      // legacy（保留給既有元件，如需舊的無襯線）
      Noto: ['Noto Sans TC', 'sans-serif']
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '16px',
        sm: '16px',
        md: '32px',
        xl: '40px'
      },
      screens: {
        sm: '100%',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1680px',
        '3xl': '1920px'
      }
    },
    zIndex: {
      '-10': '-10',
      0: 0,
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      25: 25,
      50: 50,
      75: 75,
      100: 100,
      auto: 'auto'
    },
    extend: {
      spacing: {
        34: '8.5rem', // 136px
        35: '8.75rem', // 140px
        54: '13.5rem' // 216px
      },
      colors: {
        pre: {
          800: '#EFE6D2'
        },
        // Figma 變數 theme/accent-1。⚠️ index.vue 目前散落硬寫的 #71c1f0 是舊值，
        // 與設計稿不同色，之後應統一改用這個 token。
        accent: {
          1: '#7CC8F2'
        },
        brand: {
          light: '#A0BEFF',
          DEFAULT: '#110AFF',
          dark: '#285388'
        },
        ad: {
          DEFAULT: '#5A78FF',
          light: '#8CD3F8'
        },
        gray: {
          100: '#F2F4F7',
          200: '#E4E7EC',
          300: '#D0D5DD',
          400: '#98A2B3',
          500: '#667085',
          600: '#475467',
          700: '#1D2939',
          800: '#101828'
        },
        txt: {
          white: '#FFFFFF',
          'super-light': '#98A2B3',
          light: '#667085',
          DEFAULT: '#475467',
          dark: '#101828',
          black: '#000000'
        }
      },
      borderRadius: {
        none: '0',
        sm: '.125rem',
        DEFAULT: '.25rem',
        lg: '.5rem',
        full: '9999px'
      },
      fontSize: {
        // ===== WebConf 2026 型階 · One ladder, thirteen rungs =====
        // 語意用 typography.css 的 .text-* class；這裡只放尺寸+行高+字距
        'fs-hero': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }], //  72 · Hero（Inria）
        'fs-h1': ['4rem', { lineHeight: '1.08', letterSpacing: '-0.02em' }], //  64 · Section opener（Inria）
        'fs-display': ['3.5rem', { lineHeight: '1.3', letterSpacing: '0.04em' }], //  56 · 中文 specimen（Noto Serif TC）
        'fs-h2': ['3rem', { lineHeight: '1.12', letterSpacing: '-0.01em' }], //  48 · Plate H2
        'fs-h3': ['2rem', { lineHeight: '1.2', letterSpacing: '0px' }], //  32 · Plate subhead
        'fs-h4': ['1.75rem', { lineHeight: '1.3', letterSpacing: '0px' }], //  28 · Card title
        'fs-h5': ['1.375rem', { lineHeight: '1.45', letterSpacing: '0px' }], //  22 · Card subtitle
        'fs-body-lg': ['1.125rem', { lineHeight: '1.9', letterSpacing: '0.04em' }], //  18 · 正文 lede
        'fs-body': ['1rem', { lineHeight: '1.95', letterSpacing: '0.04em' }], //  16 · base body（中文 行高 1.95）
        'fs-body-sm': ['0.875rem', { lineHeight: '1.8', letterSpacing: '0.04em' }], //  14 · dense paragraph
        'fs-caption': ['0.8125rem', { lineHeight: '1.6', letterSpacing: '0.04em' }], //  13 · caption / footnote
        'fs-meta': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.18em' }], //  12 · KV / mono labels
        'fs-micro': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.24em' }], //  11 · status / tag / corner
        'fs-btn': ['1rem', { lineHeight: '1.6', letterSpacing: '0.02em' }] //  16/160 · 按鈕
      }
    }
  }
}
