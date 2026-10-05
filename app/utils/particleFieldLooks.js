// 五組主視覺直接對齊設計師 sandbox 的 PRESETS：
// https://frank890417.github.io/webconf-visual-2026/sandbox.js
// rules／seed／色盤／物理／取景／待機速度保留原值；粒子數仍依裝置面積與效能縮減。
// 頁面底色與捲動後的圖片、花形、菌落編排由元件控制，不寫回範本。
// 開場造型由 useParticleOpening 保留一秒後釋放，不另換矩陣或永久拉回 seed。
export const PARTICLE_FIELD_LOOKS = {
  'cobalt-cells': {
    id: 'cobalt-cells', index: 1, name: 'Cobalt Cells 鈷藍細胞',
    palette: 'blue',
    rules: { preset: 'cellular', seedPattern: 'softClusters', species: 6 },
    physics: { forceFactor: 0.95, friction: 0.31, repel: 1.1, minR: 5, rMax: 72 },
    visual: { pointSize: 0.9, showGlow: false, heroOpacity: 0.6, aboutOpacity: 0.82 },
    glow: { glowSize: 3.2, glowIntensity: 0.016, glowSteepness: 5.5 },
    camera: { zoom: 1.4 },
    budget: { density: 0.0278, max: 36000, min: 9000 },
    speed: { idle: 0.4, max: 0.8 },
    ambient: 0.55,
    hold: { pull: 0, grip: 0 },
  },
  'biolum-drift': {
    id: 'biolum-drift', index: 2, name: 'Bioluminescent Drift 深海流光',
    palette: 'bioluminescence',
    rules: { preset: 'spiral-conveyor', seedPattern: 'rainbowSpiral', species: 6 },
    physics: { forceFactor: 0.9, friction: 0.3, repel: 1.0, minR: 5, rMax: 84 },
    visual: { pointSize: 0.8, showGlow: true, heroOpacity: 0.55, aboutOpacity: 0.75 },
    glow: { glowSize: 5, glowIntensity: 0.03, glowSteepness: 4.5 },
    camera: { zoom: 1.2 },
    budget: { density: 0.037, max: 48000, min: 9000 },
    speed: { idle: 0.3, max: 0.6 },
    ambient: 0.55,
    hold: { pull: 0, grip: 0 },
  },
  'parchment-herbarium': {
    id: 'parchment-herbarium', index: 3, name: 'Herbarium Specimen 標本切片',
    palette: 'parchment',
    rules: { preset: 'shells', seedPattern: 'orbitalBelts', species: 7 },
    physics: { forceFactor: 1.0, friction: 0.32, repel: 1.2, minR: 5, rMax: 70 },
    visual: { pointSize: 1.0, showGlow: false, heroOpacity: 0.75, aboutOpacity: 0.95 },
    glow: { glowSize: 3, glowIntensity: 0.012, glowSteepness: 6 },
    camera: { zoom: 1.5 },
    budget: { density: 0.0208, max: 27000, min: 9000 },
    speed: { idle: 0.45, max: 0.9 },
    ambient: 0.55,
    hold: { pull: 0, grip: 0 },
  },
  'fluoro-swarm': {
    id: 'fluoro-swarm', index: 4, name: 'Fluoro Swarm 螢光群飛',
    palette: 'fluoro',
    rules: { preset: 'swarm', seedPattern: 'chaoticBands', species: 5 },
    physics: { forceFactor: 1.0, friction: 0.29, repel: 1.1, minR: 5, rMax: 78 },
    visual: { pointSize: 0.85, showGlow: true, heroOpacity: 0.6, aboutOpacity: 0.82 },
    glow: { glowSize: 4, glowIntensity: 0.022, glowSteepness: 5 },
    camera: { zoom: 1.3 },
    budget: { density: 0.0324, max: 42000, min: 9000 },
    speed: { idle: 0.5, max: 1.0 },
    ambient: 0.55,
    hold: { pull: 0, grip: 0 },
  },
  'coral-membrane': {
    id: 'coral-membrane', index: 5, name: 'Coral Membrane 珊瑚薄膜',
    palette: 'coral',
    rules: { preset: 'membrane', seedPattern: 'linkedClusters', species: 6 },
    physics: { forceFactor: 0.92, friction: 0.31, repel: 1.05, minR: 5, rMax: 80 },
    visual: { pointSize: 0.9, showGlow: true, heroOpacity: 0.62, aboutOpacity: 0.85 },
    glow: { glowSize: 4.5, glowIntensity: 0.02, glowSteepness: 5 },
    camera: { zoom: 1.4 },
    budget: { density: 0.0254, max: 33000, min: 9000 },
    speed: { idle: 0.4, max: 0.8 },
    ambient: 0.55,
    hold: { pull: 0, grip: 0 },
  },
}

// 網址上指定效果用的參數名，以及「面板模式」的開關。
//   ?hero-animation=3      指定第 3 組
//   ?hero-animation=random 明講要隨機（= 不帶這個參數）
//   ?tool=1                右下角開工具面板
export const FIELD_LOOK_QUERY = 'hero-animation'
export const FIELD_TOOL_QUERY = 'tool'
export const FIELD_TOOL_VALUE = '1'
export const FIELD_LOOK_RANDOM = 'random'

// SSR 與「查不到」時的保底。⚠️ 這不是站上的預設行為 —— 沒帶 query 時是隨機抽
//（見 fieldLookFromLocation），這個常數只是「什麼都不知道時挑哪一組」。
export const DEFAULT_FIELD_LOOK = 'biolum-drift'

// 依 index 排好的陣列，面板列表與隨機抽都用它
export const FIELD_LOOK_LIST = Object.values(PARTICLE_FIELD_LOOKS).sort((a, b) => a.index - b.index)

// 議程／贊助以 Figma 的藍白色與持續可辨識構圖呈現五種 seed。
// 使用副本，首頁及 404／建置中的原範本參數不受影響。
export function plateFieldLook (look) {
  return {
    ...look,
    palette: 'blue',
    physics: { ...look.physics, minR: 16, repel: 1.4 },
    visual: { ...look.visual, showGlow: false },
    hold: { pull: 12, grip: 82 },
  }
}

/**
 * 取一組效果。認 id（'coral-membrane'）也認 index（5 或 '5'），查無就退回保底 ——
 * 網址上打錯字不該讓首頁變成空白。
 *
 * @param {string|number} idOrIndex
 * @returns {object} PARTICLE_FIELD_LOOKS 的其中一筆
 */
export function resolveFieldLook (idOrIndex) {
  if (idOrIndex && PARTICLE_FIELD_LOOKS[idOrIndex]) return PARTICLE_FIELD_LOOKS[idOrIndex]

  const n = Number(idOrIndex)
  if (Number.isFinite(n)) {
    const hit = FIELD_LOOK_LIST.find(l => l.index === n)
    if (hit) return hit
  }

  return PARTICLE_FIELD_LOOKS[DEFAULT_FIELD_LOOK]
}

/**
 * 隨機抽一組。
 *
 * ⚠️ 只能在 client 呼叫 —— SSR 抽一次、hydration 再抽一次會抽到不同組。
 * 目前沒有任何 DOM 是從 look 算出來的（canvas 在 onMounted 才建），但之後若把
 * 效果名字印到畫面上，就會變成 hydration mismatch。
 *
 * @param {object} [exclude] 不要抽到這一組（面板連按「隨機」時才不會抽到同一組）
 * @returns {object}
 */
export function randomFieldLook (exclude = null) {
  const pool = exclude ? FIELD_LOOK_LIST.filter(l => l.id !== exclude.id) : FIELD_LOOK_LIST

  return pool[Math.floor(Math.random() * pool.length)] || FIELD_LOOK_LIST[0]
}

/**
 * 依網址決定要跑哪一組：有 ?hero-animation= 就照它，沒有就隨機抽。
 *
 * 值有白名單（resolveFieldLook 查不到就退回保底），所以正式站也可以開著 ——
 * 這正是要給設計 / 團隊在同一個部署上比較用的。
 *
 * ⚠️ 只能在 client 呼叫（讀 window.location）。
 *
 * @returns {{ look: object, pinned: boolean, tool: boolean }}
 *   pinned  true = 網址指定的，false = 這次隨機抽到的
 *   tool    true = 要顯示右側切換面板
 */
export function fieldLookFromLocation () {
  if (typeof window === 'undefined') {
    return { look: PARTICLE_FIELD_LOOKS[DEFAULT_FIELD_LOOK], pinned: false, tool: false }
  }

  const q = new URLSearchParams(window.location.search)
  const want = q.get(FIELD_LOOK_QUERY)
  const tool = q.get(FIELD_TOOL_QUERY) === FIELD_TOOL_VALUE
  const pinned = !!want && want !== FIELD_LOOK_RANDOM

  return { look: pinned ? resolveFieldLook(want) : randomFieldLook(), pinned, tool }
}

// --- 效能診斷用的參數 -------------------------------------------------------
// 跟上面 ?hero-animation / ?tool 同一套規矩：值有白名單、打錯字就當沒帶、
// 正式站也可以開著。放在同一支檔案是為了維持「只有一個地方知道網址長什麼樣」。
//   ?tier=0|1|2|3   強制效能檔位（不做裝置偵測、不做任何升降）
//   ?tier=auto      明講要自動（= 不帶這個參數）
//   ?fps=1          打開引擎自帶的 fps overlay（會印 fps · count · backend）
export const PARTICLE_TIER_QUERY = 'tier'
export const PARTICLE_FPS_QUERY = 'fps'
export const PARTICLE_TIER_AUTO = 'auto'

/**
 * 讀效能診斷參數。
 *
 * ⚠️ 只能在 client 呼叫（讀 window.location），跟 fieldLookFromLocation 同樣的限制。
 *
 * @returns {{ forcedTier: number|null, showFps: boolean }}
 *   forcedTier  null = 照裝置偵測走；0~3 = 強制指定
 *   showFps     true = 打開引擎的 fps overlay
 */
export function particleDebugFromLocation () {
  if (typeof window === 'undefined') return { forcedTier: null, showFps: false }

  const q = new URLSearchParams(window.location.search)

  const raw = q.get(PARTICLE_TIER_QUERY)
  const n = Number(raw)
  const forcedTier = raw && raw !== PARTICLE_TIER_AUTO && Number.isInteger(n) && n >= 0 && n <= 3
    ? n
    : null

  return { forcedTier, showFps: q.get(PARTICLE_FPS_QUERY) === '1' }
}

/**
 * 把目前選的效果寫回網址，不留下一堆 history —— 面板切換後重整還是同一組，
 * 網址也可以直接複製給別人看。
 *
 * @param {object|null} look null = 改回隨機（把參數拿掉）
 */
export function syncFieldLookQuery (look) {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  if (look) url.searchParams.set(FIELD_LOOK_QUERY, String(look.index))
  else url.searchParams.delete(FIELD_LOOK_QUERY)

  window.history.replaceState(window.history.state, '', url)
}

/**
 * 把一組效果套到「已經在跑」的引擎上，不重建 canvas。
 *
 * ⚠️ 相機 zoom、模擬速度、透明度不在這裡 —— 那三個是 ParticleField 每幀依捲動
 * 狀態重算後寫進去的，在這裡寫了下一幀就被蓋掉。切換時由呼叫端自己換掉 look
 * 變數，下一幀的迴圈就會拿到新值。
 *
 * ⚠️ setSpecies / setCount 會整場重生成粒子，收攏用的 targets buffer 也會被重配
 * （engine.targetsGeneration 會跳號）。呼叫端切換後必須重建 targets，否則 seek
 * 會對著全 0 的目標把整場粒子吸到左上角。
 *
 * setter 一律用 optional call —— canvas2d / webgl2 那兩個 fallback 後端沒有實作
 * 全部的控制面。
 *
 * @param {object} engine  makeEngine 的產物
 * @param {object} look    PARTICLE_FIELD_LOOKS 的其中一筆
 * @param {object} [opts]
 * @param {number} [opts.count]      要一起改的點數（依新的 budget 算好再傳）
 * @param {boolean} [opts.allowGlow] false 就強制關光暈（手機省填充率）
 * @param {string[]} [opts.palette]  色盤色碼陣列，不給就照 look.palette 去查
 */
export function applyFieldLook (engine, look, opts = {}) {
  if (!engine || !look) return

  const { count, allowGlow = true, palette } = opts

  // 點數／物種的 setter 會重生，先選新 seed，避免切換後仍畫上一組造型。
  engine.setSeedPattern?.(look.rules.seedPattern)
  const willRespawn = (count && count !== engine.config.count) || look.rules.species !== engine.config.species
  if (count) engine.setCount?.(count)
  engine.setSpecies?.(look.rules.species)
  engine.setPreset?.(look.rules.preset)
  if (!willRespawn) engine.respawn?.()

  const colors = palette || window.PLPalettes?.PALETTES?.[look.palette]?.particles
  if (colors) engine.setPalette?.(colors)

  engine.setForce?.(look.physics.forceFactor)
  engine.setFriction?.(look.physics.friction)
  engine.setRepel?.(look.physics.repel)
  engine.setMinR?.(look.physics.minR)
  engine.setRMax?.(look.physics.rMax)

  engine.setPointSize?.(look.visual.pointSize)
  engine.setShowGlow?.(allowGlow && look.visual.showGlow)
  engine.setGlowSize?.(look.glow.glowSize)
  engine.setGlowIntensity?.(look.glow.glowIntensity)
  engine.setGlowSteepness?.(look.glow.glowSteepness)
}
