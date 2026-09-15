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
    lenis.scrollTo(target, { offset: -headerHeight, immediate: true })
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
