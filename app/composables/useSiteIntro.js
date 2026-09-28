// 首次進站的 loading（LayoutPageIntro）跑完了沒，以及它要等哪些資源。
//
// 判斷方式照 ntcart 的 preloader：loading 元件掛在 app.vue，SSR 就輸出、整站只 mount
// 一次 —— 從外部網址進站（含重新整理）一定會看到；站內 SPA 換頁不會重掛，所以不會再出現。
//
// 頁面的進場動畫（useFadeIn、Header 的 logo／選單）一律透過 whenIntroDone 排隊，
// 等 loading 淡出後才開始播，不會在遮罩底下偷偷播完。站內換頁時 introDone 早就是
// true，callback 會立刻執行，行為跟以前一樣。
//
// ── 資源登記（trackIntro）─────────────────────────────────────────────────────
// loading 的藍線就是「登記過的工作完成了幾件」。除了 Intro 自己登記的 window.load、
// 字型、首屏圖片，頁面上的重資源要自己登記，不然 loading 收掉時它們還在背景載：
//   onMounted(() => { trackIntro(init()) })
// 目前登記的是各個粒子場的 init() —— particle-kit 7 支 script、WebGPU 裝置與
// shader 編譯（makeEngine）、圖片點雲取樣（PLImage.prepare）都在裡面。
// 之後新增 three.js 之類的重資源，照同樣方式把「可以開始播了」的那個 promise 登記進來。
// loading 已經結束（站內換頁）時 trackIntro 什麼都不做，直接回傳原 promise。

// 整站只有一份（client 端單一 app），不放 useState：promise 不能序列化進 payload
const tasks = []
let lastRegisteredAt = 0

export function useSiteIntro () {
  const introDone = useState('site-intro-done', () => false)

  // 已經跑完 → 立刻執行；還沒 → 等 introDone 變 true 時執行一次
  function whenIntroDone (cb) {
    if (introDone.value) return cb()
    const stop = watch(introDone, (v) => {
      if (!v) return
      stop()
      cb()
    })
  }

  // 登記一件 loading 要等的工作。失敗也算完成（壞掉的資源不該把整站卡在 loading）
  function trackIntro (promise) {
    if (import.meta.server || introDone.value || !promise?.then) return promise
    const task = { done: false }
    tasks.push(task)
    lastRegisteredAt = performance.now()
    promise.then(() => { task.done = true }, () => { task.done = true })
    return promise
  }

  // 給 Intro 算進度用
  function introTaskState () {
    return {
      total: tasks.length,
      done: tasks.filter(t => t.done).length,
      lastRegisteredAt,
    }
  }

  return { introDone, whenIntroDone, trackIntro, introTaskState }
}
