import type Lenis from 'lenis'
import { useDebounceFn, useResizeObserver } from '@vueuse/core'
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

    // ScrollTrigger 只在 load / resize 時自動重算，不會察覺頁面本身長高或變矮
    // （圖片換圖、字型替換、延遲 hydration 的區塊、ClientOnly 頁尾），
    // pin 的起點會停在舊位置，CTA 就會被捲走、只剩一段空白。高度一變就重算一次
    let lastHeight = document.documentElement.scrollHeight
    const refreshOnResize = useDebounceFn(() => {
      if (document.documentElement.scrollHeight !== lastHeight)
        ScrollTrigger.refresh()
    }, 200)

    // refresh 自己會調整 pin-spacer 改變高度，記下結果避免重複觸發
    ScrollTrigger.addEventListener('refresh', () => {
      lastHeight = document.documentElement.scrollHeight
    })

    useResizeObserver(document.body, refreshOnResize)
  })

  return {
    provide: {
      gsap,
      ScrollTrigger,
    },
  }
})
