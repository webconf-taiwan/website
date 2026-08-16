// 文字進場：捲到區塊時，區塊內標了 [data-stagger] 的元素由上而下逐項淡入。
//
// 用法：
//   const { staggerIn, killStaggers } = useStaggerIn()
//   onMounted(() => staggerIn(sectionRef.value))
//   onBeforeUnmount(() => killStaggers())
//
// ⚠️ 初始的 opacity:0 是用 JS 設的，不是寫在 CSS 裡。
// 寫在 CSS 的話，萬一 JS 沒跑起來（載入失敗、gsap plugin 沒註冊、SSR 後 hydration
// 出錯）文字就永遠看不見了。用 JS 設至少是「壞掉時文字仍然可見」。
// 這些區塊都在首屏之外，設定前的那一幀使用者看不到，所以沒有閃動問題。
//
// ⚠️ 每個區塊要各自呼叫一次。多個區塊共用一個 trigger 的話，捲到第一個區塊時
// 後面區塊的文字就一起播完了，等使用者捲到那裡已經沒有進場可言。

const DEFAULTS = {
  step: 0.09,        // 每項之間的間隔（秒）
  duration: 0.7,     // 單項的淡入時長
  y: 16,             // 從下方多少 px 浮上來
  start: 'top 75%',  // 區塊頂邊到達視窗 75% 時觸發
}

export function useStaggerIn () {
  const triggers = []

  function staggerIn (root, opts = {}) {
    if (!root || typeof window === 'undefined') return
    const { $gsap, $ScrollTrigger } = useNuxtApp()
    if (!$gsap || !$ScrollTrigger) return

    const els = root.querySelectorAll('[data-stagger]')
    if (!els.length) return

    // reduced-motion：完全不動，文字維持原樣直接可見
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const o = { ...DEFAULTS, ...opts }
    $gsap.set(els, { opacity: 0, y: o.y })
    triggers.push($ScrollTrigger.create({
      trigger: root,
      start: o.start,
      once: true,          // 進場只播一次，來回捲動不重播（重播很煩）
      onEnter: () => {
        $gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: o.duration,
          ease: 'power2.out',
          stagger: o.step,
        })
      },
    }))
  }

  function killStaggers () {
    triggers.forEach(t => t.kill())
    triggers.length = 0
  }

  return { staggerIn, killStaggers }
}
