<script setup>
// 手機／平板（< 1024px）的粒子場 —— 桌機那條「一鏡到底」的時間軸在這裡是關掉的。
//
// ─── 跟桌機版（HomeSame/Field.vue）差在哪 ─────────────────────────────────
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

const canvasRef = ref(null)
const backend = ref('')

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
// 再乘一個手機折扣。理由（不是實測，是推算 —— 有實機再回來修這個數字）：
// useParticleBudget 的密度換算讓「每顆粒子要掃的鄰居數」固定，所以總成本正比於 N，
// 而 N 已經跟著面積縮了（390×844 約是 1440×900 的 1/4）。但手機 GPU 與桌機的差距
// 通常不只 4 倍，所以再留一段餘裕。
// ⚠️ 真的要調的話，先看 window.__mobileDbg() 的 count 與 engine.getFps()，
// 不要憑感覺 —— 下面 FPS_SAMPLE_MS 那段的自適應減半是保底，不是替代品。
const MOBILE_COUNT_SCALE = 0.7

// --- 模擬速度（與 Home/ParticleField 同一套）--------------------------------
const SIM_SPEED_INTRO = 1.5
const INTRO_HOLD_MS = 1800
const INTRO_FADE_MS = 5000
const SCROLL_REF = 2200
const ATTACK = 0.14
const RELEASE = 0.022
const SCROLL_CALM = 0.6

// --- 維持開場構圖 ----------------------------------------------------------
const HOLD_DRIFT_AMP = 22             // 每顆粒子的游走半徑（模擬 px）
const HOLD_DRIFT_MS = 2400            // 多久換一組新的隨機偏移
const HOLD_BREATHE_MS = 7000          // 握力走完「鬆 → 緊 → 鬆」一輪
const HOLD_BREATHE_FLOOR = 0.18       // 最鬆的時候還留多少握力

// 目標點失效（視窗轉向、fps 自適應觸發 setCount）後多久重建。
// 兼作 resize 的 debounce —— 手機轉向會連續發好幾個 resize。
const REBUILD_SETTLE_MS = 700
// 開場多久之後量 fps。⚠️ 要在建目標點「之前」量並且先 setCount：setCount 會重配
// targets buffer，順序反了目標點會被清空（桌機版 FPS_SAMPLE_MS 有完整說明）。
const FPS_SAMPLE_MS = 900
const FPS_FLOOR = 45

const TAU = Math.PI * 2
// --------------------------------------------------------------------------

// ⚠️ 用 let：frame() 每幀讀它，不需要響應式的開銷。
let look = resolveFieldLook(DEFAULT_FIELD_LOOK)

let engine = null
let stopAmbient = null
let raf = 0
let io = null
let onVisibility = null
let onResize = null
let resizeTimer = 0
let fpsTimer = 0
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

let simSpeed = SIM_SPEED_INTRO
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
function opacityNow () {
  return inRegion[0]
    ? look.visual.heroOpacity
    : Math.min(1, look.visual.heroOpacity * OUTRO_OPACITY_RATIO)
}

// --- 目標點 ----------------------------------------------------------------
// 開場構圖：seedPattern 畫出來的那張圖，才是每組效果真正好看、也真正互相不同的
// 樣子 —— 規則一接管幾秒內就洗掉了，所以交給 seek 力去維持。
// buildSlotTargets 把它換算成「以 slot 為索引」的目標點（GPU 每幀 spatial sort
// 會重排陣列，array index 靠不住，只有生成時指定的 slot 是穩定身分）。
async function buildHold () {
  if (!engine?.readParticles || !engine.setTargets) return false
  const snap = await engine.readParticles()
  const { W, H } = engine.size
  try {
    const seed = buildSeedTargets(look.rules.seedPattern, snap.length, look.rules.species, W, H)
    holdBase = buildSlotTargets(snap, seed, look.rules.species, W).shape
  } catch (err) {
    console.warn('[HomeSameMobileField] 開場構圖目標點建立失敗，改成完全放手', err)
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
    const age = t - introStart
    let intro = 0
    if (age < INTRO_HOLD_MS) {
      intro = 1
    } else if (age < INTRO_HOLD_MS + INTRO_FADE_MS) {
      const u = 1 - (age - INTRO_HOLD_MS) / INTRO_FADE_MS
      intro = u * u * (3 - 2 * u)
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

  // 游走：每 HOLD_DRIFT_MS 換一組新的隨機偏移。
  // ⚠️ 兩個目標槽都塞同一組（blend 在這一版永遠是 0，沒有第二個形狀要混）——
  // 這樣 setMorph 的 blend 參數怎麼給都不影響結果，少一個會漂移的狀態。
  if (!reducedMotion) {
    const cycle = Math.floor(t / HOLD_DRIFT_MS)
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
  // ⚠️ ?mode=tool 的切換面板只在桌機版有 —— 那是給設計對照效果用的工具，
  // 而效果的差異在窄視窗上本來就看不太出來。
  const fromUrl = fieldLookFromLocation()
  look = fromUrl.look
  appliedForce = look.physics.forceFactor

  const hero = window.PLPalettes.PALETTES[look.palette]
  const b = look.budget
  const count = countFor(canvas, {
    density: b.density * MOBILE_COUNT_SCALE,
    max: Math.round(b.max * MOBILE_COUNT_SCALE),
    min: Math.round(b.min * MOBILE_COUNT_SCALE),
  })

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
    rMax: look.physics.rMax,
    simSpeed: SIM_SPEED_INTRO,
    cameraZoom: look.camera.zoom,
    pointSize: look.visual.pointSize,
    particleOpacity: look.visual.heroOpacity,
    // 光暈一律關：額外一趟全螢幕加法 pass，成本跟 DPR 平方成正比，
    // 而這支元件只會在 < 1024px 掛載。
    showGlow: false,
    glowSize: look.glow.glowSize,
    glowIntensity: look.glow.glowIntensity,
    glowSteepness: look.glow.glowSteepness,
    cellSubdivisions: 2,
    maxDpr: maxDpr(),
  })
  backend.value = engine.backend
  if (import.meta.dev) window.__mobileField = engine

  if (!reducedMotion) stopAmbient = window.PLAmbient.start(() => engine, { intensity: look.ambient })

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
      count: engine.config.count,
      backend: engine.backend,
      inRegion: [...inRegion],
      running,
      ready,
      simSpeed: +simSpeed.toFixed(3),
      paused: engine.config.paused,
    })
  }
  frame()

  // 量 fps → 需要就減半 → 馬上建目標點。
  // ⚠️ 順序不能反：setCount 會重配 targets buffer，先建目標點的話會被清空。
  fpsTimer = setTimeout(async () => {
    const fps = engine?.getFps ? engine.getFps() : 60
    if (fps > 0 && fps < FPS_FLOOR) {
      engine.setCount?.(Math.round(count / 2))
      // setCount 會整場重生成粒子，等它們離開生成點再配對
      await new Promise(r => setTimeout(r, REBUILD_SETTLE_MS))
    }
    await buildHold()
  }, FPS_SAMPLE_MS)
}

onMounted(() => { init() })

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  clearTimeout(resizeTimer)
  clearTimeout(fpsTimer)
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
</template>
