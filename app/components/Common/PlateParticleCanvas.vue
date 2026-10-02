<script setup>
const props = defineProps({
  variant: { type: String, default: 'hero' },
  density: { type: Number, default: 0.8 },
  galleryConfig: { type: Object, default: null },
  poster: { type: Boolean, default: false },
})
const emit = defineEmits(['ready', 'unavailable'])
const { loadParticleKit } = useParticleKit()
const { trackIntro, introDone } = useSiteIntro()
const { idle } = useParticleStage()
const { countFor, maxDpr } = useParticleBudget()
const { knobs, markActive, onTierChange, suspendReadback, noteRespawn } = useParticleQuality()
const { buildSeedTargets, buildSlotTargets } = useParticleMorph()
const canvasRef = ref(null)
const ready = ref(false)
const stage = Symbol('plate-field')
let engine = null
let disposed = false
let running = false
let visible = true
let observer = null
let resizeObserver = null
let stopTier = null
let stopAmbient = null
let raf = 0
let resizeTimer = 0
let building = false
let targetBase = null
let targetJitter = null
let targetGeneration = -1
let targetSize = ''
let targetCycle = -1
let elapsed = 0
let lastTime = 0
let look = resolveFieldLook(DEFAULT_FIELD_LOOK)
let settings = null

function quality() { return knobs('mobileField') }
function budget() {
  const scale = quality().countScale * props.density
  return {
    density: settings.budget.density * scale,
    max: Math.round(settings.budget.max * scale),
    min: Math.max(400, Math.round(Math.min(3000, settings.budget.min) * scale)),
  }
}

function stop() {
  running = false
  cancelAnimationFrame(raf)
  engine?.pause(true)
  stopAmbient?.()
  stopAmbient = null
  markActive(stage, false)
}

function fail(error) {
  if (disposed) return
  stop()
  engine?.destroy()
  engine = null
  ready.value = false
  emit('unavailable')
  console.warn('[PlateField] using media fallback:', error)
}

function syncRunning() {
  if (!engine || disposed) return
  const next = ready.value && visible && !document.hidden && !idle.value && introDone.value
  engine.pause(!next)
  if (next === running) return
  running = next
  markActive(stage, next)
  cancelAnimationFrame(raf)
  stopAmbient?.()
  stopAmbient = next ? window.PLAmbient.start(() => engine, { intensity: look.ambient * quality().ambientGain }) : null
  lastTime = 0
  if (next) raf = requestAnimationFrame(frame)
}

async function rebuildTargets() {
  const current = engine
  if (!current || building || !settings.pull) return
  building = true
  const generation = current.targetsGeneration
  const { W, H } = current.size
  try {
    suspendReadback()
    const snapshot = await current.readParticles()
    if (disposed || current !== engine) return
    if (generation !== current.targetsGeneration || W !== current.size.W || H !== current.size.H) return
    const seed = plateFieldTargets(props.variant, settings, snapshot.length, W, H, buildSeedTargets)
    const slots = buildSlotTargets(snapshot, seed, settings.species, W, { recolor: props.variant !== 'hero' })
    targetBase = slots.shape
    targetJitter = new Float32Array(targetBase.length)
    current.setTargets(targetBase, targetBase)
    if (props.variant !== 'hero') current.setShapeTypes?.(slots.shapeType, slots.shapeType)
    targetGeneration = generation
    targetSize = W + ':' + H
    targetCycle = -1
  } finally {
    building = false
  }
}

function frame(now) {
  if (!engine || !running || disposed) return
  const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0
  lastTime = now
  elapsed += dt * 1000
  const current = engine
  try {
    // 首頁自由場的相機漂移與 7 秒 hold 呼吸；look 2 的 0/0 不再被強制加拉力。
    if (props.variant === 'hero') {
      const s = elapsed * 0.001
      current.setCameraZoom(settings.zoom * (1 + 0.035 * Math.sin(s * 0.011)))
      current.setCameraOffset(Math.sin(s * 0.021) * 42 + Math.sin(s * 0.006) * 26,
        Math.cos(s * 0.017) * 30 + Math.sin(s * 0.010) * 16)
    }
    if (settings.pull) {
      const stale = current.targetsGeneration !== targetGeneration || current.size.W + ':' + current.size.H !== targetSize
      if (stale) {
        current.setMorph(0, 0, 0)
        rebuildTargets().catch(fail)
      } else if (targetBase) {
        const cycle = Math.floor(elapsed / (props.variant === 'rail' ? 260 : quality().driftMs))
        if (cycle !== targetCycle) {
          targetCycle = cycle
          const amplitude = props.variant === 'hero' ? 22 : props.variant === 'rail' ? 7 : 4
          for (let i = 0; i < targetBase.length; i += 2) {
            const a = Math.random() * Math.PI * 2
            const r = amplitude * (0.3 + 0.7 * Math.random())
            targetJitter[i] = targetBase[i] + Math.cos(a) * r
            targetJitter[i + 1] = targetBase[i + 1] + Math.sin(a) * r
          }
          current.setTargets(targetJitter, targetJitter)
        }
        const breathe = props.variant === 'hero' ? 0.18 + 0.82 * (0.5 - 0.5 * Math.cos(elapsed / 7000 * Math.PI * 2)) : 1
        current.setMorph(settings.pull * breathe, settings.grip * breathe, 0)
      }
    }
    raf = requestAnimationFrame(frame)
  } catch (error) { fail(error) }
}

function applyBudget() {
  if (!engine || disposed) return
  const q = quality()
  engine.setMaxDpr(Math.min(maxDpr(), q.dprCap))
  engine.setRMax(settings.physics.rMax * q.rMaxScale)
  // 減量不再同時放大亮點，避免低密度補償又把內頁照亮。
  engine.setPointSize(settings.pointSize * Math.min(1.15, q.pointScale))
  const count = countFor(canvasRef.value, budget())
  if (engine.config.count !== count) {
    engine.setMorph(0, 0, 0)
    engine.setCount(count)
    noteRespawn()
  }
}

function drawRailPoster() {
  const canvas = canvasRef.value
  if (!canvas || disposed) return
  const { width: W, height: H } = canvas.getBoundingClientRect()
  if (!W || !H) return
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  canvas.width = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, W, H)
  // 無 GPU 側欄只在尺寸變動時畫一次；不建立 CPU 粒子模擬。
  const points = plateFieldTargets('rail', settings, 3600, W, H, buildSeedTargets)
  ctx.globalAlpha = 0.65
  for (let i = 0; i < points.tx.length; i++) {
    ctx.fillStyle = PLATE_RAIL_PALETTE[points.tt[i]]
    ctx.fillRect(points.tx[i], points.ty[i], 0.8, 0.8)
  }
  ready.value = true
  emit('ready', 'static')
}

async function init() {
  look = fieldLookFromLocation().look
  settings = plateFieldSettings(props.variant, look, props.galleryConfig)
  if (props.poster) {
    drawRailPoster()
    resizeObserver = new ResizeObserver(drawRailPoster)
    resizeObserver.observe(canvasRef.value)
    return
  }
  await loadParticleKit()
  if (disposed) return
  const q = quality()
  const palette = Array.isArray(settings.palette) ? settings.palette : window.PLPalettes.PALETTES[settings.palette].particles
  const next = await window.makeEngine(canvasRef.value, {
    species: settings.species, count: countFor(canvasRef.value, budget()),
    preset: settings.preset, seedPattern: settings.seedPattern, palette,
    ...settings.physics, rMax: settings.physics.rMax * q.rMaxScale,
    bg: '#0a0a0c', bgFade: 'rgba(10,10,12,0.18)',
    cameraZoom: settings.zoom, simSpeed: settings.speed,
    pointSize: settings.pointSize * Math.min(1.15, q.pointScale),
    particleOpacity: settings.opacity, showGlow: false, glow: 0,
    maxDpr: Math.min(maxDpr(), q.dprCap), cellSubdivisions: q.cellSub,
  })
  if (disposed) { next.destroy(); return }
  if (next.backend !== 'webgpu') {
    next.pause(true)
    next.destroy()
    throw new Error('GPU initialization returned a CPU renderer')
  }
  engine = next
  // 先畫第一幀，再讓全站 loading 結束後開始演化。
  await new Promise(resolve => setTimeout(resolve, 200))
  if (disposed) return
  await rebuildTargets()
  if (disposed) return
  ready.value = true
  emit('ready', engine.backend)
  observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRect.height > 0 && entry.intersectionRect.width > 0
    syncRunning()
  }, { threshold: [0, 0.001] })
  observer.observe(canvasRef.value)
  resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(applyBudget, 150)
  })
  resizeObserver.observe(canvasRef.value)
  stopTier = onTierChange(applyBudget)
  document.addEventListener('visibilitychange', syncRunning)
  syncRunning()
}

watch(idle, syncRunning)
watch(introDone, syncRunning)
watch(() => props.density, applyBudget)
onMounted(() => {
  const task = init().catch(fail)
  if (props.variant === 'hero') trackIntro(task)
  if (import.meta.dev) canvasRef.value.__plateField = () => ({
    variant: props.variant, backend: props.poster ? 'static' : engine?.backend,
    count: engine?.config.count, look: look.id, ready: ready.value, running, elapsed,
    pull: settings?.pull, grip: settings?.grip, size: engine?.size,
    targetGeneration, generation: engine?.targetsGeneration,
  })
})
onBeforeUnmount(() => {
  disposed = true
  stop()
  clearTimeout(resizeTimer)
  observer?.disconnect()
  resizeObserver?.disconnect()
  stopTier?.()
  document.removeEventListener('visibilitychange', syncRunning)
  engine?.destroy()
  engine = null
})
</script>

<template>
  <canvas ref="canvasRef" aria-hidden="true" class="absolute inset-0 h-full w-full" :style="{ opacity: ready ? 1 : 0 }" />
</template>
