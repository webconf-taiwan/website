/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './components/**/*.{js,vue,ts}',
    './app.vue',
    './layouts/**/*.vue',
    './pages/**/*.vue',
  ],
  theme: {
    extend: {
      transitionDuration: {
        1500: '1500ms',
        2000: '2000ms',
        2500: '2500ms',
      },
      transitionDelay: {
        1500: '1500ms',
      },
      container: {
        center: true,
        screens: {
          '2xl': '1440px',
        },
      },
      screens: {
        'xs': '360px',
        'xm': '480px',
        '2xl': '1440px',
        '3xl': '1600px',
      },
      maxWidth: {
        'container-sm': '640px',
        'container-md': '768px',
        'container-lg': '1024px',
        'container-xl': '1280px',
        'container-2xl': '1400px',
      },
      height: {
        400: '400px',
        1200: '1200px',
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'btn-14': ['14px', { lineHeight: '1', letterSpacing: '0.02em', fontWeight: '400' }],
        'btn-16': ['16px', { lineHeight: '1', letterSpacing: '0.02em', fontWeight: '400' }],
        'body-16': ['15px', { lineHeight: '1.8', letterSpacing: '0.02em', fontWeight: '400' }],
        'body-18': ['16px', { lineHeight: '1.8', letterSpacing: '0.02em', fontWeight: '400' }],
        'h1-96': ['clamp(3rem, 2rem + 4.4444vw, 6rem)', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h3-40': ['clamp(28px, 4.167vw, 40px)', { lineHeight: '1', letterSpacing: '0em', fontWeight: '600' }],
        'h4-24': ['20px', { lineHeight: '1', letterSpacing: '0em', fontWeight: '600' }],
        'h4-60': ['28px', { lineHeight: '1', letterSpacing: '0em', fontWeight: '600' }],
        'h5-20': ['18px', { lineHeight: '1', letterSpacing: '0em', fontWeight: '600' }],
      },
      clipPath: {
        mypolygon: 'polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 1rem))',
        fancycut: 'polygon(32px 0%, 100% 0%, 100% 100%, 0% 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        webconf: {
          gray: '#E6E6E6',
          blue: '#002EFF',
          black: '#1C1C1C',
          frame: 'rgba(230, 230, 230, 0.5)',
        },
      },
      keyframes: {
        'arrow-run': {
          '0%': { left: '0' },
          '100%': { left: '100%' },
        },
      },
      animation: {
        'arrow-run': 'arrow-run 13s ease-in-out infinite normal',
      },
      aspectRatio: {
        'speaker-img': '282 / 448',
        'speaker-img-full': '264 / 376',
      },
    },
  },
  plugins: [require('tailwind-scrollbar'), require('tailwind-clip-path'), require('tailwindcss-animate')],
}
