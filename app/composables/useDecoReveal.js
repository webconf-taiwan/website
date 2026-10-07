// 內頁「沒有 WebGPU」時的裝飾圖進場動態，跟首頁 Home/SideDeco.vue 同一套：
//   root       定位用，什麼動畫都不掛（也是 ScrollTrigger 的觸發元素）
//   parallax   視差：經過畫面的這段從 -d 慢慢沉到 +d（scrub），d = 圖寬 × parallax
//   inner      進場：捲到時從側邊 32px 外滑回來 + 淡入，播一次
// ⚠️ 初始的 opacity:0 是 JS 設的，JS 沒跑起來時圖片仍然看得見。reduced-motion 不做動畫。
// ⚠️ 看 root 有沒有掛上來才建：圖片要等 WebGPU 偵測完才出現，跨過斷點時也會進出。
//
// @param {object} refs  { root, inner, parallaxEl } 三個 template ref
// @param {object} [opts]
// @param {number} [opts.parallax]  視差位移量（單邊），圖寬的倍數；0 = 不做視差
// @param {number} [opts.fromX]     進場起點的水平位移（px），左側的圖給負值、右側給正值
// @param {string} [opts.start]     進場的觸發點（ScrollTrigger 的 start），預設同首頁
// @param {Function} [opts.scrubTrigger]  視差改用別的元素當捲動範圍（sticky 的圖自己不會經過畫面）
export function useDecoReveal ({ root, inner, parallaxEl }, opts = {}) {
  const { parallax = 0.04, fromX = -32, start = 'top 80%', scrubTrigger = null } = opts
  // 首次進站要等 loading 淡出才建 trigger，不然首屏附近的圖會在遮罩底下就播完（同 useFadeIn）
  const { whenIntroDone } = useSiteIntro()
  let alive = false
  let trigger = null
  let tween = null
  let parallaxTween = null

  function teardown () {
    alive = false
    trigger?.kill()
    tween?.kill()
    parallaxTween?.scrollTrigger?.kill()
    parallaxTween?.kill()
    trigger = tween = parallaxTween = null
  }

  function setup () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const { $gsap, $ScrollTrigger } = useNuxtApp()
    if (!$gsap || !$ScrollTrigger || !root.value || !inner.value) return

    $gsap.set(inner.value, { opacity: 0, x: fromX })
    alive = true
    const el = root.value
    whenIntroDone(() => {
      if (!alive || root.value !== el) return
      trigger = $ScrollTrigger.create({
        trigger: el,
        start,
        once: true,
        onEnter: () => {
          tween = $gsap.to(inner.value, { opacity: 1, x: 0, duration: 1.4, ease: 'power3.out' })
        },
      })
    })

    if (parallax > 0 && parallaxEl.value) {
      // 位移量吃圖片「實際顯示」的寬度，resize 後要重算，所以用函式值 + invalidateOnRefresh
      const d = () => (root.value?.offsetWidth || 0) * parallax
      parallaxTween = $gsap.fromTo(parallaxEl.value, { y: () => -d() }, {
        y: d,
        ease: 'none',
        scrollTrigger: {
          trigger: scrubTrigger?.() || root.value,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
    }
  }

  watch(root, (el) => {
    teardown()
    if (el) setup()
  }, { flush: 'post' })

  onBeforeUnmount(teardown)
}
