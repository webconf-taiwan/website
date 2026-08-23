// 首頁粒子場的「效果目錄」。
//
// 來源是 WebConf visual sandbox（docs/particle-kit 那份 demo 的 sandbox.html）右上角
// 「— 載入範例 —」下拉的那 5 組，加上從 sandbox 匯出的 1.json ~ 5.json。原本這些數值
// 是散在 ParticleField.vue 的一堆常數裡、要換效果得逐行改，現在集中成一張表。
//
// ─── 這張表「不含」什麼 ────────────────────────────────────────────────────
// 只放「這個效果長什麼樣」：力矩陣、開場種子、物理、點大小、光暈、色盤、相機。
// 捲動編排（開場包絡、收攏拉力 MORPH_*、ScrollTrigger 範圍、交棒追趕）留在
// ParticleField.vue —— 那是版面的事，換效果不該動到它。
//
// ─── sandbox 數值怎麼換算到站上 ────────────────────────────────────────────
// sandbox 是滿版單一 canvas、沒有其他內容在跑；站上這張場要跟版面、另外兩張
// canvas、行動裝置共存，所以三個欄位是「等比縮到站上基準」而不是照抄：
//
//   基準 = 深海流光（= 目前線上的 hero），sandbox 原值 count 80000 /
//          simSpeed 0.3 / cameraZoom 1.2，對應站上的 48000 / 0.16 / 1.35。
//
//   budget  density = 0.037 × (該組 count ÷ 80000)      max 同比例
//           ⚠️ 點數不寫死，density 才是契約 —— 力場成本是 N²/面積，
//              寫死的數字在窄視窗上會爆掉（見 useParticleBudget 的長註解）。
//   speed   idle / max = 0.16 / 0.6 × (該組 simSpeed ÷ 0.3)
//   camera  zoom = 1.35 × (該組 cameraZoom ÷ 1.2)
//
// 其餘欄位（species / 物理 / pointSize / 透明度 / 光暈）都是絕對值，直接照各組的
// JSON。唯一例外是 biolum-drift，見該組的註解。
//
// ─── ⚠️ 力矩陣被換掉了，這是最重要的一段 ──────────────────────────────────
// sandbox 那 5 組範例是「出圖用」的預設（每組都帶 exportGlow / exportScale，那個
// 工具本來就是取素材實驗場），5 組裡有 4 組直接搬到滿版 hero 上是壞的：
//
//   實測 1440×900、跑滿 25 秒：
//     cellular（原 #1）  36000 顆塌成約 8 顆球      → 畫面近乎全黑
//     shells  （原 #3）  塌成約 60 顆實心圓點
//     swarm   （原 #4）  塌成約 6 顆發光球          → 畫面近乎全黑
//     membrane（原 #5）  塌成散落的小球
//   （不是換算錯：把 sandbox.html 跑起來餵 3.json 的原始參數，結果一模一樣。）
//
// 原因：這四組的力矩陣是對稱的（m[i][j] === m[j][i]）或自吸引極強，都存在靜止解
// —— 粒子擠成不動的球之後就再也不動了。原本 hero 選 spiral-conveyor 正是因為它
// 非對稱。ParticleField.vue 開頭那段「活起來的四個關鍵」講的就是這件事。
//
// 所以每組的「視覺個性」（色盤、點大小、透明度、光暈、密度、相機、速度）全部照
// sandbox 保留，只把力矩陣換成 kit 裡「非對稱、沒有靜止解」的同質選項。每組的
// swappedFrom 記著原本是哪一個，要回去對照隨時可以換回來。
//
// 判斷方法（自己要再換時照做）：把 particle-life-rules.js 裡那個函式的 m[i][j]
// 與 m[j][i] 比一下 ——
//   相等          → 對稱，會收斂，不能當 hero（cellular / swarm / membrane /
//                   chains1~3 / ring-road / symbiosis / bipartite / triad-flocks）
//   相反或不相等  → 非對稱，會一直追逐（spiral-conveyor / snake / orbital / rps /
//                   tri-spiral / vortex / helical / wavefield / predator）
// 另外 self（i===j）給正值越大，越容易先塌成球，即使非對稱也一樣（shells 的 0.9
// 就是這樣塌的）—— snake 的 self=1 能用，是因為它對「非鄰居」給 0 而不是負值，
// 群落之間沒有互斥力去把彼此擠成孤立的球。
//
// motion 欄位：這 5 組現在全是 chase（非對稱、站上待機速度下也還在動）。
//
// ─── hold：維持開場構圖的拉力 ──────────────────────────────────────────────
// 換完矩陣之後還有第二個問題：五組看起來太像。因為真正好看、也真正有辨識度的是
// seedPattern 畫出來的「開場構圖」（softClusters 的細胞團、orbitalBelts 的同心帶、
// chaoticBands 的亂流條紋…），而規則一接管幾秒內就把它洗掉了 —— 剩下的都是同一種
// 「飄浮細塵」。particle-life-seeds.js 的檔頭自己就寫著：
//   "the opening read is what people see and remember"
//
// 所以每組多了一組 hold = { pull, grip }，用 PL.II 收攏圖片那套 shader seek 力
// 把開場構圖按住（見 useParticleMorph 的 buildSeedTargets）。關鍵是這個力與
// particle-life 的互動力場「同時作用」，所以構圖留得住、粒子仍在裡面游動 ——
// 是活的構圖，不是靜止貼圖。
//
//   pull  每單位距離想要的靠攏速度。調大 = 更貼合開場構圖。
//   grip  速度被導引的強度。這是主要旋鈕：
//           0        完全不維持（＝純湧現，規則想怎麼演就怎麼演）
//           12~25    鬆握，構圖看得出來但會慢慢流動變形
//           30~50    握緊，構圖清楚，內部仍有運動
//           55~85    近乎鎖死（PL.II 鎖圖片用的區間），內部運動幾乎沒了
// ⚠️ grip 要跟 physics.forceFactor 一起看：力矩陣越想把粒子塌成球，就要越大的
//    grip 才守得住。swappedFrom 那四組已經換成不塌的矩陣，所以鬆握就夠。
// ⚠️ 這個值可以在 ?mode=tool 面板上即時拉，找到滿意的再寫回這裡。
//
// ─── 怎麼換 ────────────────────────────────────────────────────────────────
//   1. 預設      不帶 query 就是「每次進站隨機抽一組」
//   2. 指定一組  ?hero-animation=1 ~ 5（也認 id，例如 ?hero-animation=coral-membrane）
//   3. 現場比較  ?mode=tool 會在畫面右側開一塊面板，點一下就換，不用重整
//   4. dev 即時  console 打 __fieldLook('fluoro-swarm')
//
// 想調出第 6 組：把 sandbox.html 跑起來、右上面板調到滿意、按「⬇ 匯出 .json」，
// 再照上面的換算規則加一筆進 LOOKS 就好。preset / seedPattern / palette 的可用值
// 分別在 public/particle-kit 的 particle-life-rules.js（PRESETS）、
// particle-life-seeds.js（PATTERNS）、particle-palettes.js（PALETTES）。

export const PARTICLE_FIELD_LOOKS = {
  // ── 1 ────────────────────────────────────────────────────────────────────
  // sandbox 原值：count 60000 / simSpeed 0.4 / zoom 1.4 / species 6
  // 力矩陣 cellular → snake：cellular 是 i===j 給 0.8、其餘一律 -0.55 的完全對稱
  // 矩陣，那個 -0.55 會把各物種擠成互不往來的孤立球。snake 一樣是 self 極強（=1）
  // 所以「一顆顆分明的圓群落」這個細胞感留得住，但它對非鄰居給 0（沒有互斥），
  // 而且 i→i+1 是單向吸引（i+1→i 為 0）—— 群落之間會一直互相追逐，不會定格。
  'cobalt-cells': {
    id: 'cobalt-cells',
    index: 1,
    name: 'Cobalt Cells 鈷藍細胞',
    motion: 'chase',
    swappedFrom: 'cellular',
    palette: 'blue',
    rules: { preset: 'snake', seedPattern: 'softClusters', species: 6 },
    physics: { forceFactor: 0.95, friction: 0.31, repel: 1.1, minR: 5, rMax: 72 },
    visual: { pointSize: 0.9, showGlow: false, heroOpacity: 0.6, aboutOpacity: 0.82 },
    glow: { glowSize: 3.2, glowIntensity: 0.016, glowSteepness: 5.5 },
    camera: { zoom: 1.58 },
    budget: { density: 0.0278, max: 36000, min: 9000 },
    speed: { idle: 0.21, max: 0.8 },
    ambient: 0.55,
    // softClusters＝一團團柔邊細胞群。snake 的 SELF=1 本來就想結團，方向一致，
    // 所以鬆握就守得住，還能讓群落之間繼續互追。
    hold: { pull: 6, grip: 28 },
  },

  // ── 2 ────────────────────────────────────────────────────────────────────
  // 目前線上的 hero。
  // ⚠️ 這一組刻意「不是」2.json 的原值 —— 力矩陣與開場種子跟 sandbox 一樣，但其餘
  // 是站上另外調校過的，換過來的話 hero 會有可見變化。差異與原因：
  //   species    7（2.json 是 6）  色盤每組都是 7 色，對齊才不會有兩個物種同色
  //   rMax       72（84）          84 的搜尋窗面積多 36%，48000 顆下不划算
  //   force      1.0（0.9）        對齊 sandbox 預設，收攏後輪廓比較有勁
  //   showGlow   false（true）     這個密度下光暈會糊成一片白霧，只留銳利點
  //   zoom       1.35（1.2）       hero 取景是照版面調的，不是照 sandbox
  // 要看 2.json 的原汁原味就把上面括號裡的值填回去。
  'biolum-drift': {
    id: 'biolum-drift',
    index: 2,
    name: 'Bioluminescent Drift 深海流光',
    motion: 'chase',
    palette: 'blue',              // sandbox 原案用 bioluminescence，站上統一品牌藍
    rules: { preset: 'spiral-conveyor', seedPattern: 'rainbowSpiral', species: 7 },
    physics: { forceFactor: 1.0, friction: 0.3, repel: 1.0, minR: 5, rMax: 72 },
    visual: { pointSize: 0.8, showGlow: false, heroOpacity: 0.55, aboutOpacity: 0.75 },
    glow: { glowSize: 5, glowIntensity: 0.03, glowSteepness: 4.5 },
    camera: { zoom: 1.35 },
    budget: { density: 0.037, max: 48000, min: 9000 },
    speed: { idle: 0.16, max: 0.6 },
    ambient: 0.55,
    // ⚠️ 這組刻意「不維持」開場構圖 —— spiral-conveyor 自己演化出來的絲狀環流
    // 就是目前線上 hero 的樣子，按住反而是退步。要試著按住就把 grip 調到 20 上下。
    hold: { pull: 0, grip: 0 },
  },

  // ── 3 ────────────────────────────────────────────────────────────────────
  // sandbox 原值：count 45000 / simSpeed 0.45 / zoom 1.5 / species 7
  // 力矩陣 shells → tri-spiral：shells 雖然是單向鏈（i 吸 i+1、i+1 不回頭），但
  // SELF 0.9 太強，還沒開始追就先各自塌成實心球（實測約 60 顆圓點）。tri-spiral
  // 的 sin(ph)+sin(3ph) 是完全反對稱（m[i][j] === -m[j][i]）、self 給 -0.05，
  // 塌不起來，長出來的是多分岔的絲狀脈絡 —— 標本切片上的維管束就是這個樣子。
  // 點數最少、pointSize 最大、透明度最高，是 5 組裡最「疏而清楚」的一組。
  'parchment-herbarium': {
    id: 'parchment-herbarium',
    index: 3,
    name: 'Herbarium Specimen 標本切片',
    motion: 'chase',
    swappedFrom: 'shells',
    palette: 'blue',              // sandbox 原案用 parchment
    rules: { preset: 'tri-spiral', seedPattern: 'orbitalBelts', species: 7 },
    physics: { forceFactor: 1.0, friction: 0.32, repel: 1.2, minR: 5, rMax: 70 },
    visual: { pointSize: 1.0, showGlow: false, heroOpacity: 0.75, aboutOpacity: 0.95 },
    glow: { glowSize: 3, glowIntensity: 0.012, glowSteepness: 6 },
    camera: { zoom: 1.69 },
    budget: { density: 0.0208, max: 27000, min: 9000 },
    speed: { idle: 0.24, max: 0.9 },
    ambient: 0.55,
    // orbitalBelts＝同心軌道帶。這是 5 組裡構圖最幾何、最像「標本切片」的一組，
    // 所以握得比別組緊一點，讓那幾條帶子明確看得出來。
    hold: { pull: 6, grip: 32 },
  },

  // ── 4 ────────────────────────────────────────────────────────────────────
  // sandbox 原值：count 70000 / simSpeed 0.5 / zoom 1.3 / species 5
  // 力矩陣 swarm → predator：swarm 是「自己強吸（0.95）、對別人都弱吸（0.18）」，
  // 只靠 ±0.06 的隨機量打破對稱 —— 沒有方向性，整場會併成幾顆巨大的球（實測 6 顆）。
  // predator 把物種 0 設成獵食者：牠追所有人（0.95）、所有人逃離牠（-0.95），
  // 這對數值是相反的 → 永遠追不到、也永遠停不下來，其餘物種之間則弱吸成群。
  // 「群飛」要的就是這個 —— 一群一群被追著跑過整個畫面。
  // ⚠️ 這組與珊瑚薄膜是 5 組裡唯二開光暈的。光暈是額外一趟全螢幕的加法 pass，
  //    填充率成本跟 DPR 平方成正比，行動裝置上會明顯掉 fps ——
  //    ParticleField 因此在手機一律關掉（見那裡的 showGlow 那行）。
  'fluoro-swarm': {
    id: 'fluoro-swarm',
    index: 4,
    name: 'Fluoro Swarm 螢光群飛',
    motion: 'chase',
    swappedFrom: 'swarm',
    palette: 'blue',              // sandbox 原案用 fluoro
    rules: { preset: 'predator', seedPattern: 'chaoticBands', species: 5 },
    physics: { forceFactor: 1.0, friction: 0.29, repel: 1.1, minR: 5, rMax: 78 },
    visual: { pointSize: 0.85, showGlow: true, heroOpacity: 0.6, aboutOpacity: 0.82 },
    glow: { glowSize: 4, glowIntensity: 0.022, glowSteepness: 5 },
    camera: { zoom: 1.46 },
    budget: { density: 0.0324, max: 42000, min: 9000 },
    speed: { idle: 0.27, max: 1.0 },
    ambient: 0.55,
    // chaoticBands＝亂流條紋。這組刻意握最鬆 —— predator 的追逐速度是 5 組裡最快的
    // （實測平均速率約 3 倍），握太緊就把「群飛」那個動感壓掉了。
    hold: { pull: 5, grip: 20 },
  },

  // ── 5 ────────────────────────────────────────────────────────────────────
  // sandbox 原值：count 55000 / simSpeed 0.4 / zoom 1.4 / species 6
  // 力矩陣 membrane → helical：membrane 把最後一個物種當細胞壁（跟所有人互斥、
  // 自己強吸），但那個互斥是對稱的，膜一旦圍好就停在那裡不動了。helical 的
  // A·sin(K(j−i)) 是反對稱的環流項、B·cos(K(i+j)) 是對稱的分層項 —— 兩者疊起來
  // 就是「一層一層、彼此錯開流動的薄片」，膜的層狀感留著，但它一直在推移。
  'coral-membrane': {
    id: 'coral-membrane',
    index: 5,
    name: 'Coral Membrane 珊瑚薄膜',
    motion: 'chase',
    swappedFrom: 'membrane',
    palette: 'blue',              // sandbox 原案用 coral + ink-blue 底
    rules: { preset: 'helical', seedPattern: 'linkedClusters', species: 6 },
    physics: { forceFactor: 0.92, friction: 0.31, repel: 1.05, minR: 5, rMax: 80 },
    visual: { pointSize: 0.9, showGlow: true, heroOpacity: 0.62, aboutOpacity: 0.85 },
    glow: { glowSize: 4.5, glowIntensity: 0.02, glowSteepness: 5 },
    camera: { zoom: 1.58 },
    budget: { density: 0.0254, max: 33000, min: 9000 },
    speed: { idle: 0.21, max: 0.8 },
    ambient: 0.55,
    // linkedClusters＝一串串相連的團塊，很接近「珊瑚」的分枝感。
    hold: { pull: 6, grip: 26 },
  },
}

// 網址上指定效果用的參數名，以及「面板模式」的開關。
//   ?hero-animation=3      指定第 3 組
//   ?hero-animation=random 明講要隨機（= 不帶這個參數）
//   ?mode=tool             右側開切換面板
export const FIELD_LOOK_QUERY = 'hero-animation'
export const FIELD_TOOL_QUERY = 'mode'
export const FIELD_TOOL_VALUE = 'tool'
export const FIELD_LOOK_RANDOM = 'random'

// SSR 與「查不到」時的保底。⚠️ 這不是站上的預設行為 —— 沒帶 query 時是隨機抽
//（見 fieldLookFromLocation），這個常數只是「什麼都不知道時挑哪一組」。
export const DEFAULT_FIELD_LOOK = 'biolum-drift'

// 依 index 排好的陣列，面板列表與隨機抽都用它
export const FIELD_LOOK_LIST = Object.values(PARTICLE_FIELD_LOOKS).sort((a, b) => a.index - b.index)

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

  // 先換點數與物種：兩者都會 respawn，先做才不會把後面設好的東西白做一次
  if (count) engine.setCount?.(count)
  engine.setSpecies?.(look.rules.species)
  engine.setPreset?.(look.rules.preset)
  engine.setSeedPattern?.(look.rules.seedPattern)

  const colors = palette || window.PLPalettes?.PALETTES?.[look.palette]?.particles
  if (colors) engine.setPalette?.(colors)

  engine.setForce?.(look.physics.forceFactor)
  engine.setFriction?.(look.physics.friction)
  engine.setRepel?.(look.physics.repel)
  engine.setRMax?.(look.physics.rMax)

  engine.setPointSize?.(look.visual.pointSize)
  engine.setShowGlow?.(allowGlow && look.visual.showGlow)
  engine.setGlowSize?.(look.glow.glowSize)
  engine.setGlowIntensity?.(look.glow.glowIntensity)
  engine.setGlowSteepness?.(look.glow.glowSteepness)
}
