<script setup>
// 講者卡 hover 時疊在照片上的粒子人像。
//
// 兩種模式：
//   gpu    —— 有 WebGPU、裝置有 hover、沒開減少動態。卡片快進畫面時預熱引擎（建好就停）。
//             平常（看不到時）粒子跑首頁 hero 那組自由場（biolum-drift：spiral-conveyor
//             力矩陣 + 品牌藍色盤），流成一條條絲帶。
//             hover 進來：先看到藍白絲帶在卡片裡流，力場慢慢壓下、吸附力拉高，
//             粒子匯聚成人像，同時從藍白染回照片原色；停留期間微微閃動。
//             hover 離開：吸附力放掉、力場開回來，人像散回絲帶並淡出。
//             引擎還沒預熱好就 hover 的那一下維持原照片（框線跑光），好了才接上粒子 ——
//             ⚠️ 不要拿點畫圖墊：有 WebGPU 的人會看到兩種效果在切換，很怪。
//             ⚠️ 試過不好看的：「從外往內聚」（像被吸進一個點）、「從左緣流進來」——
//             粒子從一個不自然的起點出發；從活的場匯聚才順。
//             備選：「從中心長出來」（粒子先收在臉中心一小團，再往外綻開成人像）設計覺得還行，
//             目前以絲帶匯聚為主；要換回去就把待命的目標點改成收在中心、吸附一開始就拉滿。
//   static —— 桌機但沒有 WebGPU／減少動態／引擎初始化失敗：
//             hover 時淡入事先渲染好的點畫圖（speakers.json 的 portrait_static）。
//   off    —— 觸控裝置（手機、平板）：人物先不做粒子效果（設計決定），什麼都不掛。
//
// 人像那一端的物理參數抄首頁的人像（Home/SpeakerPortrait.vue，檔位表 speakerPortrait）；
// 自由場那一端抄 utils/homeFieldLooks.js 的 biolum-drift，但 rMax / minR 依卡片尺寸縮小
//（hero 是整個視窗，同一個 rMax 放在 206px 的卡片裡會變成幾顆大團塊）。
// 引擎數量與「同時只跑一張」交給 useHoverPortraitPool。

const props = defineProps({
  portrait: { type: String, default: '' },
  staticSrc: { type: String, default: '' },
  active: { type: Boolean, default: false },
})

const { webgpu } = useWebGpuSupport()
const { loadParticleKit } = useParticleKit()
const { countFor, maxDpr } = useParticleBudget()
const { buildImageTargets, buildSlotTargets, paletteToLinear, lerpPaletteLinear } = useParticleMorph()
const { whenTierReady, knobs, markActive, suspendReadback } = useParticleQuality()
const pool = useHoverPortraitPool()

const SPECIES = 7              // 人像色盤與 hero 藍色盤都是 7 色，才能逐色漸變
const FIT = 0.86

// 自由場（hover 前 / 離開後）—— 抄 biolum-drift
const FREE_PRESET = 'spiral-conveyor'
const FREE_SEED = 'rainbowSpiral'
const FREE_PALETTE = 'blue'
const FREE_FORCE = 1.0
const FREE_SPEED = 0.3
const FREE_OPACITY = 0.6
const FREE_RMAX = 26           // hero 72 是整個視窗的尺度
const FREE_MINR = 3

// 人像（hover 中）—— 抄 Home/SpeakerPortrait
const LOCK_PULL = 11
const LOCK_GRIP = 82
const LOCK_FORCE = 0.1
const LOCK_SPEED = 0.45
const LOCK_OPACITY = 0.72

const CONVERGE_MS = 1400       // 絲帶 → 人像
const RELEASE_MS = 700         // 人像 → 散回絲帶
const WARM_FRAMES = 90         // 預熱時讓自由場先長出絲帶（看不到的時候跑）
const HOVER_DELAY_MS = 80      // 滑鼠掃過整排時不要每張都啟動
const TAU = Math.PI * 2

const rootRef = ref(null)
const canvasRef = ref(null)
const id = `hover-portrait-${useId()}`
const mode = ref('pending')    // pending → gpu | static | off
const alive = ref(false)       // canvas 在 DOM 裡（引擎被回收時拿掉）
const shown = ref(false)       // 粒子畫面淡入中 / 已顯示
const ready = ref(false)       // 引擎預熱完、可以直接播

let engine = null
let disposed = false
let q = null
let shapeXY = null
let linFree = null
let linPortrait = null
let portraitPalette = null
let freePalette = null
let lock = 0                   // 0 = 自由場，1 = 人像
let appliedForce = FREE_FORCE
let tween = null
let hoverTimer = 0
let shimmerRaf = 0
let shimmerCycle = -1
let shimmerT0 = 0
let nearIo = null
let initing = null

const entry = {
  lastUsed: 0,
  near: false,
  isActive: () => props.active,
  evict: () => teardown(),
}

const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const lerp = (a, b, t) => a + (b - a) * t

function jitterXY (base, amp) {
  const out = new Float32Array(base.length)
  for (let i = 0; i < base.length; i += 2) {
    const a = Math.random() * TAU
    const r = amp * (0.3 + 0.7 * Math.random())
    out[i] = base[i] + Math.cos(a) * r
    out[i + 1] = base[i + 1] + Math.sin(a) * r
  }
  return out
}

function frames (n) {
  return new Promise((resolve) => {
    let i = 0
    const tick = () => (++i < n ? requestAnimationFrame(tick) : resolve())
    requestAnimationFrame(tick)
  })
}

function setRunning (running) {
  if (!engine) return
  engine.pause(!running)
  markActive(id, running)
}

// 把 lock（0 自由場 → 1 人像）套到引擎上。
// ⚠️ 吸附（grip / pull）用平方 —— 前段幾乎還是自由場，看得到絲帶在流，後段才收緊；
// 顏色比形狀再慢一點，粒子先到定位才顯影成原色。
function applyLock (t) {
  lock = t
  if (!engine) return
  const g = t * t
  engine.setMorph?.(LOCK_PULL * g, LOCK_GRIP * g, 1)
  const force = lerp(FREE_FORCE, LOCK_FORCE, t)
  if (Math.abs(force - appliedForce) > 0.01) {
    appliedForce = force
    engine.setForce?.(force)
  }
  engine.setSimSpeed?.(lerp(FREE_SPEED, LOCK_SPEED, t))
  engine.setParticleOpacity?.(lerp(FREE_OPACITY, LOCK_OPACITY, t))
  engine.setColors?.(lerpPaletteLinear(linFree, linPortrait, Math.min(1, t * t * 1.15)))
}

async function init () {
  if (engine || initing || disposed) return initing
  initing = (async () => {
    alive.value = true
    await nextTick()
    const canvas = canvasRef.value
    if (!canvas) return

    await loadParticleKit()
    await whenTierReady()
    q = knobs('speakerPortrait')

    const spec = await window.PLImage.prepare(props.portrait, { count: q.samples, colors: SPECIES, fit: FIT })
    if (disposed || !alive.value) return
    portraitPalette = spec.palette
    freePalette = window.PLPalettes.PALETTES[FREE_PALETTE].particles
    linFree = paletteToLinear(freePalette)
    linPortrait = paletteToLinear(portraitPalette)

    const created = await window.makeEngine(canvas, {
      species: SPECIES,
      count: countFor(canvas, { density: q.density, max: q.countMax, min: q.countMin }),
      palette: freePalette,
      seedPattern: FREE_SEED,
      preset: FREE_PRESET,
      forceFactor: FREE_FORCE,
      friction: 0.3,
      minR: FREE_MINR,
      rMax: FREE_RMAX,
      repel: 1.0,
      simSpeed: FREE_SPEED,
      cameraZoom: 1,
      pointSize: q.pointSize,
      particleOpacity: FREE_OPACITY,
      showGlow: false,
      cellSubdivisions: 2,
      maxDpr: Math.min(maxDpr(), q.dprCap),
      bg: '#0a0a0c',
    })
    // 建引擎這段時間裡被回收或卸載了
    if (disposed || !alive.value) { created.destroy(); return }
    // makeEngine 在 WebGPU 失敗時會靜默退到 CPU 引擎（沒有 morph）—— 改用點畫圖
    if (!created.setTargets) { created.destroy(); toStatic(); return }
    engine = created
    appliedForce = FREE_FORCE
    markActive(id, true)

    // 看不到的時候讓自由場先長出絲帶，再依當下的粒子位置配好人像的目標點
    await frames(WARM_FRAMES)
    if (disposed || !engine) return
    suspendReadback()
    const snap = await engine.readParticles()
    const { W, H } = engine.size
    const targets = buildImageTargets(spec, snap.length, W, H)
    shapeXY = buildSlotTargets(snap, targets, SPECIES, W).shape
    engine.setTargets(shapeXY, shapeXY)
    applyLock(0)
    if (disposed || !engine) return
    ready.value = true
    setRunning(props.active)
    if (props.active) enter()
  })()
  try {
    await initing
  } catch (err) {
    console.warn('[HoverPortrait] 粒子初始化失敗，改用點畫圖', err)
    teardown()
    toStatic()
  } finally {
    initing = null
  }
}

function tweenLock (to, ms, ease) {
  const { $gsap } = useNuxtApp()
  tween?.kill()
  const state = { t: lock }
  return new Promise((done) => {
    tween = $gsap.to(state, {
      t: to,
      duration: ms / 1000,
      ease,
      onUpdate: () => applyLock(state.t),
      onComplete: done,
    })
  })
}

function shimmer (now) {
  shimmerRaf = 0
  if (!engine || !props.active || lock < 1) return
  shimmerRaf = requestAnimationFrame(shimmer)
  const cycle = Math.floor((now - shimmerT0) / q.shimmerMs)
  if (cycle === shimmerCycle) return
  shimmerCycle = cycle
  const jit = jitterXY(shapeXY, q.shimmerAmp)
  engine.setTargets(jit, jit)
}

async function enter () {
  pool.touch(entry)
  if (!ready.value) { init(); return }
  shown.value = true
  setRunning(true)
  engine.setTargets(shapeXY, shapeXY)
  await tweenLock(1, CONVERGE_MS, 'power1.inOut')
  if (!props.active || !engine) return
  engine.setColors?.(portraitPalette)
  shimmerT0 = performance.now()
  shimmerCycle = -1
  if (!shimmerRaf) shimmerRaf = requestAnimationFrame(shimmer)
}

async function leave () {
  if (!ready.value) return
  cancelAnimationFrame(shimmerRaf)
  shimmerRaf = 0
  // 先散一下再淡出，看得到人像融回絲帶
  const fade = setTimeout(() => { if (!props.active) shown.value = false }, RELEASE_MS * 0.35)
  await tweenLock(0, RELEASE_MS, 'power2.out')
  clearTimeout(fade)
  if (props.active || !engine) return
  shown.value = false
  setRunning(false)
}

watch(() => props.active, (on) => {
  if (mode.value !== 'gpu') return
  clearTimeout(hoverTimer)
  if (on) hoverTimer = setTimeout(() => { if (props.active) enter() }, HOVER_DELAY_MS)
  else leave()
})

function toStatic () {
  mode.value = 'static'
}

function teardown () {
  pool.release(entry)
  tween?.kill()
  cancelAnimationFrame(shimmerRaf)
  shimmerRaf = 0
  markActive(id, false)
  engine?.destroy()
  engine = null
  lock = 0
  ready.value = false
  shown.value = false
  alive.value = false
}

function decide () {
  if (mode.value !== 'pending' || webgpu.value === null) return
  if (!canHover()) { mode.value = 'off'; return }
  if (webgpu.value !== true || reduced() || !props.portrait) { toStatic(); return }
  mode.value = 'gpu'
  // 卡片快進畫面才預熱；被回收過的再進畫面時重建
  nearIo = new IntersectionObserver((entries) => {
    entry.near = entries.some(en => en.isIntersecting)
    if (entry.near) {
      pool.touch(entry)
      init()
    }
  }, { rootMargin: '50% 0px' })
  nearIo.observe(rootRef.value)
}

onMounted(() => { watch(webgpu, decide, { immediate: true }) })

onBeforeUnmount(() => {
  disposed = true
  clearTimeout(hoverTimer)
  nearIo?.disconnect()
  teardown()
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0">
    <canvas
      v-if="mode === 'gpu' && alive"
      ref="canvasRef"
      class="absolute inset-0 block size-full transition-opacity duration-300 motion-reduce:transition-none"
      :class="shown ? 'opacity-100' : 'opacity-0'"
    />
    <!-- 引擎還沒預熱好就被 hover：框線上跑一道光，讓使用者知道有反應；好了就淡出、換粒子接手 -->
    <div
      v-if="mode === 'gpu'"
      class="hover-portrait-loading absolute inset-0 transition-opacity duration-300"
      :class="active && !ready ? 'opacity-100' : 'opacity-0'"
    >
      <span class="hover-portrait-ring absolute inset-0" />
    </div>
    <!-- 點畫圖：只給 static 模式（沒有 WebGPU 等），gpu 模式不用它墊 -->
    <img
      v-if="staticSrc && mode === 'static'"
      :src="staticSrc"
      alt=""
      width="1000"
      height="1000"
      loading="lazy"
      decoding="async"
      draggable="false"
      class="absolute inset-0 block size-full select-none bg-bg-mid object-contain transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none"
      :class="active ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0'"
    >
  </div>
</template>

<style scoped>
/* 繞著框線跑的光：conic-gradient 轉角度，mask 只留下邊框那一圈。
   光暈（drop-shadow）要掛在外層 —— 掛在同一層會被自己的 mask 裁掉。 */
@property --hover-portrait-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
.hover-portrait-loading { filter: drop-shadow(0 0 3px rgb(124 200 242 / 80%)); }
.hover-portrait-ring {
  padding: 1.5px;
  background: conic-gradient(from var(--hover-portrait-angle), transparent 0 62%, rgb(124 200 242 / 0%) 62%, #7cc8f2 94%, #e6f5fd 99%, transparent 100%);
  /* ⚠️ 不要寫成 mask 縮寫（`content-box exclude`）—— Chromium 會解析但裁成全透明 */
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: hover-portrait-orbit 1.2s linear infinite;
}
@keyframes hover-portrait-orbit {
  to { --hover-portrait-angle: 360deg; }
}
@media (prefers-reduced-motion: reduce) {
  .hover-portrait-ring { animation: none; }
}
</style>
