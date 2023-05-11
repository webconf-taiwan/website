/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        custom: {
          gray: {
            100: '#f5f5f5',
            200: '#e6e6e6',
            300: '#cccccc',
            400: '#b3b3b3',
            500: '#999999',
            600: '#808080',
            700: '#666666',
            800: '#4d4d4d',
            900: '#0E161A',
          },
          teal: {
            100: '#C2F2F5',
            200: '#96E6EB',
            300: '#6ADBE1',
            400: '#41CED6',
            500: '#3EF0FC',
            600: '#26BCC0',
            700: '#006A97',
            800: '#14665D',
            900: '#0C3A2C',
          },
        },
      },
      width: {
        '340': '340px',
        '480': '480px',
        '1300': '1300px',
      },
      height: {
        '95': '95px',
        '130': '130px',
        '630': '630px',
      },
    },
  },
  plugins: [],
}