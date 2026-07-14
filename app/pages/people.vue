<script setup>
// People — 人物「活體標本」點雲。
// 照片離線去背 + 取樣成 JSON 點資料（docs/particle-kit/particle-image.js），
// 網站只載點資料不載原圖。原理與工作流見 docs/point-cloud-effect.md。
//
// 互動：預設完整人形（凍結）→ hover 開始擴散 → 滑鼠離開凍在當下
//      → 點擊「倒帶」：粒子以動畫緩緩退回原位，而非瞬間閃回。
const canvasRef = ref(null)
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

const NEBULA_FORCE = 0.3          // 擴散時的力度（倒帶時會暫時歸零）
const REWIND_MS = 2200            // 倒帶動畫時長

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

let engine = null
let spec = null
let stopAmbient = null
let io = null
let onVisibility = null
let hovering = false
let inView = true
let rewinding = false

// 凍結條件集中管理：hover 中或倒帶中 + 在視窗內 + 分頁可見 才讓引擎跑
function syncPause() {
  if (engine) engine.pause(!((hovering || rewinding) && inView && !document.hidden))
}

onMounted(async () => {
  for (const s of SCRIPTS) await loadScript(`${KIT}/${s}`)

  const canvas = canvasRef.value
  if (!canvas) return

  // 點資料（離線烘焙的 JSON，不含原始照片）
  const data = await $fetch('/people/people-01.json')
  spec = window.PLImage.prepareFromData(data)

  // 自訂「星雲擴散」力矩陣。注意：任何正的自吸引（cellular、self>0）都會
  // 把人像凝結成菌落圓點。要「氣體感」需用正弦相位差製造環流（wavefield
  // 的做法）+ 全域微斥力讓它緩慢膨脹 → 人像像彩色煙霧般旋開。
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

  // 效能守則：粒子預算看裝置（JSON 有 32k 點，行動裝置只取一半）
  const count = window.innerWidth < 768 ? 16000 : spec.count

  engine = await window.makeEngine(canvas, {
    species: spec.palette.length,
    count,
    palette: spec.palette,          // 色盤 = 照片量化出的 7 主色
    seedPattern: spec.pattern,      // 開場即人像
    preset: 'nebula',
    forceFactor: NEBULA_FORCE,
    friction: 0.4,
    minR: 4,
    rMax: 55,
    repel: 1.0,
    simSpeed: 0.3,                  // 慢動作擴散（渲染仍全速）— 使用者指定再放慢
    cameraZoom: 1,
    pointSize: 0.9,
    particleOpacity: 1,
    showGlow: false,
    cellSubdivisions: 2,
    bgFade: 'rgba(10,10,12,0.18)',  // CPU fallback 的殘影洗刷色（同面板底色）
  })
  backend.value = engine.backend

  // 先讓引擎渲染出人形（兩幀足夠，慢速下粒子幾乎沒動），再凍結
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  syncPause()

  canvas.addEventListener('pointerenter', handleEnter)
  canvas.addEventListener('pointerleave', handleLeave)
  canvas.addEventListener('pointermove', handlePointer)
  canvas.addEventListener('click', handleClick)

  // 效能守則：分頁隱藏、捲出視窗都凍結
  onVisibility = () => syncPause()
  document.addEventListener('visibilitychange', onVisibility)
  io = new IntersectionObserver(
    (entries) => { inView = entries[0].isIntersecting; syncPause() },
    { threshold: 0.05 },
  )
  io.observe(canvas)
})

function handleEnter() {
  hovering = true
  syncPause()
  // 擴散期間掛低強度代謝 + 亂流，氣體才有流動感；潮汐/呼吸太暴力不開
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
  syncPause()                        // 凍在擴散到一半的樣子
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

// ---------------------------------------------------------------------------
// 倒帶重組 — 把目前擴散狀態讀回 CPU，與人像目標點做同物種就近配對，
// 再以 easing 逐幀把插值位置上傳回引擎（借用 respawn + 臨時 pattern，
// 不需改引擎）。視覺上 = 煙霧倒流回人形。
// ---------------------------------------------------------------------------
function buildTargets(N, W, H) {
  // 與 particle-image.js registerPattern 相同的 contain-fit 映射
  const boxW = W * spec.fit, boxH = H * spec.fit
  const s = Math.min(boxW / spec.aspect, boxH)
  const drawW = s * spec.aspect, drawH = s
  const x0 = (W - drawW) / 2, y0 = (H - drawH) / 2
  const tx = new Float32Array(N)
  const ty = new Float32Array(N)
  const tt = new Uint8Array(N)
  const T = spec.palette.length
  for (let i = 0; i < N; i++) {
    const j = i % spec.count
    tx[i] = x0 + spec.px[j] * drawW
    ty[i] = y0 + spec.py[j] * drawH
    tt[i] = spec.types[j] % T
  }
  return { tx, ty, tt }
}

async function rewind() {
  if (!engine || rewinding) return
  if (!engine.readParticles) { engine.respawn(); return }   // CPU fallback：瞬間重組
  rewinding = true
  syncPause()                                  // 倒帶期間引擎必須在跑
  engine.setForce?.(0)                         // 關掉星雲力場，避免和倒帶打架

  const snap = await engine.readParticles()
  const N = snap.length
  const { W, H } = engine.size
  const { tx, ty, tt } = buildTargets(N, W, H)

  // 同物種內以「掃描線順序」配對（近似就近，避免粒子交錯亂飛）
  const T = spec.palette.length
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

  // 臨時 pattern：每幀把插值後的位置整批寫回（速度歸零）
  const frame = { x: curX, y: curY }
  window.PLSeeds.PATTERNS.__rewind = (write, n) => {
    for (let i = 0; i < n; i++) write(i, frame.x[i], frame.y[i], 0, 0, dstT[i])
  }

  const ix = new Float32Array(N), iy = new Float32Array(N)
  frame.x = ix; frame.y = iy
  const start = performance.now()
  const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2)

  await new Promise((done) => {
    const step = () => {
      const u = Math.min(1, (performance.now() - start) / REWIND_MS)
      const e = easeInOut(u)
      for (let i = 0; i < N; i++) {
        ix[i] = curX[i] + (dstX[i] - curX[i]) * e
        iy[i] = curY[i] + (dstY[i] - curY[i]) * e
      }
      engine.respawn('__rewind')
      if (u < 1) requestAnimationFrame(step)
      else done()
    }
    step()
  })

  // 收尾：回到正式人像 pattern 與星雲力場，凍結狀態交還給 hover 邏輯
  engine.setSeedPattern?.(spec.pattern)
  engine.setForce?.(NEBULA_FORCE)
  rewinding = false
  syncPause()
}

onBeforeUnmount(() => {
  if (stopAmbient) stopAmbient()
  if (io) io.disconnect()
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  if (engine) { engine.destroy(); engine = null }
})
</script>

<template>
  <div class="container py-16 md:py-24">
    <section class="mx-auto max-w-2xl text-center">
      <h1 class="text-zh-display-2 text-txt-dark">
        People
      </h1>
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
