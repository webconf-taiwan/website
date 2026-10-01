<script setup>
const { loadParticleKit } = useParticleKit()
const { trackIntro, introDone } = useSiteIntro()
const { idle } = useParticleStage()
const { knobs, markActive, onTierChange, noteRespawn, cpuFallback } = useParticleQuality()
const props = defineProps({ source: { type: String, default: '/figma/agenda/mobile-particle-source.webp' } })
const ART = { width: 1264 * 1.0914, height: 640 * 1.5412, x: -476 - 1264 * 0.0457, y: -640 * 0.3818 }
const STAGE = Symbol('agendaMobileField')
const canvasRef = ref(null)
const rootRef = ref(null)
const ready = ref(false)
const fallback = ref(false)
let look = resolveFieldLook(DEFAULT_FIELD_LOOK)
let engine = null
let observer = null
let resizeObserver = null
let stopTier = null
let stopAmbient = null
let raf = 0
let disposed = false
let failed = false
let visible = true
let running = false
let reduced = false
let budgetDirty = false
let lastTime = 0
let elapsed = 0

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
  engine.setPointSize(budget.pointSize)
  if (engine.config.count !== budget.count) {
    engine.setCount(budget.count)
    noteRespawn()
  }
}

function syncRunning() {
  if (!engine || disposed) return
  const next = visible && !document.hidden && !idle.value && !reduced && !failed && introDone.value
  engine.pause(!next)
  if (running === next) return
  running = next
  markActive(STAGE, next)
  stopAmbient?.()
  stopAmbient = next ? window.PLAmbient.start(() => engine, { intensity: look.ambient }) : null
  lastTime = 0
  cancelAnimationFrame(raf)
  if (next) raf = requestAnimationFrame(frame)
}

function frame(now) {
  if (!running || disposed) return
  if (budgetDirty) applyParticleBudget()
  elapsed += lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0
  lastTime = now
  raf = requestAnimationFrame(frame)
}

async function init() {
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) { fallback.value = true; return }
  await loadParticleKit()
  if (disposed) return
  // 與首頁共用五組範本；只在進頁時選一次，保留原有手機粒子預算。
  look = fieldLookFromLocation().look
  const budget = particleBudget()
  const q = knobs('mobileField')
  const next = await window.makeEngine(canvasRef.value, {
    species: look.rules.species, count: budget.count,
    preset: look.rules.preset, seedPattern: look.rules.seedPattern,
    palette: window.PLPalettes.PALETTES[look.palette].particles,
    bg: '#0a0a0c', bgFade: 'rgba(10,10,12,0.18)',
    ...look.physics, rMax: look.physics.rMax * q.rMaxScale,
    simSpeed: look.speed.idle, cameraZoom: look.camera.zoom,
    pointSize: budget.pointSize, particleOpacity: look.visual.heroOpacity * q.opacityScale,
    showGlow: false, maxDpr: budget.maxDpr, cellSubdivisions: q.cellSub,
  })
  if (disposed) { next.destroy(); return }
  engine = next
  // 先畫出 seed 的起始造型，loading 結束後才讓它繼續演化。
  await new Promise(resolve => setTimeout(resolve, 200))
  if (disposed) return
  ready.value = true
  applyParticleBudget()
  observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncRunning() })
  observer.observe(rootRef.value)
  resizeObserver = new ResizeObserver(() => { budgetDirty = true })
  resizeObserver.observe(canvasRef.value)
  stopTier = onTierChange(applyParticleBudget)
  document.addEventListener('visibilitychange', syncRunning)
  if (import.meta.dev) {
    window.__agendaMobile = () => ({ look: look.id, ready: ready.value, running, failed, elapsed, size: engine?.size, count: engine?.config.count, backend: engine?.backend })
    window.__agendaMobileEngine = engine
  }
  syncRunning()
}

watch(introDone, syncRunning)
watch(idle, syncRunning)
onMounted(() => trackIntro(init().catch(error => {
  if (disposed) return
  failed = true
  fallback.value = true
  syncRunning()
  console.warn('[AgendaMobileField] using source image:', error)
})))
onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(raf)
  observer?.disconnect()
  resizeObserver?.disconnect()
  stopTier?.()
  stopAmbient?.()
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
  <div ref="rootRef" data-agenda-mobile-field aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden bg-[#0a0a0c]">
    <img
      v-if="fallback" :src="props.source" alt="" width="2422" height="1710"
      class="absolute max-w-none mix-blend-screen"
      :style="{ width: `${ART.width}px`, height: `${ART.height}px`, left: `calc(50% - 180px + ${ART.x}px)`, top: `${ART.y}px` }"
    >
    <canvas ref="canvasRef" class="absolute inset-0 h-full w-full" :style="{ opacity: ready ? 1 : 0 }" />
  </div>
</template>
