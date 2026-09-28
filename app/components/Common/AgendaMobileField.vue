<script setup>
const { loadParticleKit, registerNebula } = useParticleKit()
// 首次進站 loading 要等這個粒子場 init 完（script、WebGPU 引擎、點雲取樣）才收，見 useSiteIntro
const { trackIntro } = useSiteIntro()
const { buildSlotTargets } = useParticleMorph()
const { knobs, markActive, onTierChange, noteRespawn, suspendReadback, cpuFallback } = useParticleQuality()

const props = defineProps({
  // 取樣來源圖；桌機場（AgendaParticleField）用同一張
  source: {
    type: String,
    default: '/figma/agenda/mobile-particle-source.webp',
  },
})
const SOURCE = props.source
// Figma's 1264 x 640 image box, offset -476px in the 360px frame.
const ART = { width: 1264 * 1.0914, height: 640 * 1.5412, x: -476 - 1264 * 0.0457, y: -640 * 0.3818 }
const STAGE = 'mobileField'
const canvasRef = ref(null)
const rootRef = ref(null)
const ready = ref(false)
let engine = null
let observer = null
let resizeObserver = null
let budgetDirty = false
let stopTier = null
let raf = 0
let disposed = false
let failed = false
let visible = true
let running = false
let reduced = false
let building = false
let generation = -1
let sizeKey = ''
let shape = null
let types = null
let jitter = null
let flowBasis = null
let packed = null
let cycle = -1
let lastTime = 0
let elapsed = 0
let revealTimer = 0

function particleBudget() {
  const q = knobs('mobileField')
  const width = canvasRef.value?.clientWidth || 320
  // Hero 高度固定 550px。依寬度分段內插，保留窄螢幕輪廓，也限制平板總量。
  // 只調整這兩頁，不改首頁共用的 quality profile。
  const baseline = width <= 390
    ? 8000 + (width - 320) / 70 * 1000
    : width <= 768
      ? 9000 + (width - 390) / 378 * 2000
      : 11000 + (width - 768) / 256 * 1000
  const baseCount = Math.max(8000, Math.min(12000, Math.round(baseline / 250) * 250))
  const cpu = cpuFallback.value || !!engine?.particleArrays
  const count = Math.min(cpu ? 2800 : 12000, Math.round(baseCount * q.countScale / 0.7))
  return {
    count,
    // 以點面積補償減量後的亮度，限制放大幅度以保留細點質感。
    // CPU 後端是光暈 sprite，維持原尺寸，避免放大成光斑。
    pointSize: cpu ? 0.75 : 0.75 * Math.min(1.5, Math.sqrt(12000 / count)),
    maxDpr: Math.min(1.25, q.dprCap),
  }
}

function applyParticleBudget() {
  budgetDirty = false
  if (!engine) return
  const budget = particleBudget()
  engine.setMaxDpr?.(budget.maxDpr)
  if (engine.config.pointSize !== budget.pointSize) engine.setPointSize(budget.pointSize)
  if (engine.config.count !== budget.count) {
    ready.value = false
    clearTimeout(revealTimer)
    engine.setCount(budget.count)
    noteRespawn()
  }
}

function uploadTargets() {
  if (packed) engine.setTargetsPacked(packed)
  else engine.setTargets?.(jitter, jitter)
}

function syncRunning() {
  // Reading a visible Hero on a touch screen produces no activity events.
  const next = visible && !document.hidden && !reduced && !failed
  if (running === next) return
  running = next
  engine?.pause(!next)
  markActive(STAGE, next)
  lastTime = 0
}

function useFallback(error) {
  if (disposed) return
  failed = true
  ready.value = false
  clearTimeout(revealTimer)
  syncRunning()
  console.warn('[AgendaMobileField] using source image:', error)
}

async function rebuild() {
  if (!engine || building) return
  building = true
  ready.value = false
  clearTimeout(revealTimer)
  const current = engine
  const { W, H } = current.size
  const gen = current.targetsGeneration ?? current.config.count
  try {
    const x = ART.x + (W - 360) / 2
    const spec = await window.PLImage.prepare(SOURCE, {
      count: current.config.count, colors: 7, sampleEdge: 900,
      lumaBias: 0.75, minLuma: 0.09, fit: 1,
      name: 'agenda-mobile-composition',
      crop: { x: -x / ART.width, y: -ART.y / ART.height, width: W / ART.width, height: H / ART.height },
    })
    if (disposed || current !== engine) return
    suspendReadback()
    const snap = await current.readParticles()
    if (disposed || current !== engine) return
    if (gen !== (current.targetsGeneration ?? current.config.count) || W !== current.size.W || H !== current.size.H) return
    snap.forEach((p, i) => { if (p.slot == null) p.slot = i })
    const target = { tx: new Float32Array(snap.length), ty: new Float32Array(snap.length), tt: spec.types }
    for (let i = 0; i < snap.length; i++) {
      target.tx[i] = spec.px[i] * W
      target.ty[i] = spec.py[i] * H
    }
    const slots = buildSlotTargets(snap, target, 7, W, { recolor: true })
    shape = slots.shape
    types = slots.shapeType
    jitter = new Float32Array(shape)
    flowBasis = new Float32Array(snap.length * 3)
    packed = current.setTargetsPacked ? new Float32Array(snap.length * 4) : null
    for (let i = 0; i < snap.length; i++) {
      const x = shape[i * 2]
      const y = shape[i * 2 + 1]
      const dx = x - W / 2
      const dy = y - H / 2
      const radius = Math.max(1, Math.hypot(dx, dy))
      flowBasis[i * 3] = dx / radius
      flowBasis[i * 3 + 1] = dy / radius
      flowBasis[i * 3 + 2] = Math.atan2(dy, dx) * 2 + radius * 0.008
      if (packed) {
        packed[i * 4] = packed[i * 4 + 2] = x
        packed[i * 4 + 1] = packed[i * 4 + 3] = y
      }
    }
    current.setColors(spec.palette)
    uploadTargets()
    current.setShapeTypes?.(types, types)
    current.setMorph?.(18, 58, 1)
    if (current.particleArrays) {
      const p = current.particleArrays
      for (let i = 0; i < p.count; i++) { p.pX[i] = shape[i * 2]; p.pY[i] = shape[i * 2 + 1]; p.pS[i] = types[i] }
    }
    generation = gen
    sizeKey = `${W}:${H}`
    cycle = -1
    clearTimeout(revealTimer)
    revealTimer = window.setTimeout(() => { if (!disposed) ready.value = true }, 600)
  } finally {
    building = false
  }
}

function frame(now) {
  raf = requestAnimationFrame(frame)
  if (!engine || failed) return
  syncRunning()
  if (!running) return
  if (budgetDirty) applyParticleBudget()
  const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0
  lastTime = now
  elapsed += dt
  const stale = generation !== (engine.targetsGeneration ?? engine.config.count) || sizeKey !== `${engine.size.W}:${engine.size.H}`
  if (stale) {
    if (!building) rebuild().catch(useFallback)
    return
  }
  const nextCycle = Math.floor(elapsed * 24)
  if (nextCycle !== cycle) {
    cycle = nextCycle
    for (let i = 0; i < flowBasis.length / 3; i++) {
      const dx = flowBasis[i * 3]
      const dy = flowBasis[i * 3 + 1]
      const phase = flowBasis[i * 3 + 2]
      const flow = Math.sin(elapsed * 0.85 + phase) * 12
      const ripple = Math.sin(elapsed * 1.1 + phase * 1.7) * 4
      const x = shape[i * 2] - dy * flow + dx * ripple
      const y = shape[i * 2 + 1] + dx * flow + dy * ripple
      jitter[i * 2] = x
      jitter[i * 2 + 1] = y
      if (packed) {
        packed[i * 4] = packed[i * 4 + 2] = x
        packed[i * 4 + 1] = packed[i * 4 + 3] = y
      }
    }
    uploadTargets()
  }
  if (engine.particleArrays) {
    const p = engine.particleArrays
    const follow = 1 - Math.exp(-16 * dt)
    for (let i = 0; i < p.count; i++) {
      p.pX[i] += (jitter[i * 2] - p.pX[i]) * follow
      p.pY[i] += (jitter[i * 2 + 1] - p.pY[i]) * follow
      p.pVX[i] *= 0.25; p.pVY[i] *= 0.25
    }
  }
}

async function init() {
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return
  await loadParticleKit()
  if (disposed) return
  registerNebula()
  const q = knobs('mobileField')
  const budget = particleBudget()
  const next = await window.makeEngine(canvasRef.value, {
    species: 7, count: budget.count, preset: 'nebula', seedPattern: 'orbitalBelts',
    palette: ['#E8F7FF', '#7CC8F2', '#2D6ACF', '#A7DCEC', '#FFFFFF', '#7CC8F2', '#2446CC'],
    bgFade: '#0a0a0c', forceFactor: 0.35, friction: 0.85, repel: 0.3,
    minR: 1, rMax: 22, simSpeed: 0.32, cameraZoom: 1,
    pointSize: budget.pointSize, particleOpacity: 0.9,
    showGlow: true, glowSize: 3, glowIntensity: 0.01, glowSteepness: 5,
    maxDpr: budget.maxDpr, cellSubdivisions: q.cellSub,
  })
  if (disposed) { next.destroy(); return }
  engine = next
  applyParticleBudget()
  observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio > 0; syncRunning() })
  observer.observe(rootRef.value)
  resizeObserver = new ResizeObserver(() => { budgetDirty = true })
  resizeObserver.observe(canvasRef.value)
  stopTier = onTierChange(applyParticleBudget)
  document.addEventListener('visibilitychange', syncRunning)
  if (import.meta.dev) {
    window.__agendaMobile = () => ({ ready: ready.value, running, failed, generation, elapsed, size: engine?.size, count: engine?.config.count, backend: engine?.backend })
    window.__agendaMobileEngine = engine
  }
  syncRunning()
  frame(performance.now())
}

onMounted(() => trackIntro(init().catch(useFallback)))
onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(raf)
  clearTimeout(revealTimer)
  observer?.disconnect()
  resizeObserver?.disconnect()
  stopTier?.()
  document.removeEventListener('visibilitychange', syncRunning)
  markActive(STAGE, false)
  if (import.meta.dev && window.__agendaMobileEngine === engine) {
    delete window.__agendaMobile
    delete window.__agendaMobileEngine
  }
  engine?.destroy()
  engine = null
})
</script>

<template>
  <div ref="rootRef" data-agenda-mobile-field aria-hidden="true" class="agenda-mobile-field pointer-events-none absolute inset-0 overflow-hidden">
    <img
      :src="SOURCE" alt="" width="2422" height="1710"
      class="absolute max-w-none transition-opacity duration-700"
      :class="ready ? 'opacity-0' : 'opacity-100'"
      :style="{ width: `${ART.width}px`, height: `${ART.height}px`, left: `calc(50% - 180px + ${ART.x}px)`, top: `${ART.y}px` }"
    >
    <canvas ref="canvasRef" class="absolute inset-0 h-full w-full mix-blend-screen transition-opacity duration-700" :class="ready ? 'opacity-100' : 'opacity-0'" />
  </div>
</template>
