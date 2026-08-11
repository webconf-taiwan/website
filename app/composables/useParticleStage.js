// 首頁上不只一張粒子 canvas（背景滿版場、PL.III 講者人像…），但「同時只能有一張在跑」。
//
// 為什麼要仲裁：每張場都是幾萬顆粒子的 compute pass + HDR render pass，兩張並跑
// 直接把 fps 砍半。而且設計上也不需要 —— 講者區塊捲到畫面中央時，背景粒子已經被
// 這個區塊蓋掉大半，繼續算它是純粹的浪費。
//
// 為什麼「暫停」在畫面上看不出來：engine.pause() 只是跳過計算與渲染，canvas 會
// 保留最後一幀，所以背景不會消失、只是定格。交棒的瞬間沒有閃爍或空白。
//
// 用法：
//   const { activeStage, claimStage, releaseStage } = useParticleStage()
//   claimStage('speaker')            // 我要上台 → 其他人自己 pause
//   releaseStage('speaker')          // 我下台 → 交還給背景
//   watch(activeStage, v => engine.pause(v !== 'speaker'))

// 模組層級 ref = 全 app 單例。SSR 期間永遠是 'background'（只有 onMounted 之後的
// client 程式碼會寫入），所以不會有跨請求汙染。
const activeStage = ref('background')

// --- 閒置暫停 --------------------------------------------------------------
// 使用者停止操作超過 IDLE_STOP_MS 就把所有粒子場停掉。
// ⚠️ 這不是可有可無的優化：幾萬顆粒子的 compute pass 全速跑會讓筆電發燙、耗電，
// 而使用者沒在看的時候完全沒有理由繼續算。
//
// 為什麼放在這裡而不是各元件自己做：三張 canvas 各寫一份，遲早會漏掉其中一張
//（實際上就發生過 —— PL.III 與 PL.IV/V 都漏了）。集中在仲裁層，新增 canvas 只要
// 記得「pause 條件要 && !idle」就好。
//
// 除了滑鼠移動，捲動與觸控也算 —— 否則用觸控板捲頁時（不會發 pointermove）
// 場域會直接定格，看起來像壞掉。
const IDLE_STOP_MS = 5000
const idle = ref(false)

let idleTimer = 0
let listening = false
let lastX = -1
let lastY = -1

function poke () {
  if (idle.value) idle.value = false
  clearTimeout(idleTimer)
  idleTimer = setTimeout(() => { idle.value = true }, IDLE_STOP_MS)
}

// ⚠️ 座標沒變的 pointermove 不算活動。
// 瀏覽器在「內容自己在動、但滑鼠停著」時仍會發合成的 pointermove（實測靜置 4 秒
// 收到 8 次）。照單全收的話閒置永遠不會觸發，這個省電機制等於沒做。
function pokeFromPointer (ev) {
  if (ev.clientX === lastX && ev.clientY === lastY) return
  lastX = ev.clientX
  lastY = ev.clientY
  poke()
}

// 監聽器全 app 只掛一次，不隨元件生滅
function startWatchingActivity () {
  if (listening || typeof window === 'undefined') return
  listening = true
  window.addEventListener('pointermove', pokeFromPointer, { passive: true })
  for (const ev of ['pointerdown', 'scroll', 'wheel', 'keydown', 'touchstart']) {
    window.addEventListener(ev, poke, { passive: true })
  }
  poke()
}

export function useParticleStage () {
  startWatchingActivity()
  // dev 觀測點：在 console 直接看目前是誰在台上、有沒有閒置
  if (import.meta.dev && typeof window !== 'undefined') {
    window.__stage = () => ({ active: activeStage.value, idle: idle.value })
  }

  function claimStage (name) {
    if (activeStage.value !== name) activeStage.value = name
  }

  // 只在「目前確實是自己在台上」時才交還。
  // ⚠️ 這個判斷不能省：ScrollTrigger 的 onLeave 與下一區塊的 onEnter 先後次序
  // 不保證，若無條件寫回 'background'，快速捲動時會把剛上台的下一張踢掉。
  function releaseStage (name, fallback = 'background') {
    if (activeStage.value === name) activeStage.value = fallback
  }

  return { activeStage, idle, claimStage, releaseStage }
}
