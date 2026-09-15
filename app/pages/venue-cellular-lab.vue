<script setup>
// PL.IV 菌落 · 兩種做法對照（內部工具，非公開導覽項目）。
//
// 緣由：使用者拿 Claude sandbox 的「靠左散開 cellular」demo 跟正式站 PL.IV 比，
// 覺得質感不一樣。查下去發現兩邊根本是不同機制：
//
//   demo（見 useVenueCellularLab 下方 buildRightTargets）
//     只給每顆粒子一個很鬆的「拉回菌落中心」的力，紋理完全是 cellular 力矩陣
//     （同物種自吸、異物種互斥）在物理上自己跑出來的——沒有預先排點。
//
//   正式站（Home/Field.vue 的 colonyTargets）
//     先手動排好一批「小坨」座標當目標點，用高 grip 的 morph 把粒子釘上去，
//     cellular 力矩陣只是在旁邊「加強」，不是主要塑形的力。
//
// 這頁把兩種做法各自跑一份，左右並排、同一組粒子預算/色盤/物理參數，
// 讓兩種質感可以直接看、直接比，而不是靠截圖來回猜。
//
// 左：LEFT_* 開頭＝正式站現行做法（colonyTargets 搬過來的簡化版，數值抄
//     Home/Field.vue 的 VENUE_* 常數，這次順手把坨數/坨半徑也一起帶過來）。
// 右：RIGHT_* 開頭＝demo 那種「純物理」做法。

definePageMeta({ layout: false })

useSeoMeta({
  title: '菌落質感對照 · Webconf',
  description: 'PL.IV 菌落兩種做法（手動排點 vs 純物理 cellular）side by side 對照，內部工具。'
})

const { loadParticleKit } = useParticleKit()
const { countFor, maxDpr } = useParticleBudget()

const leftRef = ref(null)
const rightRef = ref(null)
const status = ref('載入中…')
const backendLabel = ref('')

// --- 共用 --------------------------------------------------------------------
const SPECIES = 7
const TAU = Math.PI * 2
// 兩邊都用同一組「菌落該多擠」物理參數 —— 抄 Home/Field.vue 的 VENUE_* 常數
// （那組本身就是照 sandbox demo 卡片：Force 0.90 / Friction 0.30 / Repel 1.00 /
// rMax 84 鎖下來的，minR 44 則是站上另外實測出來的「菌落多大」）。
const PHYS = { forceFactor: 1.0, friction: 0.30, repel: 1.00, minR: 44, rMax: 84, simSpeed: 0.3 }
const PALETTE = ['#7CC8F2', '#A9DEF9', '#4A93C9', '#2A5E96', '#EFE6D2', '#254B82', '#5B86B0']

// 菌落怎麼擺——兩邊共用同一批中心點，只有「中心點裡面怎麼填粒子」不一樣。
const COLONIES = 7
const REGION = { x0: 0.10, x1: 0.90, y0: 0.10, y1: 0.90 }
const RADIUS = [0.11, 0.15]   // 佔畫布短邊的比例。這頁沒有文字要閃，給比 PL.IV 大方一點
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

// --- 左：正式站現行做法（colonyTargets 簡化版，抄 Home/Field.vue）-------------
// 坨數/坨半徑用這次跟使用者調過、比原本更密的版本（見 Field.vue VENUE_BLOBS 的
// 長註解），不是原始的十幾坨。
const LEFT_PRESET = 'cellular'
const LEFT_PULL = 11
const LEFT_GRIP = 55
const LEFT_BLOBS = [18, 30]
const LEFT_BLOB_R = [0.05, 0.11]
const LEFT_SHIMMER_AMP = 7
const LEFT_SHIMMER_MS = 260

function buildLeftTargets (col, N, T) {
  const tx = new Float32Array(N)
  const ty = new Float32Array(N)
  const tt = new Uint8Array(N)
  const blobs = []
  for (const c of col) {
    const k = LEFT_BLOBS[0] + ((Math.random() * (LEFT_BLOBS[1] - LEFT_BLOBS[0] + 1)) | 0)
    for (let b = 0; b < k; b++) {
      const a = Math.random() * TAU
      const rr = c.R * 0.82 * Math.sqrt(Math.random())
      blobs.push({
        x: c.x + Math.cos(a) * rr,
        y: c.y + Math.sin(a) * rr,
        R: c.R * (LEFT_BLOB_R[0] + Math.random() * (LEFT_BLOB_R[1] - LEFT_BLOB_R[0])),
        t: (Math.random() * T) | 0,
      })
    }
  }
  let area = 0
  for (const b of blobs) area += b.R * b.R
  let i = 0
  for (let bi = 0; bi < blobs.length; bi++) {
    const b = blobs[bi]
    const share = bi === blobs.length - 1 ? N - i : Math.round(N * (b.R * b.R) / area)
    for (let n = 0; n < share && i < N; n++, i++) {
      const a = Math.random() * TAU
      const rr = b.R * Math.sqrt(Math.random())
      tx[i] = b.x + Math.cos(a) * rr
      ty[i] = b.y + Math.sin(a) * rr
      tt[i] = b.t
    }
  }
  return { tx, ty, tt }
}

// --- 右：demo 的「純物理」做法 -------------------------------------------------
// 每顆粒子的目標點就是自己那顆菌落的中心，沒有更多結構 —— grip/pull 給得很鬆，
// 只夠把粒子攔在菌落範圍內，剩下全部交給 cellular 力矩陣自己組織。
// 這一支不需要 shimmer：它本來就沒有靜止解，會一直自己重組（demo 的 leftScatter
// 也是同樣道理，見 sandbox 原始碼 step() 那段長註解）。
// ⚠️ 原本這裡沒開 shimmer，理由是「cellular 沒有靜止解，會自己一直動」——
// 理論上對，但跟 Home/Field.vue 的 VENUE_SHIMMER 長註解講的是同一個坑：
// 實測穩定後殘餘速度只剩 1~2px/s，肉眼看起來還是偏死，尤其菌落黏在一起、
// 力場找到局部平衡之後更明顯。真正的「活」感是週期性換一組目標點偏移逼出來的
//（每輪都有一個新目標要追，而不是等物理自己殘留一點抖動），所以還是要開，
// 幅度跟左邊用同一組（VENUE_SHIMMER 的原始值），純物理不代表不需要它。
const RIGHT_PRESET = 'cellular'
const RIGHT_PULL = 3
const RIGHT_GRIP = 14
const RIGHT_SHIMMER_AMP = 7
const RIGHT_SHIMMER_MS = 260

function buildRightTargets (col, N, T) {
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

// --- 每一側各自的引擎生命週期 --------------------------------------------------
function makeSide (canvasRef, { preset, pull, grip, buildTargets, shimmerAmp, shimmerMs }) {
  let engine = null
  let raf = 0
  let shapes = null
  let shimmerT0 = 0
  let shimmerCycle = -1
  let ready = false

  function jitterXY (base, amp) {
    if (!amp) return base
    const out = new Float32Array(base.length)
    for (let i = 0; i < base.length; i += 2) {
      const a = Math.random() * TAU
      const r = amp * (0.3 + 0.7 * Math.random())
      out[i] = base[i] + Math.cos(a) * r
      out[i + 1] = base[i + 1] + Math.sin(a) * r
    }
    return out
  }

  async function init () {
    const canvas = canvasRef.value
    if (!canvas) return
    const count = countFor(canvas, { density: 0.045, max: 26000, min: 8000 })
    engine = await window.makeEngine(canvas, {
      species: SPECIES,
      count,
      palette: PALETTE,
      preset,
      forceFactor: PHYS.forceFactor,
      friction: PHYS.friction,
      repel: PHYS.repel,
      minR: PHYS.minR,
      rMax: PHYS.rMax,
      simSpeed: PHYS.simSpeed,
      cameraZoom: 1.0,
      pointSize: 1.1,
      particleOpacity: 0.55,
      showGlow: true,
      glowSize: 4.2,
      glowIntensity: 0.021,
      glowSteepness: 5,
      cellSubdivisions: 2,
      maxDpr: maxDpr(),
    })
    backendLabel.value = engine.backend

    await new Promise((r) => {
      let n = 0
      const tick = () => (++n < 8 ? requestAnimationFrame(tick) : r())
      requestAnimationFrame(tick)
    })

    const { W, H } = engine.size
    const col = placeColonies(W, H)
    const snap = await engine.readParticles()
    const targets = buildTargets(col, snap.length, SPECIES)
    // 直接用 slot 當索引：不用同物種配對（colonyTargets 也是這樣，見 Field.vue
    // 的長註解——物種在這裡只用來配色，不必守「同物種內最短路徑配對」）
    const shape = new Float32Array(snap.length * 2)
    for (let i = 0; i < snap.length; i++) {
      const slot = snap[i].slot
      shape[slot * 2] = targets.tx[i]
      shape[slot * 2 + 1] = targets.ty[i]
    }
    shapes = shape
    engine.setTargets(shape, shape)
    engine.setMorph?.(pull, grip, 1)
    ready = true
    shimmerT0 = performance.now()
    loop()
  }

  function loop (now) {
    raf = requestAnimationFrame(loop)
    if (!engine || !ready) return
    if (shimmerAmp) {
      const t = now || performance.now()
      const cycle = Math.floor((t - shimmerT0) / shimmerMs)
      if (cycle !== shimmerCycle) {
        shimmerCycle = cycle
        const j = jitterXY(shapes, shimmerAmp)
        engine.setTargets(j, j)
      }
    }
  }

  function destroy () {
    if (raf) cancelAnimationFrame(raf)
    if (engine) { engine.destroy(); engine = null }
    ready = false
  }

  return { init, destroy }
}

let left = null
let right = null

async function boot () {
  status.value = '載入粒子引擎…'
  await loadParticleKit()
  left = makeSide(leftRef, { preset: LEFT_PRESET, pull: LEFT_PULL, grip: LEFT_GRIP, buildTargets: buildLeftTargets, shimmerAmp: LEFT_SHIMMER_AMP, shimmerMs: LEFT_SHIMMER_MS })
  right = makeSide(rightRef, { preset: RIGHT_PRESET, pull: RIGHT_PULL, grip: RIGHT_GRIP, buildTargets: buildRightTargets, shimmerAmp: RIGHT_SHIMMER_AMP, shimmerMs: RIGHT_SHIMMER_MS })
  await Promise.all([left.init(), right.init()])
  status.value = ''
}

async function reseed () {
  status.value = '重新播種…'
  left?.destroy()
  right?.destroy()
  await boot()
}

onMounted(() => { boot() })
onBeforeUnmount(() => { left?.destroy(); right?.destroy() })
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0c] px-6 py-10 text-[#EFE6D2]">
    <div class="mx-auto max-w-[1400px]">
      <h1 class="font-en-serif text-[28px] italic">
        PL.IV 菌落質感對照
      </h1>
      <p class="mt-2 max-w-[70ch] text-[14px] leading-relaxed text-[#EFE6D2]/60">
        左：正式站現行做法（手動排點 + 高 grip 釘住，cellular 力矩陣只是加強）。
        右：sandbox demo 那種做法（只給很鬆的中心拉力，紋理完全靠 cellular 力矩陣自己跑出來）。
        物理參數（force/friction/repel/rMax/minR）、色盤、粒子預算兩邊相同，只有「怎麼決定目標點」不一樣。
      </p>
      <div class="mt-4 flex items-center gap-4 text-[12px] text-[#EFE6D2]/50">
        <span>{{ status || `backend: ${backendLabel}` }}</span>
        <button
          class="border border-[#EFE6D2]/30 px-3 py-1 hover:border-[#7CC8F2] hover:text-[#7CC8F2]"
          @click="reseed"
        >
          ↺ 重新播種
        </button>
      </div>

      <!-- ⚠️ 這裡故意不用 lg:grid-cols-2 —— 這支新頁面第一次用這個 class 組合時，
           Tailwind 的 JIT 沒有把帶 lg: 前綴的 grid-cols-2 編譯進 CSS（開發環境快取
           踩坑，實測 devtools 裡完全找不到那條 @media 規則），兩張 canvas 因此疊在
           同一欄、同寬同高地蓋在一起，畫面看起來像一團看不懂的東西。
           grid-cols-2（不帶前綴）已經是全站在用的 class，不會有同樣的快取問題；
           這頁是內部工具，不必照顧手機版面，所以固定兩欄也沒差。
           每個格子再加 min-w-0——grid item 預設 min-width:auto，canvas 的
           width/height 屬性（backing store 解析度）在某些瀏覽器會被算進 auto
           的最小寬度，一樣可能撐破欄位，min-w-0 保險關掉。 -->
      <div class="mt-6 grid grid-cols-2 gap-6 overflow-x-hidden">
        <div class="min-w-0 border border-[#EFE6D2]/20 p-3">
          <p class="mb-2 border-b border-[#EFE6D2]/20 pb-2 text-[12px] uppercase tracking-[0.16em] text-[#7CC8F2]">
            左 · 現行做法（手動排點）
          </p>
          <canvas ref="leftRef" class="block aspect-square w-full bg-black" />
        </div>
        <div class="min-w-0 border border-[#EFE6D2]/20 p-3">
          <p class="mb-2 border-b border-[#EFE6D2]/20 pb-2 text-[12px] uppercase tracking-[0.16em] text-[#7CC8F2]">
            右 · 純物理（cellular 力矩陣自己長）
          </p>
          <canvas ref="rightRef" class="block aspect-square w-full bg-black" />
        </div>
      </div>
    </div>
  </div>
</template>
