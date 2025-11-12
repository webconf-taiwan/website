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
      // 如果是 agenda 的詳細頁面(Dialog)就不滾動
      const route = useRoute()

      if (route.path.startsWith('/agenda/')) {
        return
      }

      lenis.scrollTo(0, { immediate: false })
    })

    // 處理初始載入和重新載入
    nuxtApp.hook('app:mounted', () => {
      lenis.scrollTo(0, { immediate: true })
    })

    return {
      provide: {
        lenis,
      },
    }
  },
})
