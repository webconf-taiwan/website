// 粒子的「裝置效能檔位」—— 全 app 單例（同 useParticleStage / useViewportMode 的寫法）。
//
// 這一版只做 pre-flight：在建引擎「之前」用 navigator 訊號決定一個檔位，往下鎖。
// 執行期量測與降檔是下一階段，見 docs/particle-performance.md 階段 3。
//
// ─── ⚠️ 契約：只會減、不會加 ───────────────────────────────────────────────
// 跟 useParticleBudget 同一個契約，而且理由更強：
// **沒有任何 navigator 訊號可以證明「這台機器很快」。**
//   · Safari / Firefox 沒有 deviceMemory，Safari 也沒有 connection
//   · iOS 的 UA 一律只回 "iPhone"，查不到型號
//   · 有 WebGPU 的 iPhone 最舊是 11、最新是 17，GPU 差 5~8 倍，API 上分不出來
// 所以這裡的角色不是「猜出正確檔位」，而是「把已知必然的低階情境往下鎖」。
// 在 iOS 上它幾乎什麼都做不了 —— 真正的工程投入必須放在執行期量測。
//
// ─── 刻意不用的訊號 ────────────────────────────────────────────────────────
//   hardwareConcurrency  CPU 核心數，而我們是 GPU-bound；big.LITTLE 讓低階與
//                        旗艦 Android 都回 8，區分不出東西
//   UA / userAgentData   iOS 查不到型號；Android 的機型表必然過時，維護成本
//                        遠大於收益
//   devicePixelRatio     跟 GPU 吞吐沒有因果關係
//   螢幕尺寸             同上

// ⚠️ TIER_DEFAULT / TIER_FLOOR / tierKnobs 與 particleDebugFromLocation 都靠
// Nuxt 的 auto-import（app/utils/ 底下的 export 全站可見），跟專案其他地方一致。

// 模組層級 ref = 全 app 單例。SSR 期間永遠是初始值（只有 client 程式碼會寫入），
// 所以不會有跨請求汙染。
const tier = ref(TIER_DEFAULT)
const tierReady = ref(false)

// 沒有 WebGPU（= makeEngine 會靜默 fallback 到 particle-life.js 的 CPU 後端）。
// ⚠️ 這跟「檔位低」是兩件事，呼叫端要分開處理 —— 見 particleTiers.js 的
// CPU_FALLBACK_MAX_COUNT 註解。
const cpuFallback = ref(false)

let started = false
let forcedTier = null
let showFps = false
const readyWaiters = []

/**
 * 依 navigator 訊號決定開場檔位。只會往下鎖，不會往上加。
 *
 * @returns {number}
 */
function preflightTier () {
  if (typeof navigator === 'undefined') return TIER_DEFAULT

  // ⚠️ 全部訊號裡唯一決定性的一條，而且它擋的是「量級錯誤」而不是效能微調：
  // 沒有 navigator.gpu → makeEngine 會靜默落到 particle-life.js（CPU 後端），
  // 而那支硬寫 dpr cap = 2（完全不看我們傳的 maxDpr）、又照單全收我們傳的
  // 8000+ 顆 —— 在 JS 主執行緒上跑空間雜湊 + canvas2d 逐顆 drawImage。
  //
  // 更糟的是它「沒有 setTargets / setMorph」，所以 buildHold() / buildTargets()
  // 的守門會直接 return false → 開場構圖、人像收攏、閃動、換人動畫全部靜默失效。
  // 也就是這些裝置付了最高的成本，卻拿到壞掉的畫面。
  if (!navigator.gpu) {
    cpuFallback.value = true

    return TIER_FLOOR
  }

  let t = TIER_DEFAULT

  // 使用者「說」的比我們「猜」的可信。
  // ⚠️ 這也是 prefers-reduced-motion 第一次真的降低 GPU 負載 —— 現在六個元件
  // 都只關掉額外動態（漂移、呼吸、閃動、ambient、tween），compute 與 render
  // pass 一個都沒少，對電池與發熱幾乎沒有幫助。
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) t = Math.min(t, 1)

  // 明確的省電省流量意圖（Chrome / Android only，Safari 沒有 connection）
  if (navigator.connection?.saveData === true) t = Math.min(t, 1)

  // ⚠️ Safari / Firefox 沒有 deviceMemory，值是 undefined。
  // undefined 一律當「沒訊號」，不可以推論成低階 —— 否則全 iPhone 都被打成 t1。
  const mem = navigator.deviceMemory
  if (typeof mem === 'number') {
    if (mem <= 2) t = Math.min(t, 0)
    else if (mem <= 4) t = Math.min(t, 1)
  }

  return t
}

function settle () {
  if (tierReady.value) return
  tierReady.value = true
  while (readyWaiters.length) readyWaiters.shift()(tier.value)
}

function start () {
  if (started || typeof window === 'undefined') return
  started = true

  const dbg = particleDebugFromLocation()
  showFps = dbg.showFps

  // ?tier=0~3 強制覆寫：不做偵測、不做任何升降。
  // 給設計師在桌機上看各檔位長相用（配 ?fps=1 並把視窗縮到 390×844）——
  // 那是驗收低檔位 pointSize / opacity 補償值的唯一實用方式，
  // 因為那幾個數字是為了讓「極稀」看起來像刻意的設計而不是壞掉，只能靠肉眼定。
  if (dbg.forcedTier !== null) {
    forcedTier = dbg.forcedTier
    tier.value = forcedTier
    // ⚠️ cpuFallback 仍然照實偵測 —— 那是「引擎能力」不是「畫質偏好」，
    // 強制檔位不該讓 CPU 路徑拿到它跑不動的點數。
    cpuFallback.value = !navigator.gpu
    settle()

    return
  }

  tier.value = preflightTier()
  settle()
}

export function useParticleQuality () {
  start()

  if (import.meta.dev && typeof window !== 'undefined') {
    window.__pq = () => ({
      tier: tier.value,
      ready: tierReady.value,
      forced: forcedTier,
      cpuFallback: cpuFallback.value,
      gpu: !!navigator.gpu,
      deviceMemory: navigator.deviceMemory ?? null,
      saveData: navigator.connection?.saveData ?? null,
      reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? null,
    })

    // ⚠️ 只記錄不採用。先在真實裝置上收集 adapter.info 長什麼樣，之後再決定要不要
    // 拿它分檔 —— 現在就照著猜（例如「看到 mali 就打成低階」）只會製造誤判。
    // 各瀏覽器的曝露程度與去識別程度都還沒查證。
    if (!window.__pqAdapter && navigator.gpu?.requestAdapter) {
      navigator.gpu.requestAdapter()
        .then((a) => { window.__pqAdapter = a?.info ?? null })
        .catch(() => { window.__pqAdapter = null })
    }
  }

  return {
    tier,
    tierReady,
    cpuFallback,
    showFps: () => showFps,

    /**
     * 這個 profile 在目前檔位的旋鈕值。
     * @param {'mobileField'|'speakerPortrait'} profile
     */
    knobs: profile => tierKnobs(profile, tier.value),

    /**
     * 等檔位定案。
     * ⚠️ 永遠 resolve、不會 reject、不會卡死 —— 呼叫端（SpeakerPortrait.init）
     * 會 await 它才建引擎，卡住等於那一區永遠沒有人像。
     * 目前只有 pre-flight，所以它其實是同步就緒的；等執行期量測上線之後
     * 這裡才會真的等一個量測視窗。
     */
    whenTierReady () {
      if (tierReady.value) return Promise.resolve(tier.value)

      return new Promise(resolve => readyWaiters.push(resolve))
    },
  }
}
