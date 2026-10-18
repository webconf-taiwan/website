// 框線進場：區塊內標了 [data-draw] 的線條，捲到時「畫出來」。
//   data-draw="x" —— 橫線，由左往右畫
//   data-draw="y" —— 直線，由上往下長
// 線條要是獨立的元素（span），不能是容器的 border —— scale 會連內容一起縮。
//
// 時機與 useFadeIn 一樣：初始狀態（scale 0）用 JS 設，JS 沒跑起來時線照樣看得到；
// 首次進站等 loading 淡出（whenIntroDone）才建 trigger；reduced-motion 完全不動。
//
// 用法：
//   const { drawNow } = useDrawIn(sectionRef)
//   // 內容換掉、區塊沒離開畫面時（例如議程換天）：await nextTick(); drawNow(sectionRef.value)

const DEFAULTS = {
  step: 0.05,
  duration: 0.9,
  start: 'top 92%',
}

export function useDrawIn (rootRef, autoOpts = {}) {
  const triggers = []
  const pendingFrames = new Set()
  const { whenIntroDone } = useSiteIntro()

  const axisProps = el => el.dataset.draw === 'y'
    ? { scaleY: 0, transformOrigin: '50% 0%' }
    : { scaleX: 0, transformOrigin: '0% 50%' }
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function show ($gsap, targets, o) {
    $gsap.to(targets, {
      scaleX: 1,
      scaleY: 1,
      duration: o.duration,
      ease: 'power3.out',
      stagger: o.step,
      overwrite: true,
    })
  }

  function drawIn (root, opts = {}) {
    if (!root || typeof window === 'undefined') return
    const { $gsap, $ScrollTrigger } = useNuxtApp()
    if (!$gsap || !$ScrollTrigger || reduced()) return

    const els = [...root.querySelectorAll('[data-draw]')]
    if (!els.length) return

    const o = { ...DEFAULTS, ...opts }
    els.forEach(el => $gsap.set(el, axisProps(el)))

    whenIntroDone(() => {
      // 同 useFadeIn：等兩幀，Lenis 換頁重設捲動位置之後才量
      let frame = requestAnimationFrame(() => {
        pendingFrames.delete(frame)
        frame = requestAnimationFrame(() => {
          pendingFrames.delete(frame)
          if (!root.isConnected) return
          triggers.push(...$ScrollTrigger.batch(els, {
            start: o.start,
            once: true,
            onEnter: batch => show($gsap, batch, o),
          }))
        })
        pendingFrames.add(frame)
      })
      pendingFrames.add(frame)
    })
  }

  // 不等捲動、重畫一次（只畫看得到的那些；display:none 的留給之後的捲動）
  function drawNow (root, opts = {}) {
    if (!root || typeof window === 'undefined') return
    const { $gsap } = useNuxtApp()
    if (!$gsap || reduced()) return

    const els = [...root.querySelectorAll('[data-draw]')].filter(el => el.offsetParent)
    if (!els.length) return

    const o = { ...DEFAULTS, ...opts }
    els.forEach(el => $gsap.set(el, axisProps(el)))
    show($gsap, els, o)
  }

  function killDrawIns () {
    pendingFrames.forEach(frame => cancelAnimationFrame(frame))
    pendingFrames.clear()
    triggers.forEach(t => t.kill())
    triggers.length = 0
  }

  if (rootRef) {
    onMounted(() => drawIn(unref(rootRef), autoOpts))
    onBeforeUnmount(killDrawIns)
  }

  return { drawIn, drawNow, killDrawIns }
}
