// 進場動畫：區塊內標了 [data-fade="in"] 的元素，「每一個各自」進到視窗 90% 處時淡入。
//
// ⚠️ 觸發點是「元素自己」的頂邊到視窗 90%，不是「所屬區塊」的頂邊。
// 以前是每個區塊建一個 trigger（區塊頂邊到 75% 時整區一起播），區塊很高時下半部的
// 元素在畫面外就播完了 —— 票券區實測 7 個項目有 5 個在觸發時看不到，手機上最遠差
// 1100px，等使用者捲到那裡已經沒有進場可言。
// ScrollTrigger.batch 會把「短時間內一起進來」的元素打包成同一批、依序 stagger：
// 首屏一次進來一大群 → 由上而下級聯；慢慢捲 → 一個一個各自淡入。
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
// 這些元素多半在首屏之外，設定前的那一幀使用者看不到，所以沒有閃動問題。
//
// ⚠️ 每個區塊仍然要各自呼叫一次（每個 root 只管自己底下的元素），不要在頁面最上層
// 全域掃一次 —— 各區塊的 mount 時機不同，全域掃會抓到還沒渲染好的區塊。

const DEFAULTS = {
  step: 0.09,          // 同一批之間每項的間隔（秒）
  duration: 0.7,       // 單項的淡入時長
  y: 16,               // 從下方多少 px 浮上來
  start: 'top 90%',    // 元素自己的頂邊到達視窗 90% 時觸發
  end: 'bottom 10%',   // 元素底邊捲到視窗 10% 時算離開（once:false 才會用到）
  once: true,          // true = 播一次就定住；false = 進出視窗都重播
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

    // targets 是「這一批」進來的元素（batch 給的），不是整個區塊
    const show = (targets, stagger = o.step) => $gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: o.duration,
      ease: 'power2.out',
      stagger,
      overwrite: true,
    })

    // once:false 時，離開視窗要收回去 —— 往哪個方向收要跟捲動方向相反，
    // 不然元素會朝著使用者捲過來的方向跑，看起來像被推走。
    const hide = (targets, y) => $gsap.to(targets, {
      opacity: 0,
      y,
      duration: o.duration * 0.6,
      ease: 'power2.in',
      overwrite: true,
    })

    triggers.push(...$ScrollTrigger.batch(els, {
      start: o.start,
      end: o.end,
      once: o.once,
      onEnter: batch => show(batch),
      // once:true 時 ScrollTrigger 本來就只會叫一次 onEnter，其餘不必掛
      onEnterBack: o.once ? undefined : batch => show(batch, o.step * 0.8),
      onLeave: o.once ? undefined : batch => hide(batch, -o.y),
      onLeaveBack: o.once ? undefined : batch => hide(batch, o.y),
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
