<script setup>
const { loadParticleKit } = useParticleKit()
const { countFor, maxDpr } = useParticleBudget()
const { idle } = useParticleStage()
const { markActive, onTierChange, knobs, noteRespawn } = useParticleQuality()

const props = defineProps({
  fixed: {
    type: Boolean,
    default: false,
  },
})

const canvasRef = ref(null)
const fieldStyle = ref({})
const wrapClass = computed(() => props.fixed
  ? 'fixed top-0 z-0 h-dvh overflow-hidden'
  : 'absolute inset-0 h-full w-full overflow-hidden'
)

const look = resolveFieldLook(3)
let engine = null
let stopAmbient = null
let raf = 0
let io = null
let inView = false
let onVisibility = null
let onResize = null
let unsubTier = null
let running = false
let reducedMotion = false
let disposed = false
let visualMode = ''
let fieldStyleKey = ''

const DENSITY = 0.032
const MAX_COUNT = 26000
const MIN_COUNT = 6200
const STAGE = 'agendaField'
const DESKTOP_FIELD_BASE_DENSITY = 0.0386
const DESKTOP_FIELD_BASE_MAX = 50000
const DESKTOP_FIELD_BASE_MIN = 10000

function countOptions () {
  const q = knobs('desktopField') || {}

  return {
    density: DENSITY * ((q.density ?? DESKTOP_FIELD_BASE_DENSITY) / DESKTOP_FIELD_BASE_DENSITY),
    max: Math.round(MAX_COUNT * ((q.countMax ?? DESKTOP_FIELD_BASE_MAX) / DESKTOP_FIELD_BASE_MAX)),
    min: Math.round(MIN_COUNT * ((q.countMin ?? DESKTOP_FIELD_BASE_MIN) / DESKTOP_FIELD_BASE_MIN)),
  }
}

function applyParticleBudget () {
  if (!engine || !canvasRef.value) return
  engine.setCount?.(countFor(canvasRef.value, countOptions()))
  noteRespawn()
}

function updateFieldBox () {
  if (!props.fixed || typeof window === 'undefined') return

  const hero = document.querySelector('[data-agenda-hero-desktop]')
  const body = document.querySelector('[data-agenda-body]')
  const heroRect = hero?.getBoundingClientRect?.()
  const bodyRect = body?.getBoundingClientRect?.()
  const nextMode = heroRect && heroRect.bottom > 0 ? 'hero' : 'rail'
  let nextStyle
  let nextKey

  if (nextMode === 'hero') {
    nextStyle = {
      left: '0px',
      width: '100vw',
      WebkitMaskImage: 'none',
      maskImage: 'none',
    }
    nextKey = 'hero'
  } else {
    const left = Math.max(0, bodyRect?.left ?? 0)
    const containerWidth = Math.min(bodyRect?.width || window.innerWidth, 1440)
    const width = Math.min(520, Math.max(360, containerWidth * 0.35))

    nextStyle = {
      left: `${left}px`,
      width: `${width}px`,
      WebkitMaskImage: 'linear-gradient(90deg, #000 0, #000 calc(100% - 120px), transparent 100%)',
      maskImage: 'linear-gradient(90deg, #000 0, #000 calc(100% - 120px), transparent 100%)',
    }
    nextKey = `rail:${Math.round(left)}:${Math.round(width)}`
  }

  if (fieldStyleKey !== nextKey) {
    fieldStyleKey = nextKey
    fieldStyle.value = nextStyle
  }

  if (visualMode !== nextMode) {
    visualMode = nextMode
    requestAnimationFrame(applyParticleBudget)
  }
}

function syncRunning () {
  const want = inView && !document.hidden && !idle.value
  if (want === running) return
  running = want
  engine?.pause(!want)
  markActive(STAGE, want)
}
watch(idle, () => syncRunning())

function frame (now) {
  raf = requestAnimationFrame(frame)
  updateFieldBox()
  if (!engine || !running) return

  if (!reducedMotion) {
    const t = (now || performance.now()) * 0.001
    engine.setCameraOffset?.(
      Math.sin(t * 0.09) * 18 - 24,
      Math.cos(t * 0.07) * 14,
    )
  }
}

async function init () {
  const canvas = canvasRef.value
  if (!canvas) return

  updateFieldBox()
  await nextTick()
  if (disposed) return
  await loadParticleKit()
  if (disposed) return
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const palette = window.PLPalettes.PALETTES[look.palette]
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
    cameraZoom: 1.45,
    pointSize: look.visual.pointSize * 1.15 * ((q.pointSize ?? 0.8) / 0.8),
    particleOpacity: 0.9,
    showGlow: false,
    cellSubdivisions: q.cellSub ?? 2,
    maxDpr: Math.min(maxDpr(), q.dprCap ?? maxDpr()),
  })
  if (disposed) {
    nextEngine.destroy()

    return
  }
  engine = nextEngine

  if (!reducedMotion) {
    stopAmbient = window.PLAmbient.start(() => engine, { intensity: look.ambient })
  }

  io = new IntersectionObserver(([entry]) => {
    inView = !!entry?.isIntersecting
    syncRunning()
  })
  io.observe(canvas)

  onVisibility = () => syncRunning()
  document.addEventListener('visibilitychange', onVisibility)
  onResize = () => {
    updateFieldBox()
    requestAnimationFrame(applyParticleBudget)
  }
  window.addEventListener('resize', onResize)
  unsubTier = onTierChange(() => {
    const next = knobs('desktopField') || {}
    engine?.setRMax?.(next.rMax || look.physics.rMax)
    engine?.setPointSize?.(look.visual.pointSize * 1.15 * ((next.pointSize ?? 0.8) / 0.8))
    applyParticleBudget()
  })

  updateFieldBox()
  inView = true
  syncRunning()
  frame()
}

onMounted(() => { init() })

onBeforeUnmount(() => {
  disposed = true
  if (raf) cancelAnimationFrame(raf)
  io?.disconnect()
  stopAmbient?.()
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  if (onResize) window.removeEventListener('resize', onResize)
  unsubTier?.()
  markActive(STAGE, false)
  if (engine) {
    engine.destroy()
    engine = null
  }
})
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none"
    :class="wrapClass"
    :style="fieldStyle"
  >
    <canvas
      ref="canvasRef"
      class="absolute inset-0 h-full w-full"
    />
  </div>
</template>
