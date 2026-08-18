<script setup>
// People — 人物「活體標本」點雲。
// 照片離線去背 + 取樣成 JSON 點資料（docs/people-src/：cutout.swift → cleanup.py → bake.py），
// 網站只載點資料不載原圖。原理與工作流見 docs/point-cloud-effect.md。
//
// 兩個 canvas：
//   1. sticky 三講師 — GSAP ScrollTrigger：右側區塊捲到畫面中央時，粒子群集體
//      遷徙、換色盤，從上一位講師「流」成下一位（people-01 → 02 → 03）。
//   2. 底部示範 — 單一人像：hover 擴散 → 離開凍結 → 點擊倒帶重組。
useSeoMeta({
  title: '講者陣容 · Webconf',
  description: '認識 WebConf Taiwan 的講者陣容。',
  ogTitle: '講者陣容 · Webconf',
  ogDescription: '認識 WebConf Taiwan 的講者陣容。',
  twitterTitle: '講者陣容 · Webconf',
  twitterDescription: '認識 WebConf Taiwan 的講者陣容。'
})

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
// 三講師 sticky canvas — 捲動綁定漸變（scrub）
// 漸變進度直接綁在捲動位置上：每個講師區塊的頂邊從畫面 100%（底）移到 70% 的這段
// 捲動過程 = 這位講師從上一位「長」出來；此範圍以外一律定格在完成樣子（看得清楚）。
// 逆向捲動自動倒放。不用計時器、不讀回粒子，端點都是預先算好的人像目標點，可任意 scrub。
// ===========================================================================
const SPECS = []
const PAIRINGS = []              // 相鄰兩人的配對（PAIRINGS[s]：人 s → 人 s+1）
const PAIR_LIN = []             // 對應的線性光色盤（換色插值用）
let stickyEngine = null
let stickyIO = null, stickyOnVis = null
let stickyInView = true
let stickyTriggers = []
let stickyN = 0
let stickyIX = null, stickyIY = null, stickyTT = null
const blockEls = ref([])

function syncStickyPause() {
  // 在視窗內且分頁可見才讓引擎渲染（力場為 0、只重繪定格畫面，成本低）；離屏即凍結保留末幀
  if (stickyEngine) stickyEngine.pause(!(stickyInView && !document.hidden))
}

// 相鄰兩人像的粒子配對：同物種內以掃描線順序就近配對（正規化座標排序，跨解析度穩定）。
// 回傳每顆粒子在 A / B 的取樣索引與物種 t；端點都是完整人像，任意 e 插值都成立。
function buildPairing(A, B, N) {
  const T = Math.min(A.palette.length, B.palette.length)
  const aByType = Array.from({ length: T }, () => [])
  const bByType = Array.from({ length: T }, () => [])
  for (let i = 0; i < N; i++) { const j = i % A.count; aByType[A.types[j] % T].push(i) }
  for (let m = 0; m < N; m++) { const j = m % B.count; bByType[B.types[j] % T].push(m) }
  const orderA = (i) => { const j = i % A.count; return A.py[j] * 4096 + A.px[j] }
  const orderB = (m) => { const j = m % B.count; return B.py[j] * 4096 + B.px[j] }
  const aSample = new Int32Array(N), bSample = new Int32Array(N), tt = new Uint8Array(N)
  let cursor = 0
  const leftA = [], leftB = []
  for (let t = 0; t < T; t++) {
    const a = aByType[t].sort((x, y) => orderA(x) - orderA(y))
    const b = bByType[t].sort((x, y) => orderB(x) - orderB(y))
    const n = Math.min(a.length, b.length)
    for (let k = 0; k < n; k++, cursor++) {
      aSample[cursor] = a[k] % A.count; bSample[cursor] = b[k] % B.count; tt[cursor] = t
    }
    for (let k = n; k < a.length; k++) leftA.push(a[k])
    for (let k = n; k < b.length; k++) leftB.push(b[k])
  }
  for (let k = 0; k < leftB.length && cursor < N; k++, cursor++) {
    const ai = leftA[k % Math.max(1, leftA.length)]
    const bm = leftB[k]
    aSample[cursor] = ai != null ? ai % A.count : bm % B.count
    bSample[cursor] = bm % B.count; tt[cursor] = B.types[bm % B.count] % T
  }
  for (; cursor < N; cursor++) {  // A 較多的殘餘：留在原地（e=1 收合回自身）
    aSample[cursor] = cursor % A.count; bSample[cursor] = cursor % A.count; tt[cursor] = A.types[cursor % A.count] % T
  }
  return { aSample, bSample, tt }
}

// 某 spec 的 contain-fit 置中參數（與 particle-image.js registerPattern 一致）
function fitParams(sp, W, H) {
  const boxW = W * sp.fit, boxH = H * sp.fit
  const s = Math.min(boxW / sp.aspect, boxH)
  const drawW = s * sp.aspect, drawH = s
  return { x0: (W - drawW) / 2, y0: (H - drawH) / 2, drawW, drawH }
}

// 依目前捲動把整體相位（0..n-1）拆成「第 seg 段 + 段內進度 e」，插值位置與色盤後整批上傳。
// 相位 = 各 trigger progress 之和：較早的段已達 1、較晚的段仍 0，故任一時刻只有一段在 (0,1)，
// 且段邊界兩側相位一致（seg 段 e=1 = seg+1 段 e=0 = 同一人）→ 不論 onUpdate 次序都一致。
function renderSticky() {
  if (!stickyEngine || !stickyIX) return
  const n = SPECS.length
  let phase = 0
  for (const t of stickyTriggers) phase += t.progress
  let seg = Math.floor(phase)
  if (seg < 0) seg = 0
  if (seg > n - 2) seg = n - 2
  let e = Math.min(1, Math.max(0, phase - seg))
  e = e * e * (3 - 2 * e)                       // smoothstep：兩端自然收尾
  const A = SPECS[seg], B = SPECS[seg + 1], pr = PAIRINGS[seg]
  const { W, H } = stickyEngine.size
  const fa = fitParams(A, W, H), fb = fitParams(B, W, H)
  const N = stickyN, ix = stickyIX, iy = stickyIY
  for (let i = 0; i < N; i++) {
    const ja = pr.aSample[i], jb = pr.bSample[i]
    const ax = fa.x0 + A.px[ja] * fa.drawW, ay = fa.y0 + A.py[ja] * fa.drawH
    const bx = fb.x0 + B.px[jb] * fb.drawW, by = fb.y0 + B.py[jb] * fb.drawH
    ix[i] = ax + (bx - ax) * e; iy[i] = ay + (by - ay) * e
  }
  stickyTT = pr.tt
  stickyEngine.setColors?.(lerpPaletteLinear(PAIR_LIN[seg].a, PAIR_LIN[seg].b, e))
  stickyEngine.respawn('__sticky')
}

async function initSticky() {
  const canvas = canvasStickyRef.value
  if (!canvas) return

  // 三份點資料 → prepareFromData（各自註冊一個 seed pattern，回傳 px/py/types）
  const datas = await Promise.all(PEOPLE.map(p => $fetch(p.json)))
  for (const d of datas) SPECS.push(window.PLImage.prepareFromData(d))

  const first = SPECS[0]
  const count = window.innerWidth < 768 ? 16000 : first.count
  stickyN = count
  stickyIX = new Float32Array(count)
  stickyIY = new Float32Array(count)

  // 預先算好相鄰兩人的配對與線性光色盤（scrub 時只做 O(N) 插值，不再排序）
  for (let s = 0; s < SPECS.length - 1; s++) {
    PAIRINGS.push(buildPairing(SPECS[s], SPECS[s + 1], count))
    PAIR_LIN.push({ a: paletteToLinear(SPECS[s].palette), b: paletteToLinear(SPECS[s + 1].palette) })
  }
  stickyTT = PAIRINGS[0].tt

  // 一次註冊臨時 pattern，讀 module 級的 ix/iy/tt（renderSticky 每次更新其內容後 respawn）
  window.PLSeeds.PATTERNS.__sticky = (write, nn) => {
    for (let i = 0; i < nn; i++) write(i, stickyIX[i], stickyIY[i], 0, 0, stickyTT[i])
  }

  stickyEngine = await window.makeEngine(canvas, {
    species: first.palette.length,
    count,
    palette: first.palette,
    seedPattern: first.pattern,
    preset: 'nebula',
    forceFactor: 0,                 // 無演化力：位置完全由 scrub 插值決定
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

  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

  // 效能守則：離屏 / 分頁隱藏都凍結（保留末幀）
  stickyOnVis = () => syncStickyPause()
  document.addEventListener('visibilitychange', stickyOnVis)
  stickyIO = new IntersectionObserver(
    (entries) => { stickyInView = entries[0].isIntersecting; syncStickyPause() },
    { threshold: 0.05 },
  )
  stickyIO.observe(canvas)
  syncStickyPause()

  // GSAP ScrollTrigger（scrub）：每個「後續」講師區塊的頂邊 100%→70% 這段捲動 = 上一位漸變成它。
  // 第 s 段（人 s→s+1）綁在 blockEls[s+1] 上；scrub 讓進度跟著捲動、可逆。
  const { $ScrollTrigger } = useNuxtApp()
  if ($ScrollTrigger) {
    for (let s = 0; s < SPECS.length - 1; s++) {
      const el = blockEls.value[s + 1]
      if (!el) continue
      stickyTriggers.push($ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',      // 區塊頂邊在畫面 100%（底）→ 進度 0
        end: 'top 70%',           // 區塊頂邊到畫面 70% → 進度 1，之後定格
        scrub: true,
        onUpdate: renderSticky,
        onRefresh: renderSticky,  // 尺寸變動 / 重整時重算定格畫面
      }))
    }
    $ScrollTrigger.refresh()
    renderSticky()               // 初始定格在第一位講師
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

// ===========================================================================
// 使用者自製粒子卡片 — 上傳照片 → @imgly 瀏覽器端 AI 去背 → 取樣成點雲 → 下載 JSON
// 全程在瀏覽器：去背模型（ISNet quint8，首次約 56MB，之後快取）與取樣都不經伺服器，
// 產出的 JSON 與 people-0N.json 同格式（prepareFromData 可直接載入）。
// ===========================================================================
const cardCanvasRef = ref(null)
const cardVideoRef = ref(null)
const cardState = ref('idle')      // idle | camera | removing | sampling | ready | error
const cardProgress = ref(0)        // 去背/模型下載進度 %
const cardError = ref('')
const cardFileName = ref('')
let cardEngine = null
let cardSpec = null
let cardCutoutUrl = null
let cardStream = null
let cardIO = null, cardOnVis = null
let cardInView = true, cardHovering = false, cardRewinding = false, cardStopAmbient = null

function syncCardPause() {
  if (cardEngine) cardEngine.pause(!((cardHovering || cardRewinding) && cardInView && !document.hidden))
}

// 上傳檔或拍照 → 共用處理管線：@imgly 去背 → PLImage 取樣 → 掛引擎
async function processCardSource(src, name) {
  if (!window.PLImage) return
  cardFileName.value = name
  cardError.value = ''
  cardProgress.value = 0
  try {
    cardState.value = 'removing'
    // 動態載入（純瀏覽器、SSR 不打包）；首次會下載去背模型
    const { removeBackground } = await import('@imgly/background-removal')
    const blob = await removeBackground(src, {
      model: 'isnet_quint8',                 // 最小的量化模型；換 isnet_fp16 品質更好但更大
      output: { format: 'image/png' },       // 帶 alpha 的去背 PNG
      progress: (_key, current, total) => {
        if (total) cardProgress.value = Math.min(100, Math.round((current / total) * 100))
      },
    })
    if (cardCutoutUrl) URL.revokeObjectURL(cardCutoutUrl)
    cardCutoutUrl = URL.createObjectURL(blob)

    cardState.value = 'sampling'
    const count = window.innerWidth < 768 ? 16000 : 24000
    cardSpec = await window.PLImage.prepare(cardCutoutUrl, { count, name: 'card', colors: 7 })
    await mountCardEngine(count)
    cardState.value = 'ready'
  } catch (e) {
    cardError.value = (e && e.message) || String(e)
    cardState.value = 'error'
  }
}

function onCardFile(ev) {
  const file = ev.target?.files?.[0]
  if (file && file.type.startsWith('image/')) processCardSource(file, file.name)
  if (ev.target) ev.target.value = ''         // 允許重選同一檔
}

// 直接拍照：開啟相機即時預覽 → 拍攝一張當作來源
async function startCamera() {
  cardError.value = ''
  if (!navigator.mediaDevices?.getUserMedia) {
    cardError.value = '此裝置 / 瀏覽器不支援相機'
    cardState.value = 'error'
    return
  }
  try {
    cardStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
      audio: false,
    })
    cardState.value = 'camera'
    await nextTick()
    const v = cardVideoRef.value
    if (v) { v.srcObject = cardStream; await v.play() }
  } catch (e) {
    cardError.value = '無法開啟相機：' + ((e && e.message) || e)
    cardState.value = 'error'
  }
}
function stopCamera() {
  if (cardStream) { cardStream.getTracks().forEach(t => t.stop()); cardStream = null }
}
async function capturePhoto() {
  const v = cardVideoRef.value
  if (!v || !v.videoWidth) return
  const w = v.videoWidth, h = v.videoHeight
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  c.getContext('2d').drawImage(v, 0, 0, w, h)
  stopCamera()
  const blob = await new Promise(res => c.toBlob(res, 'image/png'))
  await processCardSource(blob, 'camera-photo')
}
function cancelCamera() {
  stopCamera()
  cardState.value = 'idle'
}

async function mountCardEngine(count) {
  const canvas = cardCanvasRef.value
  if (!canvas) return
  if (cardEngine) { cardEngine.destroy(); cardEngine = null }
  cardEngine = await window.makeEngine(canvas, {
    species: cardSpec.palette.length,
    count,
    palette: cardSpec.palette,
    seedPattern: cardSpec.pattern,
    preset: 'nebula',
    forceFactor: NEBULA_FORCE,
    friction: 0.4, minR: 4, rMax: 55, repel: 1.0,
    simSpeed: 0.3, cameraZoom: 1, pointSize: 0.9,
    particleOpacity: 1, showGlow: false, cellSubdivisions: 2,
    bgFade: 'rgba(10,10,12,0.18)',
  })
  if (!backend.value) backend.value = cardEngine.backend
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  syncCardPause()
  if (!cardIO) {
    cardOnVis = () => syncCardPause()
    document.addEventListener('visibilitychange', cardOnVis)
    cardIO = new IntersectionObserver(
      (es) => { cardInView = es[0].isIntersecting; syncCardPause() },
      { threshold: 0.05 },
    )
    cardIO.observe(canvas)
  }
}

// 卡片互動：與示範 canvas 同款（hover 擴散 + 亂流、離開凍結、點擊倒帶重組）
function onCardEnter() {
  cardHovering = true; syncCardPause()
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!cardStopAmbient && !reduced && window.PLAmbient) {
    cardStopAmbient = window.PLAmbient.start(() => (cardRewinding ? null : cardEngine), { breath: false, tide: false, intensity: 0.4 })
  }
}
function onCardLeave() {
  cardHovering = false; syncCardPause()
  if (cardStopAmbient) { cardStopAmbient(); cardStopAmbient = null }
}
function onCardMove(ev) {
  if (!cardEngine || !cardHovering || cardRewinding) return
  const r = ev.currentTarget.getBoundingClientRect()
  const { W, H } = cardEngine.size
  cardEngine.disturb(((ev.clientX - r.left) / r.width) * W, ((ev.clientY - r.top) / r.height) * H, 180, 6)
}
async function onCardClick() {
  if (!cardEngine || cardRewinding || !cardSpec) return
  if (!cardEngine.readParticles) { cardEngine.respawn(); return }
  cardRewinding = true; syncCardPause()
  await tweenToSpec(cardEngine, cardSpec, REWIND_MS, '__tween_card')
  cardEngine.setForce?.(NEBULA_FORCE)
  cardRewinding = false; syncCardPause()
}

function downloadCardJSON() {
  if (!cardSpec) return
  const blob = new Blob([JSON.stringify(cardSpec.data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = (cardFileName.value || 'particle-card').replace(/\.[^.]+$/, '') + '.json'
  a.click()
  URL.revokeObjectURL(url)
}
function resetCard() {
  stopCamera()
  if (cardEngine) { cardEngine.destroy(); cardEngine = null }
  if (cardCutoutUrl) { URL.revokeObjectURL(cardCutoutUrl); cardCutoutUrl = null }
  cardSpec = null
  cardState.value = 'idle'
  cardProgress.value = 0
  cardError.value = ''
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

  if (cardStopAmbient) cardStopAmbient()
  if (cardIO) cardIO.disconnect()
  if (cardOnVis) document.removeEventListener('visibilitychange', cardOnVis)
  if (cardEngine) { cardEngine.destroy(); cardEngine = null }
  if (cardCutoutUrl) URL.revokeObjectURL(cardCutoutUrl)
  stopCamera()
})
</script>

<template>
  <div class="bg-black text-txt-white">
    <section class="text-center container h-screen flex items-center justify-center">
      <h1 class="text-h2 text-txt-white">
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
          class="flex flex-col min-h-screen justify-center text-body gap-4"
        >
          <h2 class="text-h2">{{ p.title }}</h2>
          <p class="text-body">{{ p.body }}</p>
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

    <!-- 使用者自製粒子卡片 -->
    <section class="mx-auto mt-20 max-w-3xl md:mt-28">
      <h2 class="text-h2 mb-2">
        做你自己的粒子卡片
      </h2>
      <p class="text-body-lg mb-4 text-neutral-400">
        上傳一張人像照，瀏覽器會自動去背、轉成粒子點雲，可下載成 JSON 卡片資料。全程在你的裝置上完成，照片不會上傳伺服器。
      </p>
      <div class="relative overflow-hidden rounded-2xl bg-[#0a0a0c]">
        <canvas
          ref="cardCanvasRef"
          class="block h-[72vh] min-h-[420px] w-full"
          :class="cardState === 'ready' ? 'cursor-crosshair' : 'pointer-events-none'"
          @pointerenter="onCardEnter"
          @pointerleave="onCardLeave"
          @pointermove="onCardMove"
          @click="onCardClick"
        />
        <!-- 相機即時預覽（拍照模式）；video 常駐但只在 camera 狀態顯示 -->
        <video
          ref="cardVideoRef"
          class="absolute inset-0 h-full w-full -scale-x-100 object-cover"
          :class="cardState === 'camera' ? 'block' : 'hidden'"
          playsinline
          muted
        />
        <div
          v-if="cardState !== 'ready'"
          class="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center"
        >
          <template v-if="cardState === 'idle'">
            <div class="flex flex-wrap items-center justify-center gap-3">
              <label class="cursor-pointer rounded-full border border-neutral-600 px-6 py-3 text-body transition hover:bg-white/5">
                選擇照片
                <input type="file" accept="image/*" class="hidden" @change="onCardFile">
              </label>
              <button class="rounded-full border border-neutral-600 px-6 py-3 text-body transition hover:bg-white/5" @click="startCamera">
                直接拍照
              </button>
            </div>
            <p class="font-mono text-xs tracking-widest text-neutral-500">
              JPG / PNG · 建議清楚的單人正面照
            </p>
          </template>
          <template v-else-if="cardState === 'camera'">
            <div class="flex flex-wrap items-center justify-center gap-3">
              <button class="rounded-full bg-white px-6 py-3 text-body text-black transition hover:bg-neutral-200" @click="capturePhoto">
                拍攝
              </button>
              <button class="rounded-full border border-neutral-600 px-6 py-3 text-body transition hover:bg-white/5" @click="cancelCamera">
                取消
              </button>
            </div>
          </template>
          <template v-else-if="cardState === 'removing'">
            <p class="text-body">
              AI 去背中… {{ cardProgress ? cardProgress + '%' : '' }}
            </p>
            <p class="max-w-sm font-mono text-xs tracking-widest text-neutral-500">
              首次使用需下載去背模型（約 56MB），完成後瀏覽器會快取，下次就很快。
            </p>
          </template>
          <template v-else-if="cardState === 'sampling'">
            <p class="text-body">
              取樣成粒子中…
            </p>
          </template>
          <template v-else-if="cardState === 'error'">
            <p class="text-body text-red-400">
              處理失敗：{{ cardError }}
            </p>
            <button class="rounded-full border border-neutral-600 px-6 py-3 transition hover:bg-white/5" @click="resetCard">
              重試
            </button>
          </template>
        </div>
      </div>
      <div v-if="cardState === 'ready'" class="mt-3 flex flex-wrap items-center justify-between gap-4">
        <p class="font-mono text-xs tracking-widest text-neutral-400">
          YOUR SPECIMEN — hover 擴散 · 點擊倒帶重組
        </p>
        <div class="flex gap-3">
          <button class="rounded-full border border-neutral-600 px-4 py-2 text-sm transition hover:bg-white/5" @click="resetCard">
            換一張
          </button>
          <button class="rounded-full bg-white px-4 py-2 text-sm text-black transition hover:bg-neutral-200" @click="downloadCardJSON">
            下載 JSON
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
