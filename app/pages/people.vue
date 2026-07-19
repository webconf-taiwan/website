<script setup>
// People — 人物「活體標本」點雲。
// 照片離線去背 + 取樣成 JSON 點資料（docs/people-src/：cutout.swift → cleanup.py → bake.py），
// 網站只載點資料不載原圖。原理與工作流見 docs/point-cloud-effect.md。
//
// 兩個 canvas：
//   1. sticky 三講師 — GSAP ScrollTrigger：右側區塊捲到畫面中央時，粒子群集體
//      遷徙、換色盤，從上一位講師「流」成下一位（people-01 → 02 → 03）。
//   2. 底部示範 — 單一人像：hover 擴散 → 離開凍結 → 點擊倒帶重組。
const canvasRef = ref(null)          // 底部示範 canvas
const canvasStickyRef = ref(null)    // 三講師滾動漸變 canvas
const backend = ref('')

const KIT = '/particle-kit'
const SCRIPTS = [
  'particle-life-seeds.js',
  'particle-life-rules.js',
  'particle-life.js',
  'particle-life-gpu.js',
  'particle-ambient.js',
  'particle-image.js',
]

// 三位講師的點資料與右側文案（順序 = 捲動漸變順序）
const PEOPLE = [
  { json: '/people/people-01.json', title: '講師ABC', body: '123' },
  { json: '/people/people-02.json', title: '講師EFD', body: '123' },
  { json: '/people/people-03.json', title: '講師GHI', body: '123' },
]

const NEBULA_FORCE = 0.3          // 擴散時的力度（倒帶時會暫時歸零）
const REWIND_MS = 2200            // 倒帶動畫時長
const MORPH_MS = 2000             // 講師間漸變時長

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      if (existing.dataset.loaded) return resolve()
      existing.addEventListener('load', resolve)
      existing.addEventListener('error', reject)
      return
    }
    const el = document.createElement('script')
    el.src = src
    el.onload = () => { el.dataset.loaded = '1'; resolve() }
    el.onerror = () => reject(new Error(`failed to load ${src}`))
    document.head.appendChild(el)
  })
}

// 自訂「星雲擴散」力矩陣（見 docs §7.4 的踩坑）：任何正自吸引都會把人像凝結成
// 菌落圓點，氣體感要用正弦相位環流 + 全域微斥力。兩個 canvas 共用，只註冊一次。
function registerNebula() {
  if (window.PLRules.PRESETS.nebula) return
  window.PLRules.PRESETS.nebula = (n) => {
    const m = []
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) { m.push(-0.06); continue }
        const phase = 2 * Math.PI * (j - i) / n
        m.push(0.45 * Math.sin(phase) - 0.08)
      }
    }
    return m
  }
}

// ---------------------------------------------------------------------------
// 共用：把某份 spec 的點位映射到模擬座標（contain-fit 置中，與 particle-image.js
// registerPattern 同一套），供倒帶／漸變的目標點使用。
// ---------------------------------------------------------------------------
function buildTargets(sp, N, W, H) {
  const boxW = W * sp.fit, boxH = H * sp.fit
  const s = Math.min(boxW / sp.aspect, boxH)
  const drawW = s * sp.aspect, drawH = s
  const x0 = (W - drawW) / 2, y0 = (H - drawH) / 2
  const tx = new Float32Array(N)
  const ty = new Float32Array(N)
  const tt = new Uint8Array(N)
  const T = sp.palette.length
  for (let i = 0; i < N; i++) {
    const j = i % sp.count
    tx[i] = x0 + sp.px[j] * drawW
    ty[i] = y0 + sp.py[j] * drawH
    tt[i] = sp.types[j] % T
  }
  return { tx, ty, tt }
}

// --- 色盤在「線性光」空間插值，換色才順滑（naive sRGB 線性插值中點會發灰） ---
function srgbToLinear(v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
function linearToByte(v) {
  v = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
  return Math.max(0, Math.min(255, Math.round(v * 255)))
}
function paletteToLinear(pal) {
  return pal.map((h) => {
    const n = parseInt(h.slice(1), 16)
    return [srgbToLinear((n >> 16) & 255), srgbToLinear((n >> 8) & 255), srgbToLinear(n & 255)]
  })
}
function lerpPaletteLinear(linA, linB, e) {
  const out = []
  const n = Math.min(linA.length, linB.length)
  for (let i = 0; i < n; i++) {
    const a = linA[i], b = linB[i]
    out.push('#'
      + linearToByte(a[0] + (b[0] - a[0]) * e).toString(16).padStart(2, '0')
      + linearToByte(a[1] + (b[1] - a[1]) * e).toString(16).padStart(2, '0')
      + linearToByte(a[2] + (b[2] - a[2]) * e).toString(16).padStart(2, '0'))
  }
  return out
}

// 把引擎目前粒子以 easing 逐幀插值移動到指定 spec 的人像目標點。
// 同物種內以「掃描線順序」就近配對（GPU 每幀 spatial sort 會打亂粒子順序，index
// 對不上原點位，但同色可互換所以無妨）。借 respawn(臨時 pattern) 整批上傳，不改引擎。
// 期間 setForce(0) 關掉星雲力場，避免和插值打架。tag 用不同名稱避免兩個 canvas 撞。
// opts.fromPalette/toPalette：換人漸變時逐幀同步插值色盤（同一 easing），顏色隨形狀
// 一起流過去，避免瞬間換色的跳色與 rebuildBindGroups 卡頓。
async function tweenToSpec(eng, sp, ms, tag, opts = {}) {
  eng.setForce?.(0)
  const snap = await eng.readParticles()
  const N = snap.length
  const { W, H } = eng.size
  const { tx, ty, tt } = buildTargets(sp, N, W, H)

  const T = sp.palette.length
  const snapBy = Array.from({ length: T }, () => [])
  const tgtBy = Array.from({ length: T }, () => [])
  for (let i = 0; i < N; i++) snapBy[snap[i].s % T].push(i)
  for (let i = 0; i < N; i++) tgtBy[tt[i]].push(i)
  const orderKey = (x, y) => y * W + x
  const curX = new Float32Array(N), curY = new Float32Array(N)
  const dstX = new Float32Array(N), dstY = new Float32Array(N)
  const dstT = new Uint8Array(N)
  let cursor = 0
  const leftoverSnap = [], leftoverTgt = []
  for (let t = 0; t < T; t++) {
    const a = snapBy[t].sort((i, j) => orderKey(snap[i].x, snap[i].y) - orderKey(snap[j].x, snap[j].y))
    const b = tgtBy[t].sort((i, j) => orderKey(tx[i], ty[i]) - orderKey(tx[j], ty[j]))
    const n = Math.min(a.length, b.length)
    for (let k = 0; k < n; k++, cursor++) {
      curX[cursor] = snap[a[k]].x; curY[cursor] = snap[a[k]].y
      dstX[cursor] = tx[b[k]]; dstY[cursor] = ty[b[k]]; dstT[cursor] = t
    }
    for (let k = n; k < a.length; k++) leftoverSnap.push(a[k])
    for (let k = n; k < b.length; k++) leftoverTgt.push(b[k])
  }
  for (let k = 0; k < leftoverTgt.length && cursor < N; k++, cursor++) {
    const si = leftoverSnap[k % Math.max(1, leftoverSnap.length)]
    const ti = leftoverTgt[k]
    curX[cursor] = si != null ? snap[si].x : tx[ti]
    curY[cursor] = si != null ? snap[si].y : ty[ti]
    dstX[cursor] = tx[ti]; dstY[cursor] = ty[ti]; dstT[cursor] = tt[ti]
  }

  const linFrom = opts.fromPalette ? paletteToLinear(opts.fromPalette) : null
  const linTo = opts.toPalette ? paletteToLinear(opts.toPalette) : null
  const ix = new Float32Array(N), iy = new Float32Array(N)
  window.PLSeeds.PATTERNS[tag] = (write, n) => {
    for (let i = 0; i < n; i++) write(i, ix[i], iy[i], 0, 0, dstT[i])
  }
  const start = performance.now()
  const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2)
  await new Promise((done) => {
    const step = () => {
      const u = Math.min(1, (performance.now() - start) / ms)
      const e = easeInOut(u)
      for (let i = 0; i < N; i++) {
        ix[i] = curX[i] + (dstX[i] - curX[i]) * e
        iy[i] = curY[i] + (dstY[i] - curY[i]) * e
      }
      if (linFrom && linTo) eng.setColors?.(lerpPaletteLinear(linFrom, linTo, e))
      eng.respawn(tag)
      if (u < 1) requestAnimationFrame(step)
      else done()
    }
    step()
  })
  if (opts.toPalette) eng.setColors?.(opts.toPalette)   // 收尾定色，config.palette 對齊
  eng.setSeedPattern?.(sp.pattern)   // 之後 respawn 用這個人像佈局
}

// ===========================================================================
// 三講師 sticky canvas — 捲動漸變
// ===========================================================================
const SPECS = []
let stickyEngine = null
let stickyIO = null, stickyOnVis = null
let stickyInView = true
let stickyCurrent = 0, stickyTarget = 0, stickyMorphing = false
let stickyTriggers = []
const blockEls = ref([])

function syncStickyPause() {
  // 只有在漸變中且在視窗內、分頁可見時才讓引擎跑；其餘時間凍結（保留最後一幀）
  if (stickyEngine) stickyEngine.pause(!(stickyMorphing && stickyInView && !document.hidden))
}

// 捲動觸發：把目標指到第 i 位講師；若目前沒在漸變就啟動（連跳幾位也會逐一補上）
function requestMorph(i) {
  stickyTarget = i
  runMorph()
}
async function runMorph() {
  if (stickyMorphing) return
  while (stickyEngine && stickyTarget !== stickyCurrent) {
    const idx = stickyTarget
    stickyMorphing = true
    syncStickyPause()
    if (!stickyEngine.readParticles) {
      // CPU fallback：換色盤 + 直接重生（無逐幀遷徙）
      stickyEngine.setPalette?.(SPECS[idx].palette)
      stickyEngine.setSeedPattern?.(SPECS[idx].pattern)
      stickyEngine.respawn(SPECS[idx].pattern)
    } else {
      // 位置與色盤用同一 easing 逐幀插值 → 顏色隨形狀一起流過去，換色順滑無卡頓
      await tweenToSpec(stickyEngine, SPECS[idx], MORPH_MS, '__tween_sticky', {
        fromPalette: SPECS[stickyCurrent].palette,
        toPalette: SPECS[idx].palette,
      })
    }
    stickyCurrent = idx
    stickyMorphing = false
    syncStickyPause()
  }
}

async function initSticky() {
  const canvas = canvasStickyRef.value
  if (!canvas) return

  // 三份點資料 → prepareFromData（各自註冊一個 seed pattern，回傳 px/py/types）
  const datas = await Promise.all(PEOPLE.map(p => $fetch(p.json)))
  for (const d of datas) SPECS.push(window.PLImage.prepareFromData(d))

  const first = SPECS[0]
  const count = window.innerWidth < 768 ? 16000 : first.count

  stickyEngine = await window.makeEngine(canvas, {
    species: first.palette.length,
    count,
    palette: first.palette,
    seedPattern: first.pattern,
    preset: 'nebula',
    forceFactor: 0,                 // 凍結人像；漸變時本來就以插值覆寫位置
    friction: 0.4,
    minR: 4,
    rMax: 55,
    repel: 1.0,
    simSpeed: 0.3,
    cameraZoom: 1,
    pointSize: 0.9,
    particleOpacity: 1,
    showGlow: false,
    cellSubdivisions: 2,
    bgFade: 'rgba(0,0,0,0.18)',
  })
  if (!backend.value) backend.value = stickyEngine.backend

  // 先渲染出第一位講師（兩幀）再凍結
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  syncStickyPause()

  // 效能守則：離屏 / 分頁隱藏都凍結
  stickyOnVis = () => syncStickyPause()
  document.addEventListener('visibilitychange', stickyOnVis)
  stickyIO = new IntersectionObserver(
    (entries) => { stickyInView = entries[0].isIntersecting; syncStickyPause() },
    { threshold: 0.05 },
  )
  stickyIO.observe(canvas)

  // GSAP ScrollTrigger：每個右側區塊捲到畫面中央 → 漸變到對應講師
  const { $ScrollTrigger } = useNuxtApp()
  if ($ScrollTrigger) {
    blockEls.value.forEach((el, i) => {
      if (!el) return
      stickyTriggers.push($ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => requestMorph(i),
        onEnterBack: () => requestMorph(i),
      }))
    })
    $ScrollTrigger.refresh()
  }
}

// ===========================================================================
// 底部示範 canvas — hover 擴散 / 點擊倒帶
// ===========================================================================
let engine = null
let spec = null
let stopAmbient = null
let io = null
let onVisibility = null
let hovering = false
let inView = true
let rewinding = false

function syncPause() {
  if (engine) engine.pause(!((hovering || rewinding) && inView && !document.hidden))
}

async function initDemo() {
  const canvas = canvasRef.value
  if (!canvas) return

  const data = await $fetch(PEOPLE[0].json)
  spec = window.PLImage.prepareFromData(data)

  const count = window.innerWidth < 768 ? 16000 : spec.count
  engine = await window.makeEngine(canvas, {
    species: spec.palette.length,
    count,
    palette: spec.palette,
    seedPattern: spec.pattern,
    preset: 'nebula',
    forceFactor: NEBULA_FORCE,
    friction: 0.4,
    minR: 4,
    rMax: 55,
    repel: 1.0,
    simSpeed: 0.3,
    cameraZoom: 1,
    pointSize: 0.9,
    particleOpacity: 1,
    showGlow: false,
    cellSubdivisions: 2,
    bgFade: 'rgba(10,10,12,0.18)',
  })
  backend.value = engine.backend

  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  syncPause()

  canvas.addEventListener('pointerenter', handleEnter)
  canvas.addEventListener('pointerleave', handleLeave)
  canvas.addEventListener('pointermove', handlePointer)
  canvas.addEventListener('click', handleClick)

  onVisibility = () => syncPause()
  document.addEventListener('visibilitychange', onVisibility)
  io = new IntersectionObserver(
    (entries) => { inView = entries[0].isIntersecting; syncPause() },
    { threshold: 0.05 },
  )
  io.observe(canvas)
}

function handleEnter() {
  hovering = true
  syncPause()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!stopAmbient && !reducedMotion && window.PLAmbient) {
    stopAmbient = window.PLAmbient.start(() => (rewinding ? null : engine), {
      breath: false,
      tide: false,
      intensity: 0.4,
    })
  }
}

function handleLeave() {
  hovering = false
  syncPause()
  if (stopAmbient) { stopAmbient(); stopAmbient = null }
}

function handlePointer(ev) {
  if (!engine || !hovering || rewinding) return
  const r = ev.currentTarget.getBoundingClientRect()
  const { W, H } = engine.size
  engine.disturb(
    ((ev.clientX - r.left) / r.width) * W,
    ((ev.clientY - r.top) / r.height) * H,
    180,
    6,
  )
}

function handleClick() {
  rewind()
}

async function rewind() {
  if (!engine || rewinding) return
  if (!engine.readParticles) { engine.respawn(); return }   // CPU fallback：瞬間重組
  rewinding = true
  syncPause()
  await tweenToSpec(engine, spec, REWIND_MS, '__tween_demo')
  engine.setForce?.(NEBULA_FORCE)                           // 收尾：回星雲力場
  rewinding = false
  syncPause()
}

onMounted(async () => {
  for (const s of SCRIPTS) await loadScript(`${KIT}/${s}`)
  registerNebula()
  await initSticky()
  await initDemo()
})

onBeforeUnmount(() => {
  stickyTriggers.forEach(t => t.kill())
  if (stickyIO) stickyIO.disconnect()
  if (stickyOnVis) document.removeEventListener('visibilitychange', stickyOnVis)
  if (stickyEngine) { stickyEngine.destroy(); stickyEngine = null }

  if (stopAmbient) stopAmbient()
  if (io) io.disconnect()
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  if (engine) { engine.destroy(); engine = null }
})
</script>

<template>
  <div class="bg-black text-txt-white">
    <section class="text-center container h-screen flex items-center justify-center">
      <h1 class="text-zh-display-2 text-txt-white">
        People
      </h1>
    </section>
    <section class="bg-black relative grid grid-cols-12 gap-4 lg:gap-6">
      <div class="col-span-7 sticky top-10 h-max">
        <canvas
          ref="canvasStickyRef"
          class="block h-[72vh] min-h-[420px] w-full"
        />
      </div>
      <div class="col-span-5">
        <div
          v-for="(p, i) in PEOPLE"
          :key="i"
          :ref="el => { if (el) blockEls[i] = el }"
          class="flex flex-col min-h-screen justify-center text-zh-body-1 gap-4"
        >
          <h2 class="text-zh-head-1">{{ p.title }}</h2>
          <p class="text-zh-body-1">{{ p.body }}</p>
        </div>
      </div>
    </section>
    <section class="mx-auto mt-10 max-w-3xl md:mt-14">
      <div class="overflow-hidden rounded-2xl bg-[#0a0a0c]">
        <canvas
          ref="canvasRef"
          class="block h-[72vh] min-h-[420px] w-full cursor-crosshair"
        />
      </div>
      <p class="mt-3 flex items-center justify-between font-mono text-xs tracking-widest text-neutral-400">
        <span>LIVING SPECIMEN · 01 — hover 擴散 · 點擊倒帶重組</span>
        <span>{{ backend ? `simulation · live · ${backend}` : 'initializing…' }}</span>
      </p>
    </section>
  </div>
</template>
