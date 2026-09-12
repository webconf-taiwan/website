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
      // 命名比照 typography.css 的 zh-* / en-* class：一看字首就知道是哪個
      // 語言、哪種字族，不用再猜 `zh` 是不是襯線、`Noto` 是不是舊的殘留。
      // en/* 沒有 sans 角色 —— kit 裡英文一律走 Inria Serif，沒有無襯線樣式，
      // 所以這裡只有三個字族、不是四個對稱的組合。
      'en-serif': ['"Inria Serif"', '"Noto Serif TC"', 'serif'], // en/* 標題與內文（Inria，中文字會 fallback 到 Noto Serif TC）
      'zh-serif': ['"Noto Serif TC"', '"Inria Serif"', 'serif'], // zh/* 標題（h1~h5、display）
      'zh-sans': ['"Noto Sans TC"', 'sans-serif'], // zh/* 正文與按鈕（body_lg、body_md、btn）
      mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'] // common/*（數字、座標、標籤）
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
          800: '#EFE6D2',
          default: '#EFE6D2'
        },
        // Figma 變數 theme/accent-1。⚠️ index.vue 目前散落硬寫的 #71c1f0 是舊值，
        // 與設計稿不同色，之後應統一改用這個 token。
        accent: {
          1: '#7CC8F2'
        },
        brand: {
          light: '#7CC8F2',
          DEFAULT: '#3E8FE0',
          dark: '#1B3FA8'
        },
        ad: {
          DEFAULT: '#5A78FF',
          light: '#8CD3F8',
        },
        bg: {
          light: '#EFE6D2',
          'blue-light': '#71C1F0',
          mid: '#0A0A0C',
          dark: '#1C1C10'
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
        // ===== WebConf 2026 型階 =====
        // 語意用 typography.css 的 .text-zh-* / .text-en-* class；這裡只放
        // 尺寸+行高+字距。命名比照 Figma UI kit（Typography 頁，
        // node 40004306-1928）的變數結構 —— zh/*、en/*、common/* 三個命名空間，
        // 缺哪一邊就不生對應 token（kit 沒有 zh/hero、zh/caption、en/body_lg、
        // en/btn，這裡也不生造）。h1~h5 中英文數值目前相同，但 Figma 是兩個
        // 各自獨立的變數，之後可能分岔，所以還是拆成兩個 token，不共用。
        //
        // ⚠️ zh/* 的 body_lg、body_md、btn 三個字級用的是 Noto *Sans* TC，
        // 不是 Noto *Serif* TC —— 這裡的 token 只管尺寸，字族由 typography.css
        // 的 class 選 font-Noto／font-zh／font-serif。

        // ----- zh/* -----
        'fs-zh-display': ['3.5rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  56 · Bold
        'fs-zh-h1': ['4rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  64 · Bold
        'fs-zh-h2': ['3rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  48 · Bold
        'fs-zh-h3': ['2rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  32 · Bold
        'fs-zh-h4': ['1.75rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  28 · Bold
        'fs-zh-h5': ['1.375rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  22 · Bold
        'fs-zh-body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0.08em' }], //  18 · Regular（Noto Sans TC）
        'fs-zh-body-md': ['1rem', { lineHeight: '1.6', letterSpacing: '0.08em' }], //  16 · Regular（Noto Sans TC）
        'fs-zh-btn': ['1rem', { lineHeight: '1', letterSpacing: '0.1em' }], //  16 · Regular（Noto Sans TC，按鈕）

        // ----- en/* -----
        'fs-en-display': ['3.5rem', { lineHeight: '1', letterSpacing: '0.02em' }], //  56 · Italic
        'fs-en-hero': ['4.5rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  72 · Bold Italic
        'fs-en-h1': ['4rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  64 · Bold
        'fs-en-h2': ['3rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  48 · Bold
        'fs-en-h3': ['2rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  32 · Bold
        'fs-en-h4': ['1.75rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  28 · Bold
        'fs-en-h5': ['1.375rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  22 · Bold
        'fs-en-body-md': ['1rem', { lineHeight: '1.6', letterSpacing: '0.08em' }], //  16 · Bold
        'fs-en-caption': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.08em' }], //  14 · Bold（14-14，兩端相同，無手機階）

        // ----- common/*（mono，桌機／手機共用同一個值，無 zh/en 之分）-----
        'fs-body-sm': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.06em' }], //  14 · Regular
        'fs-meta': ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.2em' }], //  12 · Regular
        'fs-micro': ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.04em' }], //  12 · Regular

        // ===== 手機階 =====
        // Figma 的字級變數本來就是「桌機-手機」成對的（同一個樣式在 mode 切換下
        // 是兩個值）。這裡是手機那一半，语意 class 用 `mobile lg:desktop` 串起來
        // （見 typography.css）。common/* 與 en/caption 兩端相同，不需要手機階。
        'fs-zh-display-m': ['2rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  32 ← 56-32
        'fs-zh-h1-m': ['2.5rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  40 ← 64-40
        'fs-zh-h2-m': ['2.25rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  36 ← 48-36
        'fs-zh-h3-m': ['1.5rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  24 ← 32-24
        'fs-zh-h4-m': ['1.375rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  22 ← 28-22
        'fs-zh-h5-m': ['1.125rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  18 ← 22-18
        'fs-zh-body-lg-m': ['1rem', { lineHeight: '1.6', letterSpacing: '0.08em' }], //  16 ← 18-16
        'fs-zh-body-md-m': ['0.9375rem', { lineHeight: '1.6', letterSpacing: '0.08em' }], //  15 ← 16-15
        'fs-zh-btn-m': ['0.9375rem', { lineHeight: '1', letterSpacing: '0.1em' }], //  15 ← 16-15

        'fs-en-display-m': ['2rem', { lineHeight: '1', letterSpacing: '0.02em' }], //  32 ← 56-32
        'fs-en-hero-m': ['4rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  64 ← 72-64
        'fs-en-h1-m': ['2.5rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  40 ← 64-40
        'fs-en-h2-m': ['2.25rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  36 ← 48-36
        'fs-en-h3-m': ['1.5rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  24 ← 32-24
        'fs-en-h4-m': ['1.375rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  22 ← 28-22
        'fs-en-h5-m': ['1.125rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], //  18 ← 22-18
        'fs-en-body-md-m': ['0.9375rem', { lineHeight: '1.6', letterSpacing: '0.08em' }] //  15 ← 16-15
      }
    }
  }
}
