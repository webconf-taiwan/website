<script setup>
import { plateFieldLook } from '~/utils/particleFieldLooks'
import { prepareHistoryShapes, historyShapeTargets, RIBBON_TOP } from './particleTargets'

// 只有構圖與捲動時間軸屬於本頁；物理、圖片取樣、配對與效能降規沿用共用工具。
const { isDesktop, viewportReady } = useViewportMode()
const { webgpu } = useWebGpuSupport()
const { loadParticleKit } = useParticleKit()
const { trackIntro, introDone } = useSiteIntro()
const { idle } = useParticleStage()
const { countFor, maxDpr } = useParticleBudget()
const { knobs, markActive, onTierChange, suspendReadback, noteRespawn } = useParticleQuality()
const { buildSlotTargetsRaw, paletteToLinear, lerpPaletteLinear } = useParticleMorph()
const pageRef = ref(null)
const windowRef = ref(null)
const fieldRef = ref(null)
const canvasRef = ref(null)
const mounted = ref(false)
const ready = ref(false)
const failed = ref(false)
const reduced = ref(false)
const fallback = computed(() => webgpu.value === false || failed.value || reduced.value)
const desktopMode = computed(() => fallback.value ? 'fallback' : ready.value ? 'gpu' : 'pending')
const active = computed(() => mounted.value && viewportReady.value && isDesktop.value && webgpu.value === true && !fallback.value)
const stage = Symbol('history-particles')
let engine = null
let look = null
let shapes = null
let targets = null
let palettes = null
let pair = -1
let paletteStep = ''
let generation = 0
let running = false
let visible = true
let media = null
let timeout = null
let resizeTimer = null
let raf = 0
let observer = null
let stopTier = null
let geometry = null
let building = false
let rebuildPending = false
let driftTimer = null
let driftTime = 0
let driftLastTime = 0
let targetBuffer = null
let morphBlend = 0
const driftOffsets = new Float32Array(64)

const clamp = value => Math.max(0, Math.min(1, value))
const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p) }
const lerp = (a, b, p) => a + (b - a) * p
const quality = () => knobs('mobileField')
function count() {
  const scale = quality().countScale
  return countFor(canvasRef.value, {
    density: look.budget.density * scale, max: Math.round(look.budget.max * scale),
    min: Math.round(look.budget.min * scale),
  })
}

function syncRunning() {
  const next = !!engine && ready.value && visible && !document.hidden && !idle.value && introDone.value
  if (running === next) return
  running = next
  engine?.pause(!next)
  markActive(stage, next)
  clearTimeout(driftTimer)
  driftLastTime = performance.now()
  if (next) driftTimer = setTimeout(drift, 120)
}

// 小幅移動目標點，讓粒子收攏後仍有流動；原始構圖不累加位移。
function uploadTargets() {
  if (!engine || !targets || !targetBuffer || pair < 0) return
  for (let group = 0; group < 32; group++) {
    const phase = group * Math.PI * 2 / 32
    driftOffsets[group * 2] = Math.sin(driftTime * 0.65 + phase) * 3
    driftOffsets[group * 2 + 1] = Math.cos(driftTime * 0.48 + phase) * 2.5
  }
  const a = targets[pair].shape
  const b = targets[pair + 1].shape
  const { W, H } = engine.size
  for (let i = 0; i < a.length; i += 2) {
    const dx = driftOffsets[i % 64]
    const dy = driftOffsets[i % 64 + 1]
    const j = i * 2
    // Hero 保持原樣；橫帶與花形使用同一組微動，轉場不切斷相位。
    targetBuffer[j] = Math.max(1, Math.min(W - 1, a[i] + (pair ? dx : 0)))
    targetBuffer[j + 1] = Math.max(1, Math.min(H - 1, a[i + 1] + (pair ? dy : 0)))
    targetBuffer[j + 2] = Math.max(1, Math.min(W - 1, b[i] + dx))
    targetBuffer[j + 3] = Math.max(1, Math.min(H - 1, b[i + 1] + dy))
  }
  engine.setTargetsPacked(targetBuffer)
}

function drift() {
  if (!running) return
  const now = performance.now()
  driftTime += Math.min(0.25, (now - driftLastTime) / 1000)
  driftLastTime = now
  try {
    if (!building && (pair === 1 || morphBlend > 0)) uploadTargets()
    driftTimer = setTimeout(drift, 120)
  } catch (error) { fail(error) }
}

function destroy() {
  generation++
  clearTimeout(timeout)
  clearTimeout(resizeTimer)
  clearTimeout(driftTimer)
  driftTime = 0
  ready.value = false
  running = false
  markActive(stage, false)
  engine?.destroy()
  engine = null
  targets = null
  targetBuffer = null
  pair = -1
  paletteStep = ''
}

function fail(error) {
  if (!active.value) return
  failed.value = true
  destroy()
  console.warn('[History] using shared media fallback:', error)
}

function measure() {
  if (!isDesktop.value || !pageRef.value) return
  const rect = selector => pageRef.value.querySelector(selector)?.getBoundingClientRect()
  const hero = rect('[data-plate-hero-desktop]')
  const gallery = rect('.history-gallery .photo-board') || rect('.history-gallery')
  if (!hero || !gallery) return
  geometry = { hero: { top: hero.top + scrollY, height: hero.height }, gallery: { top: gallery.top + scrollY, height: gallery.height } }
  schedule()
}

function render() {
  raf = 0
  if (!active.value || !geometry || !fieldRef.value) return
  const { hero, gallery } = geometry
  const vh = innerHeight
  const pinnedTop = Math.max(60, (vh - 342) / 2)
  const ribbonMix = smooth((scrollY - hero.top - 120) / Math.max(1, hero.height - 180))
  const galleryTop = gallery.top - scrollY
  const galleryMix = smooth((vh - 100 - galleryTop) / Math.max(1, vh * 0.65 - 100))
  // 橫帶位於畫布中央，固定到照片區進場才移向花形的文件位置。
  const ribbonCanvasTop = pinnedTop - RIBBON_TOP
  const top = lerp(lerp(hero.top - scrollY * (1 - ribbonMix), ribbonCanvasTop, ribbonMix), galleryTop, galleryMix)
  fieldRef.value.style.transform = `translate3d(0, ${top}px, 0)`
  const clipTop = lerp(Math.max(0, hero.top - scrollY), 0, ribbonMix)
  const clipBottom = (1 - ribbonMix) * Math.max(0, vh - hero.top + scrollY - hero.height)
  windowRef.value.style.clipPath = `inset(${clipTop}px 0 ${clipBottom}px)`
  visible = top < vh && top + 720 > 0
  if (engine && targets) {
    const nextPair = galleryMix > 0 ? 1 : 0
    const blend = nextPair ? galleryMix : ribbonMix
    morphBlend = blend
    if (nextPair !== pair) {
      pair = nextPair
      uploadTargets()
      engine.setShapeTypes(targets[pair].shapeType, targets[pair + 1].shapeType)
    }
    engine.setMorph(24, 90, blend)
    // 與共用內頁一樣，捲動時提高演化速度，讓反向捲動也跟得上目標。
    engine.setSimSpeed(blend > 0 && blend < 1 ? look.speed.max : look.speed.idle)
    const step = `${pair}:${Math.round(blend * 100)}`
    if (paletteStep !== step) {
      paletteStep = step
      engine.setColors(lerpPaletteLinear(palettes[pair], palettes[pair + 1], blend))
    }
  }
  syncRunning()
  if (import.meta.dev) Object.assign(windowRef.value.dataset, {
    ribbonMix: String(ribbonMix), galleryMix: String(galleryMix), pinnedTop: String(pinnedTop),
  })
}
function schedule() { if (!raf) raf = requestAnimationFrame(render) }

async function rebuildTargets() {
  if (!engine) return
  if (building) { rebuildPending = true; return }
  building = true
  const current = engine
  const version = generation
  const n = current.config.count
  try {
    suspendReadback()
    const raw = await current.readParticlesRaw()
    if (version !== generation) return
    if (n !== current.config.count) { rebuildPending = true; return }
    const { W } = current.size
    targets = ['hero', 'ribbon', 'gallery'].map(name => buildSlotTargetsRaw(raw, n,
      historyShapeTargets(shapes, name, n, W, Math.min(innerWidth, 1440)), 7, W, { recolor: true }))
    targetBuffer = new Float32Array(n * 4)
    pair = -1
    paletteStep = ''
    render()
  } finally {
    building = false
    if (rebuildPending) { rebuildPending = false; await rebuildTargets() }
  }
}

async function applyBudget() {
  if (!engine || !active.value) return
  const current = engine
  const version = generation
  const q = quality()
  engine.setMaxDpr(Math.min(maxDpr(), q.dprCap))
  engine.setRMax(look.physics.rMax * q.rMaxScale)
  engine.setPointSize(look.visual.pointSize * 1.35 * Math.min(1.15, q.pointScale))
  const n = Math.min(engine.config.count, count())
  if (n !== engine.config.count) {
    suspendReadback()
    await current.shrinkTo(n)
    if (version !== generation) return
    noteRespawn()
  }
  await rebuildTargets()
}
function resized() {
  measure()
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => applyBudget().catch(fail), 180)
}

async function init(version) {
  await nextTick()
  await loadParticleKit()
  if (version !== generation) return
  shapes = await prepareHistoryShapes(assetUrl)
  if (version !== generation) return
  look = resolveHomeFieldLook(plateFieldLook(fieldLookFromLocation().look).id)
  const q = quality()
  const next = await window.makeEngine(canvasRef.value, {
    species: 7, count: count(), preset: look.rules.preset, seedPattern: shapes.hero.pattern,
    palette: shapes.hero.palette, ...look.physics, rMax: look.physics.rMax * q.rMaxScale,
    bg: '#0a0a0c', bgFade: 'rgba(10,10,12,0.18)', cameraZoom: 1, simSpeed: look.speed.idle,
    pointSize: look.visual.pointSize * 1.35 * Math.min(1.15, q.pointScale), particleOpacity: 0.9,
    showGlow: look.visual.showGlow, ...look.glow, cellSubdivisions: q.cellSub,
    maxDpr: Math.min(maxDpr(), q.dprCap),
  })
  if (version !== generation) { next.destroy(); return }
  if (next.backend !== 'webgpu') { next.destroy(); throw new Error('WebGPU renderer unavailable') }
  engine = next
  engine.pause(true)
  palettes = ['hero', 'ribbon', 'gallery'].map(name => paletteToLinear(shapes[name].palette))
  measure()
  await rebuildTargets()
  if (version !== generation) return
  ready.value = true
  clearTimeout(timeout)
  render()
  if (import.meta.dev) canvasRef.value.__historyField = () => ({ engine, ready: ready.value, introDone: introDone.value, running, pair, count: engine?.config.count })
}

watch(active, value => {
  destroy()
  if (!value) return
  const version = generation
  timeout = setTimeout(() => fail(new Error('Particle initialization timed out')), 15000)
  const task = init(version).catch(error => { if (version === generation) fail(error) })
  trackIntro(task)
}, { flush: 'post' })
watch([idle, introDone], syncRunning)
function motionChanged() { reduced.value = media.matches }
onMounted(() => {
  media = matchMedia('(prefers-reduced-motion: reduce)')
  motionChanged()
  media.addEventListener('change', motionChanged)
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', resized, { passive: true })
  document.addEventListener('visibilitychange', syncRunning)
  observer = new ResizeObserver(measure)
  observer.observe(pageRef.value)
  stopTier = onTierChange(() => applyBudget().catch(fail))
  mounted.value = true
  measure()
})
onBeforeUnmount(() => {
  destroy()
  cancelAnimationFrame(raf)
  observer?.disconnect()
  stopTier?.()
  media?.removeEventListener('change', motionChanged)
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', resized)
  document.removeEventListener('visibilitychange', syncRunning)
})
</script>

<template>
  <div ref="pageRef" data-plate-page class="relative isolate overflow-x-clip bg-bg-mid text-pre-800" :class="{ 'history-stage--pinned': active && ready }">
    <ClientOnly>
      <div v-if="active" ref="windowRef" aria-hidden="true" class="history-field-window pointer-events-none fixed inset-0 z-0 overflow-hidden" :style="{ opacity: ready ? 1 : 0 }">
        <div class="history-field-position">
          <div ref="fieldRef" class="history-field-motion">
            <canvas ref="canvasRef" class="history-particles absolute inset-0 h-full w-full" />
          </div>
        </div>
      </div>
    </ClientOnly>
    <slot :desktop-mode="desktopMode" />
  </div>
</template>

<style scoped>
.history-field-position { position: absolute; top: 0; left: 50%; width: max(1440px, 100vw); height: 720px; transform: translateX(-50%); }
.history-field-motion { position: absolute; inset: 0; will-change: transform; }
/* 動態模式只顯示這一批粒子；靜態與手機備援沿用原本裝飾。 */
@media (min-width: 1024px) {
  .history-stage--pinned :deep(.history-chapters > .chapter-ribbon),
  .history-stage--pinned :deep(.history-recap > .video-ribbon) { visibility: hidden; }
  .history-stage--pinned :deep(.history-copy) { background: rgb(10 10 12 / 88%); }
  .history-stage--pinned :deep(.chapter-heading),
  .history-stage--pinned :deep(.history-label),
  .history-stage--pinned :deep(.recap-label) { text-shadow: 0 1px 3px #0a0a0c; }
}
</style>
