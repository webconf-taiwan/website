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
            800: '#0B1420', //有使用
            900: '#0E161A', //有使用
          },
          teal: {
            500: '#3EF0FC', //有使用
            700: '#006A97', //有使用
          },
          pink: {
            700: '#FF9E9E',
          }
        },
      },
      width: {
        '60px': '60px',
        '138': '138px',
        '145': '145px',
        '152': '152px',
        '159': '159px',
        '202': '202px',
        '213': '213px',
        '300': '300px',
        '340': '340px',
        '436': '436px',
        '480': '480px',
        '588': '588px',
        '700': '700px',
        '1300': '1300px',
      },
      height: {
        '6px': '6px',
        '40': '40px',
        '80': '80px',
        '110': '110px',
        '148': '148px',
        '200': '200px',
        '206': '206px',
        '263': '263px',
        '350': '350px',
        '370': '370px',
        '630': '630px',
      },
      margin: {
        '43': '43px',
      },
    },
  },
  plugins: [],
}