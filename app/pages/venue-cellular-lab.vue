<script setup>
// PL.IV 菌落 · 質感對照（內部工具，非公開導覽項目）。
//
// 緣由：使用者拿 Claude sandbox 的「靠左散開 cellular」demo 跟正式站 PL.IV 比，
// 覺得質感不一樣。查下去發現正式站原本的做法（手動排一批「小坨」座標當目標點、
// 用高 grip 釘住）跟 demo 根本是不同機制——demo 只給每顆粒子一個很鬆的「拉回
// 菌落中心」的力，紋理完全是 cellular 力矩陣（同物種自吸、異物種互斥）在物理上
// 自己跑出來的，沒有預先排點。正式站的 Home/Field.vue colonyTargets 已經改成
// 跟 demo 同一種做法，這頁是拿來驗證/試參數的複本，改動要跟著同步。
//
// 三格用同一組粒子預算/色盤/物理參數，只有目標點／力矩陣／friction 不同：
// 左、中＝同一套「目標點只到菌落中心」做法，比較兩組 pull/grip 候選值；
// 右＝換一顆非對稱的 vortex 力矩陣試「電漿/電流＋黏稠」的方向（見下面長註解）。

definePageMeta({ layout: false })

useSeoMeta({
  title: '菌落質感對照 · Webconf',
  description: 'PL.IV 菌落兩種做法（手動排點 vs 純物理 cellular）side by side 對照，內部工具。'
})

const { loadParticleKit } = useParticleKit()
const { countFor, maxDpr } = useParticleBudget()

const leftRef = ref(null)
const rightRef = ref(null)
const plasmaRef = ref(null)
const status = ref('載入中…')
const backendLabel = ref('')

// --- 共用 --------------------------------------------------------------------
const SPECIES = 7
const TAU = Math.PI * 2
// 兩邊都用同一組「菌落該多擠」物理參數 —— 抄 Home/Field.vue 的 VENUE_* 常數
// （那組本身就是照 sandbox demo 卡片：Force 0.90 / Friction 0.30 / Repel 1.00 /
// rMax 84 鎖下來的，minR 44 則是站上另外實測出來的「菌落多大」）。
const PHYS = { forceFactor: 1.0, friction: 0.30, repel: 1.00, minR: 44, rMax: 84, simSpeed: 0.3 }
// 菌落黏在一起的根本原因：GAP（見下面 placeColonies）留的是「邊緣到邊緣」的
// 空隙，但力場的鄰居搜尋半徑是 rMax——只要 rMax 比這個空隙寬，兩顆菌落邊緣的
// 粒子還是互相看得到、照樣會被同物種吸過去。與其把 GAP 硬撐到超過 rMax（這塊
// 窄長區域塞不下那麼寬的間距，見 Home/Field.vue colonyTargets 的長註解），
// 反過來把 rMax 收到比 GAP 小，菌落之間直接沒有力場可以搭橋，分開純粹靠
// 「粒子看不到隔壁」，不必再跟握力拔河。
// ⚠️ 踩過的坑：只縮 rMax、minR 沒有一起縮，會把「同物種真正在互相吸引」的那圈
// 帶寬（minR 到 rMax 之間，即斥力圈外、力矩陣開始作用的地方）壓到只剩 6px——
// 幾乎等於沒有吸引力可言，整團塌成一片沒有紋理的實心球（見上一輪截圖）。
// 原始 44/84 的帶寬是 40px；這裡等比例縮小，帶寬留到 32px 左右，紋理才留得住。
const SEP_RMAX = 62
const SEP_MINR = 30
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

// --- 兩邊都用第四版做法：目標點只到菌落中心，紋理交給 cellular 力矩陣連續跑
// （見 Home/Field.vue colonyTargets 的長註解）。左右只有 pull/grip 不同，
// 用來一次比較兩組候選值哪個能在「守住分開」跟「留給 cellular 空間長紋理」
// 之間找到平衡——demo 錄影裡的菌落靠得也不遠，全靠這個力道比例撐住。
const PRESET = 'cellular'
const SHIMMER_AMP = 7
const SHIMMER_MS = 260

const LEFT_PULL = 6
const LEFT_GRIP = 20
const RIGHT_PULL = 9
const RIGHT_GRIP = 30

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

// --- 第三格：「電漿/電流」方向 -------------------------------------------------
// cellular 的性格是「同物種黏團、異物種推開」，長出來的是一坨一坨的細胞質感——
// 不管怎麼調都不會有「電流」那種連續流動、帶狀纏繞的感覺，因為它的矩陣裡沒有
// 方向性（i 對 j 跟 j 對 i 是對稱的，見 particle-life-rules.js 的 cellular()）。
// 「黏稠」＋「電流」要的其實是另一種性格：vortex 矩陣是非對稱的（i→j 跟 j→i
// 力道相反，見同檔案 vortex()），粒子會沿著物種順序連續轉圈追逐，形狀是流動的
// 帶狀漩渦而不是靜止的團塊——不會收斂，天生「電流感」；黏稠感則是把 friction
// 調高、simSpeed 放慢做出來的（阻力大、慣性重，轉起來拖泥帶水而不是甩鞭子）。
// ⚠️ 不要黏稠、不要光暈——只要「閃動感」：vortex 沒有靜止解，殘餘的連續轉圈
// 本身就是動態來源，friction/simSpeed 維持接近正常值就好，太黏會拖成一片糊。
// ⚠️ 放慢 + 加一個很長週期的 shimmer：vortex 配上固定的中心拉力，粒子會落進
// 一個穩定的軌道繞著圈轉——看起來就是「同一個來回動作」不斷重複，不是持續在變。
// 拿掉這個死循環不能只靠加快/減慢 simSpeed（那只是同一個循環播快播慢），
// 要讓它繞的「中心」本身也慢慢漂移，軌道才不會每一圈都長得一樣。shimmer
// 週期拉到遠比 VENUE_SHIMMER 的 260ms 長（這裡改用秒等級），振幅也放大一點，
// 讓中心的偏移本身就是慢慢發生的，跟其他格「快速電弧感」的用法是相反的方向。
const PLASMA_PRESET = 'plasma-blend'
const PLASMA_PULL = 7
const PLASMA_GRIP = 22
const PLASMA_POINT_SIZE = 1.55
const PLASMA_OPACITY = 0.58
const PLASMA_FRICTION = 0.30
const PLASMA_SIM_SPEED = 0.22
const PLASMA_SHIMMER_AMP = 26
const PLASMA_SHIMMER_MS = 2400

// --- 每一側各自的引擎生命週期 --------------------------------------------------
// driftMode 'colony'：整顆菌落一起慢慢漂（vortex 專用，見下面長註解），
// 不給就是預設的 shimmer（每顆粒子各自週期性換一個新的隨機偏移，其他兩格用）。
function makeSide (canvasRef, { preset, pull, grip, buildTargets, shimmerAmp, shimmerMs, friction, simSpeed, pointSize, opacity, rMax, minR, driftMode }) {
  let engine = null
  let raf = 0
  let shapes = null
  let shimmerT0 = 0
  let shimmerCycle = -1
  let ready = false
  let slotColony = null   // 每個 slot 屬於第幾顆菌落（driftMode:'colony' 用）
  let colonyPhase = null  // 每顆菌落各自的漂移相位（driftMode:'colony' 用）
  let driftBuf = null
  let driftT0 = 0
  let driftFrame = 0

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

  // 整顆菌落一起漂：同一顆菌落的粒子全部加上同一個位移，vortex 已經長出來的內部
  // 結構完全不受影響（只是整團被平移），跟 jitterXY 那種「每顆粒子各自重新
  // 隨機」完全不同——後者每次都把粒子打散重新分配，vortex 才剛開始組織結構就被
  // 打斷，肉眼看到的是「均勻雜訊」，就是使用者說的「繡球花」。
  // 用兩個不同頻率的正弦疊加（跟 Home/Field.vue 的鏡頭漂移同一招）：連續、
  // 平滑、永不精確重複，而不是每隔固定時間跳一次新的隨機點。
  function driftOffset (colonyIdx, t) {
    const ph = colonyPhase[colonyIdx]
    const s = t * 0.00035
    const dx = (Math.sin(s * 1.7 + ph) * 0.6 + Math.sin(s * 0.63 + ph * 2.1) * 0.4) * shimmerAmp
    const dy = (Math.cos(s * 1.3 + ph * 1.4) * 0.6 + Math.sin(s * 0.81 + ph * 3.2) * 0.4) * shimmerAmp
    return [dx, dy]
  }

  async function init () {
    const canvas = canvasRef.value
    if (!canvas) return
    // ⚠️ 密度/點大小加了一輪——單顆菌落內部點太疏、看得到網點感（使用者原話），
    // 不是「顆數太少」而是「每顆點畫出來太小、太稀」，所以兩個一起加：點數加倍
    // 讓同樣面積塞更多點，pointSize 加大讓相鄰點的圓盤互相重疊蓋掉縫隙。
    const count = countFor(canvas, { density: 0.085, max: 42000, min: 8000 })
    engine = await window.makeEngine(canvas, {
      species: SPECIES,
      count,
      palette: PALETTE,
      preset,
      forceFactor: PHYS.forceFactor,
      friction: friction ?? PHYS.friction,
      repel: PHYS.repel,
      minR: minR ?? PHYS.minR,
      rMax: rMax ?? PHYS.rMax,
      simSpeed: simSpeed ?? PHYS.simSpeed,
      cameraZoom: 1.0,
      // ⚠️ 上一輪把密度/點徑/不透明度三個一起加，疊加起來反而糊成一片——核心
      // 的 fragment shader 本身是銳利邊緣（fwidth 抗鋸齒，不是柔化），糊感是
      // 大量高不透明度的點互相加法疊加、被 HDR tonemap 壓過曝出來的，不是形狀
      // 本身的問題。點數（上面的 count）留著高密度解決網點感，這裡把點徑跟
      // 不透明度退回去，兩個一起降才不會疊加過曝。
      pointSize: pointSize ?? 1.55,
      particleOpacity: opacity ?? 0.58,
      // ⚠️ 沒有光暈——參考圖（Figma 留言釘那張）是銳利的點，沒有螢光暈開的感覺，
      // 光暈只會把切面邊界糊掉。
      showGlow: false,
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
    if (driftMode === 'colony') slotColony = new Uint8Array(snap.length)
    for (let i = 0; i < snap.length; i++) {
      const slot = snap[i].slot
      shape[slot * 2] = targets.tx[i]
      shape[slot * 2 + 1] = targets.ty[i]
      if (slotColony) slotColony[slot] = i % col.length
    }
    shapes = shape
    if (driftMode === 'colony') {
      colonyPhase = new Float32Array(col.length)
      for (let c = 0; c < col.length; c++) colonyPhase[c] = Math.random() * TAU
      driftBuf = new Float32Array(shape.length)
      driftT0 = performance.now()
    }
    engine.setTargets(shape, shape)
    engine.setMorph?.(pull, grip, 1)
    ready = true
    shimmerT0 = performance.now()
    loop()
  }

  function loop (now) {
    raf = requestAnimationFrame(loop)
    if (!engine || !ready) return
    const t = now || performance.now()
    if (driftMode === 'colony') {
      // 每 3 幀（~20Hz）更新一次就夠平滑，不必每幀都整批上傳 —— 省掉的是
      // GPU buffer 全量寫入的次數，漂移函式本身是連續時間，降頻不會看出階梯感。
      driftFrame++
      if (shimmerAmp && driftFrame % 3 === 0) {
        // 先算好「每顆菌落」的位移（只有 COLONIES 個，很便宜），再套用到每顆
        // 粒子——不要在下面那個 N 圈的迴圈裡重算三角函數，那是同一個值被
        // 重複算了 N/COLONIES 次。
        const cdx = new Float32Array(colonyPhase.length)
        const cdy = new Float32Array(colonyPhase.length)
        for (let c = 0; c < colonyPhase.length; c++) {
          const [dx, dy] = driftOffset(c, t - driftT0)
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
    if (shimmerAmp) {
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
let plasma = null

// 電漿要「跟左邊（cellular）綜合一點」：不是換掉 vortex，是把兩顆力矩陣混在
// 一起——vortex 太純的話粒子會被非對稱力硬拖著轉，同物種來不及好好黏團就被拖走，
// 邊界永遠在動、糊；混一點 cellular 的自吸/互斥進去，粒子有時間先聚成乾淨的塊，
// vortex 剩下的非對稱力再讓那些塊慢慢流動——跟 registerNebula 那個 composable
// 同一招，直接把自訂力矩陣塞進 window.PLRules.PRESETS。
function registerPlasmaBlend (cellularWeight = 0.55) {
  if (!window.PLRules) return
  window.PLRules.PRESETS['plasma-blend'] = (n) => {
    const a = window.PLRules.get('cellular', n)
    const b = window.PLRules.get('vortex', n)
    const out = new Array(n * n)
    for (let i = 0; i < out.length; i++) out[i] = a[i] * cellularWeight + b[i] * (1 - cellularWeight)
    return out
  }
}

async function boot () {
  status.value = '載入粒子引擎…'
  await loadParticleKit()
  registerPlasmaBlend()
  left = makeSide(leftRef, { preset: PRESET, pull: LEFT_PULL, grip: LEFT_GRIP, buildTargets: buildColonyCenterTargets, shimmerAmp: SHIMMER_AMP, shimmerMs: SHIMMER_MS, rMax: SEP_RMAX, minR: SEP_MINR })
  right = makeSide(rightRef, { preset: PRESET, pull: RIGHT_PULL, grip: RIGHT_GRIP, buildTargets: buildColonyCenterTargets, shimmerAmp: SHIMMER_AMP, shimmerMs: SHIMMER_MS, rMax: SEP_RMAX, minR: SEP_MINR })
  plasma = makeSide(plasmaRef, {
    preset: PLASMA_PRESET,
    pull: PLASMA_PULL,
    grip: PLASMA_GRIP,
    buildTargets: buildColonyCenterTargets,
    shimmerAmp: PLASMA_SHIMMER_AMP,
    shimmerMs: PLASMA_SHIMMER_MS,
    driftMode: 'colony',
    friction: PLASMA_FRICTION,
    simSpeed: PLASMA_SIM_SPEED,
    pointSize: PLASMA_POINT_SIZE,
    opacity: PLASMA_OPACITY,
    rMax: SEP_RMAX,
    minR: SEP_MINR,
  })
  await Promise.all([left.init(), right.init(), plasma.init()])
  status.value = ''
}

async function reseed () {
  status.value = '重新播種…'
  left?.destroy()
  right?.destroy()
  plasma?.destroy()
  await boot()
}

onMounted(() => { boot() })
onBeforeUnmount(() => { left?.destroy(); right?.destroy(); plasma?.destroy() })
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0c] px-6 py-10 text-[#EFE6D2]">
    <div class="mx-auto max-w-[1400px]">
      <h1 class="font-en-serif text-[28px] italic">
        PL.IV 菌落質感對照
      </h1>
      <p class="mt-2 max-w-[70ch] text-[14px] leading-relaxed text-[#EFE6D2]/60">
        左／中：同一套做法（目標點只到菌落中心，紋理交給 cellular 力矩陣連續跑），
        只有 pull/grip 不同——用來比較「守住分開」跟「留給力矩陣空間長紋理」的平衡點。
        右：換一顆非對稱的 vortex 力矩陣，找「電漿/電流」的方向（連續流動的帶狀漩渦，
        不是細胞一坨一坨），friction 調高、simSpeed 放慢做出黏稠感。
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
      <div class="mt-6 grid grid-cols-3 gap-6 overflow-x-hidden">
        <div class="min-w-0 border border-[#EFE6D2]/20 p-3">
          <p class="mb-2 border-b border-[#EFE6D2]/20 pb-2 text-[12px] uppercase tracking-[0.16em] text-[#7CC8F2]">
            左 · pull 6 / grip 20
          </p>
          <canvas ref="leftRef" class="block aspect-square w-full bg-black" />
        </div>
        <div class="min-w-0 border border-[#EFE6D2]/20 p-3">
          <p class="mb-2 border-b border-[#EFE6D2]/20 pb-2 text-[12px] uppercase tracking-[0.16em] text-[#7CC8F2]">
            中 · pull 9 / grip 30
          </p>
          <canvas ref="rightRef" class="block aspect-square w-full bg-black" />
        </div>
        <div class="min-w-0 border border-[#EFE6D2]/20 p-3">
          <p class="mb-2 border-b border-[#EFE6D2]/20 pb-2 text-[12px] uppercase tracking-[0.16em] text-[#7CC8F2]">
            右 · 電漿（vortex + 黏稠）
          </p>
          <canvas ref="plasmaRef" class="block aspect-square w-full bg-black" />
        </div>
      </div>
    </div>
  </div>
</template>
