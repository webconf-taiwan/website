import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
  const { $gsap, $ScrollTrigger } = nuxtApp

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
      lenis.scrollTo(0, { immediate: true })
      $ScrollTrigger?.refresh()
    })
  })

  window.addEventListener('beforeunload', () => {
    $gsap?.ticker.remove(tick)
    lenis.destroy()
  })

  return {
    provide: {
      lenis
    }
  }
})
