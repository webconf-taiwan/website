<script setup>
import { plateFieldLook } from '~/utils/particleFieldLooks'
import { resolveHomeFieldLook, DEFAULT_HOME_FIELD_LOOK } from '~/utils/homeFieldLooks'

const { loadParticleKit } = useParticleKit()
// 首次進站 loading 等粒子場與起始構圖準備好才結束。
const { trackIntro, introDone } = useSiteIntro()
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

let look = resolveHomeFieldLook(DEFAULT_HOME_FIELD_LOOK)
const galleryConfig = props.galleryConfig
let species = look.rules.species
const SOURCE = props.source
// 自由場同 Home/Field.vue 的 hero 格：preset／握力／速度／點徑在 init() 換成 look 的值，
// 閃動同 SHIMMER_AMP／SHIMMER_PERIOD_MS。flowMs 只給贊助頁花形的呼吸用。
const HERO = {
  height: 550, preset: 'nebula', pull: 0, grip: 0,
  pointSize: 0.85, simSpeed: 0.3,
  shimmer: 3, shimmerMs: 1000, flowMs: 1000 / 24,
}
// 以下常數同 Home/Field.vue：握力呼吸、握力跟隨、相機漂移壓制、環境擾動門檻、滑鼠推擠。
const HOLD_BREATHE_MS = 7000
const HOLD_BREATHE_FLOOR = 0.18
const LOCK_ATTACK = 0.20
const LOCK_RELEASE = 0.012
const AMBIENT_OFF_AT = 0.35
const AMBIENT_ON_AT = 0.20
const POINTER_RADIUS = 320
const POINTER_MAX_PUSH = 24
const POINTER_SPEED_GAIN = 3.5
const POINTER_IDLE_PUSH = 2
// 模擬速度同 Home/Field.vue：待機速度照效果，捲動越快越接近 speed.max。
const SCROLL_REF = 2200
const SPEED_ATTACK = 0.14
const SPEED_RELEASE = 0.022
const SCROLL_CALM = 0.6
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
// 側欄菌落：數值同 Home/Field.vue 的 venue 格（VENUE_EFFECTS.cellular、VENUE_MIN_R 等）。
// 刻意留一份副本、不 import 首頁那份：兩邊各調各的。
const RAIL = {
  preset: 'cellular',
  minR: 30,
  rMax: 62,
  friction: 0.30,
  repel: 1.0,
  force: 1.0,
  opacity: 0.85,
  pull: 9,
  grip: 30,
  pointSize: 0.8,
  simSpeed: 0.3,
  shimmer: 7,
  shimmerMs: 260,
  glow: { size: 4.2, intensity: 0.021, steepness: 5 },
}
// 菌落排法同 Home/Field.vue 的 colonyTargets：VENUE_REGION 內隨機排 7 顆，每顆粒子的目標
// 就是它那顆菌落的中心，紋理交給 cellular 力矩陣自己長。
const VENUE_REGION = { x0: 0.03, x1: 0.33, y0: 0.04, y1: 0.96 }
const VENUE_GAP = 0.07
const VENUE_COLONIES = 7
const VENUE_RADIUS = [0.045, 0.065]

function colonyTargets (N, T, W, H) {
  const tx = new Float32Array(N)
  const ty = new Float32Array(N)
  const tt = new Uint8Array(N)
  // 首頁那張 canvas 就是視窗；這張左右各外擴 64px，寬螢幕的側欄又跟著 1440 版心置中，
  // 所以換算回同一塊螢幕區域（視窗 ≤ 1440 時與首頁逐 px 相同）。
  const pad = props.fixed ? 64 : 0
  const frame = Math.min(W - pad * 2, 1440)
  const left = pad + (W - pad * 2 - frame) / 2
  const m = Math.min(frame, H)
  const r = VENUE_REGION
  const minX = left + frame * r.x0; const spanX = frame * (r.x1 - r.x0)
  const minY = H * r.y0; const spanY = H * (r.y1 - r.y0)
  const col = []
  for (let c = 0; c < VENUE_COLONIES; c++) {
    const R = (VENUE_RADIUS[0] + Math.random() * (VENUE_RADIUS[1] - VENUE_RADIUS[0])) * m
    let x = 0; let y = 0
    for (let att = 0; att < 400; att++) {
      x = minX + R + Math.random() * Math.max(1, spanX - 2 * R)
      y = minY + R + Math.random() * Math.max(1, spanY - 2 * R)
      let ok = true
      for (const o of col) {
        const dx = x - o.x; const dy = y - o.y
        const need = o.R + R + VENUE_GAP * m
        if (dx * dx + dy * dy < need * need) { ok = false; break }
      }
      if (ok) break
    }
    col.push({ x, y, R })
  }
  for (let i = 0; i < N; i++) {
    const c = col[i % col.length]
    tx[i] = c.x
    ty[i] = c.y
    tt[i] = (Math.random() * T) | 0
  }
  return { tx, ty, tt }
}

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
let heroShape = null
let heroJitter = null
let heroTypes = null
let seededOnce = false
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
let pullNow = 0
let gripNow = 0
let scrollHeat = 0
let appliedForce = NaN
let lastOpacity = NaN
let ambientOn = false
let lastFlowCycle = -1
let lastMorphPull = NaN
let lastMorphGrip = NaN
let lastMorphBlend = NaN
let resizeRaf = 0
let heroPalette = null
let railPalette = null
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
      // 首頁的菌落沒有遮罩：側欄定住後上緣開到視窗頂，左右各放寬，只擋住右側內文。
      const top = Math.max(rects.aside.top - 60, rects.body?.top ?? rects.aside.top)
      moveBounds({
        left: rects.aside.left - canvasLeft - 24, top: top - railOffset,
        width: rects.aside.width + 72, height: rects.aside.bottom - top,
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

// 點數預算同 Home/Field.vue 的 PAGE_BUDGET。
function countOptions () {
  return { density: 0.0386, max: 50000, min: 10000 }
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
    railScale = 1
    const target = colonyTargets(N, species, W, H)
    const railSlots = buildSlotTargetsRaw(raw, N, target, species, W)
    colonies = railSlots.shape
    railTypes = railSlots.shapeType
    // 自由場的目標點同首頁：seedPattern 的開場構圖，顏色跟著物種走。
    // 第一次建的時候粒子還站在引擎剛 seed 出來的位置，那份本身就是構圖，直接沿用
    // 才不會一進場就換位；之後（resize、降點）場已經演化過，照首頁重畫一份再配對。
    if (seededOnce) {
      const seed = buildSeedTargets(look.rules.seedPattern, N, species, W, H)
      const heroSlots = buildSlotTargetsRaw(raw, N, seed, species, W)
      heroShape = heroSlots.shape
      heroTypes = heroSlots.shapeType
    } else {
      heroShape = railSlots.spread
      heroTypes = new Float32Array(N)
      for (let i = 0; i < N; i++) heroTypes[raw[i * 6 + 5]] = raw[i * 6 + 4] % species
      seededOnce = true
    }
    heroJitter = new Float32Array(heroShape)
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
      const canvasLeft = canvasRef.value?.getBoundingClientRect().left || 0
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
    heroPalette = paletteToLinear(window.PLPalettes.PALETTES[look.palette].particles)
    railPalette = heroPalette
    paletteStep = -1
    packed = new Float32Array(N * 4)
    for (let i = 0; i < N; i++) {
      packed[i * 4] = heroShape[i * 2]
      packed[i * 4 + 1] = heroShape[i * 2 + 1]
      packed[i * 4 + 2] = colonies[i * 2]
      packed[i * 4 + 3] = colonies[i * 2 + 1]
    }
    uploadTargets(current)
    current.setShapeTypes?.(flowerMode && flowerTypes ? flowerTypes : heroTypes, railTypes)
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
  // 自由場的閃動同首頁：握得住構圖（lockNorm > 0.05）時每秒換一組 3px 的目標點偏移。
  // 花形只有贊助頁有，維持原本的呼吸，進到花形時才逐格重算。
  const nextHeroCycle = Math.floor(now / HERO.shimmerMs)
  const flowCycle = flower && galleryMix > 0 ? Math.floor(now / HERO.flowMs) : -1
  const galleryTop = rects.gallery?.top || 0
  if (railMix < 1 && (nextHeroCycle !== heroCycle || flowCycle !== lastFlowCycle || lastGalleryTop !== galleryTop || lastGalleryMix !== galleryMix)) {
    if (nextHeroCycle !== heroCycle && lockNorm > 0.05) {
      for (let i = 0, n = heroShape.length; i < n; i += 2) {
        const angle = Math.random() * Math.PI * 2
        const radius = HERO.shimmer * (0.3 + 0.7 * Math.random())
        heroJitter[i] = heroShape[i] + Math.cos(angle) * radius
        heroJitter[i + 1] = heroShape[i + 1] + Math.sin(angle) * radius
      }
    }
    heroCycle = nextHeroCycle
    lastFlowCycle = flowCycle
    lastGalleryTop = galleryTop
    lastGalleryMix = galleryMix
    const breathing = 1 + Math.sin(now * 0.0006) * 0.035
    for (let i = 0, n = heroShape.length / 2; i < n; i++) {
      const hx = heroJitter[i * 2]
      const hy = heroJitter[i * 2 + 1]
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
  if (!arrays || !heroShape || pull < 0.02) return
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

// 環境擾動的開關同首頁（遲滯）：收攏到一定程度就關掉，tide 那層會把菌落打散。
function syncAmbient (lock) {
  if (ambientOn && lock > AMBIENT_OFF_AT) {
    stopAmbient?.()
    stopAmbient = null
    ambientOn = false
  } else if (!ambientOn && lock < AMBIENT_ON_AT) {
    stopAmbient = window.PLAmbient.start(() => running && !failed.value ? engine : null, { intensity: look.ambient })
    ambientOn = true
  }
}

function step (dt) {
  if (!engine) return
  syncRunning(true)
  if (!running || failed.value) {
    lastScrollY = window.scrollY
    return
  }
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
    const physics = wantColony
      ? { friction: RAIL.friction, repel: RAIL.repel, minR: RAIL.minR, rMax: RAIL.rMax }
      : look.physics
    engine.setMinR?.(physics.minR)
    engine.setFriction?.(physics.friction)
    engine.setRepel?.(physics.repel)
    engine.setRMax?.(physics.rMax)
    engine.setShapeTypes?.(wantFlower && flowerTypes ? flowerTypes : heroTypes, railTypes)
  }

  const pointSize = heroSize + (RAIL.pointSize - heroSize) * railMix
  if (Math.abs(pointSize - lastPointSize) > 0.005 || ((railMix === 0 || railMix === 1) && pointSize !== lastPointSize)) {
    engine.setPointSize(pointSize)
    lastPointSize = pointSize
  }
  const scrollY = window.scrollY
  const heat = Math.min(1, Math.abs(scrollY - lastScrollY) / dt / SCROLL_REF)
  lastScrollY = scrollY
  const speedTarget = HERO.simSpeed + (RAIL.simSpeed - HERO.simSpeed) * railMix + (look.speed.max - look.speed.idle) * heat
  if (Number.isNaN(simSpeedNow)) simSpeedNow = speedTarget
  simSpeedNow += (speedTarget - simSpeedNow) * (speedTarget > simSpeedNow ? SPEED_ATTACK : SPEED_RELEASE)
  if (simSpeedNow !== lastSimSpeed) {
    engine.setSimSpeed?.(simSpeedNow)
    lastSimSpeed = simSpeedNow
  }
  // 力場同首頁：自由場捲動時壓掉一部分讓遷移乾淨，菌落用自己的固定值，兩者照 railMix 插值。
  scrollHeat += (heat - scrollHeat) * (heat > scrollHeat ? SPEED_ATTACK : SPEED_RELEASE)
  const freeForce = look.physics.forceFactor * (1 - SCROLL_CALM * scrollHeat)
  const force = freeForce + (RAIL.force - freeForce) * railMix
  if (!(Math.abs(force - appliedForce) <= 0.01)) {
    appliedForce = force
    engine.setForce?.(force)
  }
  const opacity = look.visual.heroOpacity + (RAIL.opacity - look.visual.heroOpacity) * railMix
  if (!(Math.abs(opacity - lastOpacity) <= 0.004)) {
    lastOpacity = opacity
    engine.setParticleOpacity?.(opacity)
  }
  const nextPaletteStep = `${Math.round(galleryMix * 100)}:${Math.round(railMix * 100)}`
  if (nextPaletteStep !== paletteStep) {
    paletteStep = nextPaletteStep
    engine.setColors(lerpPaletteLinear(heroPalette, railPalette, railMix))
  }
  // 握力跟隨同首頁：收攏快、放手慢（回到自由場時還有約 1.4 秒把粒子送回構圖）。
  // 花形 → 側欄那段不拖：花形握得很緊，慢放會把整群粒子壓成幾個亮點。
  const flowerMix = galleryMix * (1 - railMix)
  const freeWeight = (1 - galleryMix) * (1 - railMix)
  const stagePull = HERO.pull + (24 - HERO.pull) * galleryMix
  const stageGrip = HERO.grip + (90 - HERO.grip) * galleryMix
  const pullTarget = stagePull + (RAIL.pull - stagePull) * railMix
  const gripTarget = stageGrip + (RAIL.grip - stageGrip) * railMix
  const release = freeWeight > 0.5 ? LOCK_RELEASE : LOCK_ATTACK
  pullNow += (pullTarget - pullNow) * (pullTarget > pullNow ? LOCK_ATTACK : release)
  gripNow += (gripTarget - gripNow) * (gripTarget > gripNow ? LOCK_ATTACK : release)
  if (pullNow < 0.02) { pullNow = 0; gripNow = 0 }
  lockNorm = Math.min(1, gripNow / 90)
  // 菌落那格在首頁一律是關著環境擾動進來的（前一格人像握力 82），這裡比照。
  syncAmbient(Math.max(lockNorm, railMix))
  // 首頁的電影感漂移：自由場與側欄菌落都照握力打折，花形要對齊照片所以收到 0。
  const s = motionTime * 0.001
  const drift = (1 - 0.75 * lockNorm) * (1 - flowerMix)
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
  // 握力呼吸只吃自由場的權重，乘在最後（同首頁）；花形與側欄需要穩定的握力。
  const breathe = HOLD_BREATHE_FLOOR + (1 - HOLD_BREATHE_FLOOR) * (0.5 - 0.5 * Math.cos(motionTime / HOLD_BREATHE_MS * Math.PI * 2))
  const hold = (1 - freeWeight) + freeWeight * breathe
  pull = pullNow * hold
  grip = gripNow * hold
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
  // 整組直接用首頁的 look（力矩陣、物理、色盤、光暈、點徑、透明度、相機、速度、握力）。
  look = resolveHomeFieldLook(plateFieldLook(props.fieldLook || fieldLookFromLocation().look).id)
  species = look.rules.species
  HERO.preset = look.rules.preset
  HERO.simSpeed = look.speed.idle
  HERO.pointSize = look.visual.pointSize
  HERO.pull = look.hold.pull
  HERO.grip = look.hold.grip
  const palette = window.PLPalettes.PALETTES[look.palette]
  heroPalette = paletteToLinear(palette.particles)
  railPalette = heroPalette
  heroSize = HERO.pointSize
  const nextEngine = await window.makeEngine(canvas, {
    species,
    count: countFor(canvas, countOptions()),
    preset: HERO.preset,
    seedPattern: look.rules.seedPattern,
    palette: palette.particles,
    bgFade: palette.bgFade,
    bg: '#0a0a0c',
    forceFactor: look.physics.forceFactor,
    friction: look.physics.friction,
    repel: look.physics.repel,
    minR: look.physics.minR,
    rMax: look.physics.rMax,
    simSpeed: look.speed.idle,
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
  // 與父層移除載入圖片同一批更新，避免 GPU 與 poster 短暫重疊。
  ready.value = true
  emit('ready')

  if (import.meta.dev) {
    window.__agendaField = engine
    window.__agendaRailMotion = RAIL
    window.__agendaMotion = () => ({
      railMix, galleryMix, flowerMode, flowerBounds, pull, grip, lockNorm, ambientOn, force: appliedForce, simSpeed: simSpeedNow, targetsGeneration, buildingTargets,
      look: look.id, ready: ready.value, running, failed: failed.value, reducedMotion: reducedMotion.value, motionTime, rafPending,
      mask: maskKey, fieldBounds,
    })
  }
  // 環境擾動同首頁：開場就開，之後由 syncAmbient 依握力開關。
  ambientOn = false
  syncAmbient(0)
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
