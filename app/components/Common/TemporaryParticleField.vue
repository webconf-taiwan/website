<script setup>
const { loadParticleKit } = useParticleKit()
// 首次進站 loading 要等這個粒子場 init 完（script、WebGPU 引擎）才收，見 useSiteIntro
const { trackIntro, introDone } = useSiteIntro()
const { countFor, maxDpr } = useParticleBudget()
const { isDesktop } = useViewportMode()
const { idle } = useParticleStage()
const { knobs, cpuFallback, markActive, onTierChange, noteRespawn } = useParticleQuality()

let look = resolveFieldLook(DEFAULT_FIELD_LOOK)
const stage = Symbol('temporaryField')
const rootRef = ref(null)
const canvasRef = ref(null)
let engine = null
let observer = null
let stopTier = null
let stopAmbient = null
let motionQuery = null
let disposed = false
let visible = true
let running = false
let resizeRaf = 0

function budget () {
  const q = knobs(isDesktop.value ? 'desktopField' : 'mobileField')
  const cpu = cpuFallback.value || !!engine?.particleArrays
  const scale = isDesktop.value ? q.density / 0.0386 : q.countScale
  const count = countFor(canvasRef.value, {
    density: look.budget.density * scale,
    max: Math.round(look.budget.max * scale),
    min: Math.round(look.budget.min * scale),
  })
  return {
    count: cpu ? Math.min(count, CPU_FALLBACK_MAX_COUNT) : count,
    pointSize: cpu ? CPU_POINT_SIZE_FIELD : isDesktop.value ? q.pointSize : look.visual.pointSize * q.pointScale,
    dpr: Math.min(maxDpr(), q.dprCap),
    cellSubdivisions: q.cellSub ?? 2,
  }
}

function applyBudget () {
  if (!engine || disposed) return
  const next = budget()
  if (next.count !== engine.config.count) {
    noteRespawn()
    engine.setCount(next.count)
  }
  engine.setPointSize(next.pointSize)
  engine.setMaxDpr?.(next.dpr)
}

function syncRunning () {
  if (!engine || disposed) return
  const next = visible && !idle.value && !document.hidden && !motionQuery.matches && introDone.value
  engine.pause(!next)
  if (running === next) return
  running = next
  markActive(stage, next)
  stopAmbient?.()
  stopAmbient = next
    ? window.PLAmbient.start(() => engine, { intensity: look.ambient })
    : null
}

function onResize () {
  cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(applyBudget)
}

watch(idle, syncRunning)
watch(introDone, syncRunning)
watch(isDesktop, onResize)

async function init () {
  await loadParticleKit()
  if (disposed) return
  look = fieldLookFromLocation().look
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const q = budget()
  const palette = window.PLPalettes.PALETTES[look.palette]
  const next = await window.makeEngine(canvasRef.value, {
    species: look.rules.species,
    preset: look.rules.preset,
    seedPattern: look.rules.seedPattern,
    palette: palette.particles,
    bgFade: 'rgba(10,10,12,0.18)',
    count: q.count,
    forceFactor: look.physics.forceFactor,
    friction: look.physics.friction,
    repel: look.physics.repel,
    minR: look.physics.minR,
    rMax: look.physics.rMax,
    simSpeed: look.speed.idle,
    cameraZoom: look.camera.zoom,
    pointSize: q.pointSize,
    particleOpacity: look.visual.heroOpacity,
    showGlow: look.visual.showGlow,
    glowSize: look.glow.glowSize,
    glowIntensity: look.glow.glowIntensity,
    glowSteepness: look.glow.glowSteepness,
    cellSubdivisions: q.cellSubdivisions,
    maxDpr: q.dpr,
  })
  if (disposed) {
    next.destroy()
    return
  }
  engine = next
  applyBudget()
  await new Promise(resolve => setTimeout(resolve, 200))
  if (disposed) return
  if (import.meta.dev) window.__temporaryField = () => ({ look: look.id, running, count: engine?.config.count, backend: engine?.backend })
  observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    syncRunning()
  })
  observer.observe(rootRef.value)
  document.addEventListener('visibilitychange', syncRunning)
  window.addEventListener('resize', onResize)
  motionQuery.addEventListener('change', syncRunning)
  stopTier = onTierChange(applyBudget)
  syncRunning()
}

onMounted(() => trackIntro(init().catch(error => {
  if (!disposed) console.warn('[TemporaryParticleField] Background initialization failed:', error)
})))

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(resizeRaf)
  observer?.disconnect()
  stopTier?.()
  stopAmbient?.()
  document.removeEventListener('visibilitychange', syncRunning)
  window.removeEventListener('resize', onResize)
  motionQuery?.removeEventListener('change', syncRunning)
  markActive(stage, false)
  if (import.meta.dev) delete window.__temporaryField
  engine?.destroy()
  engine = null
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden bg-[#0a0a0c]">
    <canvas ref="canvasRef" class="absolute inset-0 h-full w-full" />
  </div>
</template>
