<script setup>
// index-same.vue 專用：整頁只有「一張」粒子 canvas 的版本。
//
// ─── 這一版跟原版首頁差在哪 ────────────────────────────────────────────────
// 原版（pages/index.vue）有三張 canvas：
//   · HomeParticleField  固定背景，服務 PL.I / PL.II
//   · HomeSpeakerField   PL.III 自己一張（人像要鎖死到看得出五官）
//   · HomeVenueFaqField  PL.IV + PL.V 共用一張（sticky）
// 三張之間靠 useParticleStage 仲裁「同時只有一張在算」，交棒時後面那張是「定格」
// 而不是繼續跑，所以還得處理台下追趕（CATCH_UP_MS）、交棒回來時對齊 morph 狀態…
//
// 這一版只有這張 fixed canvas，從 PL.I 到 PL.VII 都是同一群粒子。
// 好處與代價都很明確，這正是要給設計看的差異：
//   ＋ 區塊之間是「同一群粒子連續變形」，沒有任何淡入淡出或黑色硬邊
//   ＋ 不需要交棒仲裁、不需要台下追趕，狀態機小非常多（少了約 200 行的邊界處理）
//   ＋ 任何時刻都只有一個 compute pass，fps 天生穩定
//   － 每個區塊沒辦法各自調物理參數（人像要 grip 82、紋理要 grip 55），
//     只能沿著捲動在關鍵影格之間插值，所以人像的銳利度略遜原版
//   － 每一區的底色不能是不透明黑（會把自己的粒子蓋掉），只能用半透明壓黑
//
// ─── 機制 ──────────────────────────────────────────────────────────────
// 一條「時間軸」flow ∈ [0, KEYS.length-1]，每個整數是一個關鍵影格：
//
//   0 hero    自由場（不收攏）      3 venue   venue.png
//   1 about   side.png            4 faq     faq.png
//   2 speaker 講者人像             5 outro   自由場（票券／贊助／CoC）
//
// flow = Σ(各段 ScrollTrigger 的 scrub 進度)。每段各自 0→1、依序排列，所以 flow
// 單調、可逆、停在中間也成立。取 k = floor(flow)、u = flow - k 之後：
//
//   setTargets(shapes[k], shapes[k+1])   段落改變時才上傳（不是每幀）
//   setMorph(pull, grip, u)              每幀只寫 16 bytes
//
// 段落交界為什麼不會跳：u=1 時目標是 shapes[k+1]，切到下一段 u=0 時目標也是
// shapes[k+1] —— 換掉的那一端權重正好是 0。這是整條鏈路無縫的關鍵。
//
// ⚠️ 所有 shapes 都必須用「同一份粒子快照」配對出來（見 buildAllShapes）。
// 每顆粒子在各影格之間要有一致的身分，才能直接 setTargets(k, k+1) 而不重新配對。
//
// 位置與變形機制與原版相同（路線 C · shader seek 力，見 docs/point-cloud-effect.md §8）。

const props = defineProps({
  // /api/home 的 speaker.items，只用來拿 portrait 路徑
  speakers: {
    type: Array,
    default: () => []
  }
})

const { loadParticleKit } = useParticleKit()
const { paletteToLinear, lerpPaletteLinear, buildImageTargets, buildSlotTargets } = useParticleMorph()
// 只借用它的閒置偵測（全 app 單例）。這一版沒有第二張 canvas，不需要 claim/release。
const { idle } = useParticleStage()
const { speakerIndex, swapImpl, resetSpeakerBus } = useSameFieldBus()

const canvasRef = ref(null)
const backend = ref('')

// --- 關鍵影格 --------------------------------------------------------------
// src   null = 自由場（不收攏，純 particle-life）
// fit   點雲佔畫布的比例（contain-fit 進 W*fit × H*fit 的框）
// pull  每單位距離想要的靠攏速度；grip 速度被導引的強度。
//       grip 大 = 抓得緊、輪廓清楚，但輪廓內剩下的 particle-life 運動就少。
//       實測可用區間 pull 8–12 / grip 55–85；grip 再高就變成死的貼圖。
// shift / shiftY  內容往左 / 往上推的「視窗寬（高）比例」，靠相機位移做出
//       「圖片被畫面邊緣切掉」的構圖，而不是裁圖（裁出來的硬邊很醜）。
const SIDE_IMAGE = '/source_images/side.png'
const VENUE_IMAGE = '/source_images/venue.png'
const FAQ_IMAGE = '/source_images/faq.png'

const KEYS = [
  { id: 'hero', src: null, fit: 0, pull: 0, grip: 0, zoom: 1.35, shift: 0, shiftY: 0, opacity: 0.55 },
  { id: 'about', src: SIDE_IMAGE, fit: 0.86, pull: 10, grip: 68, zoom: 1.35, shift: 0, shiftY: 0, opacity: 0.75 },
  // 人像：這一版唯一「明顯不如原版」的地方。原版那張獨立 canvas 可以把 grip 拉到
  // 82 又完全關掉互動力場；這裡的粒子前後都還要變成別的東西，force 全程開著，
  // 所以五官會比原版鬆一點。要更銳利就把 grip 往上加，代價是前後兩段的流動感變差。
  { id: 'speaker', src: null, fit: 0.68, pull: 11, grip: 82, zoom: 1.0, shift: 0, shiftY: 0, opacity: 0.95 },
  { id: 'venue', src: VENUE_IMAGE, fit: 0.82, pull: 10, grip: 55, zoom: 1.0, shift: 0.26, shiftY: 0.10, opacity: 0.85 },
  { id: 'faq', src: FAQ_IMAGE, fit: 0.82, pull: 10, grip: 55, zoom: 1.06, shift: 0.32, shiftY: 0.26, opacity: 0.80 },
  { id: 'outro', src: null, fit: 0, pull: 0, grip: 0, zoom: 1.30, shift: 0, shiftY: 0, opacity: 0.60 },
]
const SPEAKER_KEY = 2                 // 講者影格的索引，換人時要改寫 shapes[2]

// 各段的捲動範圍。⚠️ 依序、不重疊 —— 重疊不會壞掉（flow 仍然單調），
// 但會讓兩段同時推進、變形速度忽快忽慢。
// start 用 'top 85%' 而不是 'top bottom'：從視窗底就開始的話，上一段還沒跑完
// 就被下一段接手，前一個形狀永遠收不滿（原版 ParticleField 的註解也踩過這個坑）。
const SEGMENTS = [
  { trigger: '[data-same-hero]', start: 'bottom bottom', end: 'bottom top' },
  { trigger: '[data-same-speaker]', start: 'top 85%', end: 'top 30%' },
  { trigger: '[data-same-venue]', start: 'top 85%', end: 'top 30%' },
  { trigger: '[data-same-faq]', start: 'top 85%', end: 'top 30%' },
  { trigger: '[data-same-ticket]', start: 'top 90%', end: 'top 45%' },
]

// --- 粒子預算 --------------------------------------------------------------
// ⚠️ 點數要跟「點雲在螢幕上的面積」一起看。venue / faq 那兩隻標本有很細的放射狀
// 尖刺，密度不夠就糊成一團白霧（原版 VenueFaqField 為此用到 52000）。這一版整頁
// 共用同一組粒子，所以要取所有區塊裡最吃密度的那個當基準。
const COUNT_DESKTOP = 50000
const COUNT_MOBILE = 18000
// 每張圖的取樣點數。⚠️ 全部必須一致，否則配對會有一撮粒子配不到對。
// 引擎點數可以大於它（buildImageTargets 會循環重用取樣點），也可以小於它
// （取樣是重要性採樣、順序隨機，取前 N 個仍是整張圖的均勻子集）。
const SAMPLES = 36000
const SPECIES = 7                     // 色盤長度，所有 spec 都要一致（morph 中不能改 species）

const HERO_PALETTE = 'blue'

// --- 模擬速度 --------------------------------------------------------------
// 開場快速散開 → 待機極慢 → 依捲動速度即時加速。與原版 ParticleField 同一套。
const SIM_SPEED_INTRO = 1.5
const INTRO_HOLD_MS = 1800
const INTRO_FADE_MS = 5000
const SIM_SPEED_IDLE = 0.16
const SIM_SPEED_MAX = 0.6
const SCROLL_REF = 2200               // 捲動速度 px/s 到這個值就吃滿加速
const ATTACK = 0.14
const RELEASE = 0.022

const FORCE_FACTOR = 1.0
const SCROLL_CALM = 0.6               // 捲動中把互動力場壓掉多少，遷移才乾淨

// 收攏拉力的跟隨速度。ATTACK 快（收攏要跟得上捲動），RELEASE 慢（放手要拖一段）。
// ⚠️ RELEASE 不能快：回到自由場時若 pull 跟著 u 一起歸零，粒子就沒有力氣被帶回
// 滿版，會整團留在原地慢慢擴散。慢釋放讓 seek 在 u 歸零後還有約 1.4 秒把粒子
// 送回 spread（那組目標點就是「健康的滿版自由場」），再交還給物理。
const LOCK_ATTACK = 0.20
const LOCK_RELEASE = 0.012

// --- 閃動 ------------------------------------------------------------------
// 收攏鎖得夠緊到看得出形狀時，粒子就不可能有自發運動 —— seek 是「收斂到固定點的
// 臨界阻尼彈簧」，任何擾動都會被 v = mix(v, desiredV, grip·dt) 吃掉。這是機制上
// 的，調 force / grip / 加脈衝都沒用（原版 SpeakerField 有完整的踩坑紀錄）。
// 有效的作法是「讓目標點自己會動」：每隔一段時間換一組新的隨機偏移，粒子就會平滑
// 地滑向新位置。⚠️ 這一版 blend 已經被捲動進度佔用，所以只能把抖動烘進目標點，
// 不能像 SpeakerField 那樣讓 blend 在 1↔0 之間震盪。
const SHIMMER_AMP = 7                 // 人像的五官在模擬空間只有 20–40px 寬，超過 ~10 就糊掉
const SHIMMER_PERIOD_MS = 2200

const AMBIENT_INTENSITY = 0.5
// 收攏到一定程度就把四層環境擾動關掉 —— tide 那層一發是 16–25 的大脈衝，
// 會把鎖好的形狀打散。兩個門檻做遲滯，避免在邊界上反覆開關。
const AMBIENT_OFF_AT = 0.35
const AMBIENT_ON_AT = 0.20

// 目標點失效（視窗改尺寸、fps 自適應觸發 setCount 整場重生）後要等場域重新散開
// 才能重建 ——「自由場」那組目標點就是當下的粒子分布，抓太早會記成一團緊湊的
// 開場構圖，之後就再也回不到滿版。
const REBUILD_SETTLE_MS = 3000
// 開場等多久才第一次建目標點（要等 fps 自適應定案 + 場域散開）
const FIRST_BUILD_MS = 4000

// 換人：先炸開再重組（與原版 SpeakerField 同一套 spread/shape 機制）
const EXPLODE_MS = 520
const REFORM_MS = 1100
const EXPLODE_PUSH = 170
// flow 落在這個範圍內才播換人動畫。捲到 venue 之後才點名單的話，粒子早就是別的
// 形狀了，硬播「炸開再組成人像」只會看到一團東西突然變成臉又變回去。
const SWAP_FLOW_MIN = 1.35
const SWAP_FLOW_MAX = 2.65

const TAU = Math.PI * 2
// --------------------------------------------------------------------------

let engine = null
let stopAmbient = null
let ambientOn = false
let raf = 0
let triggers = []
let onVisibility = null
let onResize = null
let resizeTimer = 0
let reducedMotion = false

// 每段的 scrub 進度，加總 = flow
const segProgress = new Array(SEGMENTS.length).fill(0)
let flow = 0

const specs = new Map()               // 圖片路徑 → PLImage spec（同一張只取樣一次）
let baseSnap = null                   // 建所有 shapes 的那份粒子快照（換人時要沿用）
const shapes = []                     // 每個影格的每-slot 目標點 [x,y,x,y,…]
const palLin = []                     // 每個影格的線性光色盤
let ready = false
let targetsGen = -1
let targetsW = 0
let targetsH = 0

let curSeg = -1                       // 目前已上傳目標點的段落
let shimmerT0 = 0
let shimmerCycle = -1
let jitA = null                       // 閃動用的 scratch，避免每 2.2 秒配兩份大陣列
let jitB = null

let simSpeed = SIM_SPEED_INTRO
let scrollHeat = 0
let appliedForce = FORCE_FACTOR
let pullNow = 0
let gripNow = 0
let lastScrollY = 0
let lastTime = 0
let introStart = 0
let lastOpacity = -1
let lastColorKey = ''

let swapping = false                  // 換人動畫進行中 → 捲動不要搶著寫 morph
let swapTween = null

// --- 小工具 ----------------------------------------------------------------
// shader 算的是 ndc = (pos - center) * (2*zoom/W)，所以畫面上位移的「視窗寬度
// 比例」= 相機位移(sim px) * zoom / W。反解如下。
function shiftToCamera (f, zoom, span) { return (f * span) / zoom }

function lerp (a, b, e) { return a + (b - a) * e }

function jitterInto (out, base, amp) {
  for (let i = 0; i < base.length; i += 2) {
    const a = Math.random() * TAU
    const r = amp * (0.3 + 0.7 * Math.random())
    out[i] = base[i] + Math.cos(a) * r
    out[i + 1] = base[i + 1] + Math.sin(a) * r
  }
  return out
}

function speakerPortrait (i) {
  return props.speakers[i]?.portrait || null
}

async function getSpec (src, fit) {
  if (!src) return null
  const cacheKey = `${src}@${fit}`
  if (specs.has(cacheKey)) return specs.get(cacheKey)
  const spec = await window.PLImage.prepare(src, {
    count: SAMPLES,
    colors: SPECIES,              // 必須等於 species，否則得 setSpecies（會整場重生）
    fit,
  })
  specs.set(cacheKey, spec)
  return spec
}

// --- 目標點 ----------------------------------------------------------------
// 用同一份快照把每個影格算成「以 slot 為索引」的目標點。
// slot 是粒子生成時指定、永不改變的身分（GPU 每幀 spatial sort 會重排陣列，
// array index 靠不住），shader 用 targets[slot] 查目標點。
function shapeFromSpec (spec, snap, W, H) {
  const targets = buildImageTargets(spec, snap.length, W, H)
  const { shape } = buildSlotTargets(snap, targets, spec.palette.length, W)
  return shape
}

// 自由場影格的「目標點」就是快照當下的位置。pull 在那裡是 0，平常用不到它 ——
// 真正的用途是「回程」：從收攏狀態捲回來時，seek 會主動把粒子拉回這組滿版分布，
// 而不是放掉力場乾等它們慢慢擴散。
function spreadFromSnap (snap, n) {
  const out = new Float32Array(n * 2)
  for (const p of snap) {
    if (p.slot < n) { out[p.slot * 2] = p.x; out[p.slot * 2 + 1] = p.y }
  }
  return out
}

async function buildAllShapes () {
  if (!engine?.readParticles || !engine.setTargets) return false
  const snap = await engine.readParticles()
  const { W, H } = engine.size
  const spread = spreadFromSnap(snap, engine.config.count)

  shapes.length = 0
  palLin.length = 0
  const heroPal = window.PLPalettes.PALETTES[HERO_PALETTE].particles
  for (const key of KEYS) {
    if (!key.src) {
      shapes.push(spread)
      palLin.push(paletteToLinear(heroPal))
      continue
    }
    const spec = specs.get(`${key.src}@${key.fit}`)
    if (!spec) { shapes.push(spread); palLin.push(paletteToLinear(heroPal)); continue }
    shapes.push(shapeFromSpec(spec, snap, W, H))
    palLin.push(paletteToLinear(spec.palette))
  }

  baseSnap = snap
  jitA = new Float32Array(spread.length)
  jitB = new Float32Array(spread.length)
  targetsGen = engine.targetsGeneration
  targetsW = W
  targetsH = H
  curSeg = -1                          // 強制下一幀重新上傳
  shimmerT0 = performance.now()
  shimmerCycle = -1
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
  pullNow = 0
  gripNow = 0
  engine?.setMorph?.(0, 0, 0)
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => { buildAllShapes() }, REBUILD_SETTLE_MS)
}

// --- 環境擾動的開關（遲滯）--------------------------------------------------
function syncAmbient (lockNorm) {
  if (reducedMotion) return
  if (ambientOn && lockNorm > AMBIENT_OFF_AT) {
    stopAmbient?.()
    stopAmbient = null
    ambientOn = false
  } else if (!ambientOn && lockNorm < AMBIENT_ON_AT) {
    stopAmbient = window.PLAmbient.start(() => engine, { intensity: AMBIENT_INTENSITY })
    ambientOn = true
  }
}

// --- 每幀 ------------------------------------------------------------------
function frame (now) {
  raf = requestAnimationFrame(frame)
  if (!engine) return

  const t = now || performance.now()
  const y = window.scrollY

  // 停住時仍要更新時間 / 捲動基準，否則喚醒那一幀會算出爆炸的 dt 與捲動速度
  if (document.hidden || idle.value) {
    lastTime = t
    lastScrollY = y
    return
  }

  // --- 捲動速度 → 模擬速度 -------------------------------------------------
  const dt = lastTime ? Math.min(0.1, (t - lastTime) / 1000) : 0
  if (dt > 0) {
    // 開場包絡：先維持 INTRO 速度，再 smoothstep 降到待機速度，之後恆為 0
    const age = t - introStart
    let intro = 0
    if (age < INTRO_HOLD_MS) {
      intro = 1
    } else if (age < INTRO_HOLD_MS + INTRO_FADE_MS) {
      const u = 1 - (age - INTRO_HOLD_MS) / INTRO_FADE_MS
      intro = u * u * (3 - 2 * u)
    }
    const base = SIM_SPEED_IDLE + (SIM_SPEED_INTRO - SIM_SPEED_IDLE) * intro

    const heat = Math.min(1, (Math.abs(y - lastScrollY) / dt) / SCROLL_REF)
    const target = base + (SIM_SPEED_MAX - SIM_SPEED_IDLE) * heat
    simSpeed += (target - simSpeed) * (target > simSpeed ? ATTACK : RELEASE)
    engine.setSimSpeed?.(simSpeed)

    scrollHeat += (heat - scrollHeat) * (heat > scrollHeat ? ATTACK : RELEASE)
    const wanted = FORCE_FACTOR * (1 - SCROLL_CALM * scrollHeat)
    if (Math.abs(wanted - appliedForce) > 0.01) {
      appliedForce = wanted
      engine.setForce?.(wanted)      // 會重寫 80 bytes 的 options buffer，所以設門檻
    }
  }
  lastTime = t
  lastScrollY = y

  // --- 時間軸 → 影格 --------------------------------------------------------
  const last = KEYS.length - 2
  const k = Math.max(0, Math.min(last, Math.floor(flow)))
  const u = Math.max(0, Math.min(1, flow - k))
  const e = u * u * (3 - 2 * u)        // smoothstep，兩端收尾自然
  const A = KEYS[k]
  const B = KEYS[k + 1]

  // --- 相機 -----------------------------------------------------------------
  const { W, H } = engine.size
  const zoom = lerp(A.zoom, B.zoom, e)
  const shiftX = shiftToCamera(lerp(A.shift, B.shift, e), zoom, W)
  // 相機往下移 = 內容往上移，所以要內容往下推就得給負的 Y
  const shiftY = -shiftToCamera(lerp(A.shiftY, B.shiftY, e), zoom, H)

  const gripTarget = lerp(A.grip, B.grip, e)
  const lockNorm = Math.min(1, gripNow / 90)

  // 緩慢的電影感漂移：兩個不同週期的正弦疊加，避免看得出循環。
  // 收攏時要壓下來 —— 人像跟著漂會讓「看得出是誰」的那幾秒一直在晃。
  let dx = 0; let dy = 0; let dz = 1
  if (!reducedMotion) {
    const s = t * 0.001
    const g = 1 - 0.75 * lockNorm
    dx = (Math.sin(s * 0.021) * 42 + Math.sin(s * 0.006) * 26) * g
    dy = (Math.cos(s * 0.017) * 30 + Math.sin(s * 0.010) * 16) * g
    dz = 1 + 0.035 * Math.sin(s * 0.011) * g
  }
  engine.setCameraZoom?.(zoom * dz)
  engine.setCameraOffset?.(shiftX + dx, shiftY + dy)

  // --- 透明度 / 色盤 --------------------------------------------------------
  // 兩者都會重寫整個 buffer，所以設變化門檻，不要每幀寫。
  const opacity = lerp(A.opacity, B.opacity, e)
  if (Math.abs(opacity - lastOpacity) > 0.004) {
    lastOpacity = opacity
    engine.setParticleOpacity?.(opacity)
  }
  if (!swapping && palLin.length === KEYS.length) {
    const ck = `${k}:${Math.round(e * 200)}`
    if (ck !== lastColorKey) {
      lastColorKey = ck
      engine.setColors?.(lerpPaletteLinear(palLin[k], palLin[k + 1], e))
    }
  }

  syncAmbient(lockNorm)

  // --- 收攏 -----------------------------------------------------------------
  if (ready && targetsStale()) invalidateTargets()
  if (!ready || swapping) return

  // 段落改變 → 換一組目標點。⚠️ 只在這裡上傳（一次 count*16 bytes），不是每幀。
  const shimmerNow = Math.floor((t - shimmerT0) / SHIMMER_PERIOD_MS)
  if (k !== curSeg || (!reducedMotion && shimmerNow !== shimmerCycle && lockNorm > 0.05)) {
    curSeg = k
    shimmerCycle = shimmerNow
    const amp = reducedMotion ? 0 : SHIMMER_AMP
    engine.setTargets(
      amp ? jitterInto(jitA, shapes[k], amp) : shapes[k],
      amp ? jitterInto(jitB, shapes[k + 1], amp) : shapes[k + 1],
    )
  }

  const pullTarget = lerp(A.pull, B.pull, e)
  pullNow += (pullTarget - pullNow) * (pullTarget > pullNow ? LOCK_ATTACK : LOCK_RELEASE)
  gripNow += (gripTarget - gripNow) * (gripTarget > gripNow ? LOCK_ATTACK : LOCK_RELEASE)
  if (pullNow < 0.02) { pullNow = 0; gripNow = 0 }
  engine.setMorph?.(pullNow, gripNow, e)
}

function syncPause () {
  // 固定背景永遠在視窗內，所以不必 IntersectionObserver；要理的是分頁隱藏
  //（rAF 在背景分頁只是降頻，不是停止）與使用者閒置。
  engine?.pause(document.hidden || idle.value)
}
watch(idle, () => syncPause())

// --- 換人 ------------------------------------------------------------------
// 兩段式：blend 1→0 把粒子往外拋，再在 blend=0（shape 權重為 0，換掉無縫）把
// shape 換成下一個人，blend 0→1 重組。位置全在 GPU 算，JS 每幀只寫 16 bytes 的
// morph uniform + 128 bytes 的色盤，所以 5 萬顆也不會掉幀。
function explodeXY (base, W, H) {
  const n = base.length / 2
  let cx = 0; let cy = 0
  for (let i = 0; i < n; i++) { cx += base[i * 2]; cy += base[i * 2 + 1] }
  cx /= n; cy /= n
  const out = new Float32Array(base.length)
  for (let i = 0; i < n; i++) {
    const dx = base[i * 2] - cx; const dy = base[i * 2 + 1] - cy
    const d = Math.hypot(dx, dy) || 1
    const push = EXPLODE_PUSH * (0.45 + 0.9 * Math.random())
    // 夾在畫布內 —— 拋到牆外會被 wall repel 彈回來，看起來像撞到看不見的東西
    out[i * 2] = Math.max(8, Math.min(W - 8, base[i * 2] + (dx / d) * push))
    out[i * 2 + 1] = Math.max(8, Math.min(H - 8, base[i * 2 + 1] + (dy / d) * push))
  }
  return out
}

function tween (obj, vars, ms, ease, onUpdate) {
  const { $gsap } = useNuxtApp()
  return new Promise((done) => {
    swapTween = $gsap.to(obj, {
      ...vars,
      duration: reducedMotion ? 0 : ms / 1000,
      ease,
      onUpdate,
      onComplete: done,
    })
  })
}

async function swapSpeaker (portrait) {
  if (!engine || !portrait) return
  const spec = await getSpec(portrait, KEYS[SPEAKER_KEY].fit)
  if (!spec || !ready || !baseSnap) return

  const { W, H } = engine.size
  const nextShape = shapeFromSpec(spec, baseSnap, W, H)
  const nextPal = paletteToLinear(spec.palette)

  // 不在人像那一段就別播動畫 —— 直接換掉，捲回去自然就是新的人
  if (flow < SWAP_FLOW_MIN || flow > SWAP_FLOW_MAX) {
    shapes[SPEAKER_KEY] = nextShape
    palLin[SPEAKER_KEY] = nextPal
    curSeg = -1
    lastColorKey = ''
    return
  }

  swapping = true
  swapTween?.kill()
  try {
    const snap = await engine.readParticles()
    const cur = spreadFromSnap(snap, engine.config.count)
    const exploded = explodeXY(cur, W, H)
    const fromPal = palLin[SPEAKER_KEY]
    const state = { e: 1 }

    // 第一段：往外炸開。shape 先維持在「現在的位置」，blend 1→0 把粒子拋去 exploded。
    engine.setTargets(exploded, cur)
    engine.setMorph?.(KEYS[SPEAKER_KEY].pull, KEYS[SPEAKER_KEY].grip, 1)
    await tween(state, { e: 0 }, EXPLODE_MS, 'power2.out', () => {
      engine?.setMorph?.(KEYS[SPEAKER_KEY].pull, KEYS[SPEAKER_KEY].grip, state.e)
    })

    // 第二段：blend 已在 0 → 無縫把 shape 換成下一個人，再拉回去重組。
    engine.setTargets(exploded, nextShape)
    await tween(state, { e: 1 }, REFORM_MS, 'power2.inOut', () => {
      engine?.setMorph?.(KEYS[SPEAKER_KEY].pull, KEYS[SPEAKER_KEY].grip, state.e)
      engine?.setColors?.(lerpPaletteLinear(fromPal, nextPal, state.e))
    })
  } finally {
    shapes[SPEAKER_KEY] = nextShape
    palLin[SPEAKER_KEY] = nextPal
    // 交還給捲動：強制重新上傳這一段的目標點與色盤
    curSeg = -1
    lastColorKey = ''
    shimmerCycle = -1
    swapping = false
  }
}

// --- 初始化 ----------------------------------------------------------------
async function init () {
  const canvas = canvasRef.value
  if (!canvas) return

  await loadParticleKit()
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const hero = window.PLPalettes.PALETTES[HERO_PALETTE]
  const count = window.innerWidth < 768 ? COUNT_MOBILE : COUNT_DESKTOP

  engine = await window.makeEngine(canvas, {
    species: SPECIES,
    count,
    // 非對稱力矩陣才會一直動 —— cellular / chains 那種對稱矩陣會收斂成不動的
    // 菌落球，畫面就死了（見 docs/point-cloud-effect.md §4）。
    preset: 'spiral-conveyor',
    seedPattern: 'rainbowSpiral',   // 固定開場構圖，之後由規則接管
    palette: hero.particles,
    bgFade: hero.bgFade,
    forceFactor: FORCE_FACTOR,
    friction: 0.3,
    repel: 1.0,
    minR: 5,
    rMax: 72,
    simSpeed: SIM_SPEED_INTRO,
    cameraZoom: KEYS[0].zoom,
    pointSize: 0.8,
    particleOpacity: KEYS[0].opacity,
    showGlow: false,                // 高密度時光暈會糊成一片，只留銳利點
    cellSubdivisions: 2,
    maxDpr: 1.5,                    // 全螢幕 HDR target，DPR 2 是 4 倍像素、視覺收益極小
  })
  backend.value = engine.backend
  if (import.meta.dev) window.__sameField = engine

  if (!reducedMotion) {
    stopAmbient = window.PLAmbient.start(() => engine, { intensity: AMBIENT_INTENSITY })
    ambientOn = true
  }

  // 取樣所有影格的圖（含目前這位講者）。約 190ms / 張，在開場散開的那幾秒內做完。
  const jobs = KEYS.filter(key => key.src).map(key => getSpec(key.src, key.fit))
  jobs.push(getSpec(speakerPortrait(speakerIndex.value), KEYS[SPEAKER_KEY].fit))
  try {
    await Promise.all(jobs)
  } catch (err) {
    console.warn('[HomeSameField] 圖片點雲取樣失敗，該影格維持自由場', err)
  }
  // 講者影格的圖是資料給的，不在 KEYS 表裡寫死
  KEYS[SPEAKER_KEY].src = speakerPortrait(speakerIndex.value)

  onVisibility = () => syncPause()
  document.addEventListener('visibilitychange', onVisibility)
  onResize = () => invalidateTargets()
  window.addEventListener('resize', onResize)

  introStart = performance.now()
  lastScrollY = window.scrollY
  syncPause()

  if (import.meta.dev) {
    window.__sameDbg = () => ({
      flow: +flow.toFixed(3),
      seg: curSeg,
      simSpeed: +simSpeed.toFixed(3),
      pull: +pullNow.toFixed(2),
      grip: +gripNow.toFixed(2),
      force: +engine.config.forceFactor.toFixed(2),
      ready,
      swapping,
      paused: engine.config.paused,
    })
  }
  frame()

  // 先讓開場的 fps 自適應定案，再建目標點 ——
  // setCount 會重配粒子與 targets buffer，順序反了目標點會被清空。
  setTimeout(async () => {
    const fps = engine?.getFps ? engine.getFps() : 60
    if (fps > 0 && fps < 45) {
      engine.setCount?.(Math.round(count / 2))
      // setCount 會整場重生成「開場構圖」（緊湊的螺旋）。要等它散開再建目標點，
      // 否則「自由場」那組目標會記成那團緊湊的東西，之後就回不到滿版。
      await new Promise(r => setTimeout(r, REBUILD_SETTLE_MS))
    }
    await buildAllShapes()
  }, FIRST_BUILD_MS)

  // --- 捲動 -----------------------------------------------------------------
  const { $ScrollTrigger } = useNuxtApp()
  if ($ScrollTrigger) {
    SEGMENTS.forEach((seg, i) => {
      if (!document.querySelector(seg.trigger)) return
      triggers.push($ScrollTrigger.create({
        trigger: seg.trigger,
        start: seg.start,
        end: seg.end,
        scrub: true,
        onUpdate: (self) => { segProgress[i] = self.progress; flow = segProgress.reduce((a, b) => a + b, 0) },
        onRefresh: (self) => { segProgress[i] = self.progress; flow = segProgress.reduce((a, b) => a + b, 0) },
      }))
    })
    $ScrollTrigger.refresh()
  }

  swapImpl.value = swapSpeaker
}

// 名單那邊改人 → 換圖。⚠️ 只在 swapImpl 沒被呼叫到的情況下當備援（例如程式碼
// 直接改 speakerIndex），正常路徑是 selectSpeaker() 直接 await swapSpeaker。
watch(speakerIndex, (i) => {
  KEYS[SPEAKER_KEY].src = speakerPortrait(i)
})

onMounted(() => { init() })

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  swapTween?.kill()
  triggers.forEach(t => t.kill())
  triggers = []
  stopAmbient?.()
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  clearTimeout(resizeTimer)
  if (onResize) window.removeEventListener('resize', onResize)
  if (engine) { engine.destroy(); engine = null }
  resetSpeakerBus()
})

defineExpose({ backend })
</script>

<template>
  <canvas
    ref="canvasRef"
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-0 block h-full w-full"
  />
</template>
