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
const { countFor, maxDpr, isMobile } = useParticleBudget()
const { paletteToLinear, lerpPaletteLinear, buildImageTargets, buildSeedTargets, buildSlotTargets } = useParticleMorph()
// 首頁不只這一張 canvas（PL.III 講者場也有一張），同時只能有一張在跑 —— 見 useParticleStage。
const { activeStage } = useParticleStage()

const canvasRef = ref(null)
const backend = ref('')

// --- 效果（力矩陣 / 物理 / 色盤 / 光暈 / 相機）------------------------------
// 這些參數整組搬到 app/utils/particleFieldLooks.js 了，那裡有 sandbox demo 那 5 組
// 「載入範例」的完整換算與踩坑說明。跑哪一組是網址決定的：
//
//   （不帶參數）              每次進站隨機抽一組
//   ?hero-animation=1 ~ 5     指定一組（也認 id，例如 coral-membrane）
//   ?mode=tool                右側開一塊切換面板，點一下就換、不用重整
//   dev console               __fieldLook('fluoro-swarm')
//
// ⚠️ 用 let 而不是 ref：driftLoop 每幀都要讀它，不需要響應式的開銷。畫面上要跟著
//    變的東西（面板的選取狀態）另外開 activeLook 這個 ref。
// ⚠️ SSR 時讀不到 window，先拿保底那組；client 的 init() 會再讀一次網址。
//    canvas 是 onMounted 才建的，畫面上沒有東西從 look 算出來 → 沒有 hydration 落差。
let look = resolveFieldLook(DEFAULT_FIELD_LOOK)

// 只給右側面板用的響應式狀態
// ⚠️ looks 這個別名不能省：auto-import 只掃 script，只在 template 出現的名字不會
//    被補上 import。
const looks = FIELD_LOOK_LIST
const activeLook = shallowRef(look)   // 目前這組（shallow 就夠，look 物件不會被改）
const pinned = ref(false)             // true = 網址指定的，false = 隨機抽到的
const toolMode = ref(false)           // ?mode=tool
const switching = ref(false)          // 切換中（重生成粒子要一兩秒）
// 面板上那支「維持開場構圖」的滑桿。1 = 照 look.hold 的設定，0 = 完全放手（純湧現）。
// ⚠️ 與 look 一樣是 driftLoop 每幀讀的裸變數，另外用 holdPct 這個 ref 給面板顯示。
let holdScale = 1
const holdPct = ref(100)

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

// --- 讓「被按住的構圖」不要變成死的貼圖 --------------------------------------
// ⚠️ 這段是機制上的必要，不是可有可無的裝飾。seek 是「收斂到固定點的臨界阻尼
// 彈簧」：粒子一到定位，desiredV 就是 0，grip 會把速度歸零。實測 #1 在 grip 28
// 之下平均速率從 27.8 px/s 掉到 1.1 —— 構圖守住了，但畫面等同靜止。
// SpeakerField 已經完整踩過這個坑（見那裡的「閃動」長註解）：調 forceFactor、
// 調 grip/pull、加 ambient 脈衝、加 disturb 全部無效，因為那是穩定平衡。
//
// 唯一有效的作法是「讓目標點自己會動」—— 每隔一段時間，把每顆粒子的目標點換成
// 「自己原點附近的一個新的隨機偏移」，粒子就一直在追一個會動的東西。
// 構圖在數學上跑不掉：每顆粒子永遠被限制在自己 seed 原點的 AMP 半徑內。
//
// ⚠️ 與 SpeakerField 的差異：那裡 spread/shape 兩個目標槽剛好一個閒著，所以它靠
// blend 在 1↔0 之間擺盪來做游走；這裡兩個槽都用掉了（blend=0 是構圖、blend=1 是
// side.png，而 blend 是捲動位置決定的），所以改成直接抽換 blend=0 那一槽的內容。
// 偏移量小，換過去只是讓粒子有個新方向可追，看起來是流動而不是跳動。
//
// AMP 是「構圖清晰度 vs 游走幅度」的取捨，跟 SpeakerField 一樣是主要旋鈕。
// 這裡的構圖尺度（細胞團、軌道帶）比人像五官大得多，所以 AMP 可以比那邊的 7 大。
// 要更明顯優先縮短 PERIOD，不要放大 AMP。
const HOLD_DRIFT_AMP = 22            // 每顆粒子的游走半徑（模擬 px）
const HOLD_DRIFT_MS = 2400           // 多久換一組新的隨機偏移
// ⚠️ 光是「換一組偏移」還不夠：粒子約 0.2 秒就追到新位置，接下來 2.2 秒又是靜止的
//（實測平均速率仍只有 0.7 px/s）。SpeakerField 是靠 blend 在兩組目標之間連續擺盪
// 才有持續運動，但這裡兩個目標槽都用掉了（構圖／side.png），blend 是捲動位置決定的。
//
// 所以改成讓「握力自己呼吸」：grip 在 0 ↔ 設定值之間緩慢來回。
//   grip 低的半週期 —— 力場贏，構圖鬆開、粒子照自己的規則流動
//   grip 高的半週期 —— seek 贏，粒子被帶回自己的構圖原點
// 構圖仍然跑不掉（每輪都會被拉回原點），但畫面全程都在動。
// 不需要任何 buffer 上傳，只是每幀多算一個 cos。
const HOLD_BREATHE_MS = 7000         // 握力走完「鬆 → 緊 → 鬆」一輪
const HOLD_BREATHE_FLOOR = 0.18      // 最鬆的時候還留多少握力（0 = 完全放手）

// 模擬速度分三段疊起來：
//   1. 開場 —— 粒子從 seedPattern 的螺旋構圖「散開」的那幾秒要快，才看得到
//      規則接管、結構溶解的過程；散開後要明顯慢下來。
//   2. 待機 —— 極慢，只是緩緩呼吸。
//   3. 捲動 —— 依捲動速度即時加速，停下來再緩降回待機。
// ⚠️ 只有開場那段是共用的（它是版面編排、不是效果）；待機速度與全速捲動速度
// 各組效果不同，在 look.speed 裡。
const SIM_SPEED_INTRO = 1.5          // 開場散開時
const INTRO_HOLD_MS = 1800           // 維持全速多久
const INTRO_FADE_MS = 5000           // 之後花多久降到待機速度
const SCROLL_REF = 2200              // 捲動速度 px/s 到這個值就吃滿加速
const ATTACK = 0.14                  // 每幀往上追的比例
const RELEASE = 0.022                // 每幀往下降的比例（比 ATTACK 小很多）

// 互動力場（look.physics.forceFactor）在遷移時不需要關掉 —— 它與 seek 力同時
// 作用，正是「形狀是活的」的來源。
// 這裡只留「捲動中要把它壓掉多少」（1 = 全部暫停）：遷移過程乾淨、停下來才擴散。
const SCROLL_CALM = 0.6

// 相機：改用圖片收攏之後，「往左收」是靠 side.png 自己的構圖決定的
//（點雲落在圖片框的左 1/3），所以相機維持不動，避免雙重位移把圖推出畫面。
// hero 與 about 的 zoom 目前一樣（都是 look.camera.zoom），保留 lerp 是為了之後
// 要單獨微調第二區塊取景時有地方下手。
// 畫面內容往左推的比例（相對視窗寬度）。
// ⚠️ 上限：粒子只存在於 [0,W]×[0,H]，相機推出這個範圍就會看到空白。
// 可推的最大比例 = (zoom − 1) / 2。
const ABOUT_SHIFT = 0

// 粒子預算在 look.budget（依 canvas 面積算、不寫死。見 useParticleBudget 的長註解
// —— 力場成本是 N² / 面積，寫死的數字在窄視窗上會變成災難）。
// 開場再實測 fps 決定要不要對半砍（docs §10 陷阱二）。

// 閒置多久就停掉模擬。pause 只是跳過渲染與計算，canvas 會保留最後一幀，
// 所以畫面不會消失、只是定格 —— 使用者一動就無縫接回去。
//
// ⚠️ 觸控裝置要用長很多的門檻，跟 useParticleStage 同一個理由（那邊有完整說明）：
// 5 秒是照桌機訂的（滑鼠總會抖一下），但手機使用者「停下來看著畫面五秒」是完全
// 正常的行為 —— 沒有滑鼠、不需要捲動、不產生任何事件，然後動態就直接凍住。
// 有使用者回報過這個症狀。手機上真正可靠的離開訊號是 visibilitychange，那個下面有接。
//
// ⚠️ 這一份是這支元件自己寫的閒置邏輯，跟 useParticleStage 那份是「兩套」。
// 兩邊的門檻要一起改，不然行為會不一致。
const IDLE_STOP_DESKTOP_MS = 5000
const IDLE_STOP_TOUCH_MS = 60000

function idleStopMs () {
  return window.matchMedia?.('(pointer: fine)').matches
    ? IDLE_STOP_DESKTOP_MS
    : IDLE_STOP_TOUCH_MS
}

// 被別區蓋住時的「追趕時間」。
// ⚠️ 這段不能省。progress 是捲動位置算出來的，使用者滑多快它都立刻正確；但粒子要
// 真的「跑過」才會移動，而這張場在 PL.III～PL.V 是暫停的 —— 一步都沒跑。結果就是
// 捲到票券區時 morphPull 已經是 0，粒子卻還整團卡在 side.png 的形狀，接著才慢慢散，
// 完全來不及。所以 progress 在台下變動時，讓它「繼續算一小段」把位置追上。
// 反正畫面被蓋著，這段期間跳得多突兀都看不到。
const CATCH_UP_MS = 1500
// 追趕期間把模擬速度拉高，1.5 秒才夠把整場從收攏形狀帶回滿版
const CATCH_UP_SIM_SPEED = 1.6
// --------------------------------------------------------------------------

let engine = null
let stopAmbient = null
let onVisibility = null
let onActivity = null
let onPointerActivity = null
// pointermove 去重用的上一個座標（見 init 裡的說明）
let lastPointerX = -1
let lastPointerY = -1
let driftRaf = 0
let scrollTrigger = null
let returnTrigger = null
let reducedMotion = false

// 閒置停止的狀態
let lastActivity = 0
let idlePaused = false

// 台上/台下：別的區塊（PL.III）把台搶走時，這張就整個凍結。
// 與 idlePaused 分開兩個旗標，因為兩者的喚醒條件不同 —— 閒置是「使用者一動就醒」，
// 交棒是「捲出那一區才醒」，混在一起會互相覆蓋。
let stageActive = true
// 台下追趕的截止時刻（performance.now() 基準）。0 = 沒在追趕。
let catchUpUntil = 0

// 捲動進度 0（hero）→ 1（about）。相機漂移迴圈每幀讀它，跟 idle drift 疊加後
// 一次寫進相機 uniform —— 兩者搶同一個 setCameraOffset，必須合在同一處算。
let progress = 0
// 去程與回程各自的捲動進度，兩段都是 scrub，所以來回捲動可逆、停在中間也成立。
//
// ⚠️ 合成用 min 而不是「去程 × (1−回程)」。相乘的話，回程只要一啟動就立刻把去程
// 的值壓低 —— 實測兩段的捲動範圍原本重疊 187px，去程最高只到 0.82，PL.II 根本沒
// 完整收攏成 side.png。min 則是「回程真的低於去程才接手」，就算之後版面高度變動
// 讓兩段再度相鄰，也只會少掉重疊的那一小段，不會整段被削掉。
let heroProgress = 0
let returnProgress = 0

function updateProgress () {
  applyProgress(Math.min(heroProgress, 1 - returnProgress))
}

// 捲動速度 → 模擬速度的狀態（見 driftLoop）
let simSpeed = SIM_SPEED_INTRO
let scrollHeat = 0                   // 平滑後的捲動強度 0..1
let morphAmount = 0                  // 平滑後的收攏拉力 0..1（釋放比進場慢）
let appliedForce = look.physics.forceFactor   // 上次寫進引擎的 forceFactor
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
// 兩組目標點留著參照：holdBase 是「開場構圖」的原點（游走以它為基準），
// shapeXY 是 side.png。每次重掛 setTargets 都要兩個一起給。
let holdBase = null
let shapeXY = null
let holdJit = null                   // 游走用的 scratch，見 jitterInto
let holdSpecies = null               // 每個 slot 的物種，構圖重生時配對要用（見 renewHold）
let driftCycle = -1
let renewCycle = -1
let targetsReady = false
let targetsGen = -1                  // 建 targets 當下的引擎世代
let targetsW = 0                     // 建 targets 當下的模擬尺寸
let targetsH = 0
let onResize = null
let resizeTimer = 0

// 游走用：每顆粒子在自己原點附近的一個隨機小偏移。
// 半徑取 0.3~1.0 × amp，全部等長的話會變成一圈規則的環。
// ⚠️ 寫進呼叫端給的 scratch buffer，不要每次配新的 —— 48000 顆是一份 384KB 的
// Float32Array，每 2.4 秒配一份純粹是餵 GC（Home/Field 為了同樣理由改成 jitA/jitB）。
function jitterInto (out, base, amp) {
  for (let i = 0; i < base.length; i += 2) {
    const a = Math.random() * Math.PI * 2
    const r = amp * (0.3 + 0.7 * Math.random())
    out[i] = base[i] + Math.cos(a) * r
    out[i + 1] = base[i + 1] + Math.sin(a) * r
  }
  return out
}

// 構圖重生：換一組「同款但不同排列」的開場構圖，粒子就會從舊的一團團遷移到新的
// 一團團 —— 途中會分裂、合併、長出新群落。給 snake 那種「會真的收斂到終點」的
// 矩陣用（見 particleFieldLooks 的 renewMs）。
//
// ⚠️ 配對是拿「上一組構圖」對「新構圖」算的，不是對 GPU 快照 ——
//    readParticles 是一次 mapAsync 來回（1–2 幀），週期性做會固定掉幀；
//    而 holdBase 本來就是粒子正被拉去的位置，拿它當起點配對的效果一樣好。
// ⚠️ 每顆粒子的物種在生成後不能改，所以要配到「自己顏色」的目標點，
//    holdSpecies 就是為此在 buildTargets 時記下來的。
function renewHold () {
  if (!holdBase || !holdSpecies || !engine) return
  const { W, H } = engine.size
  const T = look.rules.species
  const n = holdSpecies.length

  // 用上一組構圖的位置 + 記下來的物種組出一份「假快照」餵給配對器。
  // slot 就是索引本身 —— holdBase / holdSpecies 都是以 slot 為索引存的。
  const prev = new Array(n)
  for (let i = 0; i < n; i++) {
    prev[i] = { x: holdBase[i * 2], y: holdBase[i * 2 + 1], s: holdSpecies[i], slot: i }
  }

  try {
    const seed = buildSeedTargets(look.rules.seedPattern, n, T, W, H)
    holdBase = buildSlotTargets(prev, seed, T, W).shape
    driftCycle = -1                  // 讓下一幀立刻用新構圖重算一次游走偏移
  } catch (err) {
    console.warn('[ParticleField] 構圖重生失敗，維持原構圖', err)
  }
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

  // --- 閒置超過門檻就停掉模擬（觸控裝置的門檻長很多，見 idleStopMs）----------
  if (!idlePaused && t - lastActivity > idleStopMs()) {
    idlePaused = true
    syncPause()
  }
  // 停住時仍要更新時間/捲動基準，否則喚醒那一幀會算出爆炸的 dt 與捲動速度。
  // 交棒給別張 canvas 時走同一條路 —— 凍結但基準照跑。
  // 例外：台下追趕期間要照常運作，否則粒子永遠停在舊形狀（見 CATCH_UP_MS）。
  const catchingUp = !stageActive && t < catchUpUntil
  if (idlePaused || (!stageActive && !catchingUp)) {
    if (catchUpUntil && !catchingUp) {   // 追趕剛結束 → 收工暫停
      catchUpUntil = 0
      syncPause()
    }
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
    const idleSpeed = look.speed.idle
    const base = idleSpeed + (SIM_SPEED_INTRO - idleSpeed) * intro

    const v = Math.abs(y - lastScrollY) / dt                   // px/s
    const heat = Math.min(1, v / SCROLL_REF)                   // 0 = 靜止, 1 = 全速捲動
    const target = base + (look.speed.max - idleSpeed) * heat
    // 加速追得快、減速拖得慢
    const k = target > simSpeed ? ATTACK : RELEASE
    simSpeed += (target - simSpeed) * k
    engine.setSimSpeed?.(catchingUp ? CATCH_UP_SIM_SPEED : simSpeed)

    // 捲動中壓低互動力場 = 暫停「自動擴散」，讓遷移讀起來乾淨；停下來再放回去，
    // 粒子就在輪廓裡重新活過來。用同一組 attack/release，跟 simSpeed 同步呼吸。
    scrollHeat += (heat - scrollHeat) * (heat > scrollHeat ? ATTACK : RELEASE)
    const wanted = look.physics.forceFactor * (1 - SCROLL_CALM * scrollHeat)
    if (Math.abs(wanted - appliedForce) > 0.01) {
      appliedForce = wanted
      engine.setForce?.(wanted)      // 會重寫 80 bytes 的 options buffer，所以設個門檻
    }
  }
  lastTime = t
  lastScrollY = y

  const p = progress
  const { W, H } = engine.size
  const heroZoom = look.camera.zoom
  const aboutZoom = look.camera.zoom
  const zoom = heroZoom + (aboutZoom - heroZoom) * p
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
    // 台下追趕時把 seek 力「全開」去把粒子拖到目標位置（blend 仍是 e，
    // 所以 e=0 時目標就是自由場那組點）。
    // ⚠️ 這裡不能寫成 morphAmount = e。e=0 時那等於直接關掉 seek，粒子就沒有任何
    // 力量被帶回滿版，只能靠互動力場慢慢擴散 —— 正是本檔上面警告過的失效模式
    //（實測會停在「佔用 24/32 格、左半邊 74%」，而健康的自由場是 32/32、49%）。
    // 追趕的重點是「快點到定位」，不是「快點放手」。
    if (catchingUp) morphAmount = 1
    else {
      morphAmount += (e - morphAmount) * (e > morphAmount ? MORPH_ATTACK : MORPH_RELEASE)
      if (morphAmount < 0.002) morphAmount = 0
    }
    // 拉力從「維持開場構圖」的底線，插值到「鎖成 side.png」的全力。
    // ⚠️ 底線不是 0：morphAmount=0（hero）時 blend 也是 0，目標點就是開場構圖那組，
    // 所以這條底線拉力做的是「把構圖按住」。hold.grip=0 的那組（深海流光）等於沒有
    // 底線，行為與加這段之前完全一致。
    // holdScale 是面板上那支滑桿（1 = 照 look 設定），只縮放「底線」那一端 ——
    // morphAmount=1 時仍然是完整的 MORPH_PULL/GRIP，不會連 PL.II 鎖圖片一起被調弱。
    // 握力呼吸（見上面 HOLD_BREATHE_MS 的說明）。reduced-motion 下就維持固定握力。
    const breathe = reducedMotion
      ? 1
      : HOLD_BREATHE_FLOOR + (1 - HOLD_BREATHE_FLOOR) * (0.5 - 0.5 * Math.cos(t / HOLD_BREATHE_MS * Math.PI * 2))
    const hp = look.hold.pull * holdScale * breathe
    const hg = look.hold.grip * holdScale * breathe
    const pull = hp + (MORPH_PULL - hp) * morphAmount
    const grip = hg + (MORPH_GRIP - hg) * morphAmount
    engine.setMorph?.(pull, grip, e)

    // 目標點游走。只在「構圖那一端當家」時做 —— morphAmount 高的時候 blend 也高，
    // 這一槽的權重很低，換了看不到，只是白白上傳一次 buffer。
    if (hg > 0 && morphAmount < 0.5 && holdBase && shapeXY && !reducedMotion) {
      // 構圖重生要排在游走之前 —— renewHold 會把 driftCycle 歸位，
      // 讓同一幀就用新構圖重算偏移並上傳，不會有一輪拿舊構圖的空窗。
      const renewMs = look.hold.renewMs
      if (renewMs > 0) {
        const rc = Math.floor(t / renewMs)
        if (renewCycle === -1) renewCycle = rc        // 第一次不重生，先讓開場構圖站穩
        else if (rc !== renewCycle) { renewCycle = rc; renewHold() }
      }

      const cycle = Math.floor(t / HOLD_DRIFT_MS)
      if (cycle !== driftCycle) {
        driftCycle = cycle
        if (!holdJit || holdJit.length !== holdBase.length) holdJit = new Float32Array(holdBase.length)
        engine.setTargets(jitterInto(holdJit, holdBase, HOLD_DRIFT_AMP), shapeXY)
      }
    }
  }
}

// 捲動只改「色盤 + 透明度 + morph 強度」—— 粒子位置全程由 GPU 上的物理決定。
// 沒有任何 JS 端的軌跡快取，所以停頓、恢復、反向捲動都天然連續。
function applyProgress (p) {
  const next = Math.min(1, Math.max(0, p))
  // 台下（被別區蓋住）而 progress 又在變 → 開一段追趕，讓粒子真的跑到新位置。
  // 使用者滑得再快也不會在票券區看到還卡在舊形狀的場（見 CATCH_UP_MS）。
  if (!stageActive && Math.abs(next - progress) > 0.002) {
    catchUpUntil = performance.now() + CATCH_UP_MS
    syncPause()
  }
  progress = next
  if (!engine) return
  const e = progress * progress * (3 - 2 * progress)   // smoothstep，兩端收尾自然
  if (heroLin && aboutLin) engine.setColors?.(lerpPaletteLinear(heroLin, aboutLin, e))
  const { heroOpacity, aboutOpacity } = look.visual
  engine.setParticleOpacity?.(heroOpacity + (aboutOpacity - heroOpacity) * e)

  // 收攏拉力本身在 driftLoop 逐幀寫（見那裡的 morphAmount），因為它需要釋放延遲。
}

// 一次性：讀回目前粒子 → 同物種內就近配對圖片點 → 攤成以 slot 為索引的 target
// 陣列上傳。配對只決定「誰去哪個點」，之後位置由物理接管，target 不會過期。
function invalidateTargets () {
  targetsReady = false
  // ⚠️ 一併清掉，否則游走會拿舊尺寸／舊配對的陣列去 setTargets，把粒子拉去錯的位置
  holdBase = null
  shapeXY = null
  holdJit = null
  holdSpecies = null
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

  // blend=1 的那端：side.png 的點雲（PL.II）
  const { shape } = buildSlotTargets(snap, buildImageTargets(aboutSpec, snap.length, W, H), T, W)

  // blend=0 的那端。原本是「快照當下的位置」，也就是規則演化完的自由場；
  // 現在改成 seedPattern 的開場構圖 —— 那才是每組效果真正好看、也真正互相不同的
  // 樣子（見 particleFieldLooks 的 hold 那段）。hold.grip=0 的組沒有底線拉力，
  // 這組目標點只在「從 PL.II 捲回來」時用得到，行為與改之前一樣。
  //
  // ⚠️ 一定要用同一份 snap 去配對兩端，每顆粒子在兩組目標之間才有一致的身分，
  //    setTargets(hold, shape) 才能直接在兩者間插值（見 useParticleMorph 檔頭）。
  // ⚠️ hold.grip === 0 的組（深海流光＝線上 hero）走原本那條路：blend=0 那端就是
  // 「快照當下的自由場」。這一端不只在 hero 用得到 —— 從 PL.II 捲回來時，seek 是
  // 靠它把粒子主動帶回滿版的（見下面「收攏拉力」那段的警告）。既然那組不需要維持
  // 開場構圖，就不要改動它的回程目標。
  let hold
  try {
    hold = look.hold.grip > 0
      ? buildSlotTargets(snap, buildSeedTargets(look.rules.seedPattern, snap.length, T, W, H), T, W).shape
      : buildSlotTargets(snap, buildImageTargets(aboutSpec, snap.length, W, H), T, W).spread
  } catch (err) {
    // seed 產生器掛掉就退回舊行為（快照位置），至少不會把粒子吸去座標原點
    console.warn('[ParticleField] 開場構圖目標點建立失敗，退回自由場', err)
    hold = buildSlotTargets(snap, buildImageTargets(aboutSpec, snap.length, W, H), T, W).spread
  }

  holdBase = hold
  shapeXY = shape
  // 構圖重生時要配到「自己顏色」的目標點，而 slot 是粒子永不改變的身分 ——
  // 趁這份快照還在，把每個 slot 的物種記下來（見 renewHold）。
  holdSpecies = new Uint8Array(engine.config.count)
  for (const p of snap) {
    if (p.slot < holdSpecies.length) holdSpecies[p.slot] = p.s % T
  }
  driftCycle = -1
  renewCycle = -1
  engine.setTargets(hold, shape)
  targetsGen = engine.targetsGeneration
  targetsW = W
  targetsH = H
  targetsReady = true
  applyProgress(progress)              // 補算一次，避免首屏就在第二區塊時沒套上
}

function syncPause () {
  // 固定背景永遠在視窗內，所以不必 IntersectionObserver；要理的是分頁隱藏
  //（rAF 在背景分頁只是降頻，不是停止）、使用者閒置，以及被別的區塊搶走台。
  const catchingUp = !stageActive && performance.now() < catchUpUntil
  if (engine) engine.pause(document.hidden || idlePaused || (!stageActive && !catchingUp))
}

// 交棒。⚠️ 拿回台面時要一併重設 lastActivity —— 否則「離開這區的那一刻」
// 距離上次 pointermove 早就超過閒置門檻，會醒來後立刻又被閒置邏輯停掉。
watch(activeStage, (v) => {
  stageActive = v === 'background'
  if (stageActive) {
    lastActivity = performance.now()
    // ⚠️ 交棒回來時要把收攏狀態「直接對齊」progress，不能沿用 MORPH_RELEASE 慢慢放。
    // 這張場在別區當家時是暫停的，driftLoop 沒在跑，morphAmount 還停在離開時的值；
    // 不對齊的話，捲回票券區會看到粒子還在慢慢散開 —— 而那段散開過程本來應該
    // 在被蓋住的期間就完成了。反正暫停期間畫面是定格的，直接跳不會被看到。
    const e = progress * progress * (3 - 2 * progress)
    morphAmount = e
    if (targetsReady) engine?.setMorph?.(MORPH_PULL * morphAmount, MORPH_GRIP * morphAmount, e)
  }
  syncPause()
})

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

// 第二區塊的收攏目標：執行期直接取樣圖片（約 190ms / 32k 點）。
// 之後要省這段成本就改成烘好的 JSON + PLImage.prepareFromData()，
// 兩者產出的 spec 介面相同，這裡不用改。
// ⚠️ colors 必須等於當下的 species，所以換效果（species 可能不同）時要重跑一次。
async function prepareAboutSpec () {
  try {
    aboutSpec = await window.PLImage.prepare(ABOUT_IMAGE, {
      count: ABOUT_SAMPLES,
      colors: look.rules.species,
    })
    if (ABOUT_PALETTE_OVERRIDE) aboutSpec.palette = ABOUT_PALETTE_OVERRIDE
    aboutLin = paletteToLinear(aboutSpec.palette)
  } catch (err) {
    console.warn('[ParticleField] 圖片點雲取樣失敗，第二區塊維持自由場', err)
    aboutSpec = null
    aboutLin = null
  }
}

// 四層環境擾動：沒有它，場域幾十秒後會收斂成靜態圖（docs §4）。
// intensity 由效果決定 —— 對稱矩陣那幾組（motion: 'convergent'）本來就會收斂，
// 要靠比較強的外力才維持得住呼吸感。
function startAmbient () {
  stopAmbient?.()
  stopAmbient = reducedMotion
    ? null
    : window.PLAmbient.start(() => engine, { intensity: look.ambient })
}

// 面板的滑桿：即時調整「維持開場構圖」的力度。
// 只改一個裸變數，下一幀 driftLoop 就會用到 —— 不重生成粒子，所以拉的當下就看得到
// 構圖收緊或散開，不會閃一下。
// 上限開到 200 是為了試「握更緊」；再上去就接近 PL.II 鎖圖片的區間，內部運動會沒了。
function setHold (pct) {
  holdPct.value = Math.max(0, Math.min(200, Math.round(pct)))
  holdScale = holdPct.value / 100
}

// 換一組效果，不重建 canvas。給右側面板、?hero-animation= 與 dev console 用。
// ⚠️ setSpecies / setCount 會整場重生成粒子（等於重新開場），targets buffer 也
// 會被重配 —— 所以一定要跟著 invalidateTargets()，它會等場散開再重建。
//
// @param {string|number|null} idOrIndex null = 重新隨機抽一組（不會抽到目前這組）
async function switchLook (idOrIndex) {
  const next = idOrIndex === null || idOrIndex === FIELD_LOOK_RANDOM
    ? randomFieldLook(look)
    : resolveFieldLook(idOrIndex)
  const wantPinned = idOrIndex !== null && idOrIndex !== FIELD_LOOK_RANDOM

  pinned.value = wantPinned
  syncFieldLookQuery(wantPinned ? next : null)
  if (!engine || next === look) {
    activeLook.value = next
    return next?.name
  }

  look = next
  activeLook.value = next
  switching.value = true

  const count = countFor(canvasRef.value, look.budget)
  // 手機一律關光暈：那是額外一趟全螢幕加法 pass，填充率成本跟 DPR 平方成正比。
  applyFieldLook(engine, look, { count, allowGlow: !isMobile() })
  appliedForce = look.physics.forceFactor

  heroLin = paletteToLinear(window.PLPalettes.PALETTES[look.palette].particles)
  await prepareAboutSpec()
  invalidateTargets()
  startAmbient()

  // 重生成的粒子要再跑一次開場包絡才散得開；換效果時使用者正盯著看，
  // 順便當成「已經醒著」，否則閒置邏輯會在散開到一半時把它停掉。
  introStart = performance.now()
  markActivity()
  applyProgress(progress)
  switching.value = false
  return look.name
}

async function init () {
  const canvas = canvasRef.value
  if (!canvas) return

  await loadParticleKit()
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // 網址決定跑哪一組；沒指定就隨機抽（值有白名單，打錯字會退回保底那組）
  const fromUrl = fieldLookFromLocation()
  look = fromUrl.look
  activeLook.value = fromUrl.look
  pinned.value = fromUrl.pinned
  toolMode.value = fromUrl.tool

  const PAL = window.PLPalettes.PALETTES
  const hero = PAL[look.palette]
  heroLin = paletteToLinear(hero.particles)

  const count = countFor(canvas, look.budget)

  engine = await window.makeEngine(canvas, {
    species: look.rules.species,
    count,
    preset: look.rules.preset,
    seedPattern: look.rules.seedPattern,   // 固定開場構圖；之後由規則接管（docs §6）
    palette: hero.particles,
    bgFade: hero.bgFade,
    forceFactor: look.physics.forceFactor,
    friction: look.physics.friction,
    repel: look.physics.repel,
    minR: look.physics.minR,
    rMax: look.physics.rMax,
    simSpeed: SIM_SPEED_INTRO,      // 開場快速散開；之後由 driftLoop 的包絡接手
    cameraZoom: look.camera.zoom,
    pointSize: look.visual.pointSize,
    particleOpacity: look.visual.heroOpacity,
    // 手機一律關光暈（額外一趟全螢幕加法 pass，成本跟 DPR 平方成正比）；
    // 桌機也只有 fluoro-swarm / coral-membrane 這兩組原本就開著。
    showGlow: look.visual.showGlow && !isMobile(),
    glowSize: look.glow.glowSize,
    glowIntensity: look.glow.glowIntensity,
    glowSteepness: look.glow.glowSteepness,
    cellSubdivisions: 2,
    maxDpr: maxDpr(),               // 全螢幕 HDR target，DPR 2 是 4 倍像素、視覺收益極小
  })
  backend.value = engine.backend
  appliedForce = look.physics.forceFactor
  // dev 時開個把手，方便在 console 直接調參（engine.setForce(1.4) 之類）
  if (import.meta.dev) {
    window.__field = engine
    // 即時換效果：__fieldLook('coral-membrane') 或 __fieldLook(5)
    window.__fieldLook = switchLook
    window.__fieldLooks = PARTICLE_FIELD_LOOKS
    window.__fieldHold = setHold        // __fieldHold(0) = 放手、(100) = 照設定
  }

  startAmbient()
  await prepareAboutSpec()

  onVisibility = () => syncPause()
  document.addEventListener('visibilitychange', onVisibility)

  onResize = () => invalidateTargets()
  window.addEventListener('resize', onResize)

  // ⚠️ pointermove 要做座標去重：瀏覽器在「內容自己在動、滑鼠停著」時仍會發合成的
  // pointermove（useParticleStage 實測靜置 4 秒收到 8 次）。照單全收的話 lastActivity
  // 會一直被刷新，閒置省電永遠不會觸發 —— 這個機制等於沒做。
  onPointerActivity = (ev) => {
    if (ev.clientX === lastPointerX && ev.clientY === lastPointerY) return
    lastPointerX = ev.clientX
    lastPointerY = ev.clientY
    markActivity()
  }
  onActivity = () => markActivity()
  window.addEventListener('pointermove', onPointerActivity, { passive: true })
  // ⚠️ touchstart / keydown 原本漏了 —— 手機上只點不滑、或用鍵盤操作時都不算活動。
  for (const ev of ['pointerdown', 'scroll', 'wheel', 'keydown', 'touchstart']) {
    window.addEventListener(ev, onActivity, { passive: true })
  }

  lastActivity = performance.now()
  syncPause()

  introStart = performance.now()
  lastScrollY = window.scrollY
  if (import.meta.dev) {
    window.__fieldDbg = () => ({
      look: look.id,
      holdPct: holdPct.value,
      age: Math.round(performance.now() - introStart),
      simSpeed: +simSpeed.toFixed(3),
      idlePaused,
      idleFor: Math.round(performance.now() - lastActivity),
      paused: engine.config.paused,
      progress: +progress.toFixed(3),
      heroProgress: +heroProgress.toFixed(3),
      returnProgress: +returnProgress.toFixed(3),
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
    // 去程：hero 底邊捲出畫面 = 粒子場從滿版收攏成 side.png
    scrollTrigger = $ScrollTrigger.create({
      trigger: '[data-field-hero]',
      start: 'bottom bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => { heroProgress = self.progress; updateProgress() },
      onRefresh: (self) => { heroProgress = self.progress; updateProgress() },
    })

    // 回程：進入 PL.III 講者區就開始散回滿版。
    // 為什麼要有這一段：這張背景場在 PL.III～PL.V 是被交棒暫停的（畫面被那幾區
    // 蓋掉），等票券區塊重新露出來時，它還停在 side.png 的收攏構圖 —— 而票券區
    // 設計上要的是 hero 那種滿版自由場。等到票券區才開始散開根本來不及。
    // 提早到講者區開始，捲到票券時已經散完。
    // ⚠️ 這一段的兩端分別服務兩個「方向」，起點與終點不能只看往下捲：
    //
    //   往下捲（散開）  起點 = 講者區頂邊到視窗 20%。這位置差不多就是「人物整個
    //                   出現」（區塊 720 高、視窗 900 高時剛好貼齊底部）。
    //                   ⚠️ 絕不能拉到 'top bottom'：去程要到頂邊約 79% 才跑完，
    //                   從視窗底開始會把 PL.II 的收攏吃掉（實測只到 0.82）。
    //
    //   往上捲（收回）  scrub 是可逆的，所以「終點」就是往上捲時的起點。
    //                   終點掛在 FAQ 區塊而不是講者區底邊 —— 從票券往回捲時，
    //                   一進 FAQ 就開始收回 side.png，等捲到 PL.II 早就到定位了。
    //                   終點放講者區底邊的話，往上捲要到講者區才開始收，來不及。
    const returnEnd = document.querySelector('#faq')
    returnTrigger = $ScrollTrigger.create({
      trigger: '[data-field-return]',
      start: 'top 20%',
      // FAQ 還沒切出來時退回講者區底邊，至少行為不會壞掉
      endTrigger: returnEnd || '[data-field-return]',
      end: returnEnd ? 'top center' : 'bottom center',
      scrub: true,
      onUpdate: (self) => { returnProgress = self.progress; updateProgress() },
      onRefresh: (self) => { returnProgress = self.progress; updateProgress() },
    })
    $ScrollTrigger.refresh()
  }
}

onMounted(() => { init() })

onBeforeUnmount(() => {
  if (driftRaf) cancelAnimationFrame(driftRaf)
  if (scrollTrigger) scrollTrigger.kill()
  if (returnTrigger) returnTrigger.kill()
  if (stopAmbient) stopAmbient()
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  clearTimeout(resizeTimer)
  if (onResize) window.removeEventListener('resize', onResize)
  // ⚠️ 移除時要跟掛上去的是同一個函式參照，而 pointermove 掛的是 onPointerActivity
  // 不是 onActivity —— 這裡原本兩者都寫 onActivity，所以 pointermove 那個監聽器
  // 其實從來沒被移除過（元件重掛就多一個）。
  if (onPointerActivity) window.removeEventListener('pointermove', onPointerActivity)
  if (onActivity) {
    for (const ev of ['pointerdown', 'scroll', 'wheel', 'keydown', 'touchstart']) {
      window.removeEventListener(ev, onActivity)
    }
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

  <!-- ?mode=tool 的切換面板。與一鏡到底版（Home/Field.vue）共用同一個元件。 -->
  <HomeFieldLookPanel
    v-if="toolMode"
    :look="activeLook"
    :looks="looks"
    :pinned="pinned"
    :hold-pct="holdPct"
    :switching="switching"
    @pick="switchLook"
    @hold="setHold"
  />
</template>
