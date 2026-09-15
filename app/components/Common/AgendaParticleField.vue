<script setup>
const { loadParticleKit } = useParticleKit()
const { countFor, maxDpr } = useParticleBudget()
const { idle } = useParticleStage()
const { markActive, onTierChange, knobs, noteRespawn } = useParticleQuality()
const { buildSeedTargets, buildSlotTargets, paletteToLinear, lerpPaletteLinear } = useParticleMorph()

const props = defineProps({
  fixed: {
    type: Boolean,
    default: false,
  },
})

const canvasRef = ref(null)
const backend = ref('')
const railOffset = ref(0)
const wrapClass = computed(() => props.fixed
  ? 'fixed -inset-x-16 top-0 z-0 h-dvh overflow-hidden mix-blend-screen'
  : 'absolute inset-0 h-full w-full overflow-hidden'
)

const look = resolveFieldLook(3)
const STAGE = 'agendaField'
const HERO_CAMERA_ZOOM = 1.45
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
let unsubTier = null
let running = false
let reducedMotion = false
let disposed = false
let needsTargets = true
let buildingTargets = false
let targetsGeneration = -1
let targetsSize = ''
let spread = null
let colonies = null
let shimmer = null
let shimmerCycle = -1
let railMix = 0
let pull = 0
let grip = 0
let lastTime = 0
let colonyMode = false
let lastPointSize = -1
let lastMinR = -1
let resizeRaf = 0
let heroPalette = null
const railPalette = paletteToLinear(RAIL.palette)
let paletteStep = -1

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
  return look.visual.pointSize * 1.15 * ((q.pointSize ?? 0.8) / 0.8)
}

function applyParticleBudget () {
  if (!engine || !canvasRef.value) return
  const count = countFor(canvasRef.value, countOptions())
  const nextCount = engine.setTargets ? count : Math.min(count, 3600)
  if (nextCount !== engine.config.count) {
    engine.setCount(nextCount)
    noteRespawn()
  }
  needsTargets = true
}

function railBounds () {
  const body = document.querySelector('[data-agenda-body]')?.getBoundingClientRect()
  const width = Math.min(body?.width || window.innerWidth, 1440) * 0.35
  const heightScale = Math.max(0.5, (window.innerHeight - 60) / 660)
  const scale = Math.min(1, width / 484, heightScale)
  return { left: Math.max(0, body?.left || 0), width, scale: Math.max(0.5, scale), heightScale }
}

function scrollProgress () {
  if (!props.fixed) return 0
  const hero = document.querySelector('[data-agenda-hero-desktop]')?.getBoundingClientRect()
  if (!hero?.height) return 0
  const p = Math.max(0, Math.min(1, (hero.height - 120 - hero.bottom) / (hero.height - 180)))
  return p * p * (3 - 2 * p)
}

async function rebuildTargets () {
  if (!engine || buildingTargets) return
  buildingTargets = true
  needsTargets = false
  const current = engine
  const generation = current.targetsGeneration ?? current.config.count
  const { W, H } = current.size
  try {
    const snap = await current.readParticles()
    if (disposed || engine !== current) return
    if (generation !== (current.targetsGeneration ?? current.config.count) ||
        W !== current.size.W || H !== current.size.H) {
      needsTargets = true
      return
    }
    // The CPU fallback exposes the same snapshots without GPU slot indices.
    snap.forEach((p, i) => { if (p.slot == null) p.slot = i })
    const { left, scale, heightScale } = railBounds()
    // Overscan keeps clipped edge colonies inside the simulation boundaries,
    // so its toroidal wrapping cannot send particles across the agenda text.
    const canvasLeft = canvasRef.value.getBoundingClientRect().left
    let seed = 20260915
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      return seed / 4294967296
    }
    const target = buildColonyTargets(snap.length, look.rules.species, W, H, {
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
    colonies = buildSlotTargets(snap, target, look.rules.species, W).shape
    const free = buildSeedTargets(look.rules.seedPattern, snap.length, look.rules.species, W, H)
    spread = buildSlotTargets(snap, free, look.rules.species, W).shape
    shimmer = new Float32Array(colonies)
    current.setTargets?.(spread, colonies)
    targetsGeneration = generation
    targetsSize = W + ':' + H
    shimmerCycle = -1
  } finally {
    buildingTargets = false
  }
}

function syncRunning () {
  const page = canvasRef.value?.closest('[data-agenda-page]')?.getBoundingClientRect()
  const visible = page ? page.bottom > 0 && page.top < window.innerHeight : true
  const want = visible && !document.hidden && !idle.value
  if (want === running) return
  running = want
  engine?.pause(!want)
  markActive(STAGE, want)
}
watch(idle, syncRunning)

function jitterTargets (now) {
  const cycle = reducedMotion ? 0 : Math.floor(now / RAIL.shimmerMs)
  if (cycle === shimmerCycle) return
  shimmerCycle = cycle
  const amplitude = reducedMotion ? 0 : RAIL.shimmer * railBounds().scale
  for (let i = 0; i < colonies.length; i += 2) {
    const angle = Math.random() * Math.PI * 2
    const radius = amplitude * (0.3 + 0.7 * Math.random())
    shimmer[i] = colonies[i] + Math.cos(angle) * radius
    shimmer[i + 1] = colonies[i + 1] + Math.sin(angle) * radius
  }
  engine.setTargets?.(spread, shimmer)
}

function seekCpuTargets (dt) {
  const arrays = engine.particleArrays
  if (!arrays || !spread || pull < 0.02) return
  // Use the existing CPU simulation/render path; only apply the same target
  // guidance that setMorph supplies on WebGPU.
  const follow = 1 - Math.exp(-pull * dt)
  for (let i = 0; i < arrays.count; i++) {
    const x = spread[i * 2] + (shimmer[i * 2] - spread[i * 2]) * railMix
    const y = spread[i * 2 + 1] + (shimmer[i * 2 + 1] - spread[i * 2 + 1]) * railMix
    arrays.pX[i] += (x - arrays.pX[i]) * follow
    arrays.pY[i] += (y - arrays.pY[i]) * follow
    arrays.pVX[i] *= 1 - follow
    arrays.pVY[i] *= 1 - follow
  }
}

function frame (now = performance.now()) {
  raf = requestAnimationFrame(frame)
  const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 60
  lastTime = now
  if (!engine) return
  syncRunning()
  if (!running) return

  const generation = engine.targetsGeneration ?? engine.config.count
  const size = engine.size.W + ':' + engine.size.H
  if (needsTargets || targetsGeneration !== generation || targetsSize !== size) {
    if (!buildingTargets) rebuildTargets().catch(error => console.warn('[AgendaField] targets:', error))
    return
  }
  if (!colonies) return

  const progress = scrollProgress()
  railMix += (progress - railMix) * (reducedMotion ? 1 : 1 - Math.exp(-10 * dt))
  if (Math.abs(progress - railMix) < 0.0001) railMix = progress
  // Follow the sticky rail as its containing section releases above the footer.
  const aside = document.querySelector('[data-agenda-body] > aside')?.getBoundingClientRect()
  railOffset.value = Math.min(0, (aside?.top ?? 60) - 60) * railMix
  const wantColony = colonyMode ? railMix > 0.35 : railMix > 0.65
  if (wantColony !== colonyMode) {
    colonyMode = wantColony
    engine.setPreset(wantColony ? RAIL.preset : look.rules.preset)
    engine.setShowGlow?.(wantColony)
  }

  const pointSize = heroPointSize() + (RAIL.pointSize - heroPointSize()) * railMix
  if (Math.abs(pointSize - lastPointSize) > 0.005 || ((railMix === 0 || railMix === 1) && pointSize !== lastPointSize)) {
    engine.setPointSize(pointSize)
    lastPointSize = pointSize
  }
  const minR = look.physics.minR + (RAIL.minR - look.physics.minR) * railMix
  if (Math.abs(minR - lastMinR) > 0.1 || ((railMix === 0 || railMix === 1) && minR !== lastMinR)) {
    engine.setMinR?.(minR)
    lastMinR = minR
  }
  engine.setSimSpeed?.(look.speed.idle + (RAIL.simSpeed - look.speed.idle) * railMix)
  const nextPaletteStep = Math.round(railMix * 100)
  if (nextPaletteStep !== paletteStep) {
    paletteStep = nextPaletteStep
    engine.setColors(lerpPaletteLinear(heroPalette, railPalette, nextPaletteStep / 100))
  }
  const t = now * 0.001
  const drift = reducedMotion ? 0 : 1 - railMix
  engine.setCameraZoom?.(HERO_CAMERA_ZOOM + (1 - HERO_CAMERA_ZOOM) * railMix)
  engine.setCameraOffset?.(
    (Math.sin(t * 0.09) * 18 - 24) * drift,
    Math.cos(t * 0.07) * 14 * drift,
  )

  const strength = Math.min(1, railMix * 5)
  const follow = 1 - Math.exp(-(strength > pull / RAIL.pull ? 12 : 0.7) * dt)
  pull += (RAIL.pull * strength - pull) * follow
  grip += (RAIL.grip * strength - grip) * follow
  if (pull < 0.02) { pull = 0; grip = 0 }
  if (railMix > 0 || shimmerCycle < 0) jitterTargets(now)
  if (engine.setMorph) engine.setMorph(pull, grip, railMix)
  else seekCpuTargets(dt)
}

function onResize () {
  cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(() => {
    if (!disposed) applyParticleBudget()
  })
}

async function init () {
  const canvas = canvasRef.value
  if (!canvas) return
  await loadParticleKit()
  if (disposed) return
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const palette = window.PLPalettes.PALETTES[look.palette]
  heroPalette = paletteToLinear(palette.particles)
  const q = knobs('desktopField') || {}
  const nextEngine = await window.makeEngine(canvas, {
    species: look.rules.species,
    count: countFor(canvas, countOptions()),
    preset: look.rules.preset,
    seedPattern: look.rules.seedPattern,
    palette: palette.particles,
    bgFade: palette.bgFade,
    forceFactor: look.physics.forceFactor,
    friction: look.physics.friction,
    repel: look.physics.repel,
    minR: look.physics.minR,
    rMax: q.rMax || look.physics.rMax,
    simSpeed: look.speed.idle,
    cameraZoom: HERO_CAMERA_ZOOM,
    pointSize: heroPointSize(),
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
  applyParticleBudget()

  if (import.meta.dev) {
    window.__agendaField = engine
    window.__agendaRailMotion = RAIL
    window.__agendaMotion = () => ({
      railMix, pull, grip, targetsGeneration, buildingTargets,
      rail: railBounds(), colonyCount: COLONIES.length,
    })
  }
  if (!reducedMotion) {
    stopAmbient = window.PLAmbient.start(() => engine, { intensity: look.ambient })
  }
  document.addEventListener('visibilitychange', syncRunning)
  window.addEventListener('resize', onResize)
  unsubTier = onTierChange(applyParticleBudget)
  syncRunning()
  frame()
}

onMounted(init)
onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(raf)
  cancelAnimationFrame(resizeRaf)
  stopAmbient?.()
  document.removeEventListener('visibilitychange', syncRunning)
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
  <div aria-hidden="true" class="pointer-events-none" :class="wrapClass" :style="fixed ? { transform: `translateY(${railOffset}px)` } : undefined">
    <canvas ref="canvasRef" class="absolute inset-0 h-full w-full" />
  </div>
</template>
