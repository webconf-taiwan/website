// 進場動畫：捲到區塊時，區塊內標了 [data-fade="in"] 的元素由上而下逐項淡入。
//
// 標記法與參數命名跟 case-2026-focasa 的 effects.js（aosFadeIn）對齊，方便兩邊對照。
// 差別是那邊用 ScrollTrigger.batch 全域掃一次，這裡是「每個區塊自己建一個 trigger」——
// 全域批次會把整頁的元素混在同一批，捲到第一區時後面幾區也一起算進去了。
//
// 用法（兩種，效果一樣）：
//   1. 傳 ref 進來，掛載與清理都交給它 —— 新的地方用這個就好
//        const sectionRef = ref(null)
//        useFadeIn(sectionRef)
//        useFadeIn(sectionRef, { start: 'top 80%', end: 'bottom 10%', once: false })
//
//   2. 內容換掉、但區塊沒有離開畫面（例如 FAQ 換頁）
//        const { fadeInNow } = useFadeIn(sectionRef)
//        watch(page, async () => { await nextTick(); fadeInNow(listRef.value) })
//
//   3. 自己控制時機（例如同一個元件裡有兩個區塊要各自觸發）
//        const { fadeIn, killFadeIns } = useFadeIn()
//        onMounted(() => fadeIn(sectionRef.value))
//        onBeforeUnmount(() => killFadeIns())
//
// ⚠️ 初始的 opacity:0 是用 JS 設的，不是寫在 CSS 裡。
// 寫在 CSS 的話，萬一 JS 沒跑起來（載入失敗、gsap plugin 沒註冊、SSR 後 hydration
// 出錯）文字就永遠看不見了。用 JS 設至少是「壞掉時文字仍然可見」。
// 這些區塊都在首屏之外，設定前的那一幀使用者看不到，所以沒有閃動問題。
//
// ⚠️ 每個區塊要各自呼叫一次。多個區塊共用一個 trigger 的話，捲到第一個區塊時
// 後面區塊的文字就一起播完了，等使用者捲到那裡已經沒有進場可言。

const DEFAULTS = {
  step: 0.09,          // 每項之間的間隔（秒）
  duration: 0.7,       // 單項的淡入時長
  y: 16,               // 從下方多少 px 浮上來
  start: 'top 75%',    // 區塊頂邊到達視窗 75% 時觸發
  end: 'bottom 10%',   // 區塊底邊捲到視窗 10% 時算離開
  once: true,          // true = 播一次就定住；false = 進出視窗都重播（會用到 end）
}

export function useFadeIn (rootRef, autoOpts = {}) {
  const triggers = []

  function fadeIn (root, opts = {}) {
    if (!root || typeof window === 'undefined') return
    const { $gsap, $ScrollTrigger } = useNuxtApp()
    if (!$gsap || !$ScrollTrigger) return

    const els = root.querySelectorAll('[data-fade="in"]')
    if (!els.length) return

    // reduced-motion：完全不動，文字維持原樣直接可見
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const o = { ...DEFAULTS, ...opts }
    $gsap.set(els, { opacity: 0, y: o.y })

    const show = (stagger = o.step) => $gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: o.duration,
      ease: 'power2.out',
      stagger,
      overwrite: true,
    })

    // once:false 時，離開視窗要收回去 —— 往哪個方向收要跟捲動方向相反，
    // 不然元素會朝著使用者捲過來的方向跑，看起來像被推走。
    const hide = (y) => $gsap.to(els, {
      opacity: 0,
      y,
      duration: o.duration * 0.6,
      ease: 'power2.in',
      overwrite: true,
    })

    triggers.push($ScrollTrigger.create({
      trigger: root,
      start: o.start,
      end: o.end,
      once: o.once,
      onEnter: () => show(),
      // once:true 時 ScrollTrigger 本來就只會叫一次 onEnter，其餘不必掛
      onEnterBack: o.once ? undefined : () => show(o.step * 0.8),
      onLeave: o.once ? undefined : () => hide(-o.y),
      onLeaveBack: o.once ? undefined : () => hide(o.y),
    }))
  }

  // 不等捲動、立刻播一次。用在「內容換掉了但區塊沒動」的情況 ——
  // 例如 FAQ 換頁：ScrollTrigger 那條 once 早就播完了，新換上來的題目
  // 是全新的 DOM（v-for 的 key 換了），不補這一下就會直接硬跳出來。
  // ⚠️ 呼叫前要先 await nextTick()，不然抓到的還是舊的那批元素。
  function fadeInNow (root, opts = {}) {
    if (!root || typeof window === 'undefined') return
    const { $gsap } = useNuxtApp()
    if (!$gsap) return

    const els = root.querySelectorAll('[data-fade="in"]')
    if (!els.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const o = { ...DEFAULTS, ...opts }
    $gsap.fromTo(els,
      { opacity: 0, y: o.y },
      {
        opacity: 1,
        y: 0,
        duration: o.duration,
        ease: 'power2.out',
        stagger: o.step,
        overwrite: true,
      })
  }

  function killFadeIns () {
    triggers.forEach(t => t.kill())
    triggers.length = 0
  }

  // 傳了 ref 就自動接上元件的生命週期。ScrollTrigger 一定要在 onMounted 之後才建，
  // 那時 DOM 才量得到位置。
  if (rootRef) {
    onMounted(() => fadeIn(unref(rootRef), autoOpts))
    onBeforeUnmount(killFadeIns)
  }

  return { fadeIn, fadeInNow, killFadeIns }
}
