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
const ABOUT_PALETTE = 'slime'        // PL.II 金／橄欖色的那團

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

const HERO_ZOOM = 1.35
const ABOUT_ZOOM = 1.75              // 進 about 推近一點，讓群落讀起來更密
// about 區塊時，畫面內容往左推的比例（相對視窗寬度）。設計稿上那團在左側約 1/3。
// ⚠️ 上限：粒子只存在於 [0,W]×[0,H]，相機推出這個範圍就會看到空白。
// 可推的最大比例 = (1 − 1/zoom) / 2 × zoom = (zoom − 1) / 2，ABOUT_ZOOM 1.75 → 0.375。
// 目前 0.30 留了餘裕；要再往左推就得同步調高 ABOUT_ZOOM。
const ABOUT_SHIFT = 0.30
const HERO_OPACITY = 0.55
const ABOUT_OPACITY = 0.4

// 粒子預算：保守起步，開場實測 fps 再決定加減（docs §10 陷阱二）
const COUNT_DESKTOP = 48000
const COUNT_MOBILE = 16000
// --------------------------------------------------------------------------

let engine = null
let stopAmbient = null
let onVisibility = null
let driftRaf = 0
let scrollTrigger = null
let reducedMotion = false

// 捲動進度 0（hero）→ 1（about）。相機漂移迴圈每幀讀它，跟 idle drift 疊加後
// 一次寫進相機 uniform —— 兩者搶同一個 setCameraOffset，必須合在同一處算。
let progress = 0

// 捲動速度 → 模擬速度的狀態（見 driftLoop）
let simSpeed = SIM_SPEED_INTRO
let lastScrollY = 0
let lastTime = 0
let introStart = 0                   // 引擎就緒的時刻，開場包絡從這裡算

let heroLin = null
let aboutLin = null

// --- 色盤在線性光空間插值（naive sRGB 插值中點會發灰，同 people.vue）---------
function srgbToLinear (v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
function linearToByte (v) {
  v = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
  return Math.max(0, Math.min(255, Math.round(v * 255)))
}
function paletteToLinear (pal) {
  return pal.map((h) => {
    const n = parseInt(h.slice(1), 16)
    return [srgbToLinear((n >> 16) & 255), srgbToLinear((n >> 8) & 255), srgbToLinear(n & 255)]
  })
}
function lerpPaletteLinear (linA, linB, e) {
  const out = []
  const n = Math.min(linA.length, linB.length)
  for (let i = 0; i < n; i++) {
    const a = linA[i]; const b = linB[i]
    out.push('#'
      + linearToByte(a[0] + (b[0] - a[0]) * e).toString(16).padStart(2, '0')
      + linearToByte(a[1] + (b[1] - a[1]) * e).toString(16).padStart(2, '0')
      + linearToByte(a[2] + (b[2] - a[2]) * e).toString(16).padStart(2, '0'))
  }
  return out
}

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
    const target = base
      + (SIM_SPEED_MAX - SIM_SPEED_IDLE) * Math.min(1, v / SCROLL_REF)
    // 加速追得快、減速拖得慢
    const k = target > simSpeed ? ATTACK : RELEASE
    simSpeed += (target - simSpeed) * k
    engine.setSimSpeed?.(simSpeed)
  }
  lastTime = t
  lastScrollY = y

  const p = progress
  const { W } = engine.size
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
}

// 捲動只改「相機 + 色盤 + 透明度」，完全不碰粒子位置 → 模擬不中斷。
function applyProgress (p) {
  progress = Math.min(1, Math.max(0, p))
  if (!engine) return
  const e = progress * progress * (3 - 2 * progress)   // smoothstep，兩端收尾自然
  if (heroLin && aboutLin) engine.setColors?.(lerpPaletteLinear(heroLin, aboutLin, e))
  engine.setParticleOpacity?.(HERO_OPACITY + (ABOUT_OPACITY - HERO_OPACITY) * e)
}

function syncPause () {
  // 固定背景永遠在視窗內，所以只需要理分頁隱藏（rAF 在背景分頁只是降頻，不是停止）
  if (engine) engine.pause(document.hidden)
}

async function init () {
  const canvas = canvasRef.value
  if (!canvas) return

  await loadParticleKit()
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const PAL = window.PLPalettes.PALETTES
  const hero = PAL[HERO_PALETTE]
  const about = PAL[ABOUT_PALETTE]
  heroLin = paletteToLinear(hero.particles)
  aboutLin = paletteToLinear(about.particles)

  const count = window.innerWidth < 768 ? COUNT_MOBILE : COUNT_DESKTOP

  engine = await window.makeEngine(canvas, {
    species: SPECIES,
    count,
    preset: PRESET,
    seedPattern: 'rainbowSpiral',   // 固定開場構圖；之後由規則接管（docs §6）
    palette: hero.particles,
    bgFade: hero.bgFade,
    // 物理常數對齊 SandboxScience 預設（實測 Force 1 / Repel 1 / Friction 0.3）
    forceFactor: 1.0,
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

  onVisibility = () => syncPause()
  document.addEventListener('visibilitychange', onVisibility)
  syncPause()

  introStart = performance.now()
  lastScrollY = window.scrollY
  if (import.meta.dev) {
    window.__fieldDbg = () => ({ age: Math.round(performance.now() - introStart), simSpeed: +simSpeed.toFixed(3), engineSim: engine.config.simSpeed })
  }
  driftLoop()

  // 開場實測 fps，不夠就砍半（docs §10 陷阱二）。setCount 會整場重生，所以趁早做。
  setTimeout(() => {
    const fps = engine?.getFps ? engine.getFps() : 60
    if (fps > 0 && fps < 45) engine.setCount?.(Math.round(count / 2))
  }, 5000)

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
