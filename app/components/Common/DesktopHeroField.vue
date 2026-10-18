<script setup>
// 404／建置中的桌機自由場，沿用 Home/Field.vue 的 look、面積預算與取樣工具。
// 視窗大小的背景由外層 Hero 裁切，呈現高度由各頁既有版面決定。
const props = defineProps({ look: { type: Object, required: true } })
const emit = defineEmits(['ready', 'unavailable'])
const { loadParticleKit } = useParticleKit()
const { countFor, maxDpr, isMobile } = useParticleBudget()
const { buildSeedTargets, buildSlotTargets } = useParticleMorph()
const { trackIntro, introDone } = useSiteIntro()
const { idle } = useParticleStage()
const { suspendReadback } = useParticleQuality()
const rootRef = ref(null)
const canvasRef = ref(null)
const backend = ref('')
const ready = ref(false)

// Home/Field.vue: PAGE_BUDGET、HOLD_BREATHE_*、SHIMMER_*、POINTER_*。
const PAGE_BUDGET = { density: 0.0386, max: 50000, min: 10000 }
const HOLD_BREATHE_MS = 7000
const HOLD_BREATHE_FLOOR = 0.18
const SHIMMER_PERIOD_MS = 1000
const SHIMMER_AMP = 3
const POSTER_MS = 200
const REBUILD_SETTLE_MS = 700
const ADAPT_WARMUP_MS = 1200
const ADAPT_WINDOW_MS = 1500
const ADAPT_MIN_FRAMES = 20
const ADAPT_P50_MS = 22
const ADAPT_FAIL_STREAK = 2
const ADAPT_MAX_WINDOWS = 4
const SHRINK_STEPS = 10
const SHRINK_STEP_MS = 200
const AMBIENT_OFF_AT = 0.35
const AMBIENT_ON_AT = 0.20
let engine = null
let disposed = false
let raf = 0
let buildTimer = 0
let posterTimer = 0
let observer = null
let stopAmbient = null
let visible = true
let running = false
let posterDrawn = false
let reducedMotion = false
let introStart = 0
let lastTime = 0
let lastScrollY = 0
let simSpeed = props.look.speed.idle
let scrollHeat = 0
let appliedForce = props.look.physics.forceFactor
let ambientOn = false
let pull = 0
let grip = 0
let targetsGeneration = -1
let targetsSize = ''
let holdBase = null
let holdJitter = null
let shimmerCycle = -1
let pointerSeen = false
let pointerX = 0
let pointerY = 0
let previousPointerX = 0
let previousPointerY = 0
let pointerOn = false
let touchDown = false
let touchMode = false
let adaptStarted = false
let adaptRaf = 0

function syncRunning() {
  const want = visible && !document.hidden && !idle.value && (!posterDrawn || introDone.value)
  running = want
  engine?.pause(!want)
}
watch([idle, introDone], syncRunning)

async function buildHold() {
  if (!engine || disposed) return
  const current = engine
  const generation = current.targetsGeneration
  const { W, H } = current.size
  suspendReadback()
  const snapshot = await current.readParticles()
  if (disposed || current !== engine) return
  if (generation !== current.targetsGeneration || W !== current.size.W || H !== current.size.H) {
    invalidateTargets()
    return
  }
  const seed = buildSeedTargets(props.look.rules.seedPattern, snapshot.length, props.look.rules.species, W, H)
  // 與首頁自由場相同：維持物種配色，不把 hero 壓成扁橢圓或額外 recolor。
  holdBase = buildSlotTargets(snapshot, seed, props.look.rules.species, W).shape
  holdJitter = new Float32Array(holdBase.length)
  current.setTargets(holdBase, holdBase)
  targetsGeneration = generation
  targetsSize = W + ':' + H
  shimmerCycle = -1
  ready.value = true
  if (!adaptStarted && current.shrinkTo) {
    adaptStarted = true
    adaptCount().catch(unavailable)
  }
}

function invalidateTargets() {
  ready.value = false
  holdBase = null
  engine?.setMorph(0, 0, 0)
  clearTimeout(buildTimer)
  buildTimer = setTimeout(() => buildHold().catch(unavailable), REBUILD_SETTLE_MS)
}

function onResize() {
  invalidateTargets()
}

function onPointerMove(event) {
  if (!pointerOn || !visible || (touchMode && !touchDown)) return
  if (!pointerSeen) {
    previousPointerX = event.clientX
    previousPointerY = event.clientY
    pointerSeen = true
  }
  pointerX = event.clientX
  pointerY = event.clientY
}

function onTouch(event) {
  const p = event.touches[0]
  if (!p) return
  if (event.type === 'touchstart') {
    touchDown = true
    pointerSeen = false
  }
  onPointerMove(p)
}
function onTouchEnd(event) { touchDown = event.touches.length > 0 }

function pushPointer() {
  if (!pointerOn || !pointerSeen || (touchMode && !touchDown)) return
  const speed = Math.hypot(pointerX - previousPointerX, pointerY - previousPointerY)
  previousPointerX = pointerX
  previousPointerY = pointerY
  const { W, H } = engine.size
  const zoom = engine.config.cameraZoom
  engine.disturb(
    (pointerX - W / 2) / zoom + W / 2 + (engine.config.cameraX ?? 0),
    (pointerY - H / 2) / zoom + H / 2 + (engine.config.cameraY ?? 0),
    320, Math.min(24, 2 + speed * 3.5),
  )
}

function syncAmbient(lockNorm) {
  if (reducedMotion) return
  if (ambientOn && lockNorm > AMBIENT_OFF_AT) {
    stopAmbient?.()
    stopAmbient = null
    ambientOn = false
  } else if (!ambientOn && lockNorm < AMBIENT_ON_AT) {
    stopAmbient = window.PLAmbient.start(() => running ? engine : null, { intensity: props.look.ambient })
    ambientOn = true
  }
}

function frame(now) {
  if (disposed) return
  raf = requestAnimationFrame(frame)
  if (!engine || !running) { lastTime = now; lastScrollY = window.scrollY; return }
  const dt = lastTime ? Math.max(1 / 240, Math.min(0.05, (now - lastTime) / 1000)) : 1 / 60
  lastTime = now
  const t = now
  const look = props.look
  const heat = Math.min(1, Math.abs(window.scrollY - lastScrollY) / dt / 2200)
  lastScrollY = window.scrollY
  const targetSpeed = look.speed.idle + (look.speed.max - look.speed.idle) * heat
  simSpeed += (targetSpeed - simSpeed) * (targetSpeed > simSpeed ? 0.14 : 0.022)
  engine.setSimSpeed(simSpeed)
  scrollHeat += (heat - scrollHeat) * (heat > scrollHeat ? 0.14 : 0.022)
  const force = look.physics.forceFactor * (1 - 0.6 * scrollHeat)
  if (Math.abs(force - appliedForce) > 0.01) {
    appliedForce = force
    engine.setForce(force)
  }
  const lockNorm = Math.min(1, grip / 90)
  syncAmbient(lockNorm)
  const s = t * 0.001
  const g = 1 - 0.75 * lockNorm
  const dx = reducedMotion ? 0 : (Math.sin(s * 0.021) * 42 + Math.sin(s * 0.006) * 26) * g
  const dy = reducedMotion ? 0 : (Math.cos(s * 0.017) * 30 + Math.sin(s * 0.010) * 16) * g
  const dz = reducedMotion ? 1 : 1 + 0.035 * Math.sin(s * 0.011) * g
  engine.setCameraZoom(look.camera.zoom * dz)
  engine.setCameraOffset(dx, dy)
  pushPointer()
  if (ready.value && (targetsGeneration !== engine.targetsGeneration || targetsSize !== engine.size.W + ':' + engine.size.H)) invalidateTargets()
  if (!ready.value || !holdBase) return
  // 首頁同樣以握力呼吸釋放構圖；深海流光的 pull/grip=0 保持自由演化。
  pull += (look.hold.pull - pull) * (look.hold.pull > pull ? 0.20 : 0.012)
  grip += (look.hold.grip - grip) * (look.hold.grip > grip ? 0.20 : 0.012)
  const breathe = reducedMotion ? 1 : HOLD_BREATHE_FLOOR + (1 - HOLD_BREATHE_FLOOR) * (0.5 - 0.5 * Math.cos(t / HOLD_BREATHE_MS * Math.PI * 2))
  const cycle = Math.floor(t / SHIMMER_PERIOD_MS)
  if (cycle !== shimmerCycle && lockNorm > 0.05) {
    shimmerCycle = cycle
    for (let i = 0; i < holdBase.length; i += 2) {
      const angle = Math.random() * Math.PI * 2
      const radius = SHIMMER_AMP * (0.3 + 0.7 * Math.random())
      holdJitter[i] = holdBase[i] + Math.cos(angle) * radius
      holdJitter[i + 1] = holdBase[i + 1] + Math.sin(angle) * radius
    }
    engine.setTargets(holdJitter, holdJitter)
  }
  engine.setMorph(pull * breathe, grip * breathe, 0)
}

function unavailable(error) {
  if (disposed) return
  running = false
  engine?.pause(true)
  emit('unavailable')
  console.warn('[DesktopHeroField] unavailable:', error)
}

// 沿用首頁的持續降幀判斷與分批 shrinkTo；保留既有粒子，避免整場重生。
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
function measureFrameTime() {
  return new Promise(resolve => {
    const deltas = []
    const start = performance.now()
    let previous = 0
    let invalid = false
    const tick = now => {
      if (disposed || !engine) return resolve(null)
      if (document.hidden || !running) invalid = true
      if (previous) deltas.push(now - previous)
      previous = now
      if (now - start < ADAPT_WINDOW_MS) {
        adaptRaf = requestAnimationFrame(tick)
        return
      }
      if (invalid) return resolve(null)
      if (deltas.length < ADAPT_MIN_FRAMES) return resolve(ADAPT_WINDOW_MS / (deltas.length + 1))
      deltas.sort((a, b) => a - b)
      resolve(deltas[deltas.length >> 1])
    }
    adaptRaf = requestAnimationFrame(tick)
  })
}
async function adaptCount() {
  await sleep(ADAPT_WARMUP_MS)
  let streak = 0
  for (let windowIndex = 0; windowIndex < ADAPT_MAX_WINDOWS; windowIndex++) {
    const p50 = await measureFrameTime()
    if (disposed || !engine) return
    if (p50 === null) continue
    streak = p50 > ADAPT_P50_MS ? streak + 1 : 0
    if (streak < ADAPT_FAIL_STREAK) continue
    const from = engine.config.count
    const target = Math.round(from / 2)
    for (let step = 1; step <= SHRINK_STEPS; step++) {
      if (disposed || !engine) return
      await engine.shrinkTo(Math.round(from + (target - from) * step / SHRINK_STEPS))
      if (disposed || !engine) return
      invalidateTargets()
      if (step < SHRINK_STEPS) await sleep(SHRINK_STEP_MS)
    }
    return
  }
}

async function init() {
  await loadParticleKit()
  if (disposed) return
  const look = props.look
  const palette = window.PLPalettes.PALETTES[look.palette]
  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const next = await window.makeEngine(canvasRef.value, {
    species: look.rules.species,
    count: countFor(canvasRef.value, PAGE_BUDGET),
    preset: look.rules.preset,
    seedPattern: look.rules.seedPattern,
    palette: palette.particles,
    bgFade: palette.bgFade,
    bg: '#0a0a0c',
    ...look.physics,
    simSpeed: look.speed.idle,
    cameraZoom: look.camera.zoom,
    pointSize: look.visual.pointSize,
    particleOpacity: look.visual.heroOpacity,
    showGlow: look.visual.showGlow && !isMobile(),
    ...look.glow,
    cellSubdivisions: 2,
    maxDpr: maxDpr(),
  })
  if (disposed) { next.destroy(); return }
  engine = next
  if (engine.backend !== 'webgpu') throw new Error('WebGPU unavailable')
  backend.value = engine.backend
  introStart = performance.now()
  lastScrollY = window.scrollY
  observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncRunning() })
  observer.observe(rootRef.value)
  pointerOn = !reducedMotion && matchMedia('(pointer: fine)').matches
  touchMode = !pointerOn && !reducedMotion && navigator.maxTouchPoints > 0
  if (touchMode) pointerOn = true
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('touchstart', onTouch, { passive: true })
  window.addEventListener('touchmove', onTouch, { passive: true })
  window.addEventListener('touchend', onTouchEnd, { passive: true })
  window.addEventListener('touchcancel', onTouchEnd, { passive: true })
  document.addEventListener('visibilitychange', syncRunning)
  window.addEventListener('resize', onResize)
  stopAmbient = reducedMotion ? null : window.PLAmbient.start(() => running ? engine : null, { intensity: look.ambient })
  ambientOn = !!stopAmbient
  syncRunning()
  posterTimer = setTimeout(() => { posterDrawn = true; syncRunning() }, POSTER_MS)
  buildTimer = setTimeout(() => buildHold().catch(unavailable), 900)
  if (import.meta.dev) {
    window.__plateHeroField = engine
    window.__plateHeroDbg = () => ({ look: look.id, ready: ready.value, running, visible, pull, grip, simSpeed, ambientOn, scrollHeat, age: performance.now() - introStart })
  }
  raf = requestAnimationFrame(frame)
  emit('ready')
}

onMounted(() => { trackIntro(init().catch(unavailable)) })
onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(raf)
  cancelAnimationFrame(adaptRaf)
  clearTimeout(buildTimer)
  clearTimeout(posterTimer)
  observer?.disconnect()
  stopAmbient?.()
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('touchstart', onTouch)
  window.removeEventListener('touchmove', onTouch)
  window.removeEventListener('touchend', onTouchEnd)
  window.removeEventListener('touchcancel', onTouchEnd)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', syncRunning)
  if (import.meta.dev && window.__plateHeroField === engine) {
    delete window.__plateHeroField
    delete window.__plateHeroDbg
  }
  engine?.destroy()
  engine = null
})
defineExpose({ backend })
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 z-0 overflow-hidden" data-desktop-hero-field>
    <canvas ref="canvasRef" class="absolute inset-0 w-full" style="height: 100vh" />
  </div>
</template>
