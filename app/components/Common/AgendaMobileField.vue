<script setup>
const { loadParticleKit, registerNebula } = useParticleKit()
const { buildSlotTargets } = useParticleMorph()
const { idle } = useParticleStage()
const { knobs, markActive, onTierChange, suspendReadback, cpuFallback } = useParticleQuality()
const { maxDpr } = useParticleBudget()

const SOURCE = '/figma/agenda/mobile-particle-source.png'
// Figma's 1264 x 640 image box, offset -476px in the 360px frame.
const ART = { width: 1264 * 1.0914, height: 640 * 1.5412, x: -476 - 1264 * 0.0457, y: -640 * 0.3818 }
const STAGE = 'mobileField'
const canvasRef = ref(null)
const rootRef = ref(null)
const ready = ref(false)
let engine = null
let observer = null
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
let cycle = -1
let lastTime = 0
let elapsed = 0

function countNow() {
  const scale = knobs('mobileField').countScale / 0.7
  return Math.min(cpuFallback.value || engine?.particleArrays ? 2800 : 16000, Math.round(12000 * scale))
}

function syncRunning() {
  const next = visible && !idle.value && !document.hidden && !reduced && !failed
  if (running === next) return
  running = next
  engine?.pause(!next)
  markActive(STAGE, next)
  lastTime = 0
}
watch(idle, syncRunning)

function useFallback(error) {
  if (disposed) return
  failed = true
  ready.value = false
  syncRunning()
  console.warn('[AgendaMobileField] using source image:', error)
}

async function rebuild() {
  if (!engine || building) return
  building = true
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
    current.setColors(spec.palette)
    current.setTargets?.(shape, shape)
    current.setShapeTypes?.(types, types)
    current.setMorph?.(18, 90, 1)
    if (current.particleArrays) {
      const p = current.particleArrays
      for (let i = 0; i < p.count; i++) { p.pX[i] = shape[i * 2]; p.pY[i] = shape[i * 2 + 1]; p.pS[i] = types[i] }
    }
    generation = gen
    sizeKey = `${W}:${H}`
    cycle = -1
    ready.value = true
  } finally {
    building = false
  }
}

function frame(now) {
  raf = requestAnimationFrame(frame)
  if (!engine || failed) return
  syncRunning()
  if (!running) return
  const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0
  lastTime = now
  elapsed += dt
  const stale = generation !== (engine.targetsGeneration ?? engine.config.count) || sizeKey !== `${engine.size.W}:${engine.size.H}`
  if (stale) {
    if (!building) rebuild().catch(useFallback)
    return
  }
  const nextCycle = Math.floor(elapsed / 0.26)
  if (nextCycle !== cycle) {
    cycle = nextCycle
    for (let i = 0; i < shape.length; i += 2) {
      const phase = i * 2.399963 + elapsed * 1.8
      jitter[i] = shape[i] + Math.sin(phase) * 1.8
      jitter[i + 1] = shape[i + 1] + Math.cos(phase * 0.83) * 1.8
    }
    engine.setTargets?.(jitter, jitter)
  }
  engine.setMorph?.(18, 84 + Math.sin(elapsed * 0.8) * 6, 1)
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
  const next = await window.makeEngine(canvasRef.value, {
    species: 7, count: countNow(), preset: 'nebula', seedPattern: 'orbitalBelts',
    palette: ['#E8F7FF', '#7CC8F2', '#2D6ACF', '#A7DCEC', '#FFFFFF', '#7CC8F2', '#2446CC'],
    bgFade: '#0a0a0c', forceFactor: 0.35, friction: 0.85, repel: 0.3,
    minR: 1, rMax: 22, simSpeed: 0.32, cameraZoom: 1,
    pointSize: 0.55, particleOpacity: 0.5,
    showGlow: true, glowSize: 3, glowIntensity: 0.01, glowSteepness: 5,
    maxDpr: Math.min(maxDpr(), q.dprCap), cellSubdivisions: q.cellSub,
  })
  if (disposed) { next.destroy(); return }
  engine = next
  if (engine.particleArrays && engine.config.count > countNow()) engine.setCount(countNow())
  observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio > 0; syncRunning() })
  observer.observe(rootRef.value)
  stopTier = onTierChange(() => { engine?.setCount(countNow()) })
  document.addEventListener('visibilitychange', syncRunning)
  if (import.meta.dev) {
    window.__agendaMobile = () => ({ ready: ready.value, running, failed, generation, size: engine?.size, count: engine?.config.count, backend: engine?.backend })
    window.__agendaMobileEngine = engine
  }
  syncRunning()
  frame(performance.now())
}

onMounted(() => init().catch(useFallback))
onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(raf)
  observer?.disconnect()
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
      class="absolute max-w-none"
      :style="{ width: `${ART.width}px`, height: `${ART.height}px`, left: `calc(50% - 180px + ${ART.x}px)`, top: `${ART.y}px` }"
    >
    <canvas ref="canvasRef" class="absolute inset-0 h-full w-full mix-blend-screen transition-opacity duration-700" :class="ready ? 'opacity-35' : 'opacity-0'" />
  </div>
</template>

<style scoped>
.agenda-mobile-field {
  /* Fade the artwork itself behind the title, without an opaque backing. */
  mask-image: radial-gradient(ellipse 170px 94px at 50% 276px, transparent 75%, #000 100%);
}
</style>
