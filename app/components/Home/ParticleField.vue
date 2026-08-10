<script setup>
// 首頁固定背景粒子場 —— 一張 fixed canvas 墊在所有區塊後面，捲動時「相機」在動，
// 粒子模擬本身全程不中斷。原理見 docs/point-cloud-effect.md。
//
// 為什麼不用 people.vue 那套 respawn 插值？
//   people.vue 是「捲到哪就定格在哪」，forceFactor 設 0、位置完全由插值決定 ——
//   精準但畫面是死的。這裡要的是「變形後還持續運作」，所以力場全程開著，區塊之間
//   只 scrub 相機（平移 / 推近）與色盤。粒子從頭到尾都在跑自己的生態。
//
// 「活起來」的四個關鍵（對照 SandboxScience 抓出來的差異）：
//   1. 力矩陣要非對稱 —— cellular 那種 i===j?0.8:-0.55 是對稱的，會收斂成不動的
//      菌落球。spiral-conveyor / rps 這類「i 追 i+1、不追 i-1」沒有靜止解，會永遠
//      在追逐。這是生命感最大的來源。
//   2. simSpeed 別壓太低 —— demo 的 0.5 是字面上的慢動作，配上已收斂的對稱矩陣就
//      是「慢動作的靜止圖」。
//   3. 相機要會動 —— 就算場域變化不快，緩慢的推移視差也會讓畫面活著。
//   4. PLAmbient 四層擾動（代謝／呼吸／亂流／潮汐）。

const { loadParticleKit } = useParticleKit()
const { paletteToLinear, lerpPaletteLinear, buildImageTargets, buildSlotTargets } = useParticleMorph()

const canvasRef = ref(null)
const backend = ref('')

// --- 可調參數：改這裡就好 -------------------------------------------------
// 力矩陣。非對稱的才會一直動 —— 這是生命感最大的來源。
//   snake            self=1 會聚成一顆顆分明的圓群落（設計稿的樣子），
//                    但 i→i+1 是單向吸引（i-1 為 0），群落之間會一直互相追逐。
//   spiral-conveyor  self=-0.1，長成絲狀環流，比較像星雲、比較不像細胞。
//   rps              三方追逐，動得最兇。
// cellular / chains1 / chains2 是「對稱」矩陣（i↔j 相等），會收斂成不動的菌落球
// —— demo 呆板的主因就是它，別用。
const PRESET = 'spiral-conveyor'
const SPECIES = 7                    // 對齊色盤長度（每組 palette 都是 7 色）
const HERO_PALETTE = 'blue'          // PL.I 滿版藍場

// PL.II 收攏的目標圖。出圖規則很重要：畫布要留成最終版位的比例、主體放在
// 要出現的位置（side.png 是 1440×720、主體在左 1/3 且切齊左緣），
// 因為 registerPattern 是把「整張圖」等比置中，主體的相對位置會被原樣保留。
const ABOUT_IMAGE = '/source_images/side.png'
const ABOUT_SAMPLES = 32000          // ⚠️ 之後每張圖都要用同一個點數，否則配對會有殘餘
// 色盤：null = 用圖片自動量化出來的主色；要更接近設計稿就填一組 7 色覆蓋。
const ABOUT_PALETTE_OVERRIDE = null
// 收攏參數（advance shader 的速度導引，單位都是 1/s）：
//   PULL —— 每單位距離想要的靠攏速度。調大 = 更貼合原圖輪廓。
//   GRIP —— 速度被導引的強度。調大 = 抓得更緊，但輪廓裡剩下的 particle-life
//           運動就越少；調小 = 更有生命力，但形狀會鬆散甚至撐開。
// 這對數值決定「像不像原圖」與「活不活」之間的平衡，是這個效果的主要旋鈕。
// ⚠️ 數值偏大是有原因的：shader 拿到的 dt 已被 simSpeed 縮過（待機 0.16 → dt 約
// 0.0026s），而導引比例是 grip × dt。grip=5 只導引了 1.3%，完全壓不過互動力場，
// 形狀會整個炸開。實測 pull 8–12 / grip 60–100 才守得住又留得住運動；
// pull 50 就完全鎖死（平均速度 0，形狀變成死的貼圖）。
const MORPH_PULL = 10
const MORPH_GRIP = 70
// 拉力的跟隨速度。ATTACK 快（收攏要跟得上捲動），RELEASE 慢（放手要拖一段，
// 才有時間把粒子從左邊帶回滿版）。0.012 ≈ 1.4 秒的時間常數。
const MORPH_ATTACK = 0.20
const MORPH_RELEASE = 0.012
// targets 失效後（視窗改變尺寸、或 fps 自適應觸發 setCount 整場重生）要等場域
// 重新散開才能重建 —— 「自由場」那組目標點就是當下的粒子分布，抓太早會記成
// 一團緊湊的開場構圖，之後捲回來就回不到滿版。
const REBUILD_SETTLE_MS = 3000

// 模擬速度分三段疊起來：
//   1. 開場 —— 粒子從 seedPattern 的螺旋構圖「散開」的那幾秒要快，才看得到
//      規則接管、結構溶解的過程；散開後要明顯慢下來。
//   2. 待機 —— 極慢，只是緩緩呼吸。
//   3. 捲動 —— 依捲動速度即時加速，停下來再緩降回待機。
const SIM_SPEED_INTRO = 1.5          // 開場散開時
const INTRO_HOLD_MS = 1800           // 維持全速多久
const INTRO_FADE_MS = 5000           // 之後花多久降到待機速度
const SIM_SPEED_IDLE = 0.16          // 散開後的待機速度
const SIM_SPEED_MAX = 0.6            // 全速捲動時
const SCROLL_REF = 2200              // 捲動速度 px/s 到這個值就吃滿加速
const ATTACK = 0.14                  // 每幀往上追的比例
const RELEASE = 0.022                // 每幀往下降的比例（比 ATTACK 小很多）
const AMBIENT_INTENSITY = 0.55       // 四層擾動的全域強度倍率（1 = demo 原設定）

// 對齊 SandboxScience 預設。路線 C 不需要在遷移時關掉它 —— 互動力場與 seek 力
// 同時作用，正是「形狀是活的」的來源。
const FORCE_FACTOR = 1.0
// 捲動中把互動力場壓掉多少（1 = 全部暫停）。遷移過程乾淨、停下來才擴散。
const SCROLL_CALM = 0.6

// 相機：改用圖片收攏之後，「往左收」是靠 side.png 自己的構圖決定的
//（點雲落在圖片框的左 1/3），所以相機維持不動，避免雙重位移把圖推出畫面。
// 要微調第二區塊的取景就動這兩個值。
const HERO_ZOOM = 1.35
const ABOUT_ZOOM = 1.35
// 畫面內容往左推的比例（相對視窗寬度）。
// ⚠️ 上限：粒子只存在於 [0,W]×[0,H]，相機推出這個範圍就會看到空白。
// 可推的最大比例 = (zoom − 1) / 2。
const ABOUT_SHIFT = 0
const HERO_OPACITY = 0.55
const ABOUT_OPACITY = 0.75           // 圖片點雲要看得出形狀，比自由場亮一點

// 粒子預算：保守起步，開場實測 fps 再決定加減（docs §10 陷阱二）
const COUNT_DESKTOP = 48000
const COUNT_MOBILE = 16000

// 閒置多久就停掉模擬。pause 只是跳過渲染與計算，canvas 會保留最後一幀，
// 所以畫面不會消失、只是定格 —— 使用者一動就無縫接回去。
const IDLE_STOP_MS = 5000
// --------------------------------------------------------------------------

let engine = null
let stopAmbient = null
let onVisibility = null
let onActivity = null
let driftRaf = 0
let scrollTrigger = null
let reducedMotion = false

// 閒置停止的狀態
let lastActivity = 0
let idlePaused = false

// 捲動進度 0（hero）→ 1（about）。相機漂移迴圈每幀讀它，跟 idle drift 疊加後
// 一次寫進相機 uniform —— 兩者搶同一個 setCameraOffset，必須合在同一處算。
let progress = 0

// 捲動速度 → 模擬速度的狀態（見 driftLoop）
let simSpeed = SIM_SPEED_INTRO
let scrollHeat = 0                   // 平滑後的捲動強度 0..1
let morphAmount = 0                  // 平滑後的收攏拉力 0..1（釋放比進場慢）
let appliedForce = FORCE_FACTOR      // 上次寫進引擎的 forceFactor
let lastScrollY = 0
let lastTime = 0
let introStart = 0                   // 引擎就緒的時刻，開場包絡從這裡算

let heroLin = null
let aboutLin = null

// --- 圖片收攏（路線 C：shader seek 力）---------------------------------------
// 引擎的 advance shader 會把每顆粒子往 targets[slot] 彈簧式拉過去，而
// particle-life 的互動力場「同時照常跑」。所以：
//   · 停在定位時粒子仍在輪廓裡游動、邊緣會呼吸 —— 形狀是活的
//   · 捲動只改一個 uniform（morphStrength），沒有任何快取軌跡會過期
//     → 停頓、恢復、反向捲動全都天然連續，不需要偵測邏輯
//   · 位置在 GPU 上算，不再每幀上傳 48k 粒子 → fps 回到 60
//
// targets 只算一次：配對只決定「誰去哪個點」，之後由物理接管，不會過期。
let aboutSpec = null                 // PLImage.prepare 的產物
let targetsReady = false
let targetsGen = -1                  // 建 targets 當下的引擎世代
let targetsW = 0                     // 建 targets 當下的模擬尺寸
let targetsH = 0
let onResize = null
let resizeTimer = 0

// 相機位移的單位換算：shader 算的是 ndc = (pos - center) * (2*zoom/W)，
// 所以畫面上位移的「視窗寬度比例」= 相機位移(sim px) * zoom / W。
// 反解：要讓內容往左移 f 個視窗寬，相機中心要往右移 f * W / zoom。
function shiftToCameraX (f, zoom, W) { return (f * W) / zoom }

// 每幀：把「捲動決定的相機狀態」與「idle 緩慢漂移」疊起來寫進引擎。
// 只是一次 16 bytes 的 uniform write，不重建 bind group，可以放心逐幀呼叫。
function driftLoop (now) {
  driftRaf = requestAnimationFrame(driftLoop)
  if (!engine) return

  // --- 捲動速度 → 模擬速度 -------------------------------------------------
  // 自己從 scrollY 差分算，不依賴 Lenis 內部屬性（reduced-motion 下 Lenis 也可能沒接）
  const t = now || performance.now()
  const y = window.scrollY

  // --- 閒置超過 IDLE_STOP_MS 就停掉模擬 -------------------------------------
  if (!idlePaused && t - lastActivity > IDLE_STOP_MS) {
    idlePaused = true
    syncPause()
  }
  // 停住時仍要更新時間/捲動基準，否則喚醒那一幀會算出爆炸的 dt 與捲動速度
  if (idlePaused) {
    lastTime = t
    lastScrollY = y
    return
  }

  const dt = lastTime ? Math.min(0.1, (t - lastTime) / 1000) : 0
  if (dt > 0) {
    // 開場包絡：先維持 INTRO 速度，再 smoothstep 降到待機速度，之後恆為 0
    const age = t - introStart
    let intro = 0
    if (age < INTRO_HOLD_MS) {
      intro = 1
    } else if (age < INTRO_HOLD_MS + INTRO_FADE_MS) {
      const u = 1 - (age - INTRO_HOLD_MS) / INTRO_FADE_MS
      intro = u * u * (3 - 2 * u)
    }
    const base = SIM_SPEED_IDLE + (SIM_SPEED_INTRO - SIM_SPEED_IDLE) * intro

    const v = Math.abs(y - lastScrollY) / dt                   // px/s
    const heat = Math.min(1, v / SCROLL_REF)                   // 0 = 靜止, 1 = 全速捲動
    const target = base + (SIM_SPEED_MAX - SIM_SPEED_IDLE) * heat
    // 加速追得快、減速拖得慢
    const k = target > simSpeed ? ATTACK : RELEASE
    simSpeed += (target - simSpeed) * k
    engine.setSimSpeed?.(simSpeed)

    // 捲動中壓低互動力場 = 暫停「自動擴散」，讓遷移讀起來乾淨；停下來再放回去，
    // 粒子就在輪廓裡重新活過來。用同一組 attack/release，跟 simSpeed 同步呼吸。
    scrollHeat += (heat - scrollHeat) * (heat > scrollHeat ? ATTACK : RELEASE)
    const wanted = FORCE_FACTOR * (1 - SCROLL_CALM * scrollHeat)
    if (Math.abs(wanted - appliedForce) > 0.01) {
      appliedForce = wanted
      engine.setForce?.(wanted)      // 會重寫 80 bytes 的 options buffer，所以設個門檻
    }
  }
  lastTime = t
  lastScrollY = y

  const p = progress
  const { W, H } = engine.size
  const zoom = HERO_ZOOM + (ABOUT_ZOOM - HERO_ZOOM) * p
  const baseX = shiftToCameraX(ABOUT_SHIFT * p, zoom, W)

  // 緩慢的電影感漂移：兩個不同週期的正弦疊加，避免看得出循環
  let dx = 0; let dy = 0; let dz = 1
  if (!reducedMotion) {
    const t = performance.now() * 0.001
    dx = Math.sin(t * 0.021) * 42 + Math.sin(t * 0.006) * 26
    dy = Math.cos(t * 0.017) * 30 + Math.sin(t * 0.010) * 16
    dz = 1 + 0.035 * Math.sin(t * 0.011)
  }

  engine.setCameraZoom?.(zoom * dz)
  engine.setCameraOffset?.(baseX + dx, dy)

  // --- 收攏拉力 -------------------------------------------------------------
  // blend（目標點在「自由場 ↔ 圖形」之間的位置）直接跟著 progress 走，但「拉力」
  // 要拖一下才放掉：pull 若跟著 progress 一起歸零，回到 hero 的瞬間就沒有力氣把
  // 粒子帶回滿版，它們會整團留在左邊慢慢擴散（實測左半邊佔比 92%，正常約 50%）。
  // 所以 pull 用慢速釋放，讓 seek 在 progress 歸零後還有一段時間把粒子送回原位，
  // 再交還給物理。
  // targets 若已失效（setCount / respawn 重配過 buffer，或視窗尺寸變了）就別用 ——
  // 對著全 0 或舊座標的目標點跑 seek 會把整場粒子吸走。
  if (targetsReady && (engine.targetsGeneration !== targetsGen || W !== targetsW || H !== targetsH)) {
    invalidateTargets()
  }
  if (targetsReady) {
    const e = p * p * (3 - 2 * p)
    morphAmount += (e - morphAmount) * (e > morphAmount ? MORPH_ATTACK : MORPH_RELEASE)
    if (morphAmount < 0.002) morphAmount = 0
    engine.setMorph?.(MORPH_PULL * morphAmount, MORPH_GRIP * morphAmount, e)
  }
}

// 捲動只改「色盤 + 透明度 + morph 強度」—— 粒子位置全程由 GPU 上的物理決定。
// 沒有任何 JS 端的軌跡快取，所以停頓、恢復、反向捲動都天然連續。
function applyProgress (p) {
  progress = Math.min(1, Math.max(0, p))
  if (!engine) return
  const e = progress * progress * (3 - 2 * progress)   // smoothstep，兩端收尾自然
  if (heroLin && aboutLin) engine.setColors?.(lerpPaletteLinear(heroLin, aboutLin, e))
  engine.setParticleOpacity?.(HERO_OPACITY + (ABOUT_OPACITY - HERO_OPACITY) * e)

  // 收攏拉力本身在 driftLoop 逐幀寫（見那裡的 morphAmount），因為它需要釋放延遲。
}

// 一次性：讀回目前粒子 → 同物種內就近配對圖片點 → 攤成以 slot 為索引的 target
// 陣列上傳。配對只決定「誰去哪個點」，之後位置由物理接管，target 不會過期。
function invalidateTargets () {
  targetsReady = false
  morphAmount = 0
  engine?.setMorph?.(0, 0, 0)
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => { buildTargets() }, REBUILD_SETTLE_MS)
}

async function buildTargets () {
  if (!aboutSpec || !engine?.readParticles || !engine.setTargets) return
  const snap = await engine.readParticles()
  const { W, H } = engine.size
  const T = aboutSpec.palette.length
  const targets = buildImageTargets(aboutSpec, snap.length, W, H)
  const { spread, shape } = buildSlotTargets(snap, targets, T, W)
  engine.setTargets(spread, shape)
  targetsGen = engine.targetsGeneration
  targetsW = W
  targetsH = H
  targetsReady = true
  applyProgress(progress)              // 補算一次，避免首屏就在第二區塊時沒套上
}

function syncPause () {
  // 固定背景永遠在視窗內，所以不必 IntersectionObserver；要理的是分頁隱藏
  //（rAF 在背景分頁只是降頻，不是停止）與使用者閒置。
  if (engine) engine.pause(document.hidden || idlePaused)
}

// 使用者有動作 → 記時間；若正停著就立刻喚醒。
// 除了滑鼠移動，捲動與觸控也算 —— 否則用觸控板捲頁時（不會發 pointermove）
// 場域會定格，hero → about 的遷移看起來就像壞掉。
function markActivity () {
  lastActivity = performance.now()
  if (idlePaused) {
    idlePaused = false
    syncPause()
  }
}

async function init () {
  const canvas = canvasRef.value
  if (!canvas) return

  await loadParticleKit()
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const PAL = window.PLPalettes.PALETTES
  const hero = PAL[HERO_PALETTE]
  heroLin = paletteToLinear(hero.particles)

  const count = window.innerWidth < 768 ? COUNT_MOBILE : COUNT_DESKTOP

  engine = await window.makeEngine(canvas, {
    species: SPECIES,
    count,
    preset: PRESET,
    seedPattern: 'rainbowSpiral',   // 固定開場構圖；之後由規則接管（docs §6）
    palette: hero.particles,
    bgFade: hero.bgFade,
    // 物理常數對齊 SandboxScience 預設（實測 Force 1 / Repel 1 / Friction 0.3）
    forceFactor: FORCE_FACTOR,
    friction: 0.3,
    repel: 1.0,
    minR: 5,
    rMax: 72,
    simSpeed: SIM_SPEED_INTRO,      // 開場快速散開；之後由 driftLoop 的包絡接手
    cameraZoom: HERO_ZOOM,
    pointSize: 0.8,
    particleOpacity: HERO_OPACITY,
    showGlow: false,                // 高密度時光暈會糊成一片，只留銳利點
    cellSubdivisions: 2,
    maxDpr: 1.5,                    // 全螢幕 HDR target，DPR 2 是 4 倍像素、視覺收益極小
  })
  backend.value = engine.backend
  // dev 時開個把手，方便在 console 直接調參（engine.setForce(1.4) 之類）
  if (import.meta.dev) window.__field = engine

  // 四層環境擾動：沒有它，場域幾十秒後會收斂成靜態圖（docs §4）。
  // intensity 調弱一點，讓它是「底噪」而不是主要的動能來源。
  if (!reducedMotion) stopAmbient = window.PLAmbient.start(() => engine, { intensity: AMBIENT_INTENSITY })

  // 第二區塊的收攏目標：執行期直接取樣圖片（約 190ms / 32k 點）。
  // 之後要省這段成本就改成烘好的 JSON + PLImage.prepareFromData()，
  // 兩者產出的 spec 介面相同，這裡不用改。
  try {
    aboutSpec = await window.PLImage.prepare(ABOUT_IMAGE, {
      count: ABOUT_SAMPLES,
      colors: SPECIES,              // 色盤長度必須與 species 一致，否則得 setSpecies
    })
    if (ABOUT_PALETTE_OVERRIDE) aboutSpec.palette = ABOUT_PALETTE_OVERRIDE
    aboutLin = paletteToLinear(aboutSpec.palette)
  } catch (err) {
    console.warn('[ParticleField] 圖片點雲取樣失敗，第二區塊維持自由場', err)
  }

  onVisibility = () => syncPause()
  document.addEventListener('visibilitychange', onVisibility)

  onResize = () => invalidateTargets()
  window.addEventListener('resize', onResize)

  onActivity = () => markActivity()
  window.addEventListener('pointermove', onActivity, { passive: true })
  window.addEventListener('pointerdown', onActivity, { passive: true })
  window.addEventListener('scroll', onActivity, { passive: true })
  window.addEventListener('wheel', onActivity, { passive: true })

  lastActivity = performance.now()
  syncPause()

  introStart = performance.now()
  lastScrollY = window.scrollY
  if (import.meta.dev) {
    window.__fieldDbg = () => ({
      age: Math.round(performance.now() - introStart),
      simSpeed: +simSpeed.toFixed(3),
      idlePaused,
      idleFor: Math.round(performance.now() - lastActivity),
      paused: engine.config.paused,
      progress: +progress.toFixed(3),
      morphPull: +engine.config.morphPull.toFixed(2),
      scrollHeat: +scrollHeat.toFixed(2),
      morphAmount: +morphAmount.toFixed(3),
      force: +engine.config.forceFactor.toFixed(2),
      targetsReady,
    })
  }
  driftLoop()

  // 先讓開場的 fps 自適應定案，再建 targets ——
  // setCount 會重配粒子與 targets buffer，順序反了 targets 會被清空。
  setTimeout(async () => {
    const fps = engine?.getFps ? engine.getFps() : 60
    if (fps > 0 && fps < 45) {
      engine.setCount?.(Math.round(count / 2))
      // setCount 會整場重生成「開場構圖」（緊湊的螺旋）。要等它散開再建 targets，
      // 否則「自由場」那組目標會記成那團緊湊的東西，之後捲回來就回不到滿版。
      await new Promise(r => setTimeout(r, REBUILD_SETTLE_MS))
    }
    await buildTargets()
  }, 4000)

  // 捲動：hero 底邊捲出畫面的這段 = 粒子場從滿版遷移到左側。scrub 讓它可逆。
  const { $ScrollTrigger } = useNuxtApp()
  if ($ScrollTrigger) {
    scrollTrigger = $ScrollTrigger.create({
      trigger: '[data-field-hero]',
      start: 'bottom bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => applyProgress(self.progress),
      onRefresh: (self) => applyProgress(self.progress),
    })
    $ScrollTrigger.refresh()
  }
}

onMounted(() => { init() })

onBeforeUnmount(() => {
  if (driftRaf) cancelAnimationFrame(driftRaf)
  if (scrollTrigger) scrollTrigger.kill()
  if (stopAmbient) stopAmbient()
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  clearTimeout(resizeTimer)
  if (onResize) window.removeEventListener('resize', onResize)
  if (onActivity) {
    window.removeEventListener('pointermove', onActivity)
    window.removeEventListener('pointerdown', onActivity)
    window.removeEventListener('scroll', onActivity)
    window.removeEventListener('wheel', onActivity)
  }
  if (engine) { engine.destroy(); engine = null }
})

defineExpose({ backend })
</script>

<template>
  <canvas
    ref="canvasRef"
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-0 block h-full w-full"
  />
</template>
