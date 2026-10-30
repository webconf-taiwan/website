import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

export default defineNuxtPlugin({
  name: 'lenis',
  setup(nuxtApp) {
    // lerp 模式：每幀朝目標靠近固定比例，比 duration 模式跟手
    const BASE_LERP = 0.13 // 中間段：直接、順
    const EDGE_LERP = 0.06 // 頂/底：加大平滑做出緩速感
    const EDGE_ZONE = 350 // 距頂/底多少 px 內開始漸進阻尼

    const lenis = new Lenis({
      lerp: BASE_LERP,
    })

    // 依「距頂/底的距離」線性內插 lerp，邊緣阻尼漸進不跳變
    const updateEdgeDamping = () => {
      const distToEdge = Math.min(lenis.scroll, lenis.limit - lenis.scroll)
      const t = Math.min(1, Math.max(0, distToEdge / EDGE_ZONE))
      lenis.options.lerp = EDGE_LERP + (BASE_LERP - EDGE_LERP) * t
    }

    const onScroll = () => {
      updateEdgeDamping()
      ScrollTrigger.update()
    }
    // 交給 GSAP 的 ticker 驅動，捲動與 ScrollTrigger 動畫在同一個 rAF 裡更新，不會差一幀
    const onTick = (time: number) => lenis.raf(time * 1000)

    lenis.on('scroll', onScroll)
    gsap.ticker.add(onTick)
    // 主執行緒卡頓後 GSAP 預設會壓縮時間差，捲動會跟著突然跳一段
    gsap.ticker.lagSmoothing(0)

    // 切換頁面會滾到最上面
    nuxtApp.hook('page:finish', () => {
      lenis.scrollTo(0, { immediate: false })
    })

    // 處理初始載入和重新載入
    nuxtApp.hook('app:mounted', () => {
      lenis.scrollTo(0, { immediate: true })
    })

    nuxtApp.vueApp.onUnmount(() => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(onTick)
      lenis.destroy()
    })

    return {
      provide: {
        lenis,
      },
    }
  },
})
