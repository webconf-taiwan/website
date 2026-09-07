<script setup>
// PL. E — 回聲牆（Echo Wall）
//
// /wall 的兄弟頁：那邊的輸入是攝影機，這邊是麥克風。說話 → 粒子排成你說的字。
// 現場定位是「好玩的裝置」而不是無障礙字幕 —— 準確度不是重點，反應快、好看、
// 能讓人對著它鬼叫才是。
//
// ─── 兩個模式（M 鍵切換）──────────────────────────────────────────────────
//   text     說話 → 粒子排字。主秀。
//   ambient  不辨識，只把音量餵給粒子場。換場 / 休息時間放著，也是辨識掛掉時的
//            退路 —— 沒網路、Chrome 斷線都不會讓畫面變成一面黑牆。
//
// ─── 字是怎麼排出來的 ─────────────────────────────────────────────────────
// 沿用 /wall 那條路：每顆粒子有一個固定的「家」，每一輪算出它這一刻的目標點，
// engine.setTargets 上傳，靠 morph seek 把它拉過去。差別只在目標點的來源。
//
// 版面是固定的 COLS × ROWS 字元格（見 useParticleText 的檔頭）：第 k 個字永遠
// 落在第 k 格，粒子池也照格子預先切成 CAP 個 bucket，第 k 格永遠用 bucket k。
// 所以「加一個字」只動到一個 bucket 的粒子，前面已經站好的字一動都不動 ——
// 看起來是字一個一個浮出來。整句重排的話畫面會抖到不能讀（這是主要的坑）。
//
// ⚠️ 粒子預算就是版面上限。一個中文字要看得出筆畫大概要 1000 顆以上，48000 顆
//    扣掉要留給背景場的，一次大約只放得下 24 個字 —— 也就是兩行。這不是可以
//    調鬆的參數，是這個效果的物理限制，版面必須照它設計（所以是「捲動的兩行」
//    而不是「整段文字」）。
//
// ⚠️ 這裡的 jitter 要比 /wall 小很多（TEXT_JIT 7 vs 那邊的 30）。中文筆畫細，
//    抖動幅度一大就糊成一團。可讀性與生命感在這一頁是直接衝突的，偏可讀。
//
// ─── 語音辨識 ─────────────────────────────────────────────────────────────
// Web Speech API（webkitSpeechRecognition）。零依賴、有 interim 逐字結果、
// 延遲 0.3～1 秒，是目前最快能上線的路。代價要知道：
//   · 只有 Chrome 系；Safari / Firefox 沒有 → 自動退到 ambient 模式
//   · 音訊會送到 Google 的伺服器，要網路
//   · continuous 開著 Chrome 仍然會自己斷（沒聲音幾十秒就 onend）→ 要自動重啟
// 辨識層集中在 startRecognition / pushText 兩個地方，之後要換成雲端 STT
// （Deepgram、AssemblyAI…）只要換掉那一段，版面與粒子完全不用動。
//
// ⚠️ 現場公開顯示辨識結果是有風險的：吵雜環境的中文辨識會出現不該出現的字。
//    BLOCKLIST 可以把字遮成〇，另外空白鍵是隨時可按的 kill switch（停止收音）、
//    C 清空。這兩個一定要讓現場工作人員知道。
//
// 現場操作：進頁面 → 點「開始收音」→ F 全螢幕 → H 收字卡。
//   空白鍵 暫停/繼續收音   C 清空   M 切換模式   D 診斷
// 網址參數：?mode=ambient 直接進氛圍模式、?look= 指定效果、?debug=1

definePageMeta({ layout: false })

useSeoMeta({
  title: '回聲牆 · Webconf',
  description: '現場大螢幕的即時聲音裝置：對它說話，粒子場會排成你說的字。',
})

const { loadParticleKit } = useParticleKit()
const { countFor, maxDpr } = useParticleBudget()
const { paletteToLinear } = useParticleMorph()
const { ensureGlyphFont, sampleGlyph } = useParticleText()

const route = useRoute()
const canvasRef = ref(null)

const state = ref('idle')             // idle / starting / live / error
const errorMsg = ref('')
const notice = ref('')                // 非致命的提醒（例如瀏覽器不支援辨識）
const showUi = ref(true)
const debugOn = ref(route.query.debug === '1')
const mode = ref(route.query.mode === 'ambient' ? 'ambient' : 'text')
const listening = ref(true)           // 空白鍵的 kill switch
const caption = ref('')               // 目前牆上的字（給診斷與無障礙用）
const levelUi = ref(0)                // 給角落那顆點用的音量
const dbg = ref('')
// 角落時鐘。SSR 不渲染時間 —— 伺服器與瀏覽器的時鐘不一樣，先畫出來就是保證的
// hydration 落差。
const clock = ref('')
const today = ref('')

// ── 版面 ───────────────────────────────────────────────────────────────────
// 12 × 2 = 24 格。COLS 再多字就會小到讀不出筆畫（粒子數是固定的，格子越多
// 每格分到的越少），再少則一行放不下一句話。
const COLS = 12
const ROWS = 2
const CAP = COLS * ROWS
// 文字區塊佔畫面寬的比例。格子是正方形，所以高度由它跟畫面比例決定。
const BLOCK_W = 0.84
// 粒子池分給文字的比例。剩下的留在自己的家當背景場 —— 全部拿去排字的話
// 字會很漂亮，但背景一片黑，整個畫面就不是「粒子場」了。
const TEXT_SHARE = 0.55
// 取樣用的字型。600 而不是 400：粒子排字時細筆畫會斷，中黑一點才連得起來。
const GLYPH_FONT = '600 100px "Noto Serif TC", "Noto Sans TC", serif'

// ── seek 力 ────────────────────────────────────────────────────────────────
// 比 /wall 握得更緊 —— 那邊是人形輪廓，鬆一點反而有生命感；這邊筆畫要能讀。
const TEXT_PULL = 12
const TEXT_GRIP = 60
const GRIP_IN = 0.05                  // 有字時往上追（≈0.35 秒到位）
const GRIP_OUT = 0.018                // 沒字時放手（字會化開回粒子場）
const BREATHE_MS = 6000
const BREATHE_FLOOR = 0.7             // 比 /wall 高：呼吸太深筆畫會散掉

const TEXT_JIT = 7                    // 字上的粒子游走半徑（sim px）
const FIELD_JIT = 26                  // 背景場的
const DRIFT_MS = 2200

// ── 模擬速度 ───────────────────────────────────────────────────────────────
const IDLE_SIM = 0.24
const TEXT_SIM = 0.46
const SIM_LERP = 0.03
// 音量對速度的加成。ambient 模式全靠這條，text 模式只給一點點（字要穩）。
const AMBIENT_SIM_GAIN = 0.9
const TEXT_SIM_GAIN = 0.22

// ── 音量 ───────────────────────────────────────────────────────────────────
const LEVEL_ATTACK = 0.35             // 追上去要快，說話的起音才有反應
const LEVEL_RELEASE = 0.06            // 放掉要慢，不然每個字的間隙都在閃
// 突發音（拍手、大叫）：超過「目前均值 × 這個倍數」就算一次衝擊。
const SHOUT_RATIO = 1.9
const SHOUT_FLOOR = 0.06              // 太安靜時的雜訊不算
const SHOUT_COOLDOWN = 260            // ms，避免連續觸發把場掀翻
// 衝擊的推力。text 模式下字會被吹散再被 seek 拉回來 —— 這是現場最好玩的地方，
// 大部分人第一件事就是對著它大叫。
const SHOUT_PUSH = 26
const SHOUT_RADIUS = 620

// ── 辨識 ───────────────────────────────────────────────────────────────────
const SR_LANG = String(route.query.lang || 'zh-TW')
// 多久沒有新的辨識結果就把牆清空。太短會在句子中間被清掉，太長則下一個人
// 走過來還看得到上一個人說的話。
const SILENCE_MS = 7000
// Chrome 會自己 onend（沒聲音一陣子就斷），要自動接回去。太快重啟會被瀏覽器
// 當成濫用而拒絕，留一點間隔。
const RESTART_DELAY = 400
// 要遮掉的字。現場真的出事時直接加在這裡（HMR 會即時生效）。
// ⚠️ 這是最後一道防線不是唯一一道 —— 空白鍵停止收音才是。
const BLOCKLIST = []

// ── 執行期狀態 ─────────────────────────────────────────────────────────────
let engine = null
let look = resolveFieldLook(DEFAULT_FIELD_LOOK)
let stopAmbient = null
let raf = 0
let reducedMotion = false
let onVisibility = null
let onResize = null
let onKey = null
let clockTimer = 0

// 家與目標點
let homeU = null                      // Float32Array(N)：每顆粒子的家（正規化螢幕座標）
let homeV = null
let textU = null                      // Float32Array(N)：被徵召去排字的粒子的目標
let textV = null
let inText = null                     // Uint8Array(N)：這一刻有沒有在排字
let jitDX = null                      // Float32Array(N)：單位游走向量（振幅寫入時才乘）
let jitDY = null
let targetBuf = null                  // Float32Array(N*2)
let order = null                      // Uint32Array(N)：洗過的 slot 順序，前段給文字
let bucket = 0                        // 每一格分到幾顆粒子
let glyphBuf = null                   // 取樣一個字的暫存
let species = null                    // Uint8Array(N)：slot → 物種
let slotsReady = false

// 版面（隨視窗算）
let cellW = 0
let cellH = 0
let blockX = 0
let blockY = 0

// 文字狀態
let wallText = ''                     // 目前牆上這一頁的字（含空格）
let lastStr = ''                      // 上一次收到的完整字串，用來比對共同前綴
let scrolled = 0                      // 已經捲掉幾個字
let finalText = ''
let lastResultAt = 0
let dirty = false                     // 目標點要重新上傳
let driftCycle = -1

// 聲音
let audioCtx = null
let micStream = null
let analyser = null
let timeBuf = null
let level = 0
let lastShout = 0

// 辨識
let rec = null
let recRunning = false
let restartTimer = 0

// 動態量
let gripNow = 0
let simNow = IDLE_SIM

// ── 版面計算 ───────────────────────────────────────────────────────────────
// 格子在畫面上是正方形。正規化座標裡 u 跨的是 W、v 跨的是 H，所以同樣邊長的
// 正方形在 v 方向的數值要乘上畫面比例。
function layout () {
  const { W, H } = engine.size
  cellW = BLOCK_W / COLS
  cellH = cellW * (W / Math.max(1, H))
  blockX = (1 - BLOCK_W) / 2
  blockY = 0.5 - (ROWS * cellH) / 2
}

function cellBox (k) {
  const col = k % COLS
  const row = (k / COLS) | 0
  return { x: blockX + col * cellW, y: blockY + row * cellH, w: cellW, h: cellH }
}

// ── 粒子的家 ───────────────────────────────────────────────────────────────
// 分層取樣後洗牌。理由跟 /wall 一樣：純亂數會結塊，而不洗牌的話 slot 順序就是
// 開場 seedPattern 的順序（物種是照那個分配的），整面牆會出現色帶。
function buildHomes (n) {
  const { W, H } = engine.size
  const aspect = W / Math.max(1, H)
  const cols = Math.max(1, Math.round(Math.sqrt(n * aspect)))
  const rows = Math.max(1, Math.ceil(n / cols))
  const us = new Float32Array(n)
  const vs = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    us[i] = ((i % cols) + Math.random()) / cols
    vs[i] = (((i / cols) | 0) + Math.random()) / rows
  }
  for (let i = n - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    const tu = us[i]; us[i] = us[j]; us[j] = tu
    const tv = vs[i]; vs[i] = vs[j]; vs[j] = tv
  }
  homeU = us
  homeV = vs
  textU = new Float32Array(n)
  textV = new Float32Array(n)
  inText = new Uint8Array(n)
  jitDX = new Float32Array(n)
  jitDY = new Float32Array(n)
  targetBuf = new Float32Array(n * 2)
  buildOrder(n)
}

// 把 slot 洗成一個順序，前 TEXT_SHARE 段落再切成 CAP 個 bucket，第 k 格用第 k 個。
// 洗牌是必要的：連續的 slot 區間在物種上是有偏的（見 buildHomes），不洗的話
// 每個字會是單一顏色，而色盤裡有一個接近黑的（#0F1530）—— 那個字會直接消失。
function buildOrder (n) {
  const arr = new Uint32Array(n)
  for (let i = 0; i < n; i++) arr[i] = i
  for (let i = n - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t
  }
  order = arr
  bucket = Math.max(1, Math.floor((n * TEXT_SHARE) / CAP))
  glyphBuf = new Float32Array(bucket * 2)
}

// 物種快照。拿到之後把「亮的物種」排到 order 前面 —— 排字用的是前段，所以字會
// 由亮色粒子組成、深藍的留在背景場。跟 /wall 讓人形偏亮是同一個手法，而且
// 完全沒有動到色盤（species 生成後不能改）。
//
// ⚠️ 排序要穩定，才不會把上面洗好的隨機性洗掉（同一個物種內仍要是亂的）。
//    Array.prototype.sort 在現行引擎都是穩定的。
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

    const pal = window.PLPalettes.PALETTES[look.palette].particles
    const lin = paletteToLinear(pal)
    const luma = lin.map(([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b)
    const list = Array.from(order)
    list.sort((a, b) => (luma[species[b]] || 0) - (luma[species[a]] || 0))
    order = Uint32Array.from(list)

    // ⚠️ order 一換，「第 k 格用哪些 slot」就整組不一樣了。這之前若已經有字上牆
    // （快照要等 4 秒，使用者可能早就開口了），那些 inText 標記指的是舊的 slot ——
    // 不重配的話會留下一批永遠回不了家的粒子，字也會缺一塊。
    inText.fill(0)
    for (let k = 0; k < CAP; k++) setCell(k, wallText[k] || '')
    dirty = true
  } catch (err) {
    console.warn('[echo] 物種快照失敗，字的配色會跟著粒子原本的物種走', err)
  }
}

// ── 字 → 目標點 ────────────────────────────────────────────────────────────
// 只動第 k 格的 bucket。呼叫端負責決定哪些格子要重畫。
function setCell (k, ch) {
  const base = k * bucket
  const ok = ch ? sampleGlyph(ch, GLYPH_FONT, bucket, glyphBuf, 0, cellBox(k)) : false
  for (let i = 0; i < bucket; i++) {
    const s = order[base + i]
    if (!ok) { inText[s] = 0; continue }
    inText[s] = 1
    textU[s] = glyphBuf[i * 2]
    textV[s] = glyphBuf[i * 2 + 1]
  }
}

function clearWall () {
  for (let k = 0; k < CAP; k++) setCell(k, '')
  wallText = ''
  lastStr = ''
  scrolled = 0
  finalText = ''
  caption.value = ''
  dirty = true
}

// 收到新的辨識字串。s 是「這一輪從頭到現在」的完整文字（final + interim）。
//
// ⚠️ 這裡的重點是「只重畫真的變了的格子」。interim 結果會一直改寫尾巴
//（今天 → 今天天氣 → 今天天氣很好），每次都整面重排的話會抖到不能讀。
function pushText (s) {
  s = mask(s)
  // 超過容量就捲掉一整行。一次捲一個字的話畫面會每個字都全部位移一次 ——
  // 一次捲一行則是一個明確的「換行」動作，反而好讀。
  const before = scrolled
  while (s.length - scrolled > CAP) scrolled += COLS
  const rolled = scrolled !== before

  // 共同前綴 → 從第一個不同的字開始重畫
  let p = 0
  const m = Math.min(s.length, lastStr.length)
  while (p < m && s[p] === lastStr[p]) p++
  const from = rolled ? 0 : Math.max(0, p - scrolled)

  for (let k = from; k < CAP; k++) setCell(k, s[k + scrolled] || '')
  lastStr = s
  wallText = s.slice(scrolled)
  caption.value = wallText
  dirty = true
}

// 遮蔽詞。長度保持一樣，版面才不會因為遮蔽而位移。
function mask (s) {
  let out = s
  for (const w of BLOCKLIST) {
    if (!w) continue
    out = out.split(w).join('〇'.repeat(w.length))
  }
  return out
}

// ── 目標點 → 引擎 ──────────────────────────────────────────────────────────
// 相機在這一頁是固定的（文字不能跟著飄，會讀不到），所以模擬座標只有在
// 「字變了」或「換一組游走偏移」時才需要重算，不必每幀跑一次 N 迴圈。
function uploadTargets () {
  const n = engine.config.count
  if (!targetBuf || targetBuf.length !== n * 2) return
  const { W, H } = engine.size
  const zoom = engine.config.cameraZoom || 1
  const cx = W * 0.5
  const cy = H * 0.5
  const spanX = W / zoom
  const spanY = H / zoom
  const buf = targetBuf
  for (let i = 0; i < n; i++) {
    const on = inText[i]
    const u = on ? textU[i] : homeU[i]
    const v = on ? textV[i] : homeV[i]
    const amp = on ? TEXT_JIT : FIELD_JIT
    buf[i * 2] = cx + (u - 0.5) * spanX + jitDX[i] * amp
    buf[i * 2 + 1] = cy + (v - 0.5) * spanY + jitDY[i] * amp
  }
  engine.setTargets(buf, buf)
}

function renewJitter () {
  const n = jitDX.length
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const r = 0.3 + 0.7 * Math.random()
    jitDX[i] = Math.cos(a) * r
    jitDY[i] = Math.sin(a) * r
  }
}

// ── 聲音 ───────────────────────────────────────────────────────────────────
async function startAudio () {
  micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const AC = window.AudioContext || window.webkitAudioContext
  audioCtx = new AC()
  // 使用者手勢裡開的，理論上不會是 suspended，但 Chrome 偶爾還是會 —— 補一次
  if (audioCtx.state === 'suspended') await audioCtx.resume()
  const src = audioCtx.createMediaStreamSource(micStream)
  analyser = audioCtx.createAnalyser()
  analyser.fftSize = 1024
  analyser.smoothingTimeConstant = 0.5
  src.connect(analyser)
  // ⚠️ 不要接到 destination —— 現場喇叭會直接回授嘯叫。
  timeBuf = new Uint8Array(analyser.fftSize)
}

// 波形的 RMS。用時域而不是頻域：要的是「有多大聲」，頻譜對這個沒有幫助，
// 而且時域只要一次 1024 的迴圈。
function readLevel () {
  if (!analyser) return 0
  analyser.getByteTimeDomainData(timeBuf)
  let acc = 0
  for (let i = 0; i < timeBuf.length; i++) {
    const v = (timeBuf[i] - 128) / 128
    acc += v * v
  }
  // sqrt 之後大約 0～0.35 是正常說話，乘 3 讓它落在 0～1
  return Math.min(1, Math.sqrt(acc / timeBuf.length) * 3)
}

// ── 語音辨識 ───────────────────────────────────────────────────────────────
function startRecognition () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) {
    notice.value = '這個瀏覽器沒有語音辨識，已切到氛圍模式（聲音仍然會推動粒子）'
    mode.value = 'ambient'
    return
  }
  rec = new SR()
  rec.lang = SR_LANG
  rec.continuous = true
  rec.interimResults = true
  rec.maxAlternatives = 1

  rec.onresult = (e) => {
    lastResultAt = performance.now()
    let interim = ''
    // ⚠️ 從 e.resultIndex 開始掃，不是 0 —— 從 0 掃會把已經計入的 final 再加一次。
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i]
      if (r.isFinal) finalText += r[0].transcript
      else interim += r[0].transcript
    }
    pushText(finalText + interim)
  }
  rec.onerror = (e) => {
    // no-speech / aborted 是常態，不用理；network / not-allowed 才要講出來
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      notice.value = '麥克風權限被拒，辨識停止'
      recRunning = false
    } else if (e.error === 'audio-capture') {
      notice.value = '辨識拿不到麥克風（可能被其他程式佔用），聲音仍然會推動粒子'
    } else if (e.error === 'network') {
      notice.value = '辨識服務連不上（Web Speech 需要網路），聲音仍然會推動粒子'
    }
  }
  // Chrome 會自己斷（continuous 也一樣），接回去。
  rec.onend = () => {
    if (!recRunning || !listening.value) return
    clearTimeout(restartTimer)
    restartTimer = setTimeout(() => {
      try { rec.start() } catch { /* 已經在跑就會丟例外，忽略 */ }
    }, RESTART_DELAY)
  }

  recRunning = true
  try { rec.start() } catch { /* noop */ }
}

function stopRecognition () {
  recRunning = false
  clearTimeout(restartTimer)
  try { rec?.stop() } catch { /* noop */ }
}

function toggleListening () {
  listening.value = !listening.value
  if (listening.value) {
    if (state.value === 'live' && mode.value === 'text' && !recRunning) startRecognition()
  } else {
    stopRecognition()
    clearWall()
  }
}

function toggleMode () {
  mode.value = mode.value === 'text' ? 'ambient' : 'text'
  if (mode.value === 'ambient') {
    stopRecognition()
    clearWall()
  } else if (listening.value && state.value === 'live') {
    startRecognition()
  }
}

// ── 主迴圈 ─────────────────────────────────────────────────────────────────
function frame (now) {
  raf = requestAnimationFrame(frame)
  if (!engine) return
  const t = now || performance.now()

  // 音量
  const raw = readLevel()
  level += (raw - level) * (raw > level ? LEVEL_ATTACK : LEVEL_RELEASE)
  levelUi.value = level

  // 突發音 → 把粒子推開。text 模式下字會被吹散再被 seek 拉回來。
  if (raw > SHOUT_FLOOR && raw > level * SHOUT_RATIO && t - lastShout > SHOUT_COOLDOWN) {
    lastShout = t
    const { W, H } = engine.size
    // text 模式打在文字區塊的正中間（字才會被吹散）；ambient 沒有字，
    // 每次換個地方打，畫面才不會變成固定位置的心跳。
    const rx = mode.value === 'ambient' ? 0.2 + Math.random() * 0.6 : 0.5
    const ry = mode.value === 'ambient' ? 0.2 + Math.random() * 0.6 : 0.5
    engine.disturb?.(W * rx, H * ry, SHOUT_RADIUS, SHOUT_PUSH * raw)
  }

  // 太久沒有新的辨識結果就收工，讓字化回粒子場
  if (wallText && lastResultAt && t - lastResultAt > SILENCE_MS) {
    lastResultAt = 0
    clearWall()
  }

  const hasText = mode.value === 'text' && wallText.length > 0
  const want = hasText ? 1 : 0
  gripNow += (want - gripNow) * (want > gripNow ? GRIP_IN : GRIP_OUT)
  if (gripNow < 0.003) gripNow = 0

  const gain = mode.value === 'ambient' ? AMBIENT_SIM_GAIN : TEXT_SIM_GAIN
  const wantSim = (hasText ? TEXT_SIM : IDLE_SIM) + level * gain
  simNow += (wantSim - simNow) * SIM_LERP
  engine.setSimSpeed?.(simNow)

  if (slotsReady && gripNow > 0) {
    const cycle = Math.floor(t / DRIFT_MS)
    if (cycle !== driftCycle) { driftCycle = cycle; renewJitter(); dirty = true }
    if (dirty) { dirty = false; uploadTargets() }
    const breathe = reducedMotion
      ? 1
      : BREATHE_FLOOR + (1 - BREATHE_FLOOR) * (0.5 - 0.5 * Math.cos(t / BREATHE_MS * Math.PI * 2))
    engine.setMorph?.(TEXT_PULL * gripNow, TEXT_GRIP * gripNow * breathe, 0)
  } else if (gripNow === 0 && engine.config.morphPull !== 0) {
    engine.setMorph?.(0, 0, 0)         // 完全放手＝首頁 hero 那個自由場
  }

  if (debugOn.value) {
    dbg.value = [
      `${engine.backend} · ${engine.config.count.toLocaleString()}p · ${Math.round(engine.getFps?.() || 0)}fps`,
      `mode ${mode.value} · ${listening.value ? 'listening' : 'PAUSED'} · rec ${recRunning}`,
      `level ${level.toFixed(3)} · sim ${simNow.toFixed(2)} · grip ${gripNow.toFixed(2)}`,
      `cells ${wallText.length}/${CAP} · ${bucket}p per glyph`,
      `「${wallText}」`,
    ].join('\n')
  }
}

// ── 啟動 ───────────────────────────────────────────────────────────────────
async function start () {
  if (state.value === 'starting' || state.value === 'live') return
  state.value = 'starting'
  errorMsg.value = ''
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('此裝置 / 瀏覽器不支援麥克風')
    await startAudio()
    if (mode.value === 'text' && listening.value) startRecognition()
    state.value = 'live'
    setTimeout(() => { showUi.value = false }, 4500)
  } catch (e) {
    errorMsg.value = (e && e.message) || String(e)
    state.value = 'error'
  }
}

async function initEngine () {
  const canvas = canvasRef.value
  if (!canvas) return

  await loadParticleKit()
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
    simSpeed: 1.5,                     // 開場散開，之後由 frame() 接手
    cameraZoom: look.camera.zoom,
    pointSize: look.visual.pointSize,
    particleOpacity: Math.min(1, look.visual.heroOpacity + 0.18),
    showGlow: look.visual.showGlow,
    glowSize: look.glow.glowSize,
    glowIntensity: look.glow.glowIntensity,
    glowSteepness: look.glow.glowSteepness,
    cellSubdivisions: 2,
    maxDpr: maxDpr(),
  })

  if (!engine.setTargets || !engine.setMorph) {
    errorMsg.value = '這台裝置沒有 WebGPU，粒子場會跑但排不出字'
  }

  layout()
  buildHomes(engine.config.count)
  renewJitter()
  // ⚠️ 字型一定要等載完再取樣：webfont 沒到就取樣的是 fallback 字型的形狀，
  // 而且會被 inkCache 記住 —— 之後那幾個字永遠是錯的。
  await ensureGlyphFont(GLYPH_FONT)

  stopAmbient = reducedMotion ? null : window.PLAmbient.start(() => engine, { intensity: look.ambient })

  onVisibility = () => engine?.pause(document.hidden)
  document.addEventListener('visibilitychange', onVisibility)

  onResize = () => {
    if (!engine) return
    layout()
    // 版面換了，牆上的字要照新版面重排一次
    for (let k = 0; k < CAP; k++) setCell(k, wallText[k] || '')
    dirty = true
  }
  window.addEventListener('resize', onResize)

  onKey = (ev) => {
    const k = ev.key.toLowerCase()
    if (ev.code === 'Space') {
      ev.preventDefault()              // 不然會捲頁（雖然這頁 fixed，但仍會 focus 跳動）
      toggleListening()
    } else if (k === 'f') {
      if (document.fullscreenElement) document.exitFullscreen?.()
      else document.documentElement.requestFullscreen?.()
    } else if (k === 'h') {
      showUi.value = !showUi.value
    } else if (k === 'd') {
      debugOn.value = !debugOn.value
    } else if (k === 'c') {
      clearWall()
    } else if (k === 'm') {
      toggleMode()
    }
  }
  window.addEventListener('keydown', onKey)

  frame()

  setTimeout(async () => {
    const fps = engine?.getFps ? engine.getFps() : 60
    if (fps > 0 && fps < 45) {
      engine.setCount?.(Math.round(engine.config.count / 2))
      buildHomes(engine.config.count)
      renewJitter()
      await new Promise(r => setTimeout(r, 2000))
    }
    await snapshotSpecies()
    slotsReady = true
  }, 4000)
}

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
  clearInterval(clockTimer)
  if (raf) cancelAnimationFrame(raf)
  stopRecognition()
  if (micStream) micStream.getTracks().forEach(t => t.stop())
  if (audioCtx) audioCtx.close()
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

    <!-- 還沒開麥克風 -->
    <div
      v-if="state !== 'live'"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-8 text-center"
    >
      <h1 class="font-serif text-[clamp(56px,9vw,160px)] italic leading-[0.95]">
        回聲牆
      </h1>
      <p class="max-w-md font-zh text-fs-btn text-white/70">
        對它說話，粒子會排成你說的字。大聲一點會把字吹散。聲音只在這台機器上運算，辨識由瀏覽器內建的服務處理。
      </p>
      <button
        class="border border-[#71c1f0]/60 px-8 py-3 font-zh text-fs-btn transition-colors hover:border-[#71c1f0] hover:bg-[#71c1f0]/10 disabled:opacity-40"
        :disabled="state === 'starting'"
        @click="start"
      >
        {{ state === 'starting' ? '啟動中…' : '開始收音 →' }}
      </button>
      <p v-if="errorMsg" class="font-mono text-fs-micro text-[#ff8b8b]">
        {{ errorMsg }}
      </p>
    </div>

    <!-- 跑起來、還沒有人說話時的提示。一有字就淡掉。 -->
    <div
      v-else
      class="pointer-events-none absolute inset-0 z-10 transition-opacity duration-1000"
      :class="showUi && !caption ? 'opacity-100' : 'opacity-0'"
    >
      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
        <p class="font-serif text-[clamp(28px,4vw,64px)] italic leading-tight">
          {{ mode === 'ambient' ? '發出聲音' : '說說看' }}
        </p>
        <p class="mt-3 font-mono text-fs-micro uppercase tracking-[0.3em] text-white/55">
          speak · the field spells you out
        </p>
      </div>
    </div>

    <!-- ── 現場常駐的字卡（與 /wall 同一套語彙）────────────────────────── -->
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

    <div
      class="pointer-events-none absolute inset-x-0 bottom-[clamp(18px,3vh,48px)] z-10 transition-opacity duration-700"
      :class="state === 'live' ? 'opacity-100' : 'opacity-0'"
    >
      <div class="flex items-end justify-between px-[clamp(20px,3vw,64px)]">
        <div class="text-left">
          <p class="flex items-center gap-2 font-mono text-[clamp(12px,1vw,20px)] uppercase tracking-[0.26em] text-[#efe6d2]/75">
            <!-- 這顆點就是音量表：說話的時候會跟著脹縮，比一個假的 LIVE 燈有用 -->
            <span
              class="inline-block h-[0.5em] w-[0.5em] rounded-full transition-transform duration-75"
              :class="listening ? 'bg-[#71c1f0]' : 'bg-[#ff8b8b]'"
              :style="{ transform: `scale(${1 + levelUi * 1.8})` }"
            />
            {{ listening ? (mode === 'ambient' ? 'Live · Ambient' : 'Live · Echo Wall') : 'Paused' }}
          </p>
          <p class="mt-[0.35em] font-serif text-[clamp(12px,1vw,20px)] italic text-[#efe6d2]/50">
            pl. e · your voice, in particles
          </p>
        </div>

        <p class="text-right font-serif text-[clamp(15px,1.5vw,30px)] italic text-[#efe6d2]/75">
          #webconf2026
        </p>
      </div>

      <div class="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
        <p class="font-mono text-[clamp(22px,2.4vw,52px)] tabular-nums leading-none tracking-[0.14em] text-[#efe6d2]/85">
          {{ clock }}
        </p>
        <p class="mt-[0.5em] font-mono text-[clamp(10px,0.8vw,16px)] uppercase tracking-[0.32em] text-[#efe6d2]/45">
          {{ today }} · Taipei
        </p>
      </div>
    </div>

    <p
      v-if="notice"
      class="pointer-events-none absolute inset-x-0 top-[clamp(120px,18vh,220px)] z-20 text-center font-mono text-fs-micro text-[#71c1f0]/80"
    >
      {{ notice }}
    </p>

    <pre
      v-if="debugOn"
      class="pointer-events-none absolute left-6 top-6 z-30 whitespace-pre font-mono text-fs-micro leading-5 text-[#71c1f0]"
    >{{ dbg }}</pre>
  </div>
</template>
