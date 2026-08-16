<script setup>
// PL. IV（Venue）+ PL. V（FAQ）—— 兩區共用一張粒子 canvas。
//
// 為什麼兩區共用而不是各自一張：這兩塊的側邊圖形需求相同（裝飾性紋理，不像 PL.III
// 的人像那樣需要把粒子鎖死到看得出五官），共用之後 IV→V 之間就是一段「連續的捲動
// 變形」—— 粒子直接從第一隻標本流成第二隻，而不是淡出再淡入。各自一張反而做不到。
//
// canvas 為什麼是 sticky h-screen：
//   · WebGPU 的 compose pass 是不透明黑，canvas 一定是實心方塊。做成小方塊就會有
//     硬邊壓在背景粒子上（PL.III 踩過），所以一律鋪滿視窗。
//   · sticky 讓同一張 canvas 在捲過兩個區塊時「留在畫面上」，morph 才有連續感。
//     外層用 h-0 的 sticky 容器 + 溢出的 canvas，這樣它不佔文件流高度。
//
// 「圖片移出畫面」不是靠裁圖（裁出來的硬邊很醜，PL.III 的講者照踩過），
// 而是靠相機位移：點雲用完整的圖，再把相機推開讓它自然被視窗邊緣切掉。
// 每個 stage 各自有 shift，捲動時跟著插值。
//
// 位置與變形機制與首頁 ParticleField 相同（路線 C · shader seek 力）：
// setTargets(stage[k], stage[k+1]) 之後 scrub blend，JS 每幀只寫 16 bytes。

const { loadParticleKit } = useParticleKit()
const { paletteToLinear, lerpPaletteLinear, buildImageTargets, buildSlotTargets } = useParticleMorph()
const { activeStage, idle, claimStage, releaseStage } = useParticleStage()

const STAGE = 'venue-faq'

// PL.IV「更多資訊」的連結目標。⚠️ 設計稿沒標，先留 '#'，需要確認要連到
// 場地官網、Google Maps 還是站內的交通頁。填好之後如果是外部網址，
// 記得把 target="_blank" rel="noopener noreferrer" 加回去。
const VENUE_URL = '#'

// PL.V 常見問答。之後要接 CMS/API 只要換掉這個陣列，template 不用動。
// ⚠️ 設計稿的分頁是 1 2 3 … 10，代表實際題數遠多於這三題 —— 目前只有設計稿上
// 看得到的內容，其餘待補。總頁數先照設計稿寫死，接了資料來源就改成算出來的。
const FAQ_TOTAL_PAGES = 10
const faqPage = ref(1)

const FAQS = [
  {
    q: '大會有提供 Wi-Fi 嗎？',
    a: '僅提供瓶蓋工廠台北製造所原場地的 Wi-Fi，因同時會有 700 位以上裝置，若臨時流量壅塞，建議專注聆聽議程。',
  },
  {
    q: '場地有插可以充電的地方嗎？',
    a: 'B 棟休息區，以及議程廳內後方皆設有充電區可以充電喔！',
  },
  {
    q: '這次大會有錄影嗎？',
    a: '沒有，我們希望大家可以專注在現場的演講！有提供大會共筆文件。',
  },
]

// --- 兩段標本 --------------------------------------------------------------
// shift = 內容往左推的「視窗寬度比例」，就是「圖片移出畫面」那件事。
//   0.18 = 往左推 18% 視窗寬，主體會有一部分被左邊緣切掉（設計稿 PL.V 的圖是
//   x=-200 貼著左緣外，就是這個效果）。
// ⚠️ 上限 = (zoom − 1) / 2 —— 粒子只存在於 [0,W]×[0,H]，推過頭會看到空白。
//
// ⚠️ venue.png 目前是暫代：設計稿 PL.IV 要的是「散開的多個小菌落」那張
//    （節點 `截圖 2026-08-06 晚上10.20.51 1`，442×670），還沒拿到。
//    真圖到手只要換這裡的路徑，其他都不用動。
// shiftY = 內容往下推的「視窗高度比例」。設計稿 PL.V 的圖是 y=964（壓在區塊下半、
// 往下溢出），標籤在 y=60 —— 兩者是垂直錯開的。少了這個位移，點雲會直接蓋住標籤。
const STAGES = [
  { image: '/source_images/venue.png', zoom: 1.0, shift: 0.28, shiftY: 0.12, opacity: 0.85 },
  { image: '/source_images/faq.png', zoom: 1.08, shift: 0.34, shiftY: 0.30, opacity: 0.8 },
]

// ⚠️ 點數要跟「點雲在螢幕上的面積」一起看，不能只看絕對數字。
// 這兩隻標本有很細的放射狀尖刺，密度不夠就糊成一團白霧 —— 實測 30000 顆攤在
// 883×851 上只有 0.04 顆/px，而 PL.III 的人像是 0.147 顆/px（差 3.7 倍）。
// 縮小取景 + 提高點數之後回到 0.14 附近，結構才撐得起來。
const SAMPLES = 52000       // ⚠️ 每張圖同一個點數，否則配對會有一撮粒子配不到對
const SPECIES = 7
const FIT = 0.82

// 這兩區是紋理不是人臉，可以讓它比 PL.III 活一點 —— grip 低一些，
// 輪廓內留給 particle-life 的殘餘運動就多一些。
const LOCK_PULL = 10
const LOCK_GRIP = 55
const LIVE_FORCE = 1.0
const FORCE_FADE_MS = 700
const SIM_SPEED = 0.2

// 閃動：與 PL.III 同一套（讓目標點自己會動）。紋理沒有五官要保護，
// 幅度可以比人像大。原理與踩過的坑見 SpeakerField.vue 的長註解。
const SHIMMER_AMP = 14
const SHIMMER_PERIOD_MS = 2600

const MORPH_ATTACK = 0.2
const RESIZE_SETTLE_MS = 300
const TAU = Math.PI * 2
// --------------------------------------------------------------------------

const wrapRef = ref(null)
const canvasRef = ref(null)
const venueRef = ref(null)
const faqRef = ref(null)
const backend = ref('')

let engine = null
let liveRaf = 0
let onVisibility = null
let onResize = null
let resizeTimer = 0
let triggers = []
let reducedMotion = false

const specs = []                    // 每個 stage 的 PLImage spec
const shapes = []                   // 每個 stage 的每-slot 目標點
const palettes = []                 // 線性光色盤
let live = false
let force = 0
let appliedForce = 0
let ready = false
let targetsGen = -1
let targetsW = 0
let targetsH = 0

// 捲動進度：0 = 完全在 venue，1 = 完全在 faq
let progress = 0
let morphed = 0                     // 平滑後的 progress
let shimmerT0 = 0
let shimmerCycle = -1

// 相機位移的單位換算（與 ParticleField 相同）：
// shader 算的是 ndc = (pos - center) * (2*zoom/W)，所以畫面上位移的「視窗寬度比例」
// = 相機位移(sim px) * zoom / W。反解如下。
function shiftToCameraX (f, zoom, W) { return (f * W) / zoom }

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

// 把每個 stage 的圖算成「以 slot 為索引」的目標點。
// 全部用同一份粒子快照做配對，所以每顆粒子在各 stage 之間有一致的身分，
// 段與段之間可以直接 setTargets(k, k+1) 而不必重新配對。
async function buildAllShapes () {
  if (!engine?.readParticles || !engine.setTargets) return false
  const snap = await engine.readParticles()
  const { W, H } = engine.size
  shapes.length = 0
  for (const spec of specs) {
    const targets = buildImageTargets(spec, snap.length, W, H)
    const { shape } = buildSlotTargets(snap, targets, spec.palette.length, W)
    shapes.push(shape)
  }
  targetsGen = engine.targetsGeneration
  targetsW = W
  targetsH = H
  ready = true
  shimmerT0 = performance.now()
  shimmerCycle = -1
  return true
}

function targetsStale () {
  if (!engine || !ready) return false
  const { W, H } = engine.size
  return engine.targetsGeneration !== targetsGen || W !== targetsW || H !== targetsH
}

// 捲動 → 相機 + 色盤。位置本身交給 morph，這裡只調「取景」與顏色。
function applyProgress () {
  if (!engine) return
  const e = morphed
  const a = STAGES[0]; const b = STAGES[1]
  const zoom = a.zoom + (b.zoom - a.zoom) * e
  const shift = a.shift + (b.shift - a.shift) * e
  const shiftY = a.shiftY + (b.shiftY - a.shiftY) * e
  const { W, H } = engine.size
  engine.setCameraZoom?.(zoom)
  // 相機往右/下移 = 內容往左/上移，所以要內容往下推就得給負的 Y
  engine.setCameraOffset?.(shiftToCameraX(shift, zoom, W), -shiftToCameraX(shiftY, zoom, H))
  engine.setParticleOpacity?.(a.opacity + (b.opacity - a.opacity) * e)
  if (palettes.length === 2) engine.setColors?.(lerpPaletteLinear(palettes[0], palettes[1], e))
}

function liveLoop (now) {
  liveRaf = requestAnimationFrame(liveLoop)
  if (!engine) return

  // 閒置就整個收工 —— 這個迴圈每 2.6 秒會配兩份 104000 元素的 Float32Array
  // 再上傳 832KB，光 engine.pause() 擋不掉這些。
  if (idle.value) {
    cancelAnimationFrame(liveRaf)
    liveRaf = 0
    return
  }

  const t = now || performance.now()

  const want = live && !reducedMotion ? LIVE_FORCE : 0
  const step = LIVE_FORCE * (1000 / 60) / FORCE_FADE_MS
  if (force < want) force = Math.min(want, force + step)
  else if (force > want) force = Math.max(want, force - step)
  if (Math.abs(force - appliedForce) > 0.004) {
    appliedForce = force
    engine.setForce?.(force)
  }

  // 捲動進度平滑追上去，避免 scrub 的抖動直接打到 morph
  morphed += (progress - morphed) * MORPH_ATTACK
  applyProgress()

  if (ready && !reducedMotion) {
    if (targetsStale()) {
      ready = false
    } else {
      // 閃動。⚠️ 這裡不能照 SpeakerField 那樣「讓 blend 在 1↔0 之間震盪」——
      // blend 在這一區已經被捲動進度佔用了，一個 blend 沒辦法同時做兩件事。
      // 改成把抖動烘進「兩端的目標點」：每一輪換一組新的隨機偏移，粒子就會平滑地
      // 滑向新位置，這就是閃動；而 blend 依然純粹由捲動決定，兩者互不干擾。
      // 兩端都抖，所以不管停在 venue 還是 faq 都會動。
      const cycle = Math.floor((t - shimmerT0) / SHIMMER_PERIOD_MS)
      if (cycle !== shimmerCycle) {
        shimmerCycle = cycle
        engine.setTargets(jitterXY(shapes[0], SHIMMER_AMP), jitterXY(shapes[1], SHIMMER_AMP))
      }
      engine.setMorph?.(LOCK_PULL, LOCK_GRIP, morphed)
    }
  }

  if (!live && force <= 0) {
    cancelAnimationFrame(liveRaf)
    liveRaf = 0
    engine.setForce?.(0)
    appliedForce = 0
    syncPause()
  }
}

function startLiveLoop () {
  if (!liveRaf) liveRaf = requestAnimationFrame(liveLoop)
}

// ---------------------------------------------------------------------------
// 文字進場：捲到區塊時由上而下逐項淡入。與粒子無關，獨立一段。
//
// ⚠️ 初始的 opacity:0 是用 JS 設的，不是 CSS —— 寫在 CSS 裡的話，萬一 JS 沒跑起來
// （載入失敗、或 gsap plugin 沒註冊）文字就永遠看不見了。用 JS 設至少是「壞掉時
// 文字仍然是可見的」。這一區在首屏之外，設定前的那一幀使用者也看不到。
//
// once: true —— 進場動畫只播一次，來回捲動不重播（重播會很煩）。
// ---------------------------------------------------------------------------
const STAGGER_STEP = 0.09      // 每項之間的間隔（秒）
const STAGGER_DUR = 0.7        // 單項的淡入時長
const STAGGER_Y = 16           // 從下方多少 px 浮上來

let staggerTriggers = []

// 每個區塊各自一組 —— 兩區共用一組的話，捲到 PL.IV 時 PL.V 的文字就一起播完了。
function initStagger (root) {
  if (!root) return
  const { $gsap, $ScrollTrigger } = useNuxtApp()
  if (!$gsap || !$ScrollTrigger) return

  const els = root.querySelectorAll('[data-stagger]')
  if (!els.length) return
  // reduced-motion：不做動畫，文字維持原樣直接可見
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  $gsap.set(els, { opacity: 0, y: STAGGER_Y })
  staggerTriggers.push($ScrollTrigger.create({
    trigger: root,
    start: 'top 75%',
    once: true,
    onEnter: () => {
      $gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: STAGGER_DUR,
        ease: 'power2.out',
        stagger: STAGGER_STEP,
      })
    },
  }))
}

function syncPause () {
  if (!engine) return
  engine.pause(!((live || force > 0) && !document.hidden && !idle.value))
}

watch(idle, (v) => {
  if (!engine) return
  syncPause()
  if (!v && live) startLiveLoop()
})

async function goLive () {
  if (!engine) return
  live = true
  syncPause()
  if (!ready || targetsStale()) await buildAllShapes()
  startLiveLoop()
}

function goIdle () {
  live = false
  startLiveLoop()
}

async function init () {
  const canvas = canvasRef.value
  if (!canvas) return

  await loadParticleKit()
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  for (const s of STAGES) {
    const spec = await window.PLImage.prepare(s.image, {
      count: SAMPLES,
      colors: SPECIES,
      fit: FIT,
    })
    specs.push(spec)
    palettes.push(paletteToLinear(spec.palette))
  }

  engine = await window.makeEngine(canvas, {
    species: SPECIES,
    count: SAMPLES,
    palette: specs[0].palette,
    seedPattern: specs[0].pattern,
    preset: 'spiral-conveyor',      // 非對稱矩陣，不會收斂成不動的菌落球
    forceFactor: 0,
    friction: 0.35,
    minR: 5,
    rMax: 60,
    repel: 1.0,
    simSpeed: SIM_SPEED,
    cameraZoom: STAGES[0].zoom,
    pointSize: 0.85,
    particleOpacity: STAGES[0].opacity,
    showGlow: false,
    cellSubdivisions: 2,
    maxDpr: 1.5,
  })
  backend.value = engine.backend
  if (import.meta.dev) window.__venuefaq = engine

  await new Promise((r) => {
    let n = 0
    const tick = () => (++n < 8 ? requestAnimationFrame(tick) : r())
    requestAnimationFrame(tick)
  })

  await buildAllShapes()
  engine.setMorph?.(LOCK_PULL, LOCK_GRIP, 0)
  applyProgress()

  onVisibility = () => syncPause()
  document.addEventListener('visibilitychange', onVisibility)
  onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => { if (targetsStale()) buildAllShapes() }, RESIZE_SETTLE_MS)
  }
  window.addEventListener('resize', onResize)

  const { $ScrollTrigger } = useNuxtApp()
  if ($ScrollTrigger) {
    // 交棒：整個 IV+V 區段進到畫面中央就搶台（此時 canvas 已鋪滿視窗、
    // 背景粒子被整片蓋掉），離開就交還。
    const stageTrigger = $ScrollTrigger.create({
      trigger: wrapRef.value,
      start: 'top center',
      end: 'bottom center',
      onToggle: self => (self.isActive ? claimStage(STAGE) : releaseStage(STAGE)),
    })
    triggers.push(stageTrigger)
    // 變形：FAQ 區塊頂邊從畫面底捲到 70% 的這段 = venue 流成 faq。scrub 讓它可逆。
    triggers.push($ScrollTrigger.create({
      trigger: faqRef.value,
      start: 'top bottom',
      end: 'top 70%',
      scrub: true,
      onUpdate: (self) => { progress = self.progress },
      onRefresh: (self) => { progress = self.progress },
    }))
    $ScrollTrigger.refresh()
    // ⚠️ onToggle 只在「狀態改變」時觸發。init 是 async 的（載 kit + 取樣兩張圖，
    // 約 1～2 秒），使用者很可能在這之前就已經捲到這一區了 —— 那時 trigger 一建立
    // 就是 active，沒有「改變」可言，onToggle 永遠不會叫。必須自己補一次。
    if (stageTrigger.isActive) claimStage(STAGE)
  }

  if (activeStage.value === STAGE) goLive()
  else syncPause()
}

watch(activeStage, (v) => {
  if (!engine) return
  if (v === STAGE) goLive()
  else goIdle()
})

onMounted(() => {
  // 與 canvas 各自獨立：粒子初始化失敗也不該讓文字消失
  initStagger(venueRef.value)
  initStagger(faqRef.value)
  init()
})

onBeforeUnmount(() => {
  releaseStage(STAGE)
  staggerTriggers.forEach(t => t.kill())
  if (liveRaf) cancelAnimationFrame(liveRaf)
  triggers.forEach(t => t.kill())
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  clearTimeout(resizeTimer)
  if (onResize) window.removeEventListener('resize', onResize)
  if (engine) { engine.destroy(); engine = null }
})

defineExpose({ backend })
</script>

<template>
  <!-- ⚠️ wrapper 要有不透明底色。背景粒子場是 fixed 鋪在整頁底下的，這兩區在設計上
       是純黑底、不該看到它 —— 靠這層底色蓋掉，而不是靠 canvas 自己（canvas 一 pause
       就只剩凍結的最後一幀，蓋不乾淨）。
       底色的範圍剛好只到 FAQ 結束，所以再往下捲到票券區塊，背景場自然就露出來了。 -->
  <div ref="wrapRef" class="relative overflow-clip bg-[#0a0a0c]">
    <!-- 零高度的 sticky 容器 + 溢出的 canvas：canvas 捲過兩區時留在畫面上，
         但不佔文件流高度，下面兩個 section 照常排版。
         ⚠️ 因為容器是 h-0、canvas 用 h-screen 往下溢出，wrapper 一定要裁切，
         否則捲到底時 canvas 會繼續往下畫、糊到票券區塊上（實際發生過）。
         ⚠️ 而且只能用 overflow-clip，不能用 overflow-hidden ——
         hidden 會建立 scroll container，裡面的 position:sticky 就失效了；
         clip 只裁切、不建立 scroll container，sticky 照常運作。 -->
    <div class="pointer-events-none sticky top-0 z-0 h-0">
      <canvas
        id="venue-faq-canvas"
        ref="canvasRef"
        aria-hidden="true"
        class="block h-screen w-full"
      />
    </div>

    <!-- PL. IV — Venue。設計稿是兩欄：左欄固定 484 寬只放卷號，右欄 flex-1 放內容。
         兩欄各自有自己的 border-t（不是同一條線橫貫），右欄再多 24px 內縮。 -->
    <section
      id="venue"
      ref="venueRef"
      class="relative z-10 min-h-[658px]"
    >
      <div class="flex flex-col lg:flex-row lg:items-start">
        <!-- 左欄：卷號。
             ⚠️ data-stagger 掛在「文字的外層」而不是有 border-t 的那層 ——
             分隔線要留在原地，只有文字淡入，線跟著飄會很奇怪。 -->
        <div class="shrink-0 px-6 pt-16 lg:w-[484px] lg:py-[60px] lg:pl-[60px] lg:pr-0">
          <div class="flex flex-col border-t border-pre-800/35 py-8">
            <div data-stagger>
              <p class="font-mono text-[12px] leading-[1.2] tracking-[0.2em] text-pre-800/80">
                PL. IV
              </p>
              <p class="font-serif text-[56px] italic leading-none tracking-[0.02em] text-pre-800">
                IV.
              </p>
              <p class="font-mono text-[12px] leading-[1.2] tracking-[0.2em] text-pre-800/80">
                VENUE
              </p>
            </div>
          </div>
        </div>

        <!-- 右欄：標題 + 交通方式 + 按鈕 -->
        <div class="min-w-0 flex-1 px-6 pb-16 lg:py-[60px] lg:pl-0 lg:pr-[60px]">
          <div class="flex flex-col gap-12 border-t border-pre-800/35 py-8 lg:pl-6">
            <div class="flex flex-col gap-4">
              <h2 data-stagger class="font-serif text-[40px] font-bold italic leading-[1.2] tracking-[0.02em] text-pre-800 lg:text-[64px]">
                Taipei Popop
              </h2>
              <p data-stagger class="font-zh text-[22px] font-bold leading-[1.2] tracking-[0.02em] text-pre-800 lg:text-[28px]">
                瓶蓋工廠台北製造所
              </p>
            </div>

            <div class="flex flex-col gap-12">
              <!-- ⚠️ 這裡的藍是 #71c1f0，不是 token 的 accent-1 (#7cc8f2)。
                   設計稿兩種藍並存（按鈕外框用 accent-1、這兩個標題用 #71c1f0），
                   不是筆誤，統一與否要問設計師。 -->
              <div class="flex max-w-[650px] flex-col gap-8">
                <div data-stagger class="flex flex-col gap-2">
                  <p class="font-serif text-[28px] font-bold italic leading-[1.2] tracking-[0.02em] text-[#71c1f0] lg:text-[32px]">
                    By MRT
                  </p>
                  <p class="font-Noto text-[16px] leading-[1.6] tracking-[0.08em] text-pre-800/[62%] lg:text-[18px]">
                    捷運南港站 1A 出口，步行至連通道至台鐵/高鐵北門出站，經市民大道向西步行約 5 分鐘
                  </p>
                </div>
                <div data-stagger class="flex flex-col gap-2">
                  <p class="font-serif text-[28px] font-bold italic leading-[1.2] tracking-[0.02em] text-[#71c1f0] lg:text-[32px]">
                    By Train
                  </p>
                  <p class="font-Noto text-[16px] leading-[1.6] tracking-[0.08em] text-pre-800/[62%] lg:text-[18px]">
                    搭乘至南港火車站的北門出站，經市民大道向西步行約 5 分鐘
                  </p>
                </div>
              </div>

              <a
                data-stagger
                :href="VENUE_URL"
                class="inline-flex w-max items-center gap-x-1 border border-accent-1 bg-[#0a0a0c] py-2 pl-5 pr-3 font-Noto text-[16px] font-medium leading-none tracking-[0.1em] text-pre-800 transition-colors hover:bg-accent-1/10"
              >
                更多資訊
                <span class="flex size-6 items-center justify-center">
                  <AtomIcon name="arrow-right-thin" class="h-[5px] w-3" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PL. V — FAQ。兩欄結構與 PL.IV 相同。 -->
    <section
      id="faq"
      ref="faqRef"
      class="relative z-10 min-h-[741px]"
    >
      <div class="flex flex-col lg:flex-row lg:items-start">
        <!-- 左欄：卷號 -->
        <div class="shrink-0 px-6 pt-16 lg:w-[484px] lg:py-[60px] lg:pl-[60px] lg:pr-0">
          <div class="flex flex-col border-t border-pre-800/35 py-8">
            <div data-stagger>
              <p class="font-mono text-[12px] leading-[1.2] tracking-[0.2em] text-pre-800/80">
                PL. V
              </p>
              <p class="font-serif text-[56px] italic leading-none tracking-[0.02em] text-pre-800">
                V.
              </p>
              <p class="font-mono text-[12px] leading-[1.2] tracking-[0.2em] text-pre-800/80">
                FAQ
              </p>
            </div>
          </div>
        </div>

        <!-- 右欄：標題 + 問答 + 分頁 -->
        <div class="min-w-0 flex-1 px-6 pb-16 lg:py-[60px] lg:pl-0 lg:pr-[60px]">
          <div class="flex flex-col gap-12 border-t border-pre-800/35 py-8 lg:pl-6">
            <div class="flex flex-col gap-4">
              <h2 data-stagger class="font-serif text-[40px] font-bold italic leading-[1.2] tracking-[0.02em] text-pre-800 lg:text-[64px]">
                FAQ
              </h2>
              <p data-stagger class="font-zh text-[22px] font-bold leading-[1.2] tracking-[0.02em] text-pre-800 lg:text-[28px]">
                常見問答
              </p>
            </div>

            <ul class="flex flex-col">
              <li
                v-for="(item, i) in FAQS"
                :key="item.q"
                data-stagger
                class="flex gap-x-4 border-b border-dashed border-pre-800/35 py-6 lg:gap-x-6"
                :class="i === 0 ? 'border-t border-dashed' : ''"
              >
                <span class="shrink-0 font-serif text-[20px] font-bold italic leading-[1.4] text-[#71c1f0]">
                  Q{{ i + 1 }}
                </span>
                <div class="flex min-w-0 flex-col gap-3">
                  <p class="font-zh text-[18px] font-bold leading-[1.4] text-pre-800">
                    {{ item.q }}
                  </p>
                  <p class="flex gap-x-2 font-Noto text-[15px] leading-[1.7] tracking-[0.04em] text-pre-800/[62%]">
                    <span class="shrink-0">→</span>
                    <span>{{ item.a }}</span>
                  </p>
                </div>
              </li>
            </ul>

            <!-- ⚠️ 換頁目前只會改 faqPage，還不會換題目 —— FAQS 是寫死的三題，
                 沒有分頁資料來源。接上 CMS/API 之後，這裡改成依 faqPage 取資料即可。 -->
            <div data-stagger>
              <CommonControlPagination
                v-model:page="faqPage"
                :total="FAQ_TOTAL_PAGES"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
