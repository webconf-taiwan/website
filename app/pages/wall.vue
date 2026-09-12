<script setup>
// PL. W — 顯影牆（Emergence Wall）
//
// 現場那台大電視跑的就是這一頁：滿版粒子場（跟首頁 hero 同一套引擎、同一組 look），
// 加一支對著人群的攝影機。人走過去，粒子會在他的位置「凝聚成人形」。
//
// ─── 為什麼不是「把人像畫上去」 ────────────────────────────────────────────
// 最直覺的作法是拿 greenscreen.vue 那套人像遮罩，把去背的人直接疊在粒子上 ——
// 但那只是一張貼在畫面上的照片，粒子場變成壁紙，兩者沒有關係，也沒有「這面牆
// 認得我」的感覺。而且會拍到臉，隱私上也不想在現場公開播。
//
// 這裡的作法是：畫面上「一顆新粒子都沒有多」。人形完全是既有粒子重新排列出來的
// 密度差 —— 靠三件事讀出人的形狀：
//
//   1. 凝聚：輪廓外圈一圈（BAND 半徑）之內的粒子，全部被吸到輪廓上再往內沉一點。
//      → 身體變成一團明顯更密、更亮的粒子；身體外圍相對地空出一圈暗帶。
//        那圈暗帶（負空間）比身體本身更能讓「人」跳出來，尤其在遠處看大電視。
//   2. 描邊：外圈粒子是被映射到「最近的輪廓點」，所以會自然堆在邊緣上 ——
//      不用另外畫線就有一圈發亮的人形輪廓。
//   3. 選色：亮色物種的招募半徑比暗色大（speciesReach），所以被吸進身體的
//      偏亮/偏白，留在場上的偏深藍 —— 人是亮的、背景是暗的，不必動到色盤。
//
// 站著不動 → 形狀慢慢收緊變清晰；揮手快速移動 → 粒子跟不上，拖出殘影。
// 這個「慢半拍」是刻意的（MASK_RELEASE 比 MASK_ATTACK 小很多），它是現場最好玩、
// 也最容易讓人拿手機錄影的部分。
//
// ─── 機制上怎麼做到的 ──────────────────────────────────────────────────────
// 引擎的 morph seek（見 particle-life-gpu.js 的 particleAdvance）：每顆粒子有一個
// 以 slot 為索引的目標點，shader 每幀把速度往「(target − pos) × pull」導引，導引
// 強度是 grip。粒子互相作用的力場全程照跑，所以形狀是活的。
//
//   · 每顆粒子有一個固定的「家」（homeU/homeV，正規化螢幕座標，分層取樣後洗牌）。
//   · 每一個相機幀：人像遮罩 → 螢幕空間網格 → 距離轉換 → 算出每顆粒子這一幀的
//     目標點（在家附近，或被拉到輪廓上）→ setTargets。
//   · 沒人時 grip 降到 0，seek 完全關掉 → 畫面就是首頁 hero 那個自由場，一模一樣。
//
// ⚠️ grip / pull 是「全場共用」的 uniform，沒辦法只對某些粒子開。人形之所以還是
//    只發生在人身上，靠的是 seek 力與距離成正比：離家 300px 的粒子 desiredV 是
//    300×pull，而待在家附近的粒子幾乎是 0。差別是距離做出來的，不是 grip。
//
// ⚠️ 也因為 grip 是全域的，有人的時候整片場都會被「輕輕按」在自己的家上，畫面
//    會比自由場整齊一點。這是刻意留著的對比：沒人＝有機的亂流，有人＝場繃緊、
//    然後你從裡面浮出來。要放掉這個對比就把 WALL_GRIP 調小（形狀會鬆、但更野）。
//
// 相依：/public/mediapipe（selfie segmenter，與 greenscreen.vue 共用同一份自架
// wasm/模型）、/public/particle-kit（粒子引擎）。全程在瀏覽器裡跑，影像不上傳、
// 不錄影、不存檔，畫面上也永遠不會出現相機原影像。
//
// 現場操作：進頁面 → 點「啟動鏡頭」→ 按 F 全螢幕 → 按 H 收掉文字。
// 網址參數：?look=<id|1..5> 指定效果、?mirror=0 關鏡像、?debug=1 顯示診斷。

definePageMeta({ layout: false })

useSeoMeta({
  title: '顯影牆 · Webconf',
  description: '現場大螢幕的即時粒子裝置：人走過去，粒子場會凝聚成你的人形。',
})

const { loadParticleKit } = useParticleKit()
const { countFor, maxDpr } = useParticleBudget()
const { paletteToLinear } = useParticleMorph()

const canvasRef = ref(null)
const videoRef = ref(null)

// idle = 還沒開鏡頭 / starting = 要權限中 / live = 跑著 / error
const state = ref('idle')
const errorMsg = ref('')
const showUi = ref(true)
const present = ref(false)          // 這一刻鏡頭前有沒有人（給 UI 用）
// 網址參數在 setup 就讀（用 useRoute 而不是 window.location），SSR 與 client 才一致，
// 按鈕文案不會先閃一下正常版再換成假人版。
const route = useRoute()
// ?debug=1：左上角診斷數字
const debugOn = ref(route.query.debug === '1')
// 角落的即時時鐘。SSR 時留空字串 —— 伺服器與瀏覽器的時間不會一樣，先渲染出來
// 就是保證的 hydration 落差。掛載後才開始走。
const clock = ref('')
const today = ref('')
// ?fake=1：不開相機，改用畫出來的假人跑完整條管線。現場架設前調參數用。
const fakeMode = ref(route.query.fake === '1')
const dbg = ref('')

// ── 可調參數 ───────────────────────────────────────────────────────────────

// 遮罩網格：不是用 256×256 的原始遮罩直接查，而是先重新取樣成「螢幕空間」的一張
// 小網格。這樣鏡像、cover 裁切、視窗比例全部在這一步解決掉，後面每顆粒子的查表
// 就只是一次陣列索引。160 格寬在 1080p 上約 12px 一格，比人形的細節（手指）粗，
// 但比手臂細 —— 剛好。再細只會讓距離轉換變貴、遮罩的雜訊變明顯。
const GRID_W = 160

// 遮罩的時間平滑。ATTACK 快（人一進來馬上有反應）、RELEASE 慢（離開/揮手時留殘影）。
// ⚠️ 這兩個值就是現場手感的主要旋鈕，比任何粒子參數都有感。
const MASK_ATTACK = 0.55
const MASK_RELEASE = 0.11
const MASK_ON = 0.5                 // 平滑後高於這個算前景

// 前景格子佔全畫面的比例，低於這個當作「沒人」。0.004 ≈ 遠處走過的一個人。
// 太低會被鏡頭雜訊觸發（整面牆對著空氣抖動），太高則要走到很近才會反應。
const PRESENCE_MIN = 0.004
const PRESENCE_HYST = 0.7           // 離開時的遲滯，避免臨界值上下抖動

// 招募半徑：輪廓外多遠的粒子會被吸進來（相對畫面高度）。這個值同時決定了
// 「身體有多亮」與「身體外那圈暗帶有多寬」—— 是人形辨識度的主要旋鈕。
const BAND = 0.16
// 被招募的粒子沉進輪廓內多深（相對它原本離輪廓的距離）。0 = 全部貼在輪廓線上
// （很銳利的描邊、但身體內部沒變化），0.5 = 邊緣一圈實心。
// ⚠️ 上限會被「輪廓點到最近背景的距離」夾住，否則細的手臂會被穿透到另一邊。
const DEPTH = 0.5

// seek 力。pull 是每單位距離想要的靠攏速度、grip 是速度被導引的強度，
// 兩個都是 1/s，而 shader 拿到的 dt 已經被 simSpeed 縮過（見 point-cloud-effect.md §8）。
// 這裡的 simSpeed 比首頁 hero 高（0.5 vs 0.16），所以 grip 不用像 PL.II 那樣拉到 70。
const WALL_PULL = 10
const WALL_GRIP = 46
const GRIP_IN = 0.035               // 有人時往上追（每幀比例，≈0.5 秒到位）
const GRIP_OUT = 0.014              // 沒人時放手（慢，人形會化開而不是消失）

// 握力呼吸。grip 常態壓在高檔的話，粒子到定位就被歸零速度、畫面會變成死的貼圖
// （ParticleField 的 HOLD_BREATHE 註解有完整推導）。讓握力自己緩慢鬆緊，人形就
// 一直在「收緊 → 鬆開」之間呼吸，站著不動也還是活的。
const BREATHE_MS = 5200
const BREATHE_FLOOR = 0.55

// 模擬速度。待機（沒人）時慢，有人時拉高 —— 一方面 seek 才跟得上人的動作
// （dt 被 simSpeed 縮過，speed 太低粒子就追不上），一方面場本身也要更有精神。
const IDLE_SIM = 0.26
const LIVE_SIM = 0.52
const SIM_LERP = 0.02

// 目標點的游走：每顆粒子在自己的目標點附近抖一個小偏移，每隔一段時間換一組。
// 沒有這個，被握住的粒子會靜止（收斂到固定點的臨界阻尼彈簧，desiredV = 0）。
const DRIFT_AMP = 30                // sim px
const DRIFT_MS = 2000

// 目標點最多多久重建一次。相機大約 30fps，這裡壓到 ~22Hz —— 再高只是重複算
// 同一張遮罩（MediaPipe 沒出新的），白花一次 N 次迴圈加一次整包 buffer 上傳。
const REBUILD_MS = 45

// 人一進畫面時，往身體中心給一發向內的吸力脈衝 —— 場「唰」地被你吸過來一下，
// 是進場那一秒的重音。負的 strength = 往圓心拉（見 shader 的 disturb 區塊）。
const ARRIVE_PULL = -7
const ARRIVE_RADIUS = 520

// 相機緩慢漂移。人形是照當下的相機參數換算的，所以漂移不會讓人形跟著跑掉；
// 只有背景場在動。幅度比首頁小 —— 大電視上大幅度的平移看久了會暈。
const DRIFT_CAM = 18

// ── 執行期狀態（不需要響應式，每幀都在讀）─────────────────────────────────
let engine = null
let look = resolveFieldLook(DEFAULT_FIELD_LOOK)
let stream = null
let segmenter = null
let stopAmbient = null
let raf = 0
let running = false                 // 相機迴圈是否在跑
let reducedMotion = false
let mirror = true
let tsCounter = 0
let onVisibility = null
let onResize = null
let onKey = null

// 遮罩網格（螢幕空間）
let gw = 0
let gh = 0
let soft = null                     // Float32Array：時間平滑後的前景機率
let bin = null                      // Uint8Array：二值化結果
let dOut = null                     // Float32Array：每格到「最近前景格」的距離（格）
let fxOut = null                    // Int16Array：那個前景格的座標
let fyOut = null
let dIn = null                      // Float32Array：前景格到「最近背景格」的距離＝深度
let fxTmp = null
let fyTmp = null
let fgFrac = 0
let bodyU = 0.5                     // 前景重心（正規化螢幕座標）
let bodyV = 0.5

// 粒子的「家」與每幀的目標點
let homeU = null                    // Float32Array(N)
let homeV = null
let jitX = null                     // Float32Array(N) sim px 的游走偏移
let jitY = null
let targetBuf = null                // Float32Array(N*2) 每幀寫進去再上傳
let species = null                  // Uint8Array(N)：slot → 物種（一次性快照）
let speciesReach = null             // Float32Array：各物種的招募半徑倍率
let slotsReady = false

// 動態量
let gripNow = 0                     // 0..1 的握力包絡
let simNow = IDLE_SIM
let lastBuild = 0
let driftCycle = -1
let hadPerson = false
let maskFps = 0
let maskFrames = 0
let maskClock = 0

// ── 遮罩 → 螢幕空間網格 ────────────────────────────────────────────────────

// 依 canvas 比例配置網格。視窗改變時重來一次（家是正規化座標，不受影響）。
function allocGrid () {
  const { W, H } = engine.size
  gw = GRID_W
  gh = Math.max(8, Math.round(GRID_W * H / Math.max(1, W)))
  const n = gw * gh
  soft = new Float32Array(n)
  bin = new Uint8Array(n)
  dOut = new Float32Array(n)
  fxOut = new Int16Array(n)
  fyOut = new Int16Array(n)
  dIn = new Float32Array(n)
  fxTmp = new Int16Array(n)
  fyTmp = new Int16Array(n)
}

// MediaPipe 的信心遮罩（mw×mh，涵蓋整個相機幀）重新取樣到螢幕空間網格。
// 這一步同時處理三件事：鏡像（牆要像鏡子，不然舉右手畫面舉左手，人會覺得壞掉）、
// cover 裁切（相機 16:9、電視不一定）、時間平滑。
function sampleMask (conf, mw, mh, vw, vh) {
  const { W, H } = engine.size
  const screenAspect = W / Math.max(1, H)
  const videoAspect = vw / Math.max(1, vh)
  // cover：長邊被裁掉。videoAspect 比較寬 → 裁左右，反之裁上下。
  const kx = videoAspect > screenAspect ? screenAspect / videoAspect : 1
  const ky = videoAspect > screenAspect ? 1 : videoAspect / screenAspect

  let sum = 0
  let cu = 0
  let cv = 0
  for (let gy = 0; gy < gh; gy++) {
    const sv = (gy + 0.5) / gh
    const mv = 0.5 + (sv - 0.5) * ky
    const my = Math.min(mh - 1, Math.max(0, (mv * mh) | 0))
    const row = my * mw
    for (let gx = 0; gx < gw; gx++) {
      const su = (gx + 0.5) / gw
      const mu0 = mirror ? 1 - su : su
      const mu = 0.5 + (mu0 - 0.5) * kx
      const mx = Math.min(mw - 1, Math.max(0, (mu * mw) | 0))
      const raw = conf[row + mx]
      const i = gy * gw + gx
      const s = soft[i]
      soft[i] = s + (raw - s) * (raw > s ? MASK_ATTACK : MASK_RELEASE)
      const on = soft[i] > MASK_ON ? 1 : 0
      bin[i] = on
      if (on) { sum++; cu += su; cv += sv }
    }
  }
  fgFrac = sum / (gw * gh)
  if (sum > 0) { bodyU = cu / sum; bodyV = cv / sum }
}

// 向量距離轉換（Danielsson 的兩趟近似）。回傳每一格到「最近的 seed 格」的歐氏距離，
// 以及那一格的座標 —— 座標才是重點：粒子要被拉到「最近的輪廓點」上，只有距離不夠。
// 14400 格 × 8 個鄰居 ≈ 十萬次比較，一幀不到 1ms。
function distanceTransform (seedVal, d, fx, fy) {
  const INF = 1e9
  for (let i = 0; i < d.length; i++) {
    if (bin[i] === seedVal) { d[i] = 0; fx[i] = i % gw; fy[i] = (i / gw) | 0 } else { d[i] = INF; fx[i] = -1; fy[i] = -1 }
  }
  const relax = (i, j, x, y) => {
    const nx = fx[j]
    if (nx < 0) return
    const ny = fy[j]
    const dx = x - nx
    const dy = y - ny
    const nd = Math.sqrt(dx * dx + dy * dy)
    if (nd < d[i]) { d[i] = nd; fx[i] = nx; fy[i] = ny }
  }
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const i = y * gw + x
      if (d[i] === 0) continue
      if (x > 0) relax(i, i - 1, x, y)
      if (y > 0) {
        relax(i, i - gw, x, y)
        if (x > 0) relax(i, i - gw - 1, x, y)
        if (x < gw - 1) relax(i, i - gw + 1, x, y)
      }
    }
  }
  for (let y = gh - 1; y >= 0; y--) {
    for (let x = gw - 1; x >= 0; x--) {
      const i = y * gw + x
      if (d[i] === 0) continue
      if (x < gw - 1) relax(i, i + 1, x, y)
      if (y < gh - 1) {
        relax(i, i + gw, x, y)
        if (x < gw - 1) relax(i, i + gw + 1, x, y)
        if (x > 0) relax(i, i + gw - 1, x, y)
      }
    }
  }
}

// ── 粒子的「家」──────────────────────────────────────────────────────────
// 分層取樣（每個小格一顆）而不是純亂數 —— 純亂數會結塊，畫面上看得出一坨一坨的
// 疏密，人形浮出來的時候那些塊會跟著一起亮，很髒。
//
// ⚠️ 一定要洗牌再指派給 slot。slot 的順序就是開場 seedPattern 的順序，而 seed 是
// 照物種分配的（rainbowSpiral 一條臂一個物種）—— 不洗牌的話「左上角全是 1 號色」，
// 整面牆會出現色帶。
function buildHomes (n) {
  const { W, H } = engine.size
  const aspect = W / Math.max(1, H)
  const cols = Math.max(1, Math.round(Math.sqrt(n * aspect)))
  const rows = Math.max(1, Math.ceil(n / cols))
  const us = new Float32Array(n)
  const vs = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const c = i % cols
    const r = (i / cols) | 0
    us[i] = (c + Math.random()) / cols
    vs[i] = (r + Math.random()) / rows
  }
  // Fisher-Yates
  for (let i = n - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    const tu = us[i]; us[i] = us[j]; us[j] = tu
    const tv = vs[i]; vs[i] = vs[j]; vs[j] = tv
  }
  homeU = us
  homeV = vs
  jitX = new Float32Array(n)
  jitY = new Float32Array(n)
  targetBuf = new Float32Array(n * 2)
}

// 亮的物種招募半徑大、暗的小 —— 被吸進身體的偏亮、留在場上的偏深。
// 人是亮的、背景是暗的，而且完全沒有動到色盤（species 生成後不能改）。
function buildSpeciesReach () {
  const pal = window.PLPalettes.PALETTES[look.palette].particles
  const lin = paletteToLinear(pal)
  const out = new Float32Array(pal.length)
  for (let i = 0; i < pal.length; i++) {
    const [r, g, b] = lin[i]
    const luma = Math.min(1, 0.2126 * r + 0.7152 * g + 0.0722 * b)
    out[i] = 0.5 + 1.0 * Math.sqrt(luma)     // 0.5（近黑）～1.5（近白）
  }
  speciesReach = out
}

// 每個 slot 的物種。slot 是粒子唯一不會變的身分（GPU 每幀 spatial sort 會打亂
// array index），所以只要抓一次快照就永遠有效。
async function snapshotSpecies () {
  if (!engine?.readParticles) return
  try {
    const snap = await engine.readParticles()
    const T = look.rules.species
    const arr = new Uint8Array(engine.config.count)
    for (const p of snap) {
      if (p.slot < arr.length) arr[p.slot] = p.s % T
    }
    species = arr
  } catch (err) {
    console.warn('[wall] 物種快照失敗，招募半徑改用固定值', err)
    species = null
  }
}

// ── 每幀：遮罩網格 → 每顆粒子的目標點 ─────────────────────────────────────
function buildTargets () {
  const n = engine.config.count
  if (!targetBuf || targetBuf.length !== n * 2 || !homeU) return
  const { W, H } = engine.size
  const zoom = engine.config.cameraZoom || 1
  const cx = W * 0.5 + (engine.config.cameraX || 0)
  const cy = H * 0.5 + (engine.config.cameraY || 0)
  const spanX = W / zoom               // 目前螢幕可視的模擬範圍
  const spanY = H / zoom
  // BAND 是相對畫面高度，網格的一格 ≈ H/gh，所以換算成格數就是 BAND * gh。
  const bandCells = BAND * gh
  const buf = targetBuf

  for (let i = 0; i < n; i++) {
    const u = homeU[i]
    const v = homeV[i]
    let tu = u
    let tv = v

    const gx = Math.min(gw - 1, (u * gw) | 0)
    const gy = Math.min(gh - 1, (v * gh) | 0)
    const gi = gy * gw + gx
    const d = dOut[gi]

    // d === 0 就是「家本來就在身體裡」—— 什麼都不用做，它已經是人形的一部分。
    if (d > 0) {
      const reach = species ? bandCells * speciesReach[species[i]] : bandCells
      if (d < reach) {
        // 最近的輪廓格（格座標，取格心）
        const fx = fxOut[gi] + 0.5
        const fy = fyOut[gi] + 0.5
        const hx = u * gw
        const hy = v * gh
        let dx = fx - hx
        let dy = fy - hy
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        dx /= len
        dy /= len
        // 往輪廓內沉一點，深度跟「原本離輪廓多遠」成正比（單調，不會折疊）。
        // ⚠️ 要被輪廓點自己的內部深度夾住，否則細的手臂會被整個穿透過去。
        const inside = dIn[Math.min(dIn.length - 1, (fyOut[gi] | 0) * gw + (fxOut[gi] | 0))]
        const depth = Math.min(d * DEPTH, inside * 0.85)
        tu = (fx + dx * depth) / gw
        tv = (fy + dy * depth) / gh
      }
    }

    buf[i * 2] = cx + (tu - 0.5) * spanX + jitX[i]
    buf[i * 2 + 1] = cy + (tv - 0.5) * spanY + jitY[i]
  }
  // spread 與 shape 給同一組（blend 用不到 —— 這裡沒有「兩個構圖之間插值」的需求，
  // 強弱是靠 grip 包絡做的）。
  engine.setTargets(buf, buf)
}

function renewJitter () {
  const n = jitX.length
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const r = DRIFT_AMP * (0.3 + 0.7 * Math.random())
    jitX[i] = Math.cos(a) * r
    jitY[i] = Math.sin(a) * r
  }
}

// ── 主迴圈 ─────────────────────────────────────────────────────────────────
function frame (now) {
  raf = requestAnimationFrame(frame)
  if (!engine) return
  const t = now || performance.now()

  // 相機漂移。人形是照「當下」的相機參數換算的（buildTargets 每幀讀 engine.config），
  // 所以只有背景在飄，人不會跟著跑掉。
  if (!reducedMotion) {
    engine.setCameraOffset?.(
      Math.sin(t * 0.000021) * DRIFT_CAM * 2.2,
      Math.cos(t * 0.000017) * DRIFT_CAM,
    )
  }

  // 有沒有人：進場門檻高、離場門檻低（遲滯），避免臨界值附近整面牆一閃一閃。
  const on = hadPerson
    ? fgFrac > PRESENCE_MIN * PRESENCE_HYST
    : fgFrac > PRESENCE_MIN
  if (on !== hadPerson) {
    hadPerson = on
    present.value = on
    // 進場那一發向內脈衝：場「唰」地被你吸過來一下。
    if (on) {
      const { W, H } = engine.size
      const zoom = engine.config.cameraZoom || 1
      const x = W * 0.5 + (engine.config.cameraX || 0) + (bodyU - 0.5) * (W / zoom)
      const y = H * 0.5 + (engine.config.cameraY || 0) + (bodyV - 0.5) * (H / zoom)
      engine.disturb?.(x, y, ARRIVE_RADIUS, ARRIVE_PULL)
    }
  }

  // 握力包絡與模擬速度
  const want = on ? 1 : 0
  gripNow += (want - gripNow) * (want > gripNow ? GRIP_IN : GRIP_OUT)
  if (gripNow < 0.003) gripNow = 0
  const wantSim = on ? LIVE_SIM : IDLE_SIM
  simNow += (wantSim - simNow) * SIM_LERP
  engine.setSimSpeed?.(simNow)

  if (running && slotsReady && gripNow > 0) {
    if (t - lastBuild >= REBUILD_MS) {
      lastBuild = t
      const cycle = Math.floor(t / DRIFT_MS)
      if (cycle !== driftCycle) { driftCycle = cycle; renewJitter() }
      buildTargets()
    }
    // 握力呼吸：常態壓在高檔的話，粒子到定位就會被歸零速度、人形變成死的貼圖。
    const breathe = reducedMotion
      ? 1
      : BREATHE_FLOOR + (1 - BREATHE_FLOOR) * (0.5 - 0.5 * Math.cos(t / BREATHE_MS * Math.PI * 2))
    engine.setMorph?.(WALL_PULL * gripNow, WALL_GRIP * gripNow * breathe, 0)
  } else if (gripNow === 0 && engine.config.morphPull !== 0) {
    engine.setMorph?.(0, 0, 0)      // 完全放手＝首頁 hero 那個自由場
  }

  if (debugOn.value) {
    dbg.value = [
      `${engine.backend} · ${engine.config.count.toLocaleString()}p · ${Math.round(engine.getFps?.() || 0)}fps`,
      `mask ${maskFps}fps · ${gw}×${gh}`,
      `fg ${(fgFrac * 100).toFixed(1)}% · ${on ? 'PERSON' : 'empty'}`,
      `grip ${gripNow.toFixed(2)} · sim ${simNow.toFixed(2)}`,
    ].join('\n')
  }
}

// ── 相機 + 人像分割 ────────────────────────────────────────────────────────
async function createSegmenter () {
  const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision')
  const fileset = await FilesetResolver.forVisionTasks('/mediapipe/wasm')
  const opts = (delegate) => ({
    baseOptions: { modelAssetPath: '/mediapipe/selfie_segmenter.tflite', delegate },
    runningMode: 'VIDEO',
    outputConfidenceMasks: true,
    outputCategoryMask: false,
  })
  try {
    return await ImageSegmenter.createFromOptions(fileset, opts('GPU'))
  } catch {
    return await ImageSegmenter.createFromOptions(fileset, opts('CPU'))
  }
}

// 相機每出一幀就跑一次分割。用 requestVideoFrameCallback 而不是 rAF —— 相機
// 30fps、畫面 60fps，掛在 rAF 上等於一半的分割是拿同一張影像重算。
function onVideoFrame (now) {
  if (!running) return
  const v = videoRef.value
  if (v?.videoWidth && segmenter && engine) {
    try {
      // 時間戳必須嚴格遞增（整數 ms），否則 MediaPipe 會丟例外
      const ts = Math.max(tsCounter + 1, Math.round(now || performance.now()))
      tsCounter = ts
      const res = segmenter.segmentForVideo(v, ts)
      const mask = res.confidenceMasks?.[0]
      if (mask && soft) {
        sampleMask(mask.getAsFloat32Array(), mask.width, mask.height, v.videoWidth, v.videoHeight)
        distanceTransform(1, dOut, fxOut, fyOut)   // 背景格 → 最近的前景格（＝輪廓點）
        distanceTransform(0, dIn, fxTmp, fyTmp)    // 前景格 → 最近的背景格（＝內部深度）
      }
      res.close?.()
    } catch {
      // 單幀失敗不中斷迴圈（切換分頁、裝置被搶走時會偶發）
    }
    maskFrames++
    const tt = now || performance.now()
    if (!maskClock) maskClock = tt
    if (tt - maskClock >= 500) {
      maskFps = Math.round(maskFrames * 1000 / (tt - maskClock))
      maskFrames = 0
      maskClock = tt
    }
  }
  scheduleVideo()
}

function scheduleVideo () {
  const v = videoRef.value
  if (!running || !v) return
  if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(onVideoFrame)
  else requestAnimationFrame(onVideoFrame)
}

// ── ?fake=1：不用相機的假人 ────────────────────────────────────────────────
// 現場架設之前（或在會議室桌機上）要調 BAND / DEPTH / GRIP 這幾個旋鈕，總不能
// 一直站起來走到鏡頭前。這個模式直接在遮罩網格上畫一個會走動、會揮手的人，
// 後面整條管線（距離轉換 → 目標點 → seek）跟真的相機完全一樣。
//
// ⚠️ 只是把 soft 填好而已 —— 不碰 MediaPipe、不碰 getUserMedia。
// 點到線段的距離（格為單位）。假人是七根「膠囊」（頭 / 軀幹 / 兩手 / 兩腳）疊出來的。
function segDist (px, py, ax, ay, bx, by) {
  const vx = bx - ax
  const vy = by - ay
  const wx = px - ax
  const wy = py - ay
  const len2 = vx * vx + vy * vy
  let t = len2 > 0 ? (wx * vx + wy * vy) / len2 : 0
  if (t < 0) t = 0
  else if (t > 1) t = 1
  const dx = px - (ax + vx * t)
  const dy = py - (ay + vy * t)
  return Math.sqrt(dx * dx + dy * dy)
}

function fakeFrame (now) {
  if (!running || !soft) return
  const t = (now || performance.now()) * 0.001
  const s = gh / 12                         // 「一個頭」的尺度，讓假人隨畫面比例縮放
  const cx = gw * (0.5 + 0.26 * Math.sin(t * 0.28))
  const cy = gh * 0.56 + s * 0.25 * Math.sin(t * 2.2)   // 走路的上下起伏
  const swing = Math.sin(t * 1.9)
  const seg = [
    // ax, ay, bx, by, r
    [cx, cy - s * 2.6, cx, cy - s * 2.6, s * 0.85],                       // 頭
    [cx, cy - s * 1.7, cx, cy + s * 0.6, s * 1.05],                       // 軀幹
    [cx, cy - s * 1.5, cx - s * (1.6 + swing * 0.5), cy - s * swing, s * 0.42],   // 左手
    [cx, cy - s * 1.5, cx + s * (1.6 - swing * 0.5), cy + s * swing, s * 0.42],   // 右手
    [cx, cy + s * 0.5, cx - s * (0.5 + swing * 0.6), cy + s * 2.6, s * 0.5],      // 左腳
    [cx, cy + s * 0.5, cx + s * (0.5 - swing * 0.6), cy + s * 2.6, s * 0.5],      // 右腳
  ]
  let sum = 0
  let au = 0
  let av = 0
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      const i = gy * gw + gx
      let raw = 0
      for (let k = 0; k < seg.length; k++) {
        const g = seg[k]
        if (segDist(gx, gy, g[0], g[1], g[2], g[3]) < g[4]) { raw = 1; break }
      }
      const prev = soft[i]
      soft[i] = prev + (raw - prev) * (raw > prev ? MASK_ATTACK : MASK_RELEASE)
      const on = soft[i] > MASK_ON ? 1 : 0
      bin[i] = on
      if (on) { sum++; au += (gx + 0.5) / gw; av += (gy + 0.5) / gh }
    }
  }
  fgFrac = sum / (gw * gh)
  if (sum > 0) { bodyU = au / sum; bodyV = av / sum }
  distanceTransform(1, dOut, fxOut, fyOut)
  distanceTransform(0, dIn, fxTmp, fyTmp)
  maskFps = 60
  requestAnimationFrame(fakeFrame)
}

async function startCamera () {
  if (state.value === 'starting' || state.value === 'live') return
  if (fakeMode.value) {
    running = true
    state.value = 'live'
    requestAnimationFrame(fakeFrame)
    setTimeout(() => { showUi.value = false }, 4000)
    return
  }
  state.value = 'starting'
  errorMsg.value = ''
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('此裝置 / 瀏覽器不支援相機')
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    })
    if (!segmenter) segmenter = await createSegmenter()
    const v = videoRef.value
    v.srcObject = stream
    await v.play()
    running = true
    state.value = 'live'
    scheduleVideo()
    // 開了鏡頭就把文字收掉，讓畫面留給粒子（按 H 可以叫回來）
    setTimeout(() => { showUi.value = false }, 4000)
  } catch (e) {
    errorMsg.value = (e && e.message) || String(e)
    state.value = 'error'
    stopCamera()
  }
}

function stopCamera () {
  running = false
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
}

// ── 引擎 ───────────────────────────────────────────────────────────────────
async function initEngine () {
  const canvas = canvasRef.value
  if (!canvas) return

  await loadParticleKit()
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ?mirror=0 關鏡像（鏡頭已經在硬體上翻過的場合）
  if (route.query.mirror === '0') mirror = false
  // ?look=<id|1..5> 指定跑哪一組效果，不指定就用線上 hero 那組
  if (route.query.look) look = resolveFieldLook(String(route.query.look))

  const pal = window.PLPalettes.PALETTES[look.palette]
  const count = countFor(canvas, look.budget)

  engine = await window.makeEngine(canvas, {
    species: look.rules.species,
    count,
    preset: look.rules.preset,
    seedPattern: look.rules.seedPattern,
    palette: pal.particles,
    bgFade: pal.bgFade,
    forceFactor: look.physics.forceFactor,
    friction: look.physics.friction,
    repel: look.physics.repel,
    minR: look.physics.minR,
    rMax: look.physics.rMax,
    simSpeed: 1.5,                  // 開場快速散開，之後由 frame() 的包絡接手
    cameraZoom: look.camera.zoom,
    pointSize: look.visual.pointSize,
    // 大電視是遠距離觀看，比首頁再亮一點才有存在感
    particleOpacity: Math.min(1, look.visual.heroOpacity + 0.18),
    showGlow: look.visual.showGlow,
    glowSize: look.glow.glowSize,
    glowIntensity: look.glow.glowIntensity,
    glowSteepness: look.glow.glowSteepness,
    cellSubdivisions: 2,
    maxDpr: maxDpr(),
  })

  if (!engine.setTargets || !engine.setMorph) {
    // webgl2 / canvas2d 的退回引擎沒有 morph seek，人形做不出來。
    // 場還是會跑（畫面不會壞），只是不會有反應 —— 現場那台機器要用 WebGPU。
    errorMsg.value = '這台裝置沒有 WebGPU，粒子場會跑但不會對人有反應'
  }

  buildSpeciesReach()
  allocGrid()
  buildHomes(engine.config.count)

  stopAmbient = reducedMotion ? null : window.PLAmbient.start(() => engine, { intensity: look.ambient })

  onVisibility = () => engine?.pause(document.hidden)
  document.addEventListener('visibilitychange', onVisibility)

  onResize = () => {
    if (!engine) return
    allocGrid()                     // 家是正規化座標，不用重建；網格比例要跟著換
  }
  window.addEventListener('resize', onResize)

  // 現場鍵盤操作
  onKey = (ev) => {
    const k = ev.key.toLowerCase()
    if (k === 'f') {
      if (document.fullscreenElement) document.exitFullscreen?.()
      else document.documentElement.requestFullscreen?.()
    } else if (k === 'h') {
      showUi.value = !showUi.value
    } else if (k === 'd') {
      debugOn.value = !debugOn.value
    }
  }
  window.addEventListener('keydown', onKey)

  frame()

  // 假人模式不用相機權限 → 不需要使用者手勢，直接開始，現場預覽時省一次點擊。
  if (fakeMode.value) startCamera()

  // 等開場的螺旋散開、fps 自適應定案之後再抓物種快照。
  // ⚠️ 一定要在 setCount 之後 —— 那會整場重生成粒子，slot ↔ 物種的對應會全部換掉。
  setTimeout(async () => {
    const fps = engine?.getFps ? engine.getFps() : 60
    if (fps > 0 && fps < 45) {
      engine.setCount?.(Math.round(engine.config.count / 2))
      buildHomes(engine.config.count)
      await new Promise(r => setTimeout(r, 2000))
    }
    await snapshotSpecies()
    slotsReady = true
  }, 4000)
}

// 250ms 而不是 1000ms：用一秒的間隔去追一個一秒跳一次的東西，秒數看起來會頓、
// 偶爾還會跳過一秒。這裡只是格式化一個字串，成本可以忽略。
let clockTimer = 0
function tickClock () {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  clock.value = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  today.value = `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}

onMounted(() => {
  tickClock()
  clockTimer = setInterval(tickClock, 250)
  initEngine()
})

onBeforeUnmount(() => {
  running = false
  clearInterval(clockTimer)
  if (raf) cancelAnimationFrame(raf)
  stopCamera()
  if (segmenter) { try { segmenter.close() } catch { /* noop */ } segmenter = null }
  if (stopAmbient) stopAmbient()
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  if (onResize) window.removeEventListener('resize', onResize)
  if (onKey) window.removeEventListener('keydown', onKey)
  if (engine) { engine.destroy(); engine = null }
})
</script>

<template>
  <div class="fixed inset-0 overflow-hidden bg-black text-[#efe6d2]">
    <canvas ref="canvasRef" class="absolute inset-0 block h-full w-full" />

    <!-- 相機來源：永遠不顯示。畫面上只有粒子，不會出現任何人的影像。 -->
    <video ref="videoRef" class="pointer-events-none absolute h-px w-px opacity-0" playsinline muted />

    <!-- 還沒開鏡頭：現場開機時的那一步 -->
    <div
      v-if="state !== 'live'"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-8 text-center"
    >
      <h1 class="font-en-serif text-[clamp(56px,9vw,160px)] italic leading-[0.95]">
        顯影牆
      </h1>
      <p class="max-w-md text-fs-zh-body-md font-zh-sans text-white/70">
        站到鏡頭前，粒子會凝聚成你的人形。影像只在這台機器上運算，不會上傳、不會留存。
      </p>
      <button
        class="border border-[#71c1f0]/60 px-8 py-3 text-zh-btn transition-colors hover:border-[#71c1f0] hover:bg-[#71c1f0]/10 disabled:opacity-40"
        :disabled="state === 'starting'"
        @click="startCamera"
      >
        {{ state === 'starting' ? '啟動中…' : (fakeMode ? '播放假人 →' : '啟動鏡頭 →') }}
      </button>
      <p v-if="errorMsg" class="font-mono text-fs-micro text-[#ff8b8b]">
        {{ errorMsg }}
      </p>
    </div>

    <!-- 跑起來之後的現場字卡。有人站進來就淡掉，讓畫面完全留給人形。 -->
    <div
      v-else
      class="pointer-events-none absolute inset-0 z-10 transition-opacity duration-1000"
      :class="showUi && !present ? 'opacity-100' : 'opacity-0'"
    >
      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
        <p class="font-en-serif text-[clamp(28px,4vw,64px)] italic leading-tight">
          站到鏡頭前
        </p>
        <p class="mt-3 font-mono text-fs-micro uppercase tracking-[0.3em] text-white/55">
          step in · you become the field
        </p>
      </div>
    </div>

    <!-- ── 現場常駐的字卡 ──────────────────────────────────────────────────
         這一層不會因為有人站進來就淡掉 —— 它就是要被拍進照片裡的東西。
         尺寸一律用 clamp(px, vw, px)：這頁最後跑在一台大電視上，固定 px 的
         11px 角標在三公尺外等於不存在。 -->

    <!-- 中上：品牌。logo 用 #EFE6D2 的單色 svg，直接壓在深色場上就好看。
         開機畫面也留著（z-30 蓋在啟動卡上方），現場開機時就已經是有品牌的畫面。 -->
    <div
      class="pointer-events-none absolute inset-x-0 top-[clamp(20px,3.5vh,56px)] z-30 flex flex-col items-center gap-[clamp(6px,0.9vh,14px)]"
    >
      <img
        :src="assetUrl('/logo-webconf.svg')"
        alt="WebConf 2026"
        class="w-[clamp(150px,15vw,320px)] opacity-90"
      >
      <p class="font-mono text-[clamp(11px,0.85vw,17px)] uppercase tracking-[0.32em] text-[#efe6d2]/60">
        Taipei Popop · Dec 11–12, 2026
      </p>
    </div>

    <!-- 底部三欄：左＝這台裝置在幹嘛、中＝一直在走的時鐘、右＝打卡 tag。
         中間欄用絕對置中而不是 justify-between 的中間格 —— 左右兩塊的寬度不一樣，
         靠 flex 分配的話時鐘會偏掉，而它是視覺上的定錨。 -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-[clamp(18px,3vh,48px)] z-10 transition-opacity duration-700"
      :class="state === 'live' ? 'opacity-100' : 'opacity-0'"
    >
      <div class="flex items-end justify-between px-[clamp(20px,3vw,64px)]">
        <div class="text-left">
          <p class="flex items-center gap-2 font-mono text-[clamp(12px,1vw,20px)] uppercase tracking-[0.26em] text-[#efe6d2]/75">
            <span class="inline-block h-[0.5em] w-[0.5em] rounded-full bg-[#71c1f0] motion-safe:animate-pulse" />
            Live · Emergence Wall
          </p>
          <p class="mt-[0.35em] font-en-serif text-[clamp(12px,1vw,20px)] italic text-[#efe6d2]/50">
            pl. w · particles, not pixels
          </p>
        </div>

        <p class="text-right font-en-serif text-[clamp(15px,1.5vw,30px)] italic text-[#efe6d2]/75">
          #webconf2026
        </p>
      </div>

      <!-- 時鐘：絕對置中，疊在上面那一列的中間。tabular-nums 讓數字等寬，
           秒數跳動時整串不會左右抖。 -->
      <div class="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
        <p class="font-mono text-[clamp(22px,2.4vw,52px)] tabular-nums leading-none tracking-[0.14em] text-[#efe6d2]/85">
          {{ clock }}
        </p>
        <p class="mt-[0.5em] font-mono text-[clamp(10px,0.8vw,16px)] uppercase tracking-[0.32em] text-[#efe6d2]/45">
          {{ today }} · Taipei
        </p>
      </div>
    </div>

    <pre
      v-if="debugOn"
      class="pointer-events-none absolute left-6 top-6 z-30 whitespace-pre font-mono text-fs-micro leading-5 text-[#71c1f0]"
    >{{ dbg }}</pre>
  </div>
</template>
