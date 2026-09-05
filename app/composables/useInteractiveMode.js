// 互動模式（彩蛋）—— 用手勢代替滑鼠去推粒子。
//
// 開啟方式：同時按住 W + 2 + 6（W = WebConf、26 = 2026）。跳出確認窗，按下確認才會要相機權限。
// 關閉方式：Esc，或確認窗上的取消。
//
// ⚠️ 為什麼要「同時按住」而不是依序按：這是彩蛋，不該被一般打字誤觸。
// 用 e.code（KeyW / Digit2 / Digit6）而不是 e.key —— 中文輸入法下 e.key 可能是全形字元。
// ⚠️ 原本是 Control + 2 + 6，但 Control 組合鍵會踩到瀏覽器與作業系統的既有捷徑，
// 改成三個一般鍵。
//
// ⚠️ 狀態放在模組層級（跟 useParticleStage 一樣），全站共用同一份：
// 觸發鍵盤的是頁面、關滑鼠推擠的是 HomeField、開相機的是 HomeHandField，
// 三個不同的元件要看到同一個狀態。

const mode = ref('off')        // off | asking（確認窗開著）| on（相機與手勢跑起來了）
const lastError = ref('')      // 相機或模型失敗時給使用者看的訊息

let bound = false
const held = new Set()

function onKeyDown (e) {
  // Esc：不管在哪個狀態都退出（確認窗開著也算）
  if (e.key === 'Escape' && mode.value !== 'off') {
    e.preventDefault()
    close()
    return
  }

  held.add(e.code)
  if (held.has('KeyW') && held.has('Digit2') && held.has('Digit6') && mode.value === 'off') {
    e.preventDefault()
    held.clear()
    mode.value = 'asking'
  }
}

function onKeyUp (e) { held.delete(e.code) }
// 切到別的視窗時鍵盤事件收不到 keyup，回來時集合裡會殘留按鍵
function onBlur () { held.clear() }

function bind () {
  if (bound || typeof window === 'undefined') return
  bound = true
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)
}

function confirm () {
  lastError.value = ''
  mode.value = 'on'
}

// 進互動模式時把畫面帶回 PL.I。
// ⚠️ 這不是為了好看：粒子的分佈跟著捲動位置變形，捲到 about／venue 那幾格時
// 粒子會縮成一小團偏在某一側，手在別的地方比劃根本沒有東西可以推 ——
// 實測就是「捏了沒反應」的主因。hero 那格是滿版自由場，才玩得起來。
function scrollToField (lenis) {
  if (lenis) lenis.scrollTo(0, { duration: 1.1 })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

function close () {
  mode.value = 'off'
  held.clear()
}

function fail (message) {
  lastError.value = message
  mode.value = 'off'
}

export function useInteractiveMode () {
  onMounted(bind)

  return {
    mode,
    lastError,
    isOn: computed(() => mode.value === 'on'),
    isAsking: computed(() => mode.value === 'asking'),
    confirm,
    close,
    fail,
    scrollToField,
  }
}
