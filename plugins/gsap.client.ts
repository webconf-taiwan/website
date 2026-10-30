import { useDebounceFn, useResizeObserver } from '@vueuse/core'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger)

  nuxtApp.hook('app:mounted', () => {
    // Lenis 捲的是原生的 window，ScrollTrigger 用預設的 scroller 即可，不需要 scrollerProxy
    ScrollTrigger.refresh()

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
