import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
  const { $gsap, $ScrollTrigger } = nuxtApp
  const router = useRouter()

  // ─── 重整一律回到最上面 ─────────────────────────────────────────────────
  // 瀏覽器預設（scrollRestoration = 'auto'）會在重整後把頁面捲回離開前的位置，而且是
  // 「版面長出來之後」才補捲 —— 會蓋掉下面 page:finish 的 scrollTo(0)。首頁的進場動畫、
  // 粒子時間軸都是以「從頂端開始」設計的，從中間醒來會看到播到一半的狀態。
  // 所以關掉瀏覽器與 ScrollTrigger 兩邊的捲動記憶；網址帶 #hash 重整時也不捲過去
  // （hash 順便拿掉，免得網址跟畫面對不上）。⚠️ 只針對「重整」：第一次用帶 hash 的
  // 連結進站（分享連結 https://5xcamp.us/webconf2026-ticket）照常捲到該區。
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  $ScrollTrigger?.clearScrollMemory?.('manual')
  let reloading = performance.getEntriesByType?.('navigation')[0]?.type === 'reload'

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
      // refresh 會保留並還原量測前的捲動位置，先完成量測，再由 Lenis 決定新頁位置。
      $ScrollTrigger?.refresh()
      if (!router.currentRoute.value.hash) {
        lenis.scrollTo(0, { immediate: true })
      }
    })
  })

  let hashScrollId = 0

  async function resetToTop () {
    const { path, query, hash } = router.currentRoute.value
    if (hash) await router.replace({ path, query, hash: '' }).catch(() => {})
    reloading = false
    window.scrollTo(0, 0)
    lenis.scrollTo(0, { immediate: true, force: true })
  }

  async function scrollToHash () {
    if (reloading) return
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

  nuxtApp.hook('app:mounted', () => { void (reloading ? resetToTop() : scrollToHash()) })
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
