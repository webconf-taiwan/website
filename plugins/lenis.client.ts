import Lenis from 'lenis'

export default defineNuxtPlugin({
  name: 'lenis',
  setup() {
    const lenis = new Lenis()

    lenis.on('scroll', (e) => {
      // console.log(e)
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
  },
  env: {
    islands: false,
  },
})
