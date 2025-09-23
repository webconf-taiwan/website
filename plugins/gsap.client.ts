import type Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger)

  nuxtApp.hook('app:mounted', () => {
    const { $lenis } = nuxtApp

    if ($lenis) {
      const lenis = $lenis as Lenis

      ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
          if (arguments.length && value !== undefined) {
            lenis.scrollTo(value, { immediate: true })
          }
          return lenis.animatedScroll || 0
        },
        scrollLeft() {
          return 0
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          }
        },
        pinType: document.querySelector('body')?.style.transform ? 'transform' : 'fixed',
      })

      lenis.on('scroll', ScrollTrigger.update)
      ScrollTrigger.addEventListener('refresh', () => {
        lenis.resize()
      })

      ScrollTrigger.defaults({
        scroller: document.body,
      })

      ScrollTrigger.refresh()
    }
  })

  return {
    provide: {
      gsap,
      ScrollTrigger,
    },
  }
})
