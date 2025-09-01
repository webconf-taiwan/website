import Lenis from 'lenis'

export default defineNuxtPlugin({
  name: 'lenis',
  setup(nuxtApp) {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // 切換頁面會滾到最上面
    nuxtApp.hook('page:finish', () => {
      lenis.scrollTo(0, { immediate: false })
    })

    return {
      provide: {
        lenis,
      },
    }
  },
})
