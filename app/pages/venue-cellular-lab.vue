<script setup>
// PL.IV 菌落 · 效果預覽（內部工具，非公開導覽項目，給設計師看用）。
//
// 沿革見 git log 這支檔案——這裡只留「兩種效果 + 一個切換」的展示版本，
// 拿掉了原本三格並排的參數對照（那是拿來自己試參數用的，過程記錄在歷史
// commit 裡，需要回頭比較再翻）。
//
// 用 query string 切換，方便丟連結給設計師：
//   ?effect=cellular   細胞質感（cellular 力矩陣，分開清楚的菌落切面）
//   ?effect=plasma     電漿流動（cellular 混 vortex，帶流動感的變體）
// 切換也可以直接點畫面上的按鈕，按鈕會同步更新網址，所以看到喜歡的樣子時
// 網址列本身就是可以分享的連結。

definePageMeta({ layout: false })

useSeoMeta({
  title: 'PL.IV 菌落效果預覽 · Webconf',
  description: '場地區塊菌落質感的兩個候選方向，細胞質感／電漿流動，可切換預覽。'
})

const route = useRoute()
const router = useRouter()

const { loadParticleKit } = useParticleKit()
const { countFor, maxDpr } = useParticleBudget()

const canvasRef = ref(null)
const status = ref('載入中…')
const current = ref(route.query.effect === 'plasma' ? 'plasma' : 'cellular')

// --- 共用物理參數 --------------------------------------------------------------
// 抄 Home/Field.vue 的 VENUE_* 常數——那組本身就是照 sandbox demo 卡片
//（Force 0.90 / Friction 0.30 / Repel 1.00 / rMax 84）鎖下來的。
const SPECIES = 7
const TAU = Math.PI * 2
const PHYS = { forceFactor: 1.0, friction: 0.30, repel: 1.00, simSpeed: 0.3 }
// 菌落黏在一起的根本原因：placeColonies 留的 GAP 是「邊緣到邊緣」的空隙，但
// 力場的鄰居搜尋半徑是 rMax——只要 rMax 比空隙寬，兩顆菌落邊緣的粒子還是互相
// 看得到、照樣會被同物種吸過去。把 rMax 收到比 GAP 小，菌落之間直接沒有力場
// 可以搭橋，分開純粹靠「粒子看不到隔壁」。
// ⚠️ minR 要跟著等比例縮小——只縮 rMax 會把「同物種真正在互相吸引」的那圈帶寬
//（minR 到 rMax 之間）壓到幾乎沒有，整團會塌成沒有紋理的實心球。
const SEP_RMAX = 62
const SEP_MINR = 30
const PALETTE = ['#7CC8F2', '#A9DEF9', '#4A93C9', '#2A5E96', '#EFE6D2', '#254B82', '#5B86B0']

const COLONIES = 7
const REGION = { x0: 0.10, x1: 0.90, y0: 0.10, y1: 0.90 }
const RADIUS = [0.11, 0.15]
const GAP = 0.10

function placeColonies (W, H) {
  const m = Math.min(W, H)
  const r = REGION
  const minX = W * r.x0; const spanX = W * (r.x1 - r.x0)
  const minY = H * r.y0; const spanY = H * (r.y1 - r.y0)
  const col = []
  for (let c = 0; c < COLONIES; c++) {
    const R = (RADIUS[0] + Math.random() * (RADIUS[1] - RADIUS[0])) * m
    let x = 0; let y = 0
    for (let att = 0; att < 400; att++) {
      x = minX + R + Math.random() * Math.max(1, spanX - 2 * R)
      y = minY + R + Math.random() * Math.max(1, spanY - 2 * R)
      let ok = true
      for (const o of col) {
        const dx = x - o.x; const dy = y - o.y
        const need = o.R + R + GAP * m
        if (dx * dx + dy * dy < need * need) { ok = false; break }
      }
      if (ok) break
    }
    col.push({ x, y, R })
  }
  return col
}

// 目標點只到「菌落中心」，顆粒紋理交給力矩陣連續跑出來——不是預先排點。
function buildColonyCenterTargets (col, N, T) {
  const tx = new Float32Array(N)
  const ty = new Float32Array(N)
  const tt = new Uint8Array(N)
  for (let i = 0; i < N; i++) {
    const c = col[i % col.length]
    tx[i] = c.x
    ty[i] = c.y
    tt[i] = (Math.random() * T) | 0
  }
  return { tx, ty, tt }
}

// 電漿：把 cellular 跟 vortex 兩顆力矩陣按比例混在一起（跟 useParticleKit 的
// registerNebula 同一招，把自訂矩陣塞進 window.PLRules.PRESETS）。純 vortex
// 粒子會被非對稱力一直拖著轉，同物種來不及聚成乾淨色塊就被拖走、糊成一片；
// 混一點 cellular 的自吸/互斥進去，粒子有時間先聚成塊，剩下的非對稱力再讓
// 這些塊慢慢流動。
function registerPlasmaBlend (cellularWeight = 0.55) {
  if (!window.PLRules || window.PLRules.PRESETS['plasma-blend']) return
  window.PLRules.PRESETS['plasma-blend'] = (n) => {
    const a = window.PLRules.get('cellular', n)
    const b = window.PLRules.get('vortex', n)
    const out = new Array(n * n)
    for (let i = 0; i < out.length; i++) out[i] = a[i] * cellularWeight + b[i] * (1 - cellularWeight)
    return out
  }
}

const EFFECTS = {
  cellular: {
    label: '細胞質感',
    preset: 'cellular',
    pull: 9,
    grip: 30,
    friction: PHYS.friction,
    simSpeed: PHYS.simSpeed,
    shimmerAmp: 7,
    shimmerMs: 260,
    driftMode: 'shimmer',
  },
  plasma: {
    label: '電漿流動',
    preset: 'plasma-blend',
    pull: 7,
    grip: 22,
    friction: 0.30,
    simSpeed: 0.22,
    shimmerAmp: 26,
    shimmerMs: 0,
    driftMode: 'colony',
  },
}

// --- 引擎生命週期 --------------------------------------------------------------
let engine = null
let raf = 0
let shapes = null
let shimmerT0 = 0
let shimmerCycle = -1
let ready = false
let slotColony = null
let colonyPhase = null
let driftBuf = null
let driftT0 = 0
let driftFrame = 0
let activeCfg = null

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

// 整顆菌落一起漂（電漿用）：同一顆菌落的粒子全部加上同一個位移，力矩陣已經
// 長出來的內部結構完全不受影響，只是整團被平移——跟「每顆粒子各自重新隨機」
// 的 shimmer 完全不同，後者會把粒子打散重新分配，結構才剛開始組織就被打斷，
// 肉眼看到的是均勻雜訊（繡球花）。用兩個不同頻率的正弦疊加，連續、平滑、
// 永不精確重複。
function driftOffset (colonyIdx, t, amp) {
  const ph = colonyPhase[colonyIdx]
  const s = t * 0.00035
  const dx = (Math.sin(s * 1.7 + ph) * 0.6 + Math.sin(s * 0.63 + ph * 2.1) * 0.4) * amp
  const dy = (Math.cos(s * 1.3 + ph * 1.4) * 0.6 + Math.sin(s * 0.81 + ph * 3.2) * 0.4) * amp
  return [dx, dy]
}

async function boot (name) {
  const cfg = EFFECTS[name]
  activeCfg = cfg
  const canvas = canvasRef.value
  if (!canvas) return
  const count = countFor(canvas, { density: 0.085, max: 42000, min: 8000 })
  engine = await window.makeEngine(canvas, {
    species: SPECIES,
    count,
    palette: PALETTE,
    preset: cfg.preset,
    forceFactor: PHYS.forceFactor,
    friction: cfg.friction,
    repel: PHYS.repel,
    minR: SEP_MINR,
    rMax: SEP_RMAX,
    simSpeed: cfg.simSpeed,
    cameraZoom: 1.0,
    // 點徑/不透明度：密度加高解決單顆內部太疏的網點感，但點徑/不透明度不能
    // 一起加太多——大量高不透明度的點加法疊加，會被 HDR tonemap 壓過曝、糊成
    // 一片。核心的 fragment shader 本身是銳利邊緣（fwidth 抗鋸齒），糊感是
    // 疊加出來的，不是形狀問題。
    pointSize: 1.55,
    particleOpacity: 0.58,
    // 沒有光暈——參考稿是銳利的點，沒有螢光暈開的感覺，光暈只會把切面糊掉。
    showGlow: false,
    cellSubdivisions: 2,
    maxDpr: maxDpr(),
  })

  await new Promise((r) => {
    let n = 0
    const tick = () => (++n < 8 ? requestAnimationFrame(tick) : r())
    requestAnimationFrame(tick)
  })

  const { W, H } = engine.size
  const col = placeColonies(W, H)
  const snap = await engine.readParticles()
  const targets = buildColonyCenterTargets(col, snap.length, SPECIES)
  const shape = new Float32Array(snap.length * 2)
  const wantColonyDrift = cfg.driftMode === 'colony'
  if (wantColonyDrift) slotColony = new Uint8Array(snap.length)
  for (let i = 0; i < snap.length; i++) {
    const slot = snap[i].slot
    shape[slot * 2] = targets.tx[i]
    shape[slot * 2 + 1] = targets.ty[i]
    if (slotColony) slotColony[slot] = i % col.length
  }
  shapes = shape
  if (wantColonyDrift) {
    colonyPhase = new Float32Array(col.length)
    for (let c = 0; c < col.length; c++) colonyPhase[c] = Math.random() * TAU
    driftBuf = new Float32Array(shape.length)
    driftT0 = performance.now()
    driftFrame = 0
  }
  engine.setTargets(shape, shape)
  engine.setMorph?.(cfg.pull, cfg.grip, 1)
  ready = true
  shimmerT0 = performance.now()
  shimmerCycle = -1
  loop()
}

function loop (now) {
  raf = requestAnimationFrame(loop)
  if (!engine || !ready || !activeCfg) return
  const t = now || performance.now()
  if (activeCfg.driftMode === 'colony') {
    driftFrame++
    if (activeCfg.shimmerAmp && driftFrame % 3 === 0) {
      const cdx = new Float32Array(colonyPhase.length)
      const cdy = new Float32Array(colonyPhase.length)
      for (let c = 0; c < colonyPhase.length; c++) {
        const [dx, dy] = driftOffset(c, t - driftT0, activeCfg.shimmerAmp)
        cdx[c] = dx; cdy[c] = dy
      }
      for (let i = 0; i < slotColony.length; i++) {
        const c = slotColony[i]
        driftBuf[i * 2] = shapes[i * 2] + cdx[c]
        driftBuf[i * 2 + 1] = shapes[i * 2 + 1] + cdy[c]
      }
      engine.setTargets(driftBuf, driftBuf)
    }
    return
  }
  if (activeCfg.shimmerAmp) {
    const cycle = Math.floor((t - shimmerT0) / activeCfg.shimmerMs)
    if (cycle !== shimmerCycle) {
      shimmerCycle = cycle
      const j = jitterXY(shapes, activeCfg.shimmerAmp)
      engine.setTargets(j, j)
    }
  }
}

function teardown () {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  ready = false
  slotColony = null
  colonyPhase = null
  driftBuf = null
  if (engine) { engine.destroy(); engine = null }
}

async function start (name) {
  status.value = '載入中…'
  teardown()
  await boot(name)
  status.value = ''
}

async function switchEffect (name) {
  if (name === current.value && engine) { await reseed(); return }
  current.value = name
  router.replace({ query: { ...route.query, effect: name } })
  await start(name)
}

async function reseed () {
  status.value = '重新產生…'
  await start(current.value)
}

onMounted(async () => {
  await loadParticleKit()
  registerPlasmaBlend()
  await start(current.value)
})
onBeforeUnmount(() => teardown())
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0c] px-6 py-10 text-[#EFE6D2]">
    <div class="mx-auto max-w-[820px]">
      <h1 class="font-en-serif text-[26px] italic">
        PL.IV 場地菌落 · 效果預覽
      </h1>
      <p class="mt-2 max-w-[60ch] text-[14px] leading-relaxed text-[#EFE6D2]/60">
        兩個候選方向：細胞質感（分開清楚的菌落，每顆內部是密實的多邊形切面）、
        電漿流動（在細胞質感之外疊一點流動感，色塊會慢慢變化）。
      </p>

      <div class="mt-6 flex flex-wrap items-center gap-4">
        <div class="inline-flex border border-[#EFE6D2]/30">
          <button
            v-for="(cfg, name) in EFFECTS"
            :key="name"
            class="px-4 py-2 text-[13px] transition-colors"
            :class="current === name ? 'bg-[#7CC8F2] text-[#0a0a0c]' : 'text-[#EFE6D2]/70 hover:text-[#7CC8F2]'"
            @click="switchEffect(name)"
          >
            {{ cfg.label }}
          </button>
        </div>
        <button
          class="border border-[#EFE6D2]/30 px-3 py-2 text-[13px] hover:border-[#7CC8F2] hover:text-[#7CC8F2]"
          @click="reseed"
        >
          ↺ 重新產生
        </button>
        <span class="text-[12px] text-[#EFE6D2]/40">{{ status }}</span>
      </div>

      <div class="mt-6 aspect-square w-full border border-[#EFE6D2]/20 bg-black">
        <canvas ref="canvasRef" class="block h-full w-full" />
      </div>
    </div>
  </div>
</template>
