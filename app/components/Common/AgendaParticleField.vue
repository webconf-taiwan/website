<script setup>
import { plateFieldLook } from '~/utils/particleFieldLooks'

const { loadParticleKit } = useParticleKit()
// 首次進站 loading 等粒子場與起始構圖準備好才結束。
const { trackIntro, introDone } = useSiteIntro()
const opening = useParticleOpening()
const { countFor, maxDpr } = useParticleBudget()
const { idle } = useParticleStage()
const { suspendReadback } = useParticleQuality()
const { buildSeedTargets, buildSlotTargetsRaw, paletteToLinear, lerpPaletteLinear } = useParticleMorph()

const props = defineProps({
  fixed: {
    type: Boolean,
    default: false,
  },
  // 減少動態或引擎失敗時使用的備援圖片。
  source: {
    type: String,
    default: '/figma/agenda/mobile-particle-source.webp',
  },
  railStart: { type: String, default: 'hero' },
  galleryConfig: { type: Object, default: null },
  density: { type: Number, default: 0.8 },
  heroVisible: { type: Boolean, default: true },
  fieldLook: { type: Object, default: null },
})
const emit = defineEmits(['ready', 'unavailable'])

const wrapRef = ref(null)
const canvasRef = ref(null)
const backend = ref('')
const ready = ref(false)
const artwork = ref({ width: 1440, height: 1440 * 1710 / 2422, left: 64, top: (550 - 1440 * 1710 / 2422) / 2 })
const wrapClass = computed(() => props.fixed
  ? 'agenda-field--fixed fixed -inset-x-16 top-0 z-0 h-dvh overflow-hidden'
  : 'absolute inset-0 h-full w-full overflow-hidden'
)

let look = resolveFieldLook(DEFAULT_FIELD_LOOK)
const galleryConfig = props.galleryConfig
let species = look.rules.species
const SOURCE = props.source
const HERO = {
  height: 550, preset: 'nebula', pull: 12, grip: 58,
  pointSize: 0.85, simSpeed: 0.65,
  flowMs: 1000 / 24, flowDistance: 18, rippleDistance: 6,
}
// 首頁 hero 的力矩陣、物理、相機與握力，數值抄自 utils/homeFieldLooks.js。
// 刻意在這裡留一份副本、不 import 首頁那份：兩邊各調各的，互不影響。
const HERO_MOTION = {
  'cobalt-cells': {
    rules: { preset: 'snake', species: 6 },
    physics: { forceFactor: 0.95, friction: 0.31, repel: 1.4, minR: 16, rMax: 72 },
    zoom: 1.58, hold: { pull: 6, grip: 28 },
    speed: { idle: 0.21, max: 0.8 },
  },
  'biolum-drift': {
    rules: { preset: 'spiral-conveyor', species: 7 },
    physics: { forceFactor: 1.0, friction: 0.3, repel: 1.0, minR: 5, rMax: 72 },
    zoom: 1.35, hold: { pull: 0, grip: 0 },
    speed: { idle: 0.16, max: 0.6 },
  },
  'parchment-herbarium': {
    rules: { preset: 'tri-spiral', species: 7 },
    physics: { forceFactor: 1.0, friction: 0.32, repel: 1.2, minR: 5, rMax: 70 },
    zoom: 1.69, hold: { pull: 6, grip: 32 },
    speed: { idle: 0.24, max: 0.9 },
  },
  'fluoro-swarm': {
    rules: { preset: 'predator', species: 5 },
    physics: { forceFactor: 1.0, friction: 0.29, repel: 1.1, minR: 5, rMax: 78 },
    zoom: 1.46, hold: { pull: 5, grip: 20 },
    speed: { idle: 0.27, max: 1.0 },
  },
  'coral-membrane': {
    rules: { preset: 'helical', species: 6 },
    physics: { forceFactor: 0.92, friction: 0.31, repel: 1.05, minR: 5, rMax: 80 },
    zoom: 1.58, hold: { pull: 6, grip: 26 },
    speed: { idle: 0.21, max: 0.8 },
  },
}
// 以下常數同 Home/Field.vue：握力呼吸、相機漂移壓制、環境擾動門檻、滑鼠推擠。
const HOLD_BREATHE_MS = 7000
const HOLD_BREATHE_FLOOR = 0.18
const AMBIENT_OFF_AT = 0.35
const POINTER_RADIUS = 320
const POINTER_MAX_PUSH = 24
const POINTER_SPEED_GAIN = 3.5
const POINTER_IDLE_PUSH = 2
// 模擬速度同 Home/Field.vue：待機速度照效果，捲動越快越接近 speed.max。
const SCROLL_REF = 2200
const SPEED_ATTACK = 0.14
const SPEED_RELEASE = 0.022
// 效能降規同 Home/Field.vue：不接檔位表，暖機後量幀時間中位數，
// 連續兩個視窗超標就用 shrinkTo 分批減半（逐漸變稀、不重生），整個 page view 只降一次。
const ADAPT_WARMUP_MS = 1200
const ADAPT_WINDOW_MS = 1500
const ADAPT_MIN_FRAMES = 20
const ADAPT_P50_MS = 22
const ADAPT_FAIL_STREAK = 2
const ADAPT_MAX_WINDOWS = 4
const SHRINK_STEPS = 10
const SHRINK_STEP_MS = 200
// HomeField's cellular structure and shimmer, with tighter guidance for the rail.
const RAIL = {
  preset: 'cellular',
  minR: 24,
  pull: 18,
  grip: 82,
  pointSize: 0.68,
  simSpeed: 0.3,
  shimmer: 7,
  shimmerMs: 260,
  glow: { size: 4.2, intensity: 0.021, steepness: 5 },
  palette: ['#7CC8F2', '#3E8FE0', '#E8E8E8', '#97DFF5', '#3E8FE0', '#E8E8E8', '#97DFF5'],
}
// Colony centers/radii read from the 445 x 533 Figma rail reference.
// A fixed composition preserves the gaps around the label and between groups.
const COLONIES = [
  [18, 138, 47], [198, 83, 51], [344, 39, 53], [249, 195, 52],
  [188, 346, 59], [360, 299, 55], [69, 462, 54], [373, 468, 57],
]

let engine = null
let stopAmbient = null
let raf = 0
let rafPending = false
let adaptRaf = 0
let shrinking = false
// 降點後的倍率；resize 重算點數時要沿用，不然一拉視窗就把降掉的粒子補回來。
let countScale = 1
let running = false
const reducedMotion = ref(false)
let disposed = false
let needsTargets = true
let buildingTargets = false
let targetsGeneration = -1
let targetsSize = ''
let spread = null
let heroFlow = null
let heroTypes = null
let railTypes = null
let colonies = null
let flower = null
let flowerTypes = null
let flowerBounds = null
let galleryMix = 0
let flowerMode = false
let lastGalleryTop = NaN
let lastGalleryMix = NaN
// 上傳給 shader 的目標點，一份持久的交錯陣列：每個 slot 佔 4 個 float
// [heroX, heroY, railX, railY]。jitter 直接寫進這裡，再整包交給 setTargetsPacked，
// 不再每個週期配置新陣列、也不再讓引擎多做一次交錯拷貝。
let packed = null
let shimmerCycle = -1
let heroCycle = -1
let motionTime = 0
let railMix = 0
let pull = 0
let grip = 0
let lastTime = 0
let lastDt = 1 / 60
let colonyMode = false
let lastPointSize = -1
let lastMinR = -1
let lastSimSpeed = NaN
let simSpeedNow = NaN
let lastScrollY = 0
let lastCameraX = NaN
let lastCameraY = NaN
let lockNorm = 1
let pointerOn = false
let touchMode = false
let touchDown = false
let pointerSeen = false
let pointerX = 0
let pointerY = 0
let pointerPrevX = 0
let pointerPrevY = 0
let lastCameraZoom = NaN
let returnUntil = 0
let previousProgress = 0
let lastMorphPull = NaN
let lastMorphGrip = NaN
let lastMorphBlend = NaN
let resizeRaf = 0
let heroPalette = null
const railPalette = paletteToLinear(RAIL.palette)
let paletteStep = -1
const failed = ref(false)
let heroSize = HERO.pointSize
let railScale = 1
let heroOffset = 0
let railOffset = 0
let canvasHeight = 550
let resizeObserver = null
let posterDrawn = false
let maskKey = ''
let fieldBounds = null
let regionEdges = null
let regionSettling = false

// --- DOM：元素只查一次，矩形一幀只量一次 ------------------------------------
// 以前每幀在四個地方各 querySelector + getBoundingClientRect 一次，而前一幀剛改過
// canvas 的 transform / clip-path / mask 變數，每次量測都會強制 layout。
const dom = { hero: null, page: null, body: null, aside: null, gallery: null, board: null }
const rects = { hero: null, page: null, aside: null, body: null, gallery: null, board: null, canvas: null }

function lookupDom () {
  if (!dom.hero) dom.hero = document.querySelector('[data-plate-hero-desktop]')
  if (!dom.page) dom.page = canvasRef.value?.closest('[data-plate-page]') || null
  if (!dom.body) dom.body = document.querySelector('[data-plate-body]')
  if (!dom.aside && dom.body) dom.aside = dom.body.querySelector(':scope > aside')
  if (galleryConfig && !dom.gallery) {
    dom.gallery = dom.page?.querySelector('[data-plate-gallery]')
    dom.board = dom.gallery?.querySelector('.photo-board') || null
  }
}

function measure () {
  lookupDom()
  rects.hero = dom.hero?.getBoundingClientRect() || null
  rects.page = dom.page?.getBoundingClientRect() || null
  rects.aside = dom.aside?.getBoundingClientRect() || null
  rects.body = dom.body?.getBoundingClientRect() || null
  rects.canvas = canvasRef.value?.getBoundingClientRect() || null
  if (dom.gallery) rects.gallery = dom.gallery.getBoundingClientRect()
  if (dom.board) rects.board = dom.board.getBoundingClientRect()
}

// --- CSS 變數：動畫數值直接寫在 wrapper 上，Vue 不參與動畫迴圈 ----------------
// 只有數值真的變了才寫；靜止時不會讓 mask / clip-path 重新光柵化。
const cssVars = { railMix: NaN, heroOffset: NaN, railOffset: NaN, clipBottom: NaN }

function writeCssVars () {
  const el = wrapRef.value
  if (!el) return
  const clipBottom = 0
  if (props.fixed) {
    const W = canvasRef.value?.clientWidth || window.innerWidth + 128
    const canvasLeft = canvasRef.value?.getBoundingClientRect().left || 0
    // 只有一個顯示範圍，跟著同批粒子移動；不保留獨立的 Hero／正文窗口。
    const bounds = {
      left: 0, top: (rects.hero?.top || 0) - railOffset,
      width: W, height: rects.hero?.height || HERO.height,
    }
    const moveBounds = (target, mix) => {
      for (const key of ['left', 'top', 'width', 'height']) bounds[key] += (target[key] - bounds[key]) * mix
    }
    if (galleryConfig && rects.board) {
      const board = rects.board
      // 顯示範圍跟著花形，花瓣左緣不被固定比例切掉。
      const flowerLeft = flowerBounds ? flowerBounds.cx - flowerBounds.radius - 48 : board.left - canvasLeft + board.width * 0.48
      const left = Math.max(board.left - canvasLeft, flowerLeft)
      moveBounds({
        left, top: board.top - railOffset,
        width: board.left - canvasLeft + board.width - left, height: board.height,
      }, galleryMix)
    }
    if (rects.aside) {
      moveBounds({
        left: rects.aside.left - canvasLeft, top: rects.aside.top - railOffset,
        width: rects.aside.width, height: rects.aside.height,
      }, railMix)
    }
    // 粒子靠物理追目標，會比捲動進度慢到位；左右邊界往內收時跟著放慢，
    // 不在粒子還沒飛到時就先把它們切掉。往外放寬則立刻跟上。
    const edgeLeft = bounds.left
    const edgeRight = bounds.left + bounds.width
    if (!regionEdges) regionEdges = { left: edgeLeft, right: edgeRight }
    const follow = 1 - Math.exp(-1.5 * lastDt)
    regionEdges.left = edgeLeft < regionEdges.left ? edgeLeft : regionEdges.left + (edgeLeft - regionEdges.left) * follow
    regionEdges.right = edgeRight > regionEdges.right ? edgeRight : regionEdges.right + (edgeRight - regionEdges.right) * follow
    if (Math.abs(regionEdges.left - edgeLeft) < 0.5) regionEdges.left = edgeLeft
    if (Math.abs(regionEdges.right - edgeRight) < 0.5) regionEdges.right = edgeRight
    regionSettling = regionEdges.left !== edgeLeft || regionEdges.right !== edgeRight
    bounds.left = regionEdges.left
    bounds.width = regionEdges.right - regionEdges.left
    const top = Math.max(0, bounds.top)
    const bottom = Math.min(canvasHeight, bounds.top + bounds.height)
    fieldBounds = { ...bounds, top, height: Math.max(0, bottom - top) }
    const visible = props.heroVisible || galleryMix > 0 || railMix > 0
    const region = visible
      ? `linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent) ${fieldBounds.left}px ${fieldBounds.top}px / ${fieldBounds.width}px ${fieldBounds.height}px no-repeat`
      : 'linear-gradient(transparent, transparent)'
    // 標題不再挖空粒子；粒子直接從標題文字後方通過。
    if (region !== maskKey) {
      el.style.mask = region
      maskKey = region
    }
  }
  const artworkOffset = (props.fixed ? rects.hero?.top || 0 : 0) * (1 - railMix)
  if (cssVars.railMix !== railMix) {
    cssVars.railMix = railMix
    el.style.setProperty('--rail-mix', String(railMix))
  }
  if (cssVars.heroOffset !== artworkOffset) {
    cssVars.heroOffset = artworkOffset
    el.style.setProperty('--hero-offset', `${artworkOffset}px`)
  }
  if (cssVars.railOffset !== railOffset) {
    cssVars.railOffset = railOffset
    el.style.setProperty('--rail-offset', `${railOffset}px`)
  }
  if (cssVars.clipBottom !== clipBottom) {
    cssVars.clipBottom = clipBottom
    el.style.setProperty('--clip-bottom', `${clipBottom}px`)
  }
}

function updateArtwork () {
  const W = canvasRef.value?.getBoundingClientRect().width || window.innerWidth
  const width = Math.max(1440, props.fixed ? W - 128 : W)
  const height = width * 1710 / 2422
  artwork.value = { width, height, left: (W - width) / 2, top: (HERO.height - height) / 2 }
  canvasHeight = canvasRef.value?.getBoundingClientRect().height || window.innerHeight
}

function countOptions () {
  return {
    density: props.density * 0.032,
    max: Math.round(props.density * 26000),
    min: Math.round(props.density * 6200),
  }
}

function applyParticleBudget () {
  if (!engine || !canvasRef.value || shrinking) return
  const count = Math.round(countFor(canvasRef.value, countOptions()) * countScale)
  const nextCount = engine.setTargets ? count : Math.min(count, 3600)
  if (nextCount !== engine.config.count) {
    engine.setMorph?.(0, 0, 0)
    engine.setCount(nextCount)
  }
  needsTargets = true
  schedule()
}

function railBounds () {
  const body = dom.body?.getBoundingClientRect()
  const width = Math.min(body?.width || window.innerWidth, 1440) * 0.35
  const heightScale = Math.max(0.5, (window.innerHeight - 60) / 660)
  const scale = Math.min(1, width / 484, heightScale)
  return { left: Math.max(0, body?.left || 0), width, scale: Math.max(0.5, scale), heightScale }
}

function scrollProgress () {
  if (!props.fixed) return 0
  const hero = rects.hero
  if (!hero?.height) return 0
  const boundary = props.railStart === 'body' ? (rects.body?.top ?? hero.bottom) : hero.bottom
  // 照片區右侧的場在正文入鏡時就往左移，接到側欄後維持 sticky。
  const start = galleryConfig ? Math.min(window.innerHeight - 120, hero.height + 200) : hero.height - 120
  const end = galleryConfig ? 160 : 60
  const p = Math.max(0, Math.min(1, (start - boundary) / Math.max(1, start - end)))
  return p * p * (3 - 2 * p)
}

// CPU 後端只有物件快照，轉成 GPU readParticlesRaw 同款的 stride 6 陣列，slot = index。
function rawFromSnapshot (snap) {
  const raw = new Float32Array(snap.length * 6)
  for (let i = 0; i < snap.length; i++) {
    const p = snap[i]
    raw[i * 6] = p.x
    raw[i * 6 + 1] = p.y
    raw[i * 6 + 2] = p.vx
    raw[i * 6 + 3] = p.vy
    raw[i * 6 + 4] = p.s
    raw[i * 6 + 5] = p.slot == null ? i : p.slot
  }
  return raw
}

async function rebuildTargets () {
  if (!engine || buildingTargets) return
  buildingTargets = true
  needsTargets = false
  const current = engine
  const generation = current.targetsGeneration ?? current.config.count
  const { W, H } = current.size
  try {
    updateArtwork()
    suspendReadback()
    const raw = current.readParticlesRaw
      ? await current.readParticlesRaw()
      : rawFromSnapshot(await current.readParticles())
    if (disposed || engine !== current) return
    if (generation !== (current.targetsGeneration ?? current.config.count) ||
        W !== current.size.W || H !== current.size.H) {
      needsTargets = true
      return
    }
    const N = raw.length / 6
    const bounds = railBounds()
    const { left, scale, heightScale } = bounds
    railScale = scale
    // Overscan keeps clipped edge colonies inside the simulation boundaries,
    // so its toroidal wrapping cannot send particles across the agenda text.
    const canvasLeft = canvasRef.value.getBoundingClientRect().left
    let seed = 20260915
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      return seed / 4294967296
    }
    const target = buildColonyTargets(N, species, W, H, {
      centers: COLONIES.map(([x, y, R]) => ({
        x: left - canvasLeft + x * scale,
        // Distribute centers over the rail height without stretching each colony.
        y: 60 + (91 + y - 60) * heightScale,
        R: R * scale * 0.8,
      })),
      blobs: [14, 22],
      blobRadius: [0.10, 0.24],
      random,
    })
    const railSlots = buildSlotTargetsRaw(raw, N, target, species, W)
    colonies = railSlots.shape
    railTypes = railSlots.shapeType
    // 起點就是這批粒子的真實 seed；GPU 空間排序會換順序，必須以 slot 配對。
    spread = new Float32Array(N * 2)
    heroTypes = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const slot = raw[i * 6 + 5]
      spread[slot * 2] = raw[i * 6]
      spread[slot * 2 + 1] = raw[i * 6 + 1]
      heroTypes[slot] = raw[i * 6 + 4]
    }
    if (galleryConfig && dom.gallery) {
      const board = dom.gallery.querySelector('.photo-board').getBoundingClientRect()
      const heading = dom.gallery.querySelector('.photo-heading').getBoundingClientRect()
      // 第二區是設計稿的花形：跨越照片後方、頂端與標題同高，不隨視窗高度縮小。
      // 同一批粒子以 slot 配對變形過去，不另開引擎、不增加粒子數。
      const top = Math.max(24, heading.top - board.top)
      const radius = Math.min(board.width * 0.31, (board.height - top) * 0.52)
      const zoom = galleryConfig.sim.cameraZoom
      const size = radius * 2 / zoom
      const seedTargets = buildSeedTargets(galleryConfig.behavior.seedPattern, N, species, size, size)
      const cx = board.left - canvasLeft + board.width * 0.76
      const cy = top + radius
      for (let i = 0; i < N; i++) {
        seedTargets.tx[i] = cx + (seedTargets.tx[i] - size / 2) * zoom
        // 目標放在視窗內模擬，照片區的捲動位移交給相機；放到環狀世界外會繞回蓋到標題。
        seedTargets.ty[i] = H / 2 + (seedTargets.ty[i] - size / 2) * zoom
      }
      const slots = buildSlotTargetsRaw(raw, N, seedTargets, species, W, { recolor: true })
      flower = slots.shape
      flowerTypes = slots.shapeType
      flowerBounds = { cx, cy, simulationCy: H / 2, radius, top }
    }
    // 同區域的粒子沿共同方向流動，保留 seed 的起始構圖。
    heroFlow = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const dx = spread[i * 2] - W / 2
      const dy = spread[i * 2 + 1] - HERO.height / 2
      const distance = Math.max(1, Math.hypot(dx, dy))
      heroFlow[i * 3] = dx / distance
      heroFlow[i * 3 + 1] = dy / distance
      heroFlow[i * 3 + 2] = Math.atan2(dy, dx) * 2 + distance * 0.008
    }
    heroPalette = paletteToLinear(window.PLPalettes.PALETTES[look.palette].particles)
    paletteStep = -1
    packed = new Float32Array(N * 4)
    for (let i = 0; i < N; i++) {
      packed[i * 4] = spread[i * 2]
      packed[i * 4 + 1] = spread[i * 2 + 1]
      packed[i * 4 + 2] = colonies[i * 2]
      packed[i * 4 + 3] = colonies[i * 2 + 1]
    }
    uploadTargets(current)
    current.setShapeTypes?.(flowerMode && flowerTypes ? flowerTypes : heroTypes, railTypes)
    pull = HERO.pull
    grip = HERO.grip
    current.setMorph?.(pull, grip, railMix)
    lastMorphPull = pull
    lastMorphGrip = grip
    lastMorphBlend = railMix
    targetsGeneration = generation
    targetsSize = W + ':' + H
    shimmerCycle = -1
    heroCycle = -1
  } finally {
    buildingTargets = false
    schedule()
  }
}

// fresh = true 表示這一幀已經 measure() 過；事件路徑（visibilitychange / idle）
// 自己量一次再判斷。
function syncRunning (fresh = false) {
  if (!fresh) measure()
  const page = rects.page
  const visible = page ? page.bottom > 0 && page.top < window.innerHeight : true
  // 共用閒置門檻已是三分鐘；切換分頁或進站 loading 結束前也會暫停。
  const want = visible && !document.hidden && !idle.value && !reducedMotion.value && !failed.value && (!posterDrawn || introDone.value)
  if (want === running) return
  running = want
  engine?.pause(!want)
  schedule()
}
watch(idle, () => syncRunning())
watch(introDone, () => syncRunning())

function jitterTargets (now) {
  const cycle = reducedMotion.value ? 0 : Math.floor(now / RAIL.shimmerMs)
  let changed = false
  // blend 為 0 時 shader 的 mix(hero, rail, 0) 完全不碰 rail 半邊，這時不必算、也不必上傳。
  if (railMix > 0 && cycle !== shimmerCycle) {
    shimmerCycle = cycle
    const amplitude = reducedMotion.value ? 0 : RAIL.shimmer * railScale
    for (let i = 0, n = colonies.length / 2; i < n; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = amplitude * (0.3 + 0.7 * Math.random())
      packed[i * 4 + 2] = colonies[i * 2] + Math.cos(angle) * radius
      packed[i * 4 + 3] = colonies[i * 2 + 1] + Math.sin(angle) * radius
    }
    changed = true
  }
  const nextHeroCycle = Math.floor(now / HERO.flowMs)
  const galleryTop = rects.gallery?.top || 0
  if (railMix < 1 && (nextHeroCycle !== heroCycle || lastGalleryTop !== galleryTop || lastGalleryMix !== galleryMix)) {
    heroCycle = nextHeroCycle
    lastGalleryTop = galleryTop
    lastGalleryMix = galleryMix
    const t = now * 0.001
    for (let i = 0, n = spread.length / 2; i < n; i++) {
      const nx = heroFlow[i * 3]
      const ny = heroFlow[i * 3 + 1]
      const phase = heroFlow[i * 3 + 2]
      const flow = Math.sin(t * 0.85 + phase) * HERO.flowDistance
      const ripple = Math.sin(t * 1.1 + phase * 1.7) * HERO.rippleDistance
      const grain = Math.sin(t * 2.4 + i * 2.399963) * 2.5
      const hx = spread[i * 2] - ny * flow + nx * (ripple + grain)
      const hy = spread[i * 2 + 1] + nx * flow + ny * (ripple + grain)
      const breathing = 1 + Math.sin(t * 0.6) * 0.035
      const fx = flower ? flowerBounds.cx + (flower[i * 2] - flowerBounds.cx) * breathing : hx
      const fy = flower ? flowerBounds.simulationCy + (flower[i * 2 + 1] - flowerBounds.simulationCy) * breathing : hy
      packed[i * 4] = hx + (fx - hx) * galleryMix
      packed[i * 4 + 1] = hy + (fy - hy) * galleryMix
    }
    changed = true
  }
  if (changed) uploadTargets(engine)
}

// 上傳 packed；若引擎是舊版快取（沒有 setTargetsPacked），拆回兩個 scratch 陣列
// 走舊的 setTargets，行為相同只是多一次拷貝。
let scratchA = null
let scratchB = null
function uploadTargets (target) {
  if (target.setTargetsPacked) { target.setTargetsPacked(packed); return }
  if (!target.setTargets) return
  const n = packed.length >> 2
  if (!scratchA || scratchA.length !== n * 2) {
    scratchA = new Float32Array(n * 2)
    scratchB = new Float32Array(n * 2)
  }
  for (let i = 0; i < n; i++) {
    scratchA[i * 2] = packed[i * 4]
    scratchA[i * 2 + 1] = packed[i * 4 + 1]
    scratchB[i * 2] = packed[i * 4 + 2]
    scratchB[i * 2 + 1] = packed[i * 4 + 3]
  }
  target.setTargets(scratchA, scratchB)
}

function seekCpuTargets (dt) {
  const arrays = engine.particleArrays
  if (!arrays || !spread || pull < 0.02) return
  // Use the existing CPU simulation/render path; only apply the same target
  // guidance that setMorph supplies on WebGPU.
  const follow = 1 - Math.exp(-pull * dt)
  for (let i = 0; i < arrays.count; i++) {
    const hx = packed[i * 4]
    const hy = packed[i * 4 + 1]
    const x = hx + (packed[i * 4 + 2] - hx) * railMix
    const y = hy + (packed[i * 4 + 3] - hy) * railMix + heroOffset
    arrays.pX[i] += (x - arrays.pX[i]) * follow
    arrays.pY[i] += (y - arrays.pY[i]) * follow
    arrays.pS[i] = railMix < 0.5 ? (flowerMode && flowerTypes ? flowerTypes[i] : heroTypes[i]) : railTypes[i]
    arrays.pVX[i] *= 1 - follow
    arrays.pVY[i] *= 1 - follow
  }
}

// --- 迴圈排程 ----------------------------------------------------------------
// 引擎在跑（或 railMix 還在追 progress）時每幀連續跑；其他情況（減速動畫、引擎
// 還沒好、fallback、閒置、頁面捲出畫面）畫面只會因為捲動 / resize / 版面變動而改變，
// 所以只在那些事件發生時跑一幀。停下前把 lastTime 歸零，恢復時的第一幀用最後一次
// 連續跑的 dt，跟一直在跑時的 dt 一樣。
function schedule () {
  if (rafPending || disposed) return
  rafPending = true
  raf = requestAnimationFrame(frame)
}

function step (dt) {
  if (!engine) return
  syncRunning(true)
  if (!running || failed.value) return
  motionTime += dt * 1000

  // 分批減量期間 slot 一直在重編，先放手讓力場自己跑，最後一批之後才重建目標點。
  if (shrinking) return
  const generation = engine.targetsGeneration ?? engine.config.count
  const size = engine.size.W + ':' + engine.size.H
  if (needsTargets || targetsGeneration !== generation || targetsSize !== size) {
    if (!buildingTargets) rebuildTargets().catch(useFallback)
    return
  }
  if (!colonies) return

  // Follow the sticky rail as its containing section releases above the footer.
  railOffset = Math.min(0, (rects.aside?.top ?? 60) - 60) * railMix
  const wantColony = colonyMode ? railMix > 0.35 : railMix > 0.65
  const wantFlower = !!galleryConfig && galleryMix > 0.5 && !wantColony
  if (wantColony !== colonyMode || wantFlower !== flowerMode) {
    colonyMode = wantColony
    flowerMode = wantFlower
    engine.setSeedPattern?.(look.rules.seedPattern)
    engine.setPreset(wantColony ? RAIL.preset : HERO.preset)
    engine.setShowGlow?.(wantColony || look.visual.showGlow)
    const glow = wantColony ? { glowSize: RAIL.glow.size, glowIntensity: RAIL.glow.intensity, glowSteepness: RAIL.glow.steepness } : look.glow
    engine.setGlowSize?.(glow.glowSize)
    engine.setGlowIntensity?.(glow.glowIntensity)
    engine.setGlowSteepness?.(glow.glowSteepness)
    const physics = look.physics
    engine.setForce?.(physics.forceFactor)
    engine.setFriction?.(physics.friction)
    engine.setRepel?.(physics.repel)
    engine.setRMax?.(physics.rMax)
    engine.setParticleOpacity?.(wantColony ? 0.9 : look.visual.heroOpacity)
    engine.setShapeTypes?.(wantFlower && flowerTypes ? flowerTypes : heroTypes, railTypes)
  }

  const pointSize = heroSize + (RAIL.pointSize - heroSize) * railMix
  if (Math.abs(pointSize - lastPointSize) > 0.005 || ((railMix === 0 || railMix === 1) && pointSize !== lastPointSize)) {
    engine.setPointSize(pointSize)
    lastPointSize = pointSize
  }
  const minR = look.physics.minR + (RAIL.minR - look.physics.minR) * railMix
  if (Math.abs(minR - lastMinR) > 0.1 || ((railMix === 0 || railMix === 1) && minR !== lastMinR)) {
    engine.setMinR?.(minR)
    lastMinR = minR
  }
  const scrollY = window.scrollY
  const heat = Math.min(1, Math.abs(scrollY - lastScrollY) / dt / SCROLL_REF)
  lastScrollY = scrollY
  const speedTarget = HERO.simSpeed + (RAIL.simSpeed - HERO.simSpeed) * railMix + (look.speed.max - look.speed.idle) * heat
  if (Number.isNaN(simSpeedNow)) simSpeedNow = speedTarget
  simSpeedNow += (speedTarget - simSpeedNow) * (speedTarget > simSpeedNow ? SPEED_ATTACK : SPEED_RELEASE)
  const simSpeed = simSpeedNow * opening.factor()
  if (simSpeed !== lastSimSpeed) {
    engine.setSimSpeed?.(simSpeed)
    lastSimSpeed = simSpeed
  }
  const nextPaletteStep = `${Math.round(galleryMix * 100)}:${Math.round(railMix * 100)}`
  if (nextPaletteStep !== paletteStep) {
    paletteStep = nextPaletteStep
    engine.setColors(lerpPaletteLinear(heroPalette, railPalette, railMix))
  }
  const stageGrip = HERO.grip + (90 - HERO.grip) * galleryMix
  lockNorm = Math.min(1, (stageGrip + (RAIL.grip - stageGrip) * railMix) / 90)
  // 首頁的電影感漂移：只在 hero 自由場作用，花形與側欄要對齊版面所以收到 0。
  const s = motionTime * 0.001
  const drift = (1 - 0.75 * lockNorm) * (1 - Math.max(galleryMix, railMix))
  const dx = (Math.sin(s * 0.021) * 42 + Math.sin(s * 0.006) * 26) * drift
  const dy = (Math.cos(s * 0.017) * 30 + Math.sin(s * 0.010) * 16) * drift
  const dz = 1 + 0.035 * Math.sin(s * 0.011) * drift
  const cameraZoom = (look.camera.zoom + (1 - look.camera.zoom) * Math.max(galleryMix, railMix)) * dz
  if (cameraZoom !== lastCameraZoom) {
    engine.setCameraZoom?.(cameraZoom)
    lastCameraZoom = cameraZoom
  }
  // Hero 以 720px 取景；捲動與相機縮放同步，讓同一粒子的螢幕位移連續。
  const centerShift = (engine.size.H / 2 - 360) * (1 - galleryMix) * (1 - railMix)
  const cameraY = (centerShift - heroOffset) / cameraZoom + dy
  if (dx !== lastCameraX || cameraY !== lastCameraY) {
    engine.setCameraOffset?.(dx, cameraY)
    lastCameraX = dx
    lastCameraY = cameraY
  }
  pushPointer()
  // 握力呼吸只乘在 hero 的握力上；花形與側欄需要穩定的握力。
  const breathe = HOLD_BREATHE_FLOOR + (1 - HOLD_BREATHE_FLOOR) * (0.5 - 0.5 * Math.cos(motionTime / HOLD_BREATHE_MS * Math.PI * 2))
  const heroPull = HERO.pull * breathe
  const heroGrip = HERO.grip * breathe
  const stagePull = heroPull + (24 - heroPull) * galleryMix
  const breathedGrip = heroGrip + (90 - heroGrip) * galleryMix
  pull = stagePull + (RAIL.pull - stagePull) * railMix
  grip = breathedGrip + (RAIL.grip - breathedGrip) * railMix
  // 回捲需先帶回同一份起點，收尾後再放手讓原範本自然演化。
  if (performance.now() < returnUntil) {
    pull = Math.max(pull, 8)
    grip = Math.max(grip, 36)
  }
  jitterTargets(motionTime)
  if (engine.setMorph) {
    if (pull !== lastMorphPull || grip !== lastMorphGrip || railMix !== lastMorphBlend) {
      engine.setMorph(pull, grip, railMix)
      lastMorphPull = pull
      lastMorphGrip = grip
      lastMorphBlend = railMix
    }
  } else {
    seekCpuTargets(dt)
  }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// 量一個視窗的幀時間中位數。分頁在背景或引擎暫停的視窗量到的不是引擎成本，回 null。
function measureFrameTime () {
  return new Promise((resolve) => {
    const deltas = []
    const t0 = performance.now()
    let last = 0
    let invalid = false
    const tick = (now) => {
      if (disposed || !engine) return resolve(null)
      if (document.hidden || !running) invalid = true
      if (last) deltas.push(now - last)
      last = now
      if (now - t0 < ADAPT_WINDOW_MS) {
        adaptRaf = requestAnimationFrame(tick)
        return
      }
      if (invalid) return resolve(null)
      // 可見又沒暫停、幀數卻少，那是「更慢」不是「無效」，改用平均幀時間。
      if (deltas.length < ADAPT_MIN_FRAMES) return resolve(ADAPT_WINDOW_MS / (deltas.length + 1))
      deltas.sort((a, b) => a - b)
      resolve(deltas[deltas.length >> 1])
    }
    adaptRaf = requestAnimationFrame(tick)
  })
}

async function adaptCount () {
  // 開場保留期間模擬速度是 0，量到的不是實際成本；等放開之後才開始暖機。
  while (opening.factor() < 1) {
    if (disposed || !engine) return
    await sleep(200)
  }
  await sleep(ADAPT_WARMUP_MS)
  let streak = 0
  for (let w = 0; w < ADAPT_MAX_WINDOWS; w++) {
    const p50 = await measureFrameTime()
    if (disposed || !engine) return
    if (p50 === null) continue
    streak = p50 > ADAPT_P50_MS ? streak + 1 : 0
    if (streak < ADAPT_FAIL_STREAK) continue
    const from = engine.config.count
    const target = Math.round(from / 2)
    shrinking = true
    engine.setMorph(0, 0, 0)
    try {
      for (let i = 1; i <= SHRINK_STEPS; i++) {
        await engine.shrinkTo(Math.round(from + (target - from) * i / SHRINK_STEPS))
        if (disposed || !engine) return
        if (i < SHRINK_STEPS) await sleep(SHRINK_STEP_MS)
      }
      countScale *= 0.5
    } finally {
      shrinking = false
      needsTargets = true
      lastMorphPull = NaN
      schedule()
    }
    return
  }
}

function onPointerMove (event) {
  // 第一次進來先對齊，不然 prev 還停在 (0,0)，會算出一整個螢幕的位移
  if (!pointerSeen) {
    pointerPrevX = event.clientX
    pointerPrevY = event.clientY
    pointerSeen = true
  }
  pointerX = event.clientX
  pointerY = event.clientY
}

function onTouch (event) {
  const p = event.touches[0]
  if (!p) return
  if (event.type === 'touchstart') pointerSeen = false
  onPointerMove(p)
  touchDown = true
}
function onTouchEnd (event) { touchDown = event.touches.length > 0 }

// 每幀最多推一次；游標停著也持續輕推，作法與量級同 Home/Field.vue。
function pushPointer () {
  if (!pointerOn || !pointerSeen || !rects.canvas || (touchMode && !touchDown)) return
  const speed = Math.hypot(pointerX - pointerPrevX, pointerY - pointerPrevY)
  pointerPrevX = pointerX
  pointerPrevY = pointerY
  // 螢幕座標 → 模擬座標：canvas 往左外擴 64px 且會跟著側欄位移，再反轉相機。
  const { W, H } = engine.size
  const zoom = engine.config?.cameraZoom ?? 1
  engine.disturb?.(
    (pointerX - rects.canvas.left - W / 2) / zoom + W / 2 + (engine.config?.cameraX ?? 0),
    (pointerY - rects.canvas.top - H / 2) / zoom + H / 2 + (engine.config?.cameraY ?? 0),
    POINTER_RADIUS, Math.min(POINTER_MAX_PUSH, POINTER_IDLE_PUSH + speed * POINTER_SPEED_GAIN),
  )
}

function frame (now = performance.now()) {
  rafPending = false
  if (disposed) return
  const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : lastDt
  lastTime = now
  lastDt = dt
  // 先讀後寫：所有 DOM 量測集中在這裡，樣式在幀尾一次寫入。
  measure()
  const progress = scrollProgress()
  railMix += (progress - railMix) * (reducedMotion.value ? 1 : 1 - Math.exp(-10 * dt))
  if (Math.abs(progress - railMix) < 0.0001) railMix = progress
  const galleryProgress = galleryConfig ? Math.max(0, Math.min(1, -(rects.hero?.top || 0) / (HERO.height - 120))) : 0
  galleryMix = galleryProgress * galleryProgress * (3 - 2 * galleryProgress)
  const galleryOffset = flowerBounds ? (rects.gallery?.top || 0) + flowerBounds.cy - flowerBounds.simulationCy : 0
  heroOffset = ((props.fixed ? rects.hero?.top || 0 : 0) * (1 - galleryMix) + galleryOffset * galleryMix) * (1 - railMix)
  const combinedProgress = Math.max(railMix, galleryMix)
  if (combinedProgress < previousProgress - 0.00001) returnUntil = now + 1400
  previousProgress = combinedProgress
  step(dt)
  writeCssVars()
  if (running || railMix !== progress || regionSettling) schedule()
  else lastTime = 0
}

function onResize () {
  cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(() => {
    if (!disposed) { updateArtwork(); applyParticleBudget() }
  })
}

function useFallback (error) {
  if (disposed) return
  failed.value = true
  ready.value = false
  engine?.pause(true)
  syncRunning()
  emit('unavailable')
  console.warn('[AgendaField] using page media fallback:', error)
}

async function init () {
  const canvas = canvasRef.value
  if (!canvas) return
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion.value) return
  await loadParticleKit()
  if (disposed) return
  look = plateFieldLook(props.fieldLook || fieldLookFromLocation().look)
  // 色盤、光暈與點數維持內頁設定；動態個性換成首頁那組（見 HERO_MOTION）。
  const motion = HERO_MOTION[look.id]
  if (motion) {
    look = {
      ...look,
      rules: { ...look.rules, ...motion.rules },
      physics: motion.physics,
      camera: { zoom: motion.zoom },
      hold: motion.hold,
      speed: motion.speed,
    }
  }
  species = look.rules.species
  HERO.preset = look.rules.preset
  HERO.simSpeed = look.speed.idle
  HERO.pointSize = look.visual.pointSize
  HERO.pull = look.hold.pull
  HERO.grip = look.hold.grip
  const palette = window.PLPalettes.PALETTES[look.palette]
  heroPalette = paletteToLinear(palette.particles)
  heroSize = HERO.pointSize
  const nextEngine = await window.makeEngine(canvas, {
    species,
    count: countFor(canvas, countOptions()),
    preset: HERO.preset,
    seedPattern: look.rules.seedPattern,
    palette: palette.particles,
    bgFade: 'rgba(10,10,12,0.18)',
    bg: '#0a0a0c',
    forceFactor: look.physics.forceFactor,
    friction: look.physics.friction,
    repel: look.physics.repel,
    minR: look.physics.minR,
    rMax: look.physics.rMax,
    simSpeed: 0,
    cameraZoom: look.camera.zoom,
    pointSize: heroSize,
    particleOpacity: look.visual.heroOpacity,
    showGlow: look.visual.showGlow,
    glowSize: look.glow.glowSize,
    glowIntensity: look.glow.glowIntensity,
    glowSteepness: look.glow.glowSteepness,
    cellSubdivisions: 2,
    maxDpr: maxDpr(),
  })
  if (disposed) {
    nextEngine.destroy()
    return
  }
  engine = nextEngine
  if (engine.backend !== 'webgpu') throw new Error('WebGPU initialization unavailable')
  backend.value = engine.backend
  engine.setCameraZoom?.(look.camera.zoom)
  applyParticleBudget()
  await rebuildTargets()
  if (disposed) return
  await new Promise(resolve => setTimeout(resolve, 200))
  if (disposed) return
  posterDrawn = true
  opening.ready()
  // 與父層移除載入圖片同一批更新，避免 GPU 與 poster 短暫重疊。
  ready.value = true
  emit('ready')

  if (import.meta.dev) {
    window.__agendaField = engine
    window.__agendaRailMotion = RAIL
    window.__agendaMotion = () => ({
      opening: opening.factor(),
      railMix, galleryMix, flowerMode, flowerBounds, pull, grip, targetsGeneration, buildingTargets,
      look: look.id, ready: ready.value, running, failed: failed.value, reducedMotion: reducedMotion.value, motionTime, rafPending,
      rail: railBounds(), colonyCount: COLONIES.length, mask: maskKey, fieldBounds,
    })
  }
  if (!reducedMotion.value) {
    // 首頁在握力鬆的自由場就有環境擾動；側欄菌落維持原本的擾動，花形握得緊所以不擾動。
    stopAmbient = window.PLAmbient.start(() => running && opening.factor() === 1 && (colonyMode || lockNorm < AMBIENT_OFF_AT) && !failed.value ? engine : null, { intensity: look.ambient })
  }
  // canvas 是 pointer-events-none，所以聽 window；listener 一律 passive，不跟捲動搶事件。
  pointerOn = window.matchMedia('(pointer: fine)').matches
  if (pointerOn) {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
  } else if (navigator.maxTouchPoints > 0) {
    pointerOn = true
    touchMode = true
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
  }
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('resize', onResize)
  syncRunning()
  if (engine.shrinkTo) adaptCount().catch(error => console.warn('[AgendaField] adaptCount:', error))
}

function onVisibility () {
  syncRunning()
}

onMounted(() => {
  updateArtwork()
  window.addEventListener('scroll', schedule, { passive: true })
  if (typeof ResizeObserver !== 'undefined') {
    // 版面高度變了（內容載入、字型載入）sticky 側欄的釋放點也會變，沒有捲動事件也要重算一幀。
    resizeObserver = new ResizeObserver(schedule)
    resizeObserver.observe(document.body)
  }
  schedule()
  trackIntro(init().catch(useFallback))
})
onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(raf)
  cancelAnimationFrame(resizeRaf)
  cancelAnimationFrame(adaptRaf)
  stopAmbient?.()
  resizeObserver?.disconnect()
  window.removeEventListener('scroll', schedule)
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('touchstart', onTouch)
  window.removeEventListener('touchmove', onTouch)
  window.removeEventListener('touchend', onTouchEnd)
  window.removeEventListener('touchcancel', onTouchEnd)
  if (import.meta.dev && window.__agendaField === engine) {
    delete window.__agendaField
    delete window.__agendaMotion
    delete window.__agendaRailMotion
    delete window.__agendaRailLook
  }
  engine?.destroy()
  engine = null
})

defineExpose({ backend })
</script>

<template>
  <div ref="wrapRef" aria-hidden="true" class="agenda-field pointer-events-none" :class="[wrapClass, { 'agenda-field--gallery': fixed && galleryConfig }]">
    <div
      v-if="failed || reducedMotion"
      class="agenda-hero-artwork absolute inset-x-0 top-0 h-[550px] overflow-hidden transition-opacity duration-700"
      :style="{ opacity: ready ? 0 : 'calc(1 - var(--rail-mix))' }"
    >
      <img
        :src="SOURCE" alt="" width="2422" height="1710" fetchpriority="high" class="absolute max-w-none mix-blend-screen"
        :style="{ width: `${artwork.width}px`, height: `${artwork.height}px`, left: `${artwork.left}px`, top: `${artwork.top}px` }"
      >
    </div>
    <canvas
      ref="canvasRef" class="agenda-guided-particles absolute inset-0 h-full w-full"
      :style="{ opacity: ready ? 1 : 0 }"
    />
  </div>
</template>

<style scoped>
/* 動畫數值由 script 每幀直接寫成 wrapper 的 CSS 變數，子元素用 var() 讀。 */
.agenda-field {
  --rail-mix: 0;
  --hero-offset: 0px;
  --rail-offset: 0px;
  --clip-bottom: 0px;
}

.agenda-field--fixed {
  transform: translateY(var(--rail-offset));
}

/* 與 PhotoWall 的 photo-board 同高，較矮視窗也不會讓花瓣越過模擬邊界繞回。
   CSS 在 resize 事件前完成尺寸更新，粒子數仍受原本預算上限限制。 */
.agenda-field--gallery {
  min-height: calc(clamp(640px, 50vw, 720px) + 48px);
}

.agenda-hero-artwork {
  transform: translateY(var(--hero-offset));
}

.agenda-guided-particles {
  clip-path: inset(0 0 var(--clip-bottom) 0);
}
</style>
