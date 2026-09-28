<script setup>
/**
 * 首次進站 loading（Figma node 40005144-3398）
 *
 * 流程：
 *   0. 灰色圓圈從中心放大
 *   1. 四組文字隨機挑一組，以「亂碼解碼」方式由左到右定格（參考 db-portfolio-25 的 preloader）
 *   2. 灰色圓圈底線上，藍線從 12 點鐘方向順時針畫一圈 —— 進度跟著真實載入狀態走
 *   3. 藍線畫完 → 圓圈稍微縮小 → 整層淡出 → introDone = true，頁面進場動畫才開始
 *
 * 何時出現（照 ntcart 的 preloader）：
 *   - 掛在 app.vue、SSR 就輸出，整站只 mount 一次 —— 從外部網址進站、重新整理都會看到
 *   - 站內 SPA 換頁不會重掛，所以不會再出現（換頁有 LayoutPageTransition 的黑幕）
 *   - prefers-reduced-motion 直接跳過；關閉 JS 時由 <noscript> 的 style 隱藏
 *
 * 進度 = 登記的工作完成了幾件（見 useSiteIntro 的 trackIntro）：
 *   - 這裡自己登記：首屏非 lazy 圖片、window.load、字型
 *   - 頁面自己登記：各個粒子場的 init()（particle-kit script、WebGPU 引擎、圖片點雲取樣）
 * 全部完成、而且 SETTLE_MS 內沒有新登記（晚 mount 的 ClientOnly 元件也來得及報到）
 * 才畫滿最後一段。最多等 MAX_WAIT_MS —— WebGPU 卡住之類的情況不能讓整站停在 loading。
 * 顯示的進度有速度上限（MIN_DRAW_MS 畫滿一圈），快網路也看得到完整的畫線。
 */
const PHRASES = [
  'Observing speaker ideas...',
  'Tracing key questions...',
  'Connecting session threads...',
  'Finding emerging patterns...'
]
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&*+=<>/[]'
const SCRAMBLE_MS = 900       // 文字解碼總長
const DRAW_DELAY_MS = 300     // 文字先開始，藍線稍後才開始畫
const MIN_DRAW_MS = 1400      // 藍線畫滿一圈最快要多久
const FONTS_TIMEOUT_MS = 3000
const SETTLE_MS = 400         // 最後一件工作登記後，再等這麼久沒有新登記才算「全部到齊」
const MAX_WAIT_MS = 12000     // 最多等多久（從 mount 起算），超過就不等了直接收
const RING_IN_S = 0.8         // 開場：圓圈從中心放大的時長，放大完文字才開始解碼
const FADE_OUT_S = 0.8        // 收尾：整層淡出的時長

const R = 199.5               // viewBox 400，1px 線畫在邊緣內側半格
const CIRCUMFERENCE = 2 * Math.PI * R

const { introDone, trackIntro, introTaskState } = useSiteIntro()
const sound = useSiteSound()
// ⚠️ 在 setup 就先拿好：finish() 是在 await / gsap 回呼裡跑的，那時已經沒有 Nuxt context
const { $gsap, $lenis } = useNuxtApp()
const visible = ref(!introDone.value)
const text = ref('')
const progress = ref(0)       // 0 ~ 1，畫面上藍線的長度

const rootRef = ref(null)
const ringRef = ref(null)
const textRef = ref(null)

// 載入中鎖住整頁捲動（SSR 就帶上，hydration 前也捲不動）
useHead({ htmlAttrs: { class: computed(() => (visible.value ? 'overflow-hidden' : '')) } })

// 關閉 JS 時隱藏遮罩（寫法理由見 ntcart Preloader.vue：v-html 才不會 hydration mismatch）
const noscriptStyle = '<style>#site-intro{display:none !important}</style>'

let raf = 0
let scrambleRaf = 0

function scramble (target) {
  return new Promise((resolve) => {
    const start = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - start) / SCRAMBLE_MS)
      const settled = Math.floor(t * target.length)
      let out = target.slice(0, settled)
      for (let i = settled; i < target.length; i++) {
        out += target[i] === ' ' ? ' ' : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0]
      }
      text.value = out
      if (t < 1) scrambleRaf = requestAnimationFrame(step)
      else resolve()
    }
    scrambleRaf = requestAnimationFrame(step)
  })
}

function waitWindowLoad () {
  if (document.readyState === 'complete') return Promise.resolve()
  return new Promise(resolve => window.addEventListener('load', resolve, { once: true }))
}

function waitFonts () {
  if (!document.fonts?.ready) return Promise.resolve()
  return Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, FONTS_TIMEOUT_MS))])
}

// 首屏的非 lazy 圖片：每張各自登記成一件工作，張數多的頁面藍線就走得比較細
function trackImages () {
  const imgs = [...document.querySelectorAll('img:not([loading="lazy"])')].filter(i => !i.complete)
  imgs.forEach(img => trackIntro(new Promise((resolve) => {
    img.addEventListener('load', resolve, { once: true })
    img.addEventListener('error', resolve, { once: true })
  })))
}

// 藍線該畫到哪：完成件數 / 總件數；全部完成且到齊（或逾時）才給 1
function targetNow (startedAt) {
  const now = performance.now()
  if (now - startedAt > MAX_WAIT_MS) return 1
  const { total, done, lastRegisteredAt } = introTaskState()
  if (done === total && now - lastRegisteredAt > SETTLE_MS) return 1
  return total ? Math.min(0.97, done / total) : 0
}

// 藍線：每幀往 target 靠近，但速度不超過「MIN_DRAW_MS 畫滿一圈」。
// 只進不退 —— 晚到的工作登記進來會讓完成比例變小，線不能因此倒退。
function drawTo (getTarget) {
  return new Promise((resolve) => {
    let last = performance.now()
    const step = (now) => {
      const dt = now - last
      last = now
      const target = getTarget()
      const maxStep = dt / MIN_DRAW_MS
      progress.value = Math.max(progress.value, Math.min(target, progress.value + maxStep))
      if (progress.value >= 1) return resolve()
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
  })
}

function finish () {
  const done = () => {
    visible.value = false
    introDone.value = true
    $lenis?.start()
  }
  if (!$gsap || !rootRef.value) return done()

  $gsap.timeline({ onComplete: done })
    .to({}, { duration: 0.15 })
    // 藍線畫完 → 圓圈稍微縮小，文字同時收掉
    .to(ringRef.value, { scale: 0.9, duration: 0.6, ease: 'power3.inOut' })
    .to(textRef.value, { opacity: 0, duration: 0.35, ease: 'power2.in' }, '<')
    // 縮到一半開始整層淡出，露出底下的頁面
    .to(rootRef.value, { opacity: 0, duration: FADE_OUT_S, ease: 'power2.out' }, '-=0.25')
}

onMounted(async () => {
  if (!visible.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    visible.value = false
    introDone.value = true
    return
  }

  $lenis?.stop()

  // 自己登記的基本工作；頁面的重資源（粒子場 init）由各元件自己 trackIntro
  const startedAt = performance.now()
  trackImages()
  trackIntro(waitWindowLoad())
  trackIntro(waitFonts())

  // loading 音：開機 thump 對齊圓圈放大。瀏覽器還不允許出聲時會安靜略過（見 plugins/sound.client.js）
  sound.introStart()

  // 圓圈先從中心放大（SSR 時就是 scale-0，hydration 前不會先閃一個滿版的圈），放大完文字才出現
  if ($gsap && ringRef.value) {
    await new Promise(resolve => $gsap.fromTo(ringRef.value,
      { scale: 0 },
      { scale: 1, duration: RING_IN_S, ease: 'power3.out', onComplete: resolve }))
  } else if (ringRef.value) {
    ringRef.value.style.transform = 'none'
  }

  const phrase = PHRASES[(Math.random() * PHRASES.length) | 0]
  const textDone = scramble(phrase)
  await new Promise(resolve => setTimeout(resolve, DRAW_DELAY_MS))
  // 藍線真的畫滿那一刻播「鎖定」音 —— 不等文字解碼，跟畫面對齊
  await Promise.all([textDone, drawTo(() => targetNow(startedAt)).then(() => sound.introLock())])

  finish()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  cancelAnimationFrame(scrambleRaf)
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- 固定字串，無使用者輸入 -->
  <noscript v-html="noscriptStyle"></noscript>
  <div
    v-if="visible"
    id="site-intro"
    ref="rootRef"
    class="fixed inset-0 z-[3000] flex items-center justify-center bg-bg-mid motion-reduce:hidden"
    role="status"
    aria-live="polite"
    aria-label="網站載入中"
  >
    <div ref="ringRef" class="relative aspect-square w-[min(400px,calc(100vw-48px))] scale-0">
      <svg class="absolute inset-0 size-full -rotate-90" viewBox="0 0 400 400" fill="none" aria-hidden="true">
        <!-- 底圈 -->
        <circle cx="200" cy="200" :r="R" stroke="rgba(239,230,210,0.2)" stroke-width="1" />
        <!-- 藍線：從 12 點鐘順時針（整個 svg 轉 -90°，circle 起點在 3 點鐘） -->
        <circle
          cx="200"
          cy="200"
          :r="R"
          stroke="#7CC8F2"
          stroke-width="1"
          :stroke-dasharray="CIRCUMFERENCE"
          :stroke-dashoffset="CIRCUMFERENCE * (1 - progress)"
        />
      </svg>
      <p
        ref="textRef"
        class="absolute inset-0 flex items-center justify-center whitespace-pre text-body-sm text-pre-800"
        aria-hidden="true"
      >{{ text }}</p>
    </div>
  </div>
</template>
