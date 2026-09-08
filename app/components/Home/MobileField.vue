<script setup>
// 手機／平板（< 1024px）的粒子場 —— 桌機那條「一鏡到底」的時間軸在這裡是關掉的。
//
// ─── 跟桌機版（Home/Field.vue）差在哪 ─────────────────────────────────
// 桌機版是一條 flow ∈ [0,5] 的時間軸，六個關鍵影格（自由場 → side.png → 人像 →
// 菌落場 → faq.png → 自由場）沿捲動連續變形，全程都在算。
//
// 這一版只有「自由場」那一種狀態，而且只在兩個區間跑：
//   PL.I  hero    進站就是它
//   PL.VI～VII    票券／贊助／CoC（設計稿上這幾區的底就是 hero 那種生態）
// 中間的 PL.II～PL.V 底色改成不透明，這張 canvas 在那段期間是 pause 的 ——
// 不是變透明、也不是卸載，engine.pause() 只跳過計算與渲染、保留最後一幀，
// 所以捲回來的瞬間沒有閃爍或重新生成。
//
// 為什麼「不做變形」而不是「做了但看不到」：收攏成圖片那幾格要的密度是全頁最高的
//（faq 的放射狀尖刺、人像的五官），窄視窗根本沒有那個面積可以攤開；而且那些區塊
// 在這裡底色是不透明的，算出來也被蓋掉。少掉時間軸之後，這支檔案不需要 ScrollTrigger、
// 不需要 setTargets 每段重傳、不需要 PLImage 取樣任何一張圖。
//
// ─── 「活著」的來源 ────────────────────────────────────────────────────────
// 與 Home/ParticleField 的 hero 狀態同一套（那邊是 morphAmount=0 的那一端）：
//   1. seek 把粒子按在 seedPattern 的開場構圖上（look.hold）
//   2. 目標點每 HOLD_DRIFT_MS 換一組小隨機偏移 → 粒子一直在追一個會動的東西
//   3. 握力自己呼吸（grip 在 FLOOR ↔ 1 之間來回）→ 鬆的半週期力場贏、構圖散開，
//      緊的半週期 seek 贏、粒子被帶回原點。構圖跑不掉，但畫面全程在動。
// 這三件的長註解在 Home/ParticleField.vue，改參數前先讀那邊。

const { loadParticleKit } = useParticleKit()
const { countFor, maxDpr } = useParticleBudget()
const { buildSeedTargets, buildSlotTargets } = useParticleMorph()
// 只借用它的閒置偵測（全 app 單例）。這一版沒有第二張滿版 canvas，不需要 claim/release。
const { idle } = useParticleStage()
// 裝置效能檔位。⚠️ 只會往下鎖，沒有負面訊號時 t3 就是「今天線上的樣子」。
// 各旋鈕的值與理由在 app/utils/particleTiers.js。
const {
  tier, knobs, cpuFallback, showFps,
  onTierChange, markActive, suspendReadback, noteRespawn,
} = useParticleQuality()

const canvasRef = ref(null)
const backend = ref('')

// --- ?tool=1 工具面板 -------------------------------------------------------
// ⚠️ 檔位表給的是「倍率」（countScale / pointScale…），面板要的是「絕對值」——
// 因為面板是給人看的，"0.32" 沒有意義、"3897 顆" 才有。所以這裡兩邊都留：
// q 仍然是倍率（onTierChange 那條路要用），knobs 是換算後的絕對值。
const toolKnobs = reactive({
  count: 0, rMax: 0, pointSize: 0, dprCap: 0, opacity: 0, driftMs: 0, ambient: 0,
})
const toolPresets = ref([])
const toolMeta = reactive({ autoCount: 0, backend: '', note: '' })
const { register: registerTool } = useParticleTool()
let unregisterTool = null
const toolMode = ref(false)
// 這一版開放哪幾個旋鈕。沒有「取樣點數」—— 自由場不是從圖片來的，沒有取樣這回事。
const TOOL_FIELDS = ['count', 'rMax', 'pointSize', 'dprCap', 'opacity', 'driftMs', 'ambient']
// 面板覆寫值。0 = 沒被覆寫，照原本的算法走。
let opacityOverride = 0
let driftMsOverride = 0
let ambientOverride = 0

// --- 這張 canvas 要在哪些區間跑 --------------------------------------------
// ⚠️ 順序有意義：索引 0 是 hero、1 是 outro，下面 zoomNow / opacityNow 依索引取參數。
// 用 IntersectionObserver 而不是 ScrollTrigger —— 這裡只要「有沒有在畫面上」這個
// 布林值，不需要 scrub 進度，IO 是瀏覽器原生、不吃主執行緒。
const REGIONS = ['[data-same-hero]', '[data-same-outro]']

// 兩個區間的取景與透明度。沿用桌機版 hero / outro 兩格的比例關係（見 Field.vue 的
// OUTRO_ZOOM_RATIO），這樣換到 zoom 比較大的效果時兩端仍是同一個關係。
const OUTRO_ZOOM_RATIO = 1.30 / 1.35
const OUTRO_OPACITY_RATIO = 0.60 / 0.55

// --- 粒子預算 --------------------------------------------------------------
// ⚠️ 這一版可以、而且應該用 look.budget（桌機那版不行）。原因見 Field.vue 的
// COUNT_DENSITY 註解：那邊整條時間軸共用同一組粒子，點數若跟著 hero 效果走，
// 同一張人像會忽濃忽淡。這裡只有自由場，各組效果本來就該用自己的密度。
//
// 再乘一個「手機折扣」，現在由檔位表提供（q.countScale）。
// t3 的 0.70 就是原本寫在這裡的 MOBILE_COUNT_SCALE —— 沒有負面訊號時行為完全不變。
// 那個 0.70 的由來（推算不是實測）與各檔的值都搬到 app/utils/particleTiers.js 了。
// ⚠️ 要調的話先看 window.__mobileDbg() 的 count 與 window.__pq() 的檔位判斷依據，
// 不要憑感覺。

// --- 模擬速度（與 Home/ParticleField 同一套）--------------------------------
// ⚠️ 設計師定案（2026-09）：開場不加速，一進場就照 demo 原本的速度跑。
// 這支開關留著是因為「開場先散開再降速」在改版過程中反覆進出 —— 想看那一版
// 把它改成 true 就好，底下三個 INTRO 常數只在它為 true 時生效。
const INTRO_SPEED_BOOST = false
const SIM_SPEED_INTRO = 1.5
const INTRO_HOLD_MS = 1800
const INTRO_FADE_MS = 5000

// 引擎起手的模擬速度：不加速時直接從待機速度開始（look 會被 __fieldLook 換掉，
// 所以寫成函式每次現算，不是一次算好的常數）。
const startSimSpeed = () => (INTRO_SPEED_BOOST ? SIM_SPEED_INTRO : look.speed.idle)
const SCROLL_REF = 2200
const ATTACK = 0.14
const RELEASE = 0.022
const SCROLL_CALM = 0.6

// --- 維持開場構圖 ----------------------------------------------------------
const HOLD_DRIFT_AMP = 22             // 每顆粒子的游走半徑（模擬 px）
// 多久換一組新的隨機偏移 → 由檔位表提供（q.driftMs）。
// ⚠️ 低檔位換得慢一點不是為了省算力（那只是一次 setTargets 上傳），是視覺理由：
// 粒子少的時候換太勤會看起來在閃，而不是在流動。
const HOLD_BREATHE_MS = 7000          // 握力走完「鬆 → 緊 → 鬆」一輪
const HOLD_BREATHE_FLOOR = 0.18       // 最鬆的時候還留多少握力

// 目標點失效（視窗轉向、fps 自適應觸發 setCount）後多久重建。
// 兼作 resize 的 debounce —— 手機轉向會連續發好幾個 resize。
const REBUILD_SETTLE_MS = 700
// 開場多久之後建目標點。
// ⚠️ 這個值直接決定「進站第一趟往下捲會不會有反應」，不是效能微調 ——
// ready（= 目標點建好）之前 frame() 不會收攏。越短越好，但要讓 setCount 重生的
// 粒子先離開生成點。900ms 是「粒子散開了」與「使用者還沒捲下去」的交界。
const BUILD_DELAY_MS = 900

const TAU = Math.PI * 2
// --------------------------------------------------------------------------

// ⚠️ 用 let：frame() 每幀讀它，不需要響應式的開銷。
let look = resolveFieldLook(DEFAULT_FIELD_LOOK)
// 目前檔位的旋鈕。init() 取一次；這一階段還沒有執行期換檔，所以之後不會變。
let q = knobs('mobileField')

let engine = null
let stopAmbient = null
let raf = 0
let io = null
let onVisibility = null
let onResize = null
let resizeTimer = 0
let buildTimer = 0
let unsubTier = null
let reducedMotion = false

// 目前有哪些區間在畫面上。two-bit 的狀態，決定「跑不跑」與「用哪一組取景」。
const inRegion = [false, false]
let running = false

let holdBase = null                   // 開場構圖的每-slot 原點
let holdJit = null                    // 游走用的 scratch，避免每 2.4 秒配一份大陣列
let driftCycle = -1
let ready = false
let targetsGen = -1
let targetsW = 0
let targetsH = 0

let simSpeed = startSimSpeed()
let scrollHeat = 0
let appliedForce = look.physics.forceFactor
let lastScrollY = 0
let lastTime = 0
let introStart = 0
let lastOpacity = -1

// --- 小工具 ----------------------------------------------------------------
// 每顆粒子在自己原點附近的一個隨機小偏移。半徑取 0.3~1.0 × amp，
// 全部等長的話會變成一圈規則的環。⚠️ 寫進呼叫端給的 scratch，不要每次配新的。
function jitterInto (out, base, amp) {
  for (let i = 0; i < base.length; i += 2) {
    const a = Math.random() * TAU
    const r = amp * (0.3 + 0.7 * Math.random())
    out[i] = base[i] + Math.cos(a) * r
    out[i + 1] = base[i + 1] + Math.sin(a) * r
  }
  return out
}

// 目前生效的取景：只要 hero 還在畫面上就聽 hero 的，否則聽 outro 的。
// ⚠️ 兩者不做插值 —— 中間隔著 PL.II～PL.V 四個不透明區塊，切換發生時這張 canvas
// 一定是被蓋住的，插值是看不到的成本。
function zoomNow () {
  return inRegion[0] ? look.camera.zoom : look.camera.zoom * OUTRO_ZOOM_RATIO
}
// ⚠️ 這裡一定要把 q.opacityScale 乘進去。frame() 每幀都會呼叫這個函式再
// setParticleOpacity，所以「只在 makeEngine 時給一次」會被下一幀直接洗掉 ——
// 低檔位的亮度補償等於沒做（實測過：t0 的 opacity 仍然停在 look 的原值）。
function opacityNow () {
  // 面板的覆寫是「絕對值」，直接取代整條算式 —— 那正是在面板上調它的意思。
  // ⚠️ outro 那一區仍然照比例縮，不然捲到票券區會突然變亮。
  if (opacityOverride) {
    return inRegion[0] ? opacityOverride : Math.min(1, opacityOverride * OUTRO_OPACITY_RATIO)
  }

  const base = inRegion[0]
    ? look.visual.heroOpacity
    : look.visual.heroOpacity * OUTRO_OPACITY_RATIO

  return Math.min(1, base * q.opacityScale)
}

// 游走週期：面板覆寫優先，否則照檔位表。
function driftMsNow () { return driftMsOverride || q.driftMs }

// --- 目標點 ----------------------------------------------------------------
// 開場構圖：seedPattern 畫出來的那張圖，才是每組效果真正好看、也真正互相不同的
// 樣子 —— 規則一接管幾秒內就洗掉了，所以交給 seek 力去維持。
// buildSlotTargets 把它換算成「以 slot 為索引」的目標點（GPU 每幀 spatial sort
// 會重排陣列，array index 靠不住，只有生成時指定的 slot 是穩定身分）。
async function buildHold () {
  if (!engine?.readParticles || !engine.setTargets) return false
  // ⚠️ readParticles 是 GPU→CPU 的 mapAsync 硬同步，接著 buildSlotTargets 還有
  // 兩組帶閉包比較器的 sort（O(N log N)，8500 顆下是幾十毫秒的主執行緒工作）。
  // 這段的幀時間不代表渲染負載，不能拿去做檔位判斷。
  suspendReadback()
  const snap = await engine.readParticles()
  const { W, H } = engine.size
  try {
    const seed = buildSeedTargets(look.rules.seedPattern, snap.length, look.rules.species, W, H)
    holdBase = buildSlotTargets(snap, seed, look.rules.species, W).shape
  } catch (err) {
    console.warn('[HomeMobileField] 開場構圖目標點建立失敗，改成完全放手', err)
    holdBase = null
    return false
  }
  holdJit = new Float32Array(holdBase.length)
  targetsGen = engine.targetsGeneration
  targetsW = W
  targetsH = H
  driftCycle = -1                     // 強制下一幀重新上傳
  ready = true
  return true
}

function targetsStale () {
  if (!engine || !ready) return false
  const { W, H } = engine.size
  return engine.targetsGeneration !== targetsGen || W !== targetsW || H !== targetsH
}

function invalidateTargets () {
  ready = false
  engine?.setMorph?.(0, 0, 0)
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => { buildHold() }, REBUILD_SETTLE_MS)
}

// --- 跑 / 停 ---------------------------------------------------------------
// 「在其中一個區間內」才算要跑。離開就 pause —— canvas 保留最後一幀，而它此刻
// 一定是被不透明區塊蓋住的，所以定格看不出來。
function syncRunning () {
  const want = (inRegion[0] || inRegion[1]) && !document.hidden && !idle.value
  if (want === running) return
  running = want
  engine?.pause(!want)
  // ⚠️ 一定要誠實回報 —— 量測器靠這個知道「畫面上真的有東西在算」。
  // 漏報的話它會量到瀏覽器空轉的假順暢讀數。
  markActive('mobileField', want)
  if (want) {
    // 喚醒那一幀不要算出爆炸的 dt 與捲動速度
    lastTime = 0
    lastScrollY = window.scrollY
    // 取景／透明度可能在停住期間換過區間了，補一次
    lastOpacity = -1
  }
}
watch(idle, () => syncRunning())

// --- 每幀 ------------------------------------------------------------------
function frame (now) {
  raf = requestAnimationFrame(frame)
  if (!engine || !running) return

  const t = now || performance.now()
  const y = window.scrollY

  // --- 捲動速度 → 模擬速度 -------------------------------------------------
  const dt = lastTime ? Math.min(0.1, (t - lastTime) / 1000) : 0
  if (dt > 0) {
    // 開場包絡：先維持 INTRO 速度，再 smoothstep 降到待機速度，之後恆為 0。
    // ⚠️ 只在進站那一次跑，捲回票券區時不重播 —— 那裡要的是待機的緩慢生態，
    // 不是「又炸開一次」。
    // INTRO_SPEED_BOOST = false 時整段跳過，intro 恆為 0 → 從第一幀就是待機速度。
    const age = t - introStart
    let intro = 0
    if (INTRO_SPEED_BOOST) {
      if (age < INTRO_HOLD_MS) {
        intro = 1
      } else if (age < INTRO_HOLD_MS + INTRO_FADE_MS) {
        const u = 1 - (age - INTRO_HOLD_MS) / INTRO_FADE_MS
        intro = u * u * (3 - 2 * u)
      }
    }
    const idleSpeed = look.speed.idle
    const base = idleSpeed + (SIM_SPEED_INTRO - idleSpeed) * intro

    const heat = Math.min(1, (Math.abs(y - lastScrollY) / dt) / SCROLL_REF)
    const target = base + (look.speed.max - idleSpeed) * heat
    simSpeed += (target - simSpeed) * (target > simSpeed ? ATTACK : RELEASE)
    engine.setSimSpeed?.(simSpeed)

    // 捲動中把互動力場壓掉一些，遷移才乾淨；停下來才擴散
    scrollHeat += (heat - scrollHeat) * (heat > scrollHeat ? ATTACK : RELEASE)
    const wanted = look.physics.forceFactor * (1 - SCROLL_CALM * scrollHeat)
    if (Math.abs(wanted - appliedForce) > 0.01) {
      appliedForce = wanted
      engine.setForce?.(wanted)      // 會重寫 80 bytes 的 options buffer，所以設門檻
    }
  }
  lastTime = t
  lastScrollY = y

  // --- 相機 -----------------------------------------------------------------
  // 緩慢的電影感漂移：兩個不同週期的正弦疊加，避免看得出循環。
  const zoom = zoomNow()
  let dx = 0; let dy = 0; let dz = 1
  if (!reducedMotion) {
    const s = t * 0.001
    dx = Math.sin(s * 0.021) * 42 + Math.sin(s * 0.006) * 26
    dy = Math.cos(s * 0.017) * 30 + Math.sin(s * 0.010) * 16
    dz = 1 + 0.035 * Math.sin(s * 0.011)
  }
  engine.setCameraZoom?.(zoom * dz)
  engine.setCameraOffset?.(dx, dy)

  // --- 透明度 ---------------------------------------------------------------
  // 會重寫整個 buffer，所以設變化門檻，不要每幀寫。
  const opacity = opacityNow()
  if (Math.abs(opacity - lastOpacity) > 0.004) {
    lastOpacity = opacity
    engine.setParticleOpacity?.(opacity)
  }

  // --- 維持開場構圖 ---------------------------------------------------------
  if (ready && targetsStale()) invalidateTargets()
  if (!ready || !holdBase) return

  // 游走：每 q.driftMs 換一組新的隨機偏移。
  // ⚠️ 兩個目標槽都塞同一組（blend 在這一版永遠是 0，沒有第二個形狀要混）——
  // 這樣 setMorph 的 blend 參數怎麼給都不影響結果，少一個會漂移的狀態。
  if (!reducedMotion) {
    const cycle = Math.floor(t / driftMsNow())
    if (cycle !== driftCycle) {
      driftCycle = cycle
      const jit = jitterInto(holdJit, holdBase, HOLD_DRIFT_AMP)
      engine.setTargets(jit, jit)
    }
  } else if (driftCycle !== 0) {
    driftCycle = 0
    engine.setTargets(holdBase, holdBase)
  }

  // 握力呼吸。reduced-motion 下維持固定握力。
  const breathe = reducedMotion
    ? 1
    : HOLD_BREATHE_FLOOR + (1 - HOLD_BREATHE_FLOOR) * (0.5 - 0.5 * Math.cos(t / HOLD_BREATHE_MS * TAU))
  engine.setMorph?.(look.hold.pull * breathe, look.hold.grip * breathe, 0)
}

// --- 初始化 ----------------------------------------------------------------
async function init () {
  const canvas = canvasRef.value
  if (!canvas) return

  await loadParticleKit()
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // 網址決定跑哪一組；沒指定就隨機抽（?hero-animation=1~5，值有白名單）。
  // ⚠️ 窄視窗「不」提供效果切換清單 —— 效果的差異在這個寬度本來就看不太出來，
  // 而那份清單很長，在手機上會把真正要調的旋鈕擠到看不見。
  // ?tool=1 面板在這裡只顯示「參數微調」那一段（見 FieldLookPanel 的 look prop）。
  const fromUrl = fieldLookFromLocation()
  toolMode.value = fromUrl.tool
  look = fromUrl.look
  appliedForce = look.physics.forceFactor

  const hero = window.PLPalettes.PALETTES[look.palette]
  const b = look.budget
  q = knobs('mobileField')
  let count = countFor(canvas, {
    density: b.density * q.countScale,
    max: Math.round(b.max * q.countScale),
    min: Math.round(b.min * q.countScale),
  })
  // ⚠️ 沒有 WebGPU 的話走的是完全不同的引擎（particle-life.js，CPU 後端），
  // 成本結構也完全不同 —— 空間雜湊與繪圖都在 JS 主執行緒上、canvas2d 逐顆
  // drawImage。它自己的預設點數是 1400，而我們一直照樣傳 8000+ 顆進去。
  // 這不是「比較慢」，是量級錯誤，光靠檔位的 countScale 補不回來。
  // 見 particleTiers.js 的 CPU_FALLBACK_MAX_COUNT。
  if (cpuFallback.value) count = Math.min(count, CPU_FALLBACK_MAX_COUNT)

  engine = await window.makeEngine(canvas, {
    species: look.rules.species,
    count,
    preset: look.rules.preset,
    seedPattern: look.rules.seedPattern,
    palette: hero.particles,
    bgFade: hero.bgFade,
    forceFactor: look.physics.forceFactor,
    friction: look.physics.friction,
    repel: look.physics.repel,
    minR: look.physics.minR,
    rMax: look.physics.rMax * q.rMaxScale,
    simSpeed: startSimSpeed(),
    cameraZoom: look.camera.zoom,
    // ⚠️ pointSize / opacity 隨檔位放大不是裝飾，是必須的：粒子少了還用同樣的
    // 點大小，畫面會變暗變薄，看起來像「壞了」而不是「刻意的稀」。
    // 要維持感知亮度就要維持總覆蓋面積 ≈ N × pointSize²。見 particleTiers.js。
    // ⚠️ CPU 後端的 pointSize 是光暈 sprite 的邊長基準，不是點半徑 ——
    // 套檔位表的亮度補償會變成一團大光斑。見 particleTiers.js。
    pointSize: cpuFallback.value ? CPU_POINT_SIZE_FIELD : look.visual.pointSize * q.pointScale,
    particleOpacity: Math.min(1, look.visual.heroOpacity * q.opacityScale),
    // 光暈一律關：額外一趟全螢幕加法 pass，成本跟 DPR 平方成正比，
    // 而這支元件只會在 < 1024px 掛載。
    showGlow: false,
    glowSize: look.glow.glowSize,
    glowIntensity: look.glow.glowIntensity,
    glowSteepness: look.glow.glowSteepness,
    cellSubdivisions: q.cellSub,
    // ⚠️ 取 min 而不是直接用檔位的值 —— 契約是「只會減、不會加」。
    // maxDpr() 本身已經分了手機 1.25 / 桌機 1.5（斷點 768），檔位只能再往下壓。
    // 直接用 q.dprCap 會讓 768~1023 的平板從 1.5 掉到 1.25，那是沒必要的畫質損失。
    maxDpr: Math.min(maxDpr(), q.dprCap),
  })
  backend.value = engine.backend
  toolMeta.backend = engine.backend
  toolMeta.autoCount = count
  toolMeta.note = cpuFallback.value ? '沒有 WebGPU，跑的是 CPU 後端' : ''
  if (showFps()) engine.setShowFps?.(true)
  if (import.meta.dev) window.__mobileField = engine

  // ⚠️ ambient 不是效能旋鈕（純 setTimeout 排程，每 1.2~18 秒發一次 disturb，
  // 沒有 per-frame 成本）。低檔位調低 gain 是視覺理由：粒子少的時候一記大脈衝
  // 會把整片打散得很難看。
  // ⚠️ 但不能關掉 —— particle-ambient.js 檔頭第一句就是警告：沒有擾動的話
  // 場幾十秒後會收斂成靜態圖。
  if (!reducedMotion) {
    stopAmbient = window.PLAmbient.start(() => engine, { intensity: look.ambient * q.ambientGain })
  }

  // --- 區間偵測 -------------------------------------------------------------
  // ⚠️ 要在第一幀之前掛好，否則進站時 running 是 false、frame() 直接空轉，
  // 而 IO 的第一次回呼要等下一個 frame 才來，會看到 hero 停住一瞬間。
  io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      const i = REGIONS.findIndex(sel => en.target.matches(sel))
      if (i >= 0) inRegion[i] = en.isIntersecting
    }
    syncRunning()
  })
  REGIONS.forEach((sel) => {
    const el = document.querySelector(sel)
    if (el) io.observe(el)
  })

  onVisibility = () => syncRunning()
  document.addEventListener('visibilitychange', onVisibility)
  onResize = () => invalidateTargets()
  window.addEventListener('resize', onResize)

  introStart = performance.now()
  lastScrollY = window.scrollY
  // IO 的第一次回呼還沒到，先照捲動位置猜一次，免得開場空轉
  inRegion[0] = true
  syncRunning()

  if (import.meta.dev) {
    window.__mobileDbg = () => ({
      look: look.id,
      tier: tier.value,
      cpuFallback: cpuFallback.value,
      count: engine.config.count,
      rMax: engine.config.rMax,
      backend: engine.backend,
      inRegion: [...inRegion],
      running,
      ready,
      simSpeed: +simSpeed.toFixed(3),
      paused: engine.config.paused,
    })
  }
  frame()

  // 目標點要等粒子離開生成點再配對，所以慢一拍建。
  // ⚠️ 這裡原本還夾著一段「量一次 fps，低於 45 就 setCount(count/2)」。已經拿掉，
  // 換成 useParticleQuality 的持續量測（下面的 onTierChange）。舊那段的問題：
  //   · engine.getFps() 的 fpsSmoothed 初值硬編 60、EMA α=0.08 要約 40 幀才收斂
  //     —— 900ms 讀到的有一半以上還是初值，所以它幾乎不會觸發
  //   · 一次性、單級、無回升：發熱降頻是幾十秒後才發生的，那時早就沒人在量了
  //   · 直接動 setCount 是最破壞性的手段（見下面 onTierChange 的說明）
  buildTimer = setTimeout(() => { buildHold() }, BUILD_DELAY_MS)

  // 檔位被量測器降下來 → 套新旋鈕。
  // ⚠️ setCount 先做：它會重配 targets buffer 並推進 targetsGeneration，
  //    順序反了目標點會被清空。
  // ⚠️ 但「不需要」自己重建目標點 —— 現有機制已經完整處理：
  //    setCount → allocParticleBuffers 把 morphPull/morphGrip 歸零並
  //    targetsGeneration++ → 下一幀 frame() 的 targetsStale() 抓到世代跳號 →
  //    invalidateTargets() → REBUILD_SETTLE_MS 後 buildHold()。
  //    中間那 700ms 因為 ready=false 不寫 targets、不寫 morph，粒子純靠力場
  //    自由演化，不會被 seek 吸到 (0,0)。
  // ⚠️ 換檔若落在 canvas 被暫停期間（捲到 PL.II~V），frame() 會直接 return、
  //    重建不會排 —— 這是對的，捲回來的第一幀 targetsStale() 照樣會抓到。
  syncToolKnobs()
  rebuildToolPresets()
  unregisterTool = registerTool({
    id: 'mobileField',
    label: '滿版場',
    fields: TOOL_FIELDS,
    knobs: toolKnobs,
    get presets () { return toolPresets.value },
    meta: toolMeta,
    apply: applyToolKnobs,
  })

  unsubTier = onTierChange(() => {
    if (!engine) return
    q = knobs('mobileField')

    engine.setCount?.(countFor(canvas, {
      density: b.density * q.countScale,
      max: Math.round(b.max * q.countScale),
      min: Math.round(b.min * q.countScale),
    }))
    noteRespawn()

    engine.setRMax?.(look.physics.rMax * q.rMaxScale)
    engine.setPointSize?.(look.visual.pointSize * q.pointScale)
    // 透明度不用在這裡寫 —— frame() 每幀從 opacityNow() 讀 q，改 q 就生效了。
    // ⚠️ cellSubdivisions / maxDpr 沒有 setter，執行期改不了；表裡那兩欄只在
    //    pre-flight 就判到低檔時（也就是建引擎當下）才生效。
    lastOpacity = -1
    // 量測器降檔之後面板要跟著更新，不然顯示的還是舊值
    syncToolKnobs()
  })
}

// 把現在真正生效的值抄進面板的顯示狀態。
function syncToolKnobs () {
  if (!engine) return
  toolKnobs.count = engine.config.count
  toolKnobs.rMax = engine.config.rMax
  toolKnobs.pointSize = engine.config.pointSize
  toolKnobs.dprCap = engine.config.maxDpr
  toolKnobs.opacity = +opacityNow().toFixed(3)
  toolKnobs.driftMs = driftMsNow()
  toolKnobs.ambient = +(ambientOverride || look.ambient * q.ambientGain).toFixed(3)
}

// 四個檔位換算成這張 canvas 的絕對值，給面板的 t0~t3 按鈕載入。
function rebuildToolPresets () {
  const canvas = canvasRef.value
  if (!canvas || !look) return
  const b = look.budget
  toolPresets.value = Array.from({ length: TIER_COUNT }, (_, t) => {
    const k = tierKnobs('mobileField', t)

    return {
      tier: t,
      values: {
        count: countFor(canvas, {
          density: b.density * k.countScale,
          max: Math.round(b.max * k.countScale),
          min: Math.round(b.min * k.countScale),
        }),
        rMax: Math.round(look.physics.rMax * k.rMaxScale),
        pointSize: +(look.visual.pointSize * k.pointScale).toFixed(2),
        // ⚠️ 跟建引擎時同一條規則：只會減、不會加（見 maxDpr 那段註解）
        dprCap: Math.min(maxDpr(), k.dprCap),
        opacity: +Math.min(1, look.visual.heroOpacity * k.opacityScale).toFixed(3),
        driftMs: k.driftMs,
        ambient: +(look.ambient * k.ambientGain).toFixed(3),
      },
    }
  })
}

// 面板：一次套用一整組。
// ⚠️ 只有 count 會 respawn（並讓 targetsStale 自己排重建），其餘都是即時 setter
// 或裸變數，所以這裡不必自己碰目標點。
function applyToolKnobs (next) {
  if (!engine || !next) return

  if (Number.isFinite(next.count) && Math.round(next.count) !== toolKnobs.count) {
    engine.setCount?.(Math.round(next.count))
    noteRespawn()
  }
  if (Number.isFinite(next.rMax)) engine.setRMax?.(next.rMax)
  if (Number.isFinite(next.pointSize)) engine.setPointSize?.(next.pointSize)
  if (Number.isFinite(next.dprCap)) engine.setMaxDpr?.(next.dprCap)
  if (Number.isFinite(next.opacity)) {
    opacityOverride = next.opacity
    lastOpacity = -1                 // 強制下一幀重寫，別被變化門檻擋掉
  }
  if (Number.isFinite(next.driftMs)) {
    driftMsOverride = next.driftMs
    driftCycle = -1                  // 週期一變就馬上換一組目標，不要等舊週期走完
  }
  if (Number.isFinite(next.ambient) && next.ambient !== toolKnobs.ambient) {
    // ⚠️ PLAmbient 沒有「改強度」的 API，只能停掉重開（它就是一串 setTimeout）。
    ambientOverride = next.ambient
    stopAmbient?.()
    stopAmbient = null
    if (!reducedMotion && ambientOverride > 0) {
      stopAmbient = window.PLAmbient.start(() => engine, { intensity: ambientOverride })
    }
  }

  syncToolKnobs()
}

onMounted(() => { init() })

onBeforeUnmount(() => {
  unregisterTool?.()
  if (raf) cancelAnimationFrame(raf)
  clearTimeout(resizeTimer)
  clearTimeout(buildTimer)
  unsubTier?.()
  markActive('mobileField', false)
  io?.disconnect()
  stopAmbient?.()
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  if (onResize) window.removeEventListener('resize', onResize)
  if (engine) { engine.destroy(); engine = null }
})

defineExpose({ backend })
</script>

<template>
  <!-- fixed 而不是各區塊各放一張：hero 與票券區中間隔著四個不透明區塊，
       同一張 canvas 在那段期間是 pause 的（保留末幀、被蓋住看不見），
       捲回來就直接接上去 —— 不需要第二次建引擎、也不會有重新生成的閃爍。 -->
  <canvas
    ref="canvasRef"
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-0 block h-full w-full"
  />

  <!-- ?tool=1 的工具面板。⚠️ 窄視窗由這一支掛，因為 HomeField 在這個寬度沒有
       掛載。面板本身不認得任何 Field 元件 —— 它讀的是 useParticleTool 的登記清單，
       所以人像那支（HomeSpeakerPortrait）自己登記完就會多長出一個分頁。 -->
  <HomeFieldLookPanel v-if="toolMode" />
</template>
