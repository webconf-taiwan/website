import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
  const { $gsap, $ScrollTrigger } = nuxtApp
  const router = useRouter()

  const lenis = new Lenis({
    autoRaf: false,
    duration: 1.1,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false
  })

  const tick = (time) => {
    lenis.raf(time * 1000)
  }

  lenis.on('scroll', () => {
    $ScrollTrigger?.update()
  })

  $gsap?.ticker.add(tick)
  $gsap?.ticker.lagSmoothing(0)

  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(() => {
      if (!router.currentRoute.value.hash) {
        lenis.scrollTo(0, { immediate: true })
      }
      $ScrollTrigger?.refresh()
    })
  })

  let hashScrollId = 0

  async function scrollToHash () {
    const requestId = ++hashScrollId
    const { hash, fullPath } = router.currentRoute.value
    if (!hash) return

    await nextTick()
    await document.fonts.ready
    // Run after Nuxt's native scroll and the hydrated layout have settled.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    if (requestId !== hashScrollId || router.currentRoute.value.fullPath !== fullPath) return

    let id
    try {
      id = decodeURIComponent(hash.slice(1))
    } catch {
      return
    }
    const target = document.getElementById(id)
    if (!target) return

    lenis.resize()
    $ScrollTrigger?.refresh()
    const headerHeight = document.querySelector('header')?.getBoundingClientRect().height || 0

    // 固定秒數的話，短距離（例如 venue → faq）會被拖得很慢，長距離
    // （例如 hero → ticket）又顯得太趕。改成「等速」：秒數 = 距離 / 速度，
    // 只夾出上下限，避免極短距離幾乎不動、或極長距離久到像卡住。
    const SCROLL_SPEED = 700 // px/s，決定捲動的視覺速度感，不是耗時本身
    const MIN_DURATION = 0.6
    const MAX_DURATION = 4.8
    const distance = Math.abs(target.getBoundingClientRect().top - headerHeight)
    const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, distance / SCROLL_SPEED))

    lenis.scrollTo(target, { offset: -headerHeight, duration })
    $ScrollTrigger?.update()
  }

  nuxtApp.hook('app:mounted', () => { void scrollToHash() })
  nuxtApp.hook('page:loading:end', () => { void scrollToHash() })
  nuxtApp.hook('page:start', () => { hashScrollId++ })

  window.addEventListener('beforeunload', () => {
    hashScrollId++
    $gsap?.ticker.remove(tick)
    lenis.destroy()
  })

  return {
    provide: {
      lenis
    }
  }
})
