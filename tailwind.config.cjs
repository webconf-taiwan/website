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
      colors: {
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
        'dt/zh/5xl': ['3rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '500' }],
        'dt/zh/4xl': ['2rem', { lineHeight: '160%', letterSpacing: '0px', fontWeight: '500' }],
        'dt/zh/3xl': ['1.5rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '500' }],
        'dt/zh/2xl': ['1.25rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '500' }],
        'dt/zh/1xl': ['1rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '500' }],
        'dt/zh/7xl': ['4rem', { lineHeight: '120%', letterSpacing: '1.28px', fontWeight: '500' }],
        'dt/zh/6xl': ['3rem', { lineHeight: '120%', letterSpacing: '0px', fontWeight: '500' }],
        'dt/zh/base': ['1rem', { lineHeight: '150%', letterSpacing: '0.32px', fontWeight: '400' }],
        'dt/zh/lg': ['1.125rem', { lineHeight: '150%', letterSpacing: '0px', fontWeight: '400' }],
        'dt/zh/xs': ['0.875rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '400' }],
        'dt/zh/link-xs': ['0.875rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '400', textDecoration: 'underline' }],
        'dt/zh/btn-lg': ['1rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '700' }],
        'dt/zh/btn-md': ['0.875rem', { lineHeight: '140%', letterSpacing: '0.28px', fontWeight: '700' }],
        'dt/zh/btn-xs': ['0.875rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '500' }],
        'mb/zh/5xl': ['1.75rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '500' }],
        'mb/zh/4xl': ['1.25rem', { lineHeight: '160%', letterSpacing: '0px', fontWeight: '500' }],
        'mb/zh/3xl': ['1.125rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '500' }],
        'mb/zh/2xl': ['1rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '500' }],
        'mb/zh/1xl': ['0.875rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '500' }],
        'mb/zh/7xl': ['3.5rem', { lineHeight: '120%', letterSpacing: '1.12px', fontWeight: '500' }],
        'mb/zh/6xl': ['2rem', { lineHeight: '120%', letterSpacing: '0px', fontWeight: '500' }],
        'mb/zh/base': ['0.875rem', { lineHeight: '150%', letterSpacing: '0px', fontWeight: '400' }],
        'mb/zh/lg': ['1rem', { lineHeight: '150%', letterSpacing: '0px', fontWeight: '400' }],
        'mb/zh/xs': ['0.75rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '400' }],
        'mb/zh/link-xs': ['0.75rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '400', textDecoration: 'underline' }],
        'mb/zh/btn-lg': ['1rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '700' }],
        'mb/zh/btn-md': ['0.875rem', { lineHeight: '140%', letterSpacing: '0.28px', fontWeight: '700' }],
        'mb/zh/btn-xs': ['0.875rem', { lineHeight: '140%', letterSpacing: '0px', fontWeight: '500' }]
      }
    }
  }
}
