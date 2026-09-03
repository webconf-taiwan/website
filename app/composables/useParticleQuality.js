// 粒子的「裝置效能檔位」—— 全 app 單例（同 useParticleStage / useViewportMode 的寫法）。
//
// 兩段式：
//   1. pre-flight —— 建引擎「之前」用 navigator 訊號決定開場檔位，往下鎖
//   2. 執行期量測 —— 一個共用 rAF 量整頁的交幀節奏，撐不住就再往下降
// 兩段都只會減、不會加（升檔是下一階段的事，見下面 demote() 的長註解）。
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

// --- 執行期量測的參數 -------------------------------------------------------
// ⚠️ 量的是「幀時間分佈」，不是 fps。理由見 measure() 上面那段。
const TARGET_P50_MS = 33.3       // 幀時間中位數的容忍上限（= 30fps）
const P95_SPIKE_MULT = 3         // p95 超過幾個 vsync 算「有明顯卡頓尖峰」

const WINDOW_MAX_MS = 1500       // 一個量測視窗的時間上限
const WINDOW_MAX_FRAMES = 90     // 幀數上限（快機器上早點收斂）
const WINDOW_MIN_FRAMES = 20     // 少於這個就不算數，樣本太少

const WARMUP_MS = 1200           // 第一次有引擎在跑之後，這麼久內完全不採樣
const RESUME_SETTLE_MS = 250     // 之後每次從 pause 醒來的沉澱
const COOLDOWN_MS = 4000         // 檔位變動後完全不採樣多久
const RESPAWN_SETTLE_MS = 800    // setCount 之後（呼叫端用 noteRespawn）
const VISIBILITY_SETTLE_MS = 500 // 分頁切回來
const READBACK_SETTLE_MS = 600   // readParticles + buildSlotTargets（呼叫端用 suspend）

const FAIL_STREAK = 2            // 連續幾個視窗失敗才降檔
const MAX_DEMOTIONS = 2          // 整個 page view 最多降幾次（= 最多幾次 respawn）

// vsync 週期的候選格點（120 / 90 / 60Hz）
const VSYNC_GRID = [8.333, 11.111, 16.667]

const stats = ref({ p50: 0, p95: 0, vsync: 16.667, drop: 0, samples: 0, windows: 0 })

let started = false
let stopped = false
let forcedTier = null
let showFps = false
const readyWaiters = []
const listeners = new Set()

// 哪些引擎「現在真的在渲染」。⚠️ 這是整個量測正確性的關鍵，見 markActive。
const activeIds = new Set()

let raf = 0
let prevTs = 0
let deltas = []
let windowStart = 0
let notBefore = 0                // 早於這個時間戳的樣本一律丟掉
let warmedUp = false
let failStreak = 0
let demotions = 0

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

// --- 執行期量測 -------------------------------------------------------------
//
// ⚠️ 為什麼不用 engine.getFps()。這是最容易被人「順手改回去」的地方，
// 五個理由都是讀原始碼確認的：
//   1. fpsSmoothed 初值**硬編 60**（particle-life-gpu.js:702），EMA α=0.08 要約
//      40 幀才收斂 95%。15fps 的機器上那是 2.7 秒 —— 而舊程式碼在 900ms 就讀它，
//      讀到的有一半以上還是初值 60。這就是那個「fps<45 就減半」幾乎不觸發的原因。
//   2. instFps 用未 clamp 的 real dt（:1397），切分頁回來會被一個 5 秒的 dt
//      拉出假低點。
//   3. pause(true) 時 EMA 仍在更新（:1391-1399 在 if (!config.paused) 之外）
//      —— 量到的是 rAF 節奏不是渲染負載。兩張 canvas 裡被暫停的那張會回報「很順」。
//   4. per-engine，但使用者感受到的是整頁的流暢度。
//   5. readParticles() 是 GPU→CPU 的 mapAsync 硬同步點，會汙染 EMA 好幾秒。
//
// ⚠️ 也不量「fps 絕對值」，量幀時間的百分位數。
// 絕對 fps 在 ProMotion 上會騙人：120Hz 面板跑到穩定 60fps，「掉幀率」是 0.5，
// 數字看起來像災難但體感非常順；60Hz 面板的 60fps 掉幀率是 0。
// 同樣的體感、兩個極端的數字。
// 用百分位數而不是 EMA / 平均：一次 GC、一次圖片解碼、一次 buildSlotTargets 的
// 200ms 尖峰會把平均整個帶歪，但只會動到 p95。那正是 getFps() 的 EMA 犯的錯。

// vsync 週期取「這個視窗裡看過的最短幀間隔」再吸附到格點 —— 瀏覽器最快也不可能
// 比 vsync 快，所以 min 就是週期的上界估計。
//
// ⚠️ 每個視窗都重估，不要只在開場估一次就當常數：
//   · ProMotion 是可變更新率，系統認為內容靜止時會自己降到 60 / 48 / 24
//   · 使用者可能把視窗拖到另一台外接螢幕
//   · iOS Safari 在 ProMotion 上是否把 rAF 壓在 60Hz —— 沒查證，但這段設計不
//     依賴它：我們要的本來就是「這台機器現在實際交得出來的節奏」，不是面板規格
function snapVsync (minDelta) {
  if (minDelta > 20) return 16.667      // 連 16.7 都摸不到 → 當 60Hz 面板

  let best = VSYNC_GRID[0]
  let err = Infinity
  for (const v of VSYNC_GRID) {
    const e = Math.abs(minDelta - v)
    if (e < err) { err = e; best = v }
  }

  return best
}

function percentile (sorted, p) {
  if (!sorted.length) return 0

  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]
}

function resetWindow (now) {
  deltas = []
  windowStart = now
  prevTs = 0            // ⚠️ 一定要清，否則下一個 Δ 是整段空窗的長度
}

/** 這段時間內的樣本全部丟掉。 */
function suspend (ms) {
  notBefore = Math.max(notBefore, performance.now() + ms)
  prevTs = 0
}

function stop () {
  if (stopped) return
  stopped = true
  cancelAnimationFrame(raf)
  raf = 0
  document.removeEventListener('visibilitychange', onVisibility)
}

function onVisibility () {
  // 隱藏後第一個 rAF 的 Δ 是整段隱藏時間 —— 丟掉一段再開始
  suspend(VISIBILITY_SETTLE_MS)
}

function setTier (next) {
  if (next === tier.value) return
  tier.value = next
  // 換檔會 respawn（setCount），接下來幾幀含大量 buffer 寫入 —— 不能算數
  suspend(COOLDOWN_MS)
  resetWindow(performance.now())
  failStreak = 0

  for (const cb of listeners) {
    try {
      cb(next)
    } catch (err) {
      console.warn('[useParticleQuality] onTierChange listener 失敗', err)
    }
  }
}

function demote () {
  // ⚠️ 這一版只降不升。升檔要等下一階段，而且會是「開場一次性」的，理由：
  //
  // 手機的發熱降頻是單向棘輪。持續跑幾萬顆粒子會把 SoC 加熱，系統會降 GPU
  // 時脈並在負載持續期間一直維持降頻。如果「幀時間一回穩就升檔」，就製造出一個
  // 極限環：升檔 → 更熱 → 降頻 → 降檔 → 稍微涼 → 升檔 → …
  // 每一圈都是一次看得見的 respawn，而穩態剛好停在裝置最燙的那個點。
  // 這比一直待在低檔差得多。
  //
  // 傷害也是不對稱的：低一檔只是「稀了一點」的美學損失；高一檔是卡頓 + 發燙 +
  // 耗電。所以最佳策略本來就該不對稱 —— 往下便宜、往上昂貴。
  if (demotions >= MAX_DEMOTIONS || tier.value <= TIER_FLOOR) {
    // 到底了（或已經降夠多次）—— 不再為量測付錢
    stop()

    return
  }

  demotions++
  setTier(tier.value - 1)
  if (tier.value <= TIER_FLOOR) stop()
}

function closeWindow () {
  const sorted = [...deltas].sort((a, b) => a - b)
  const vsync = snapVsync(sorted[0])
  const p50 = percentile(sorted, 0.50)
  const p95 = percentile(sorted, 0.95)

  // 掉幀率只當顯示用的參考，不當判斷依據（見上面的 ProMotion 陷阱）
  let slots = 0
  let dropped = 0
  for (const d of deltas) {
    const s = Math.max(1, Math.round(d / vsync))
    slots += s
    dropped += s - 1
  }

  stats.value = {
    p50: +p50.toFixed(1),
    p95: +p95.toFixed(1),
    vsync: +vsync.toFixed(2),
    drop: slots ? +(dropped / slots).toFixed(3) : 0,
    samples: deltas.length,
    windows: stats.value.windows + 1,
  }

  const failed = p50 > TARGET_P50_MS || p95 > P95_SPIKE_MULT * vsync
  if (!failed) {
    failStreak = 0

    return
  }

  // 連續 2 個視窗才動 —— 過濾單一視窗的雜訊（一次 GC、一次圖片解碼、
  // 一次 buildSlotTargets 的 O(N log N) 排序）
  failStreak++
  if (failStreak >= FAIL_STREAK) demote()
}

function tick (now) {
  raf = requestAnimationFrame(tick)

  // ⚠️ 所有引擎都暫停 / 離屏 / 閒置時完全不採樣。
  // 少了這條，兩張 canvas 都 pause 的時候會量到瀏覽器空轉的「超級順」假讀數。
  // markActive 是元件明講「我現在真的在渲染」的唯一管道。
  if (activeIds.size === 0 || now < notBefore) {
    resetWindow(now)

    return
  }

  if (prevTs) deltas.push(now - prevTs)
  prevTs = now

  if (deltas.length >= WINDOW_MAX_FRAMES || (now - windowStart) >= WINDOW_MAX_MS) {
    if (deltas.length >= WINDOW_MIN_FRAMES) closeWindow()
    resetWindow(now)
  }
}

function startMonitor () {
  notBefore = performance.now() + WARMUP_MS
  document.addEventListener('visibilitychange', onVisibility)
  raf = requestAnimationFrame(tick)
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

  // 已經在底檔就不用量了 —— 沒有更低的檔可以降，量測只是白付一個 rAF。
  // （沒有 WebGPU 的路徑也走這裡：那條的瓶頸在主執行緒，交幀節奏也量不出重點。）
  if (tier.value <= TIER_FLOOR) return

  startMonitor()
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
      // 執行期量測
      monitoring: !!raf,
      demotions,
      failStreak,
      active: [...activeIds],
      ...stats.value,
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
    stats,
    showFps: () => showFps,

    /**
     * 檔位變更時回呼。⚠️ 只會往下。
     * @param {(tier:number)=>void} cb
     * @returns {()=>void} unsubscribe
     */
    onTierChange (cb) {
      listeners.add(cb)

      return () => listeners.delete(cb)
    },

    /**
     * 「我現在真的在渲染」。
     * ⚠️ 這是整個量測正確性的關鍵 —— 元件被 IntersectionObserver / visibility /
     * idle 暫停時一定要回報 false，否則會量到瀏覽器空轉的假順暢讀數。
     *
     * @param {string} id 元件識別字串
     * @param {boolean} active
     */
    markActive (id, active) {
      const had = activeIds.size
      if (active) activeIds.add(id)
      else activeIds.delete(id)

      // 從「全部停著」變成「有人在跑」：丟掉一段再開始。
      // 第一次要丟得比較久 —— shader / pipeline 編譯、particle buffer 首次上傳、
      // Nuxt hydration、GSAP + Lenis init、PLImage.prepare 的圖片解碼、字型載入
      // 全擠在那裡。之後每次只是從 pause 醒來，短沉澱就夠。
      if (!had && activeIds.size) {
        suspend(warmedUp ? RESUME_SETTLE_MS : WARMUP_MS)
        warmedUp = true
      }
    },

    /** 這段時間的樣本全部丟掉。包 readParticles / buildSlotTargets / 換人動畫用。 */
    suspend,

    /** readParticles + buildSlotTargets 的標準沉澱長度。 */
    suspendReadback: () => suspend(READBACK_SETTLE_MS),

    /** setCount 之後呼叫 —— respawn 會重配 buffer，接下來幾幀不能算數。 */
    noteRespawn: () => suspend(RESPAWN_SETTLE_MS),

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
