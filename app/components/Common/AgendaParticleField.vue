<script setup>
const { loadParticleKit, registerNebula } = useParticleKit()
const { countFor, maxDpr } = useParticleBudget()
const { idle } = useParticleStage()
const { markActive, onTierChange, knobs, noteRespawn, suspendReadback } = useParticleQuality()
const { buildSlotTargetsRaw, paletteToLinear, lerpPaletteLinear } = useParticleMorph()

const props = defineProps({
  fixed: {
    type: Boolean,
    default: false,
  },
  // 取樣來源圖；換頁面時換一張即可，取樣參數與 rail 聚落設定共用
  source: {
    type: String,
    default: '/figma/agenda/mobile-particle-source.png',
  },
})

const wrapRef = ref(null)
const canvasRef = ref(null)
const backend = ref('')
const ready = ref(false)
// 原圖淡出（700ms）結束後改成 visibility:hidden：元素留在 DOM 裡，之後 ready 再變
// false 時仍能從 0 淡入到 1，但不再佔一個要合成的圖層。
const artworkHidden = ref(false)
const artwork = ref({ width: 1440, height: 1440 * 1710 / 2422, left: 64, top: (550 - 1440 * 1710 / 2422) / 2 })
const wrapClass = computed(() => props.fixed
  ? 'agenda-field--fixed fixed -inset-x-16 top-0 z-0 h-dvh overflow-hidden mix-blend-screen'
  : 'absolute inset-0 h-full w-full overflow-hidden'
)

const look = resolveFieldLook(3)
const STAGE = 'agendaField'
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
let reducedMotion = false
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
let failed = false
let revealTimer = 0
let artworkTimer = 0
let heroSize = HERO.pointSize
let railScale = 1
let heroOffset = 0
let railOffset = 0
let canvasHeight = 550
let resizeObserver = null
let sourceImage = null
const specCache = new Map()

// --- DOM：元素只查一次，矩形一幀只量一次 ------------------------------------
// 以前每幀在四個地方各 querySelector + getBoundingClientRect 一次，而前一幀剛改過
// canvas 的 transform / clip-path / mask 變數，每次量測都會強制 layout。
const dom = { hero: null, page: null, body: null, aside: null }
const rects = { hero: null, page: null, aside: null }

function lookupDom () {
  if (!dom.hero) dom.hero = document.querySelector('[data-plate-hero-desktop]')
  if (!dom.page) dom.page = canvasRef.value?.closest('[data-plate-page]') || null
  if (!dom.body) dom.body = document.querySelector('[data-plate-body]')
  if (!dom.aside && dom.body) dom.aside = dom.body.querySelector(':scope > aside')
}

function measure () {
  lookupDom()
  rects.hero = dom.hero?.getBoundingClientRect() || null
  rects.page = dom.page?.getBoundingClientRect() || null
  rects.aside = dom.aside?.getBoundingClientRect() || null
}

// --- CSS 變數：動畫數值直接寫在 wrapper 上，Vue 不參與動畫迴圈 ----------------
// 只有數值真的變了才寫；靜止時不會讓 mask / clip-path 重新光柵化。
const cssVars = { railMix: NaN, heroOffset: NaN, railOffset: NaN, clipBottom: NaN }

function writeCssVars () {
  const el = wrapRef.value
  if (!el) return
  const clipBottom = Math.max(0, canvasHeight - HERO.height - heroOffset) * (1 - railMix)
  if (cssVars.railMix !== railMix) {
    cssVars.railMix = railMix
    el.style.setProperty('--rail-mix', String(railMix))
  }
  if (cssVars.heroOffset !== heroOffset) {
    cssVars.heroOffset = heroOffset
    el.style.setProperty('--hero-offset', `${heroOffset}px`)
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
    density: 0.032 * ((q.density ?? 0.0386) / 0.0386),
    max: Math.round(26000 * ((q.countMax ?? 50000) / 50000)),
    min: Math.round(6200 * ((q.countMin ?? 10000) / 10000)),
  }
}

function heroPointSize () {
  const q = knobs('desktopField') || {}
  return HERO.pointSize * ((q.pointSize ?? 0.8) / 0.8)
}

function applyParticleBudget () {
  heroSize = heroPointSize()
  if (!engine || !canvasRef.value) return
  const count = countFor(canvasRef.value, countOptions())
  const nextCount = engine.setTargets ? count : Math.min(count, 3600)
  if (nextCount !== engine.config.count) {
    ready.value = false
    clearTimeout(revealTimer)
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
  const p = Math.max(0, Math.min(1, (hero.height - 120 - hero.bottom) / (hero.height - 180)))
  return p * p * (3 - 2 * p)
}

// 同一張圖、同一組 crop / count 的取樣結果是確定性的（固定 seed），resize 回到
// 同一個寬度時直接重用；圖片本身也只載入、解碼一次。
async function prepareSpec (count, W, art) {
  const key = [count, W, art.width, art.height, art.left, art.top].join(':')
  const hit = specCache.get(key)
  if (hit) return hit
  // 舊版快取的 particle-image.js 沒有 loadImage：退回讓 prepare 自己載圖，只是少了重用。
  if (!sourceImage && window.PLImage.loadImage) sourceImage = await window.PLImage.loadImage(SOURCE)
  const spec = await window.PLImage.prepare(SOURCE, {
    count, colors: look.rules.species, seed: 2026,
    sampleEdge: 1440, lumaBias: 0.75, minLuma: 0.09, fit: 1,
    name: 'agenda-desktop-composition',
    image: sourceImage || undefined,
    crop: { x: -art.left / art.width, y: -art.top / art.height, width: W / art.width, height: HERO.height / art.height },
  })
  if (specCache.size >= 4) specCache.delete(specCache.keys().next().value)
  specCache.set(key, spec)
  return spec
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
    const art = artwork.value
    suspendReadback()
    const spec = await prepareSpec(current.config.count, W, art)
    if (disposed || engine !== current) return
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
    const target = buildColonyTargets(N, look.rules.species, W, H, {
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
    const railSlots = buildSlotTargetsRaw(raw, N, target, look.rules.species, W)
    colonies = railSlots.shape
    railTypes = railSlots.shapeType
    const imageTarget = { tx: new Float32Array(N), ty: new Float32Array(N), tt: spec.types }
    for (let i = 0; i < N; i++) {
      imageTarget.tx[i] = spec.px[i] * W
      imageTarget.ty[i] = spec.py[i] * HERO.height
    }
    const heroSlots = buildSlotTargetsRaw(raw, N, imageTarget, look.rules.species, W, { recolor: true })
    spread = heroSlots.shape
    heroTypes = heroSlots.shapeType
    // Nearby particles share a flow direction so ribbons move together,
    // while their image-derived resting positions preserve the composition.
    heroFlow = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const dx = spread[i * 2] - W / 2
      const dy = spread[i * 2 + 1] - HERO.height / 2
      const distance = Math.max(1, Math.hypot(dx, dy))
      heroFlow[i * 3] = dx / distance
      heroFlow[i * 3 + 1] = dy / distance
      heroFlow[i * 3 + 2] = Math.atan2(dy, dx) * 2 + distance * 0.008
    }
    heroPalette = paletteToLinear(spec.palette)
    paletteStep = -1
    packed = new Float32Array(N * 4)
    for (let i = 0; i < N; i++) {
      packed[i * 4] = spread[i * 2]
      packed[i * 4 + 1] = spread[i * 2 + 1]
      packed[i * 4 + 2] = colonies[i * 2]
      packed[i * 4 + 3] = colonies[i * 2 + 1]
    }
    uploadTargets(current)
    current.setShapeTypes?.(heroTypes, railTypes)
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
    clearTimeout(revealTimer)
    revealTimer = window.setTimeout(() => { if (!disposed) ready.value = true }, 900)
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
  const hero = rects.hero
  const heroVisible = hero && hero.bottom > 60 && hero.top < window.innerHeight
  // Reading the Hero without moving the pointer must not freeze its animation.
  const want = visible && !document.hidden && (!idle.value || heroVisible) && !reducedMotion && !failed
  if (want === running) return
  running = want
  engine?.pause(!want)
  markActive(STAGE, want)
  schedule()
}
watch(idle, () => syncRunning())

function jitterTargets (now) {
  const cycle = reducedMotion ? 0 : Math.floor(now / RAIL.shimmerMs)
  let changed = false
  // blend 為 0 時 shader 的 mix(hero, rail, 0) 完全不碰 rail 半邊，這時不必算、也不必上傳。
  if (railMix > 0 && cycle !== shimmerCycle) {
    shimmerCycle = cycle
    const amplitude = reducedMotion ? 0 : RAIL.shimmer * railScale
    for (let i = 0, n = colonies.length / 2; i < n; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = amplitude * (0.3 + 0.7 * Math.random())
      packed[i * 4 + 2] = colonies[i * 2] + Math.cos(angle) * radius
      packed[i * 4 + 3] = colonies[i * 2 + 1] + Math.sin(angle) * radius
    }
    changed = true
  }
  const nextHeroCycle = Math.floor(now / HERO.flowMs)
  if (railMix < 1 && nextHeroCycle !== heroCycle) {
    heroCycle = nextHeroCycle
    const t = now * 0.001
    for (let i = 0, n = spread.length / 2; i < n; i++) {
      const nx = heroFlow[i * 3]
      const ny = heroFlow[i * 3 + 1]
      const phase = heroFlow[i * 3 + 2]
      const flow = Math.sin(t * 0.85 + phase) * HERO.flowDistance
      const ripple = Math.sin(t * 1.1 + phase * 1.7) * HERO.rippleDistance
      const grain = Math.sin(t * 2.4 + i * 2.399963) * 2.5
      packed[i * 4] = spread[i * 2] - ny * flow + nx * (ripple + grain)
      packed[i * 4 + 1] = spread[i * 2 + 1] + nx * flow + ny * (ripple + grain)
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
    arrays.pS[i] = railMix < 0.5 ? heroTypes[i] : railTypes[i]
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
  if (!running || failed) return
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
  if (wantColony !== colonyMode) {
    colonyMode = wantColony
    engine.setPreset(wantColony ? RAIL.preset : HERO.preset)
    engine.setShowGlow?.(wantColony)
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
  const simSpeed = HERO.simSpeed + (RAIL.simSpeed - HERO.simSpeed) * railMix
  if (simSpeed !== lastSimSpeed) {
    engine.setSimSpeed?.(simSpeed)
    lastSimSpeed = simSpeed
  }
  const nextPaletteStep = Math.round(railMix * 100)
  if (nextPaletteStep !== paletteStep) {
    paletteStep = nextPaletteStep
    engine.setColors(lerpPaletteLinear(heroPalette, railPalette, nextPaletteStep / 100))
  }
  if (heroOffset !== lastCameraY) {
    engine.setCameraOffset?.(0, -heroOffset)
    lastCameraY = heroOffset
  }
  pull = HERO.pull + (RAIL.pull - HERO.pull) * railMix
  grip = HERO.grip + (RAIL.grip - HERO.grip) * railMix
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
  railMix += (progress - railMix) * (reducedMotion ? 1 : 1 - Math.exp(-10 * dt))
  if (Math.abs(progress - railMix) < 0.0001) railMix = progress
  heroOffset = (props.fixed ? rects.hero?.top || 0 : 0) * (1 - railMix)
  step(dt)
  writeCssVars()
  if (running || railMix !== progress) schedule()
  else lastTime = 0
}

function onResize () {
  ready.value = false
  clearTimeout(revealTimer)
  cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(() => {
    if (!disposed) { updateArtwork(); applyParticleBudget() }
  })
}

function useFallback (error) {
  if (disposed) return
  failed = true
  ready.value = false
  clearTimeout(revealTimer)
  engine?.pause(true)
  markActive(STAGE, false)
  console.warn('[AgendaField] using source image:', error)
}

async function init () {
  const canvas = canvasRef.value
  if (!canvas) return
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion) return
  await loadParticleKit()
  if (disposed) return
  registerNebula()
  const palette = window.PLPalettes.PALETTES[look.palette]
  heroPalette = paletteToLinear(palette.particles)
  const q = knobs('desktopField') || {}
  heroSize = heroPointSize()
  const nextEngine = await window.makeEngine(canvas, {
    species: look.rules.species,
    count: countFor(canvas, countOptions()),
    preset: HERO.preset,
    seedPattern: look.rules.seedPattern,
    palette: palette.particles,
    bgFade: palette.bgFade,
    forceFactor: look.physics.forceFactor,
    friction: look.physics.friction,
    repel: look.physics.repel,
    minR: look.physics.minR,
    rMax: q.rMax || look.physics.rMax,
    simSpeed: HERO.simSpeed,
    cameraZoom: 1,
    pointSize: heroSize,
    particleOpacity: 0.9,
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
  backend.value = engine.backend
  // 鏡頭縮放固定為 1；以前每幀重寫一次，現在只在這裡設一次。
  engine.setCameraZoom?.(1)
  applyParticleBudget()

  if (import.meta.dev) {
    window.__agendaField = engine
    window.__agendaRailMotion = RAIL
    window.__agendaMotion = () => ({
      railMix, pull, grip, targetsGeneration, buildingTargets,
      ready: ready.value, running, failed, reducedMotion, motionTime, rafPending,
      rail: railBounds(), colonyCount: COLONIES.length, specCache: specCache.size,
    })
  }
  if (!reducedMotion) {
    stopAmbient = window.PLAmbient.start(() => colonyMode && !failed ? engine : null, { intensity: look.ambient })
  }
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('resize', onResize)
  unsubTier = onTierChange(applyParticleBudget)
  syncRunning()
}

function onVisibility () {
  syncRunning()
}

watch(ready, (v) => {
  clearTimeout(artworkTimer)
  if (v) artworkTimer = window.setTimeout(() => { if (!disposed) artworkHidden.value = true }, 700)
  else artworkHidden.value = false
})

onMounted(() => {
  updateArtwork()
  window.addEventListener('scroll', schedule, { passive: true })
  if (typeof ResizeObserver !== 'undefined') {
    // 版面高度變了（內容載入、字型載入）sticky 側欄的釋放點也會變，沒有捲動事件也要重算一幀。
    resizeObserver = new ResizeObserver(schedule)
    resizeObserver.observe(document.body)
  }
  schedule()
  init().catch(useFallback)
})
onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(raf)
  cancelAnimationFrame(resizeRaf)
  clearTimeout(revealTimer)
  clearTimeout(artworkTimer)
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
  <div ref="wrapRef" aria-hidden="true" class="agenda-field pointer-events-none" :class="wrapClass">
    <div
      class="agenda-hero-artwork absolute inset-x-0 top-0 h-[550px] overflow-hidden transition-opacity duration-700"
      :class="{ invisible: artworkHidden }"
      :style="{ opacity: ready ? 0 : 'calc(1 - var(--rail-mix))' }"
    >
      <img
        :src="SOURCE" alt="" width="2422" height="1710" fetchpriority="high" class="absolute max-w-none"
        :style="{ width: `${artwork.width}px`, height: `${artwork.height}px`, left: `${artwork.left}px`, top: `${artwork.top}px` }"
      >
    </div>
    <canvas
      ref="canvasRef" class="agenda-guided-particles absolute inset-0 h-full w-full"
      :class="ready ? 'transition-opacity duration-700' : ''"
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

.agenda-hero-artwork {
  transform: translateY(var(--hero-offset));
  mask-image: radial-gradient(ellipse 230px 150px at 50% 268px, transparent 65%, #000 100%);
}

.agenda-guided-particles {
  clip-path: inset(0 0 var(--clip-bottom) 0);
  mask-image: radial-gradient(ellipse 230px 150px at 50% calc(268px + var(--hero-offset)), rgb(0 0 0 / var(--rail-mix)) 65%, #000 100%);
}
</style>
