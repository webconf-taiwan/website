<script setup>
const { loadParticleKit } = useParticleKit()
// 首次進站 loading 等粒子場與起始構圖準備好才結束。
const { trackIntro, introDone } = useSiteIntro()
const { countFor, maxDpr } = useParticleBudget()
const { idle } = useParticleStage()
const { markActive, onTierChange, knobs, noteRespawn, suspendReadback } = useParticleQuality()
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
const STAGE = Symbol('agendaField')
const SOURCE = props.source
const HERO = {
  height: 550, preset: 'nebula', pull: 12, grip: 58,
  pointSize: 0.85, simSpeed: 0.65,
  flowMs: 1000 / 24, flowDistance: 18, rippleDistance: 6,
}
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
let unsubTier = null
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
let galleryPalette = null
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
let lastCameraY = NaN
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

// --- DOM：元素只查一次，矩形一幀只量一次 ------------------------------------
// 以前每幀在四個地方各 querySelector + getBoundingClientRect 一次，而前一幀剛改過
// canvas 的 transform / clip-path / mask 變數，每次量測都會強制 layout。
const dom = { hero: null, page: null, body: null, aside: null, gallery: null }
const rects = { hero: null, page: null, aside: null, body: null, gallery: null }

function lookupDom () {
  if (!dom.hero) dom.hero = document.querySelector('[data-plate-hero-desktop]')
  if (!dom.page) dom.page = canvasRef.value?.closest('[data-plate-page]') || null
  if (!dom.body) dom.body = document.querySelector('[data-plate-body]')
  if (!dom.aside && dom.body) dom.aside = dom.body.querySelector(':scope > aside')
  if (galleryConfig && !dom.gallery) dom.gallery = dom.page?.querySelector('[data-plate-gallery]')
}

function measure () {
  lookupDom()
  rects.hero = dom.hero?.getBoundingClientRect() || null
  rects.page = dom.page?.getBoundingClientRect() || null
  rects.aside = dom.aside?.getBoundingClientRect() || null
  rects.body = dom.body?.getBoundingClientRect() || null
  if (dom.gallery) rects.gallery = dom.gallery.getBoundingClientRect()
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
    const heroBottom = Math.max(0, Math.min(canvasHeight, rects.hero?.bottom || 0) - railOffset)
    const railTop = Math.max(heroBottom, (rects.body?.top ?? rects.hero?.bottom ?? 0) - railOffset, 0)
    const galleryTop = Math.max(0, (rects.gallery?.top || 0) - railOffset)
    const galleryBottom = Math.min(canvasHeight, (rects.gallery?.bottom || 0) - railOffset)
    const heroTextY = (rects.hero?.top || 0) + HERO.height / 2 + 16 - railOffset
    const layers = [
      // 新桌機 hero 自己使用首頁設定；此畫布保留原照片牆與正文的預算／動態。
      props.heroVisible
        ? `radial-gradient(ellipse 360px 210px at 50% ${heroTextY}px, transparent 65%, #000 100%) 0 0 / 100% ${heroBottom}px no-repeat`
        : `linear-gradient(transparent, transparent) 0 0 / 100% ${heroBottom}px no-repeat`,
      // 正文保留全寬畫布，避免左欄遮罩裁掉右側粒子；位移與變形仍由原本 morph 控制。
      `linear-gradient(#000, #000) 0 ${railTop}px / ${W}px ${Math.max(0, canvasHeight - railTop)}px no-repeat`,
    ]
    if (galleryConfig) layers.push(`linear-gradient(#000, #000) 0 ${galleryTop}px / 100% ${Math.max(0, galleryBottom - galleryTop)}px no-repeat`)
    const nextMask = layers.join(', ')
    if (nextMask !== maskKey) { el.style.mask = nextMask; maskKey = nextMask }
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
  const q = knobs('desktopField') || {}
  return {
    density: props.density * 0.032 * ((q.density ?? 0.0386) / 0.0386),
    max: Math.round(props.density * 26000 * ((q.countMax ?? 50000) / 50000)),
    min: Math.round(props.density * 6200 * ((q.countMin ?? 10000) / 10000)),
  }
}

function heroPointSize () {
  const q = knobs('desktopField') || {}
  return HERO.pointSize * ((q.pointSize ?? 0.8) / 0.8)
}

function applyParticleBudget () {
  heroSize = heroPointSize()
  if (!engine || !canvasRef.value) return
  const q = knobs('desktopField') || {}
  engine.setMaxDpr?.(Math.min(maxDpr(), q.dprCap ?? maxDpr()))
  const count = countFor(canvasRef.value, countOptions())
  const nextCount = engine.setTargets ? count : Math.min(count, 3600)
  if (nextCount !== engine.config.count) {
    engine.setMorph?.(0, 0, 0)
    engine.setCount(nextCount)
    noteRespawn()
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
  const p = Math.max(0, Math.min(1, (hero.height - 120 - boundary) / (hero.height - 180)))
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
    // 先用全寬生成構圖，再壓回 hero 高度；圓環／螺旋不再被短邊 550px 限縮。
    const heroSeed = buildSeedTargets(look.rules.seedPattern, N, species, W, W)
    const zoom = look.camera.zoom / 1.35
    for (let i = 0; i < N; i++) {
      heroSeed.tx[i] = W / 2 + (heroSeed.tx[i] - W / 2) * zoom
      heroSeed.ty[i] = HERO.height / 2 + (heroSeed.ty[i] - W / 2) * HERO.height / W * zoom
    }
    const heroSlots = buildSlotTargetsRaw(raw, N, heroSeed, species, W, { recolor: true })
    spread = heroSlots.shape
    heroTypes = heroSlots.shapeType
    if (galleryConfig && dom.gallery) {
      const board = dom.gallery.querySelector('.photo-board').getBoundingClientRect()
      const heading = dom.gallery.querySelector('.photo-heading').getBoundingClientRect()
      // 設計稿的花形跨越照片後方，頂端與標題同高；不隨視窗高度縮小。
      // 只放大構圖範圍，不增加粒子數量。
      const top = Math.max(24, heading.top - board.top)
      const radius = Math.min(board.width * 0.31, (board.height - top) * 0.52)
      const size = radius * 2 / galleryConfig.sim.cameraZoom
      const seed = buildSeedTargets(galleryConfig.behavior.seedPattern, N, species, size, size)
      const cx = board.left - canvasLeft + board.width * 0.76
      const cy = top + radius
      for (let i = 0; i < N; i++) {
        seed.tx[i] = cx + (seed.tx[i] - size / 2) * galleryConfig.sim.cameraZoom
        // Simulate within the viewport; the camera supplies the gallery's scroll offset.
        // Putting offscreen targets outside the toroidal world would wrap them over the heading.
        seed.ty[i] = H / 2 + (seed.ty[i] - size / 2) * galleryConfig.sim.cameraZoom
      }
      const slots = buildSlotTargetsRaw(raw, N, seed, species, W, { recolor: true })
      flower = slots.shape
      flowerTypes = slots.shapeType
      flowerBounds = { cx, cy, simulationCy: H / 2, radius, top }
      galleryPalette = paletteToLinear(window.PLPalettes.PALETTES[galleryConfig.look.palette].particles)
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
    ready.value = true
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
  markActive(STAGE, want)
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
    engine.setSeedPattern?.(wantFlower ? galleryConfig.behavior.seedPattern : look.rules.seedPattern)
    engine.setPreset(wantColony ? RAIL.preset : wantFlower ? galleryConfig.behavior.preset : HERO.preset)
    engine.setShowGlow?.(wantColony)
    const physics = wantFlower ? galleryConfig.physics : look.physics
    engine.setForce?.(physics.forceFactor)
    engine.setFriction?.(physics.friction)
    engine.setRepel?.(physics.repel)
    engine.setRMax?.(physics.rMax)
    engine.setParticleOpacity?.(wantColony ? 0.9 : wantFlower ? galleryConfig.visual.particleOpacity : look.visual.heroOpacity)
    engine.setShapeTypes?.(wantFlower && flowerTypes ? flowerTypes : heroTypes, railTypes)
  }

  const stageSize = heroSize + ((galleryConfig?.visual.pointSize ?? heroSize) - heroSize) * galleryMix
  const pointSize = stageSize + (RAIL.pointSize - stageSize) * railMix
  if (Math.abs(pointSize - lastPointSize) > 0.005 || ((railMix === 0 || railMix === 1) && pointSize !== lastPointSize)) {
    engine.setPointSize(pointSize)
    lastPointSize = pointSize
  }
  const minR = look.physics.minR + (RAIL.minR - look.physics.minR) * railMix
  if (Math.abs(minR - lastMinR) > 0.1 || ((railMix === 0 || railMix === 1) && minR !== lastMinR)) {
    engine.setMinR?.(minR)
    lastMinR = minR
  }
  const stageSpeed = HERO.simSpeed + ((galleryConfig?.sim.simSpeed ?? HERO.simSpeed) - HERO.simSpeed) * galleryMix
  const simSpeed = stageSpeed + (RAIL.simSpeed - stageSpeed) * railMix
  if (simSpeed !== lastSimSpeed) {
    engine.setSimSpeed?.(simSpeed)
    lastSimSpeed = simSpeed
  }
  const nextPaletteStep = `${Math.round(galleryMix * 100)}:${Math.round(railMix * 100)}`
  if (nextPaletteStep !== paletteStep) {
    paletteStep = nextPaletteStep
    const firstPalette = galleryPalette ? paletteToLinear(lerpPaletteLinear(heroPalette, galleryPalette, galleryMix)) : heroPalette
    engine.setColors(lerpPaletteLinear(firstPalette, railPalette, railMix))
  }
  if (heroOffset !== lastCameraY) {
    engine.setCameraOffset?.(0, -heroOffset)
    lastCameraY = heroOffset
  }
  const stagePull = HERO.pull + (24 - HERO.pull) * galleryMix
  const stageGrip = HERO.grip + (90 - HERO.grip) * galleryMix
  pull = stagePull + (RAIL.pull - stagePull) * railMix
  grip = stageGrip + (RAIL.grip - stageGrip) * railMix
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
  if (running || railMix !== progress) schedule()
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
  look = props.fieldLook || fieldLookFromLocation().look
  species = look.rules.species
  HERO.preset = look.rules.preset
  HERO.simSpeed = look.speed.idle
  HERO.pointSize = look.visual.pointSize
  HERO.pull = Math.max(look.hold.pull, 4)
  HERO.grip = Math.max(look.hold.grip, 18)
  const palette = window.PLPalettes.PALETTES[look.palette]
  heroPalette = paletteToLinear(palette.particles)
  const q = knobs('desktopField') || {}
  heroSize = heroPointSize()
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
    rMax: q.rMax || look.physics.rMax,
    simSpeed: HERO.simSpeed,
    cameraZoom: 1,
    pointSize: heroSize,
    particleOpacity: look.visual.heroOpacity,
    showGlow: false,
    glowSize: RAIL.glow.size,
    glowIntensity: RAIL.glow.intensity,
    glowSteepness: RAIL.glow.steepness,
    cellSubdivisions: q.cellSub ?? 2,
    maxDpr: Math.min(maxDpr(), q.dprCap ?? maxDpr()),
  })
  if (disposed) {
    nextEngine.destroy()
    return
  }
  engine = nextEngine
  if (engine.backend !== 'webgpu') throw new Error('WebGPU initialization unavailable')
  backend.value = engine.backend
  // 鏡頭縮放固定為 1；以前每幀重寫一次，現在只在這裡設一次。
  engine.setCameraZoom?.(1)
  applyParticleBudget()
  await rebuildTargets()
  if (disposed) return
  await new Promise(resolve => setTimeout(resolve, 200))
  if (disposed) return
  posterDrawn = true
  emit('ready')

  if (import.meta.dev) {
    window.__agendaField = engine
    window.__agendaRailMotion = RAIL
    window.__agendaMotion = () => ({
      railMix, galleryMix, flowerMode, flowerBounds, pull, grip, targetsGeneration, buildingTargets,
      look: look.id, ready: ready.value, running, failed: failed.value, reducedMotion: reducedMotion.value, motionTime, rafPending,
      rail: railBounds(), colonyCount: COLONIES.length, mask: maskKey,
    })
  }
  if (!reducedMotion.value) {
    stopAmbient = window.PLAmbient.start(() => running && colonyMode && !failed.value ? engine : null, { intensity: look.ambient })
  }
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('resize', onResize)
  unsubTier = onTierChange(applyParticleBudget)
  syncRunning()
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
  stopAmbient?.()
  resizeObserver?.disconnect()
  window.removeEventListener('scroll', schedule)
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('resize', onResize)
  unsubTier?.()
  markActive(STAGE, false)
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
  opacity: 0.72;
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
  min-height: clamp(640px, 50vw, 720px);
}

.agenda-hero-artwork {
  transform: translateY(var(--hero-offset));
}

.agenda-guided-particles {
  clip-path: inset(0 0 var(--clip-bottom) 0);
}
</style>
