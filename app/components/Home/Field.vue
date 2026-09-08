<script setup>
// 首頁專用：整頁只有「一張」粒子 canvas 的版本（桌機路徑）。
// ⚠️ 同一個目錄裡還有舊版的三個 Field（ParticleField / SpeakerField /
// VenueFaqField），那三個只服務 pages/index-old.vue。改東西前先確認改的是哪一組。
//
// ─── 這一版跟原版首頁差在哪 ────────────────────────────────────────────────
// 被它取代的舊版（pages/index-old.vue）有三張 canvas：
//   · HomeParticleField  固定背景，服務 PL.I / PL.II
//   · HomeSpeakerField   PL.III 自己一張（人像要鎖死到看得出五官）
//   · HomeVenueFaqField  PL.IV + PL.V 共用一張（sticky）
// 三張之間靠 useParticleStage 仲裁「同時只有一張在算」，交棒時後面那張是「定格」
// 而不是繼續跑，所以還得處理台下追趕（CATCH_UP_MS）、交棒回來時對齊 morph 狀態…
//
// 這一版只有這張 fixed canvas，從 PL.I 到 PL.VII 都是同一群粒子。
// 好處與代價都很明確，這正是要給設計看的差異：
//   ＋ 區塊之間是「同一群粒子連續變形」，沒有任何淡入淡出或黑色硬邊
//   ＋ 不需要交棒仲裁、不需要台下追趕，狀態機小非常多（少了約 200 行的邊界處理）
//   ＋ 任何時刻都只有一個 compute pass，fps 天生穩定
//   － 每個區塊沒辦法各自調物理參數（人像要 grip 82、紋理要 grip 55），
//     只能沿著捲動在關鍵影格之間插值，所以人像的銳利度略遜原版
//   － 每一區的底色不能是不透明黑（會把自己的粒子蓋掉），只能用半透明壓黑
//
// ─── 機制 ──────────────────────────────────────────────────────────────
// 一條「時間軸」flow ∈ [0, KEYS.length-1]，每個整數是一個關鍵影格：
//
//   0 hero    自由場（不收攏）      3 venue   菌落場（cellular，不是圖片）
//   1 about   side.png            4 faq     faq.png
//   2 speaker 講者人像             5 outro   自由場（票券／贊助／CoC）
//
// flow = Σ(各段 ScrollTrigger 的 scrub 進度)。每段各自 0→1、依序排列，所以 flow
// 單調、可逆、停在中間也成立。取 k = floor(flow)、u = flow - k 之後：
//
//   setTargets(shapes[k], shapes[k+1])   段落改變時才上傳（不是每幀）
//   setMorph(pull, grip, u)              每幀只寫 16 bytes
//
// 段落交界為什麼不會跳：u=1 時目標是 shapes[k+1]，切到下一段 u=0 時目標也是
// shapes[k+1] —— 換掉的那一端權重正好是 0。這是整條鏈路無縫的關鍵。
//
// ⚠️ 所有 shapes 都必須用「同一份粒子快照」配對出來（見 buildAllShapes）。
// 每顆粒子在各影格之間要有一致的身分，才能直接 setTargets(k, k+1) 而不重新配對。
//
// 位置與變形機制與原版相同（路線 C · shader seek 力，見 docs/point-cloud-effect.md §8）。

const props = defineProps({
  // 首頁資料的 speaker.items，只用來拿 portrait 路徑
  speakers: {
    type: Array,
    default: () => []
  }
})

const { loadParticleKit } = useParticleKit()
const { countFor, maxDpr, isMobile } = useParticleBudget()
const { paletteToLinear, lerpPaletteLinear, buildImageTargets, buildSeedTargets, buildSlotTargets } = useParticleMorph()
// 只借用它的閒置偵測（全 app 單例）。這一版沒有第二張 canvas，不需要 claim/release。
const { idle } = useParticleStage()
// 互動模式（Ctrl+2+6 的彩蛋）開著時，滑鼠推擠要讓位給手勢
const { isOn: interactiveOn } = useInteractiveMode()
const { speakerIndex, swapImpl, resetSpeakerBus } = useSpeakerFieldBus()

const canvasRef = ref(null)
const backend = ref('')

// --- 關鍵影格 --------------------------------------------------------------
// mode  這一格的粒子在做什麼。三種行為差很多，是整支檔案的主要分歧點：
//   'free'      自由場。跑 look 自己的力矩陣，只有很鬆的 hold 按住開場構圖。
//   'image'     收攏成圖片（side / 人像 / faq）。互動力場降到 LOCK_FORCE、
//               模擬速度固定 LOCK_SIM_SPEED、高 grip 把粒子釘在輪廓上。
//   'colonies'  活的菌落場（venue）。⚠️ 跟 'image' 幾乎每一項都相反 ——
//               力場要「開大」（菌落是力場自己塌出來的，不是圖片取樣來的），
//               grip 只用來把菌落圈在版面該在的那一塊。見 VENUE_COLONIES。
// src   圖片路徑，只有 mode 'image' 用得到
// fit   點雲佔畫布的比例（contain-fit 進 W*fit × H*fit 的框）
// pull  每單位距離想要的靠攏速度；grip 速度被導引的強度。
//       grip 大 = 抓得緊、輪廓清楚，但輪廓內剩下的 particle-life 運動就少。
//       實測可用區間 pull 8–12 / grip 55–85；grip 再高就變成死的貼圖。
// shift / shiftY  內容往左 / 往上推的「視窗寬（高）比例」，靠相機位移做出
//       「圖片被畫面邊緣切掉」的構圖，而不是裁圖（裁出來的硬邊很醜）。
// lumaBias  取樣密度跟著亮度走的程度（PLImage.prepare 的參數，預設 0.6）。
//       1 = 只有亮的地方有粒子，0 = 整片輪廓內均勻取樣，色調完全交給色盤表現。
//       ⚠️ 人像一定要 0，這是「人不像人」的主因之一，見 PORTRAIT_LUMA_BIAS。
const SIDE_IMAGE = '/source_images/side.png'
// ⚠️ venue.png 已經不用了 —— PL.IV 改成活的菌落場（mode 'colonies'），
// 那張圖當初只是拿來暫代這個效果的。檔案留著沒刪，原版三張 canvas 那頁還在用。
const FAQ_IMAGE = '/source_images/faq.png'

// PLImage.prepare 的預設值。標本那兩張（venue / faq）本來就是「黑底上的亮物體」，
// 調它幾乎沒差（實測 0.6 / 0.25 / 0 三種取樣，輪廓與尖刺一模一樣），所以照舊。
const DEFAULT_LUMA_BIAS = 0.6

// 人像維持 0.6 —— 這條是「試過才知道」的，留紀錄免得有人再走一次：
// 直覺會想調到 0（均勻取樣、明暗交給色盤表現），把 spec 的取樣點直接畫成 2D 圖看，
// 0 確實比 0.6 漂亮（眼窩不空、額頭不死白）。但站上不是那樣畫的 —— 引擎是 HDR
// 加法混色，一格越多粒子越亮，也就是「明暗其實是靠密度表現的」。lumaBias 一降，
// 密度平掉，臉就跟著平掉：實測 0 與 0.25 在站上都比 0.6 更沒有立體感、更像一團霧。
// ⚠️ 所以要改這個值，一定要看站上的實際畫面，不能只看取樣點的 2D 預覽。
// ⚠️ 這跟色數（look.rules.species，5～7）幾乎無關 —— 掃過 5/6/7/8 色都一樣，
//    所以不必為了人像去動 species（那會連 hero 的效果一起改掉）。
// 真正讓臉「不像人」的是另外兩件事，都已經修掉了：點雲被視窗撐太大（PORTRAIT_MAX_PX）
// 與過曝（這一格的 opacity）。
const PORTRAIT_LUMA_BIAS = 0.6

// 人像在畫面上最多幾 px（短邊）。見 fitInto() 的長註解 —— 點數有上限，點雲卻會
// 跟著視窗長大，所以要壓一個天花板，否則大視窗上的臉會稀到看不出是人。
// 612 = 基準視窗 1440×900 下現在的實際大小（0.68 × 900），所以基準視窗完全不變，
// 只有比它更大的視窗會被壓回來。
const PORTRAIT_MAX_PX = 612

// 這一格自己的閃動幅度（px）。⚠️ 別跟人像共用 SHIMMER_AMP —— 那邊是 3，因為五官
// 只有 20~40px 寬，抖過頭就糊掉；這裡一顆菌落 100px 以上、內部亮塊 20px 起跳，
// 抖 3px 等於沒動。
//
// 為什麼需要它：cellular 是對稱矩陣，會收斂 —— 混色 + 收攏雖然把靜止解破壞掉了，
// 實測穩定後也只剩 1.5 px/s，看起來還是偏死。設計師 demo 的菌落區實測是「相鄰幀
// 差異 2.3%，但 1 秒累積到 51%」，也就是結構一直在慢慢重組。
// 目標點週期性換一組偏移，正好給它這個「永遠有下一個目標」的推力。
// 「電弧感」＝ 小團內部快速閃爍重排，不是整團慢慢漂。
// 逐幀量設計師 demo 的單顆菌落（0.15 秒一張，放大 1.5 倍看）：菌落本身幾乎不位移，
// 但內部亮塊每 0.15 秒就明顯換一輪。對照原本這裡的設定（幅度 12px、週期 1000ms）
// 是「慢慢脹縮」，完全是另一種東西。
// 所以這一格自己帶「幅度 + 週期」：幅度收小到小團的尺度，週期縮到 1/4。
const VENUE_SHIMMER = 7
const VENUE_SHIMMER_MS = 260

const KEYS = [
  { id: 'hero', mode: 'free', src: null, fit: 0, pull: 0, grip: 0, zoom: 1.35, shift: 0, shiftY: 0, opacity: 0.55, lumaBias: DEFAULT_LUMA_BIAS },
  { id: 'about', mode: 'image', src: SIDE_IMAGE, fit: 0.86, pull: 10, grip: 68, zoom: 1.35, shift: 0, shiftY: 0, opacity: 0.75, lumaBias: DEFAULT_LUMA_BIAS },
  // 人像：原版那張獨立 canvas 可以把 grip 拉到 82 又完全關掉互動力場。這裡做不到
  // 「關掉」（前後兩格還要靠力場活著），但收攏成圖片的影格會把 force 降到引擎下限
  // ——見上面 LOCK_FORCE。要更銳利就把 grip 往上加，代價是前後兩段的流動感變差。
  // ⚠️ opacity 不要調回 0.95。渲染是 HDR 加法混色，臉的膚色本來就是整張圖裡面積最大、
  // 密度最高的一塊 —— 0.95 會讓它整片過曝糊成一坨橘色，眼窩、眼鏡、鼻樑這些暗部細節
  // 全被蓋掉（戴眼鏡那位最明顯，實測 0.95 完全看不到眼鏡、0.72 就看得到了）。
  { id: 'speaker', mode: 'image', src: null, fit: 0.68, maxPx: PORTRAIT_MAX_PX, pull: 11, grip: 82, zoom: 1.0, shift: 0, shiftY: 0, opacity: 0.72, lumaBias: PORTRAIT_LUMA_BIAS },
  // PL.IV 場地：⚠️ 這一格「不是圖片」。設計稿要的是一顆顆散開的菌落（第三組動態），
  // 那是 cellular 力矩陣自己塌出來的樣子，不是取樣自 venue.png。
  // venue.png 留在檔案裡沒用到 —— 之前是拿它暫代這個效果的（見 git 記錄）。
  // ⚠️ grip 55 是「握緊」不是「鬆握」，跟第一版的直覺相反。原因是結構已經寫進目標點
  // 了（colonyTargets 的小團），握緊才守得住那個構圖；握鬆的話 cellular 的異物種互斥
  // 會把小團推散，畫面就變成一片均勻的斑點（設計師的說法是「像繡球花」）。
  // 動態不靠鬆握來，靠的是 shimmer 快速換目標點（shimmerMs 260ms）。
  { id: 'venue', mode: 'colonies', src: null, fit: 0, pull: 11, grip: 55, zoom: 1.0, shift: 0, shiftY: 0, opacity: 0.85, shimmer: VENUE_SHIMMER, shimmerMs: VENUE_SHIMMER_MS, glow: true },
  { id: 'faq', mode: 'image', src: FAQ_IMAGE, fit: 0.82, pull: 10, grip: 55, zoom: 1.06, shift: 0.32, shiftY: 0.26, opacity: 0.80, lumaBias: DEFAULT_LUMA_BIAS },
  { id: 'outro', mode: 'free', src: null, fit: 0, pull: 0, grip: 0, zoom: 1.30, shift: 0, shiftY: 0, opacity: 0.60, lumaBias: DEFAULT_LUMA_BIAS },
]
const SPEAKER_KEY = 2                 // 講者影格的索引，換人時要改寫 shapes[2]

// 各段的捲動範圍。⚠️ 依序、不重疊 —— 重疊不會壞掉（flow 仍然單調），
// 但會讓兩段同時推進、變形速度忽快忽慢。
// start 用 'top 85%' 而不是 'top bottom'：從視窗底就開始的話，上一段還沒跑完
// 就被下一段接手，前一個形狀永遠收不滿（原版 ParticleField 的註解也踩過這個坑）。
const SEGMENTS = [
  { trigger: '[data-same-hero]', start: 'bottom bottom', end: 'bottom top' },
  { trigger: '[data-same-speaker]', start: 'top 85%', end: 'top 30%' },
  { trigger: '[data-same-venue]', start: 'top 85%', end: 'top 30%' },
  { trigger: '[data-same-faq]', start: 'top 85%', end: 'top 30%' },
  { trigger: '[data-same-ticket]', start: 'top 90%', end: 'top 45%' },
]

// --- 粒子預算 --------------------------------------------------------------
// ⚠️ 點數要跟「點雲在螢幕上的面積」一起看。venue / faq 那兩隻標本有很細的放射狀
// 尖刺，密度不夠就糊成一團白霧（原版 VenueFaqField 為此用到 52000）。這一版整頁
// 共用同一組粒子，所以要取所有區塊裡最吃密度的那個當基準。
//
// 依 canvas 面積算而不是寫死 —— 力場成本是 N² / 面積，窄視窗上寫死的數字會爆掉。
// DENSITY = 桌機的 50000 ÷ 1440×900，所以桌機行為不變（見 useParticleBudget）。
//
// ⚠️ 這一版「不」用 look.budget（原版三張 canvas 那邊才用）。各組效果的預算差很多
// （深海流光 48000、標本切片 27000），而這一版整條時間軸共用同一組粒子 —— 照 look
// 走的話，抽到哪一組 hero 就決定了人像 / venue / faq 的點數，同一張人像會忽濃忽淡。
// 這幾格的密度需求跟 hero 跑哪組效果無關，所以取「全頁最吃密度的那一格」當基準。
// hero 的疏密改由各組自己的 pointSize / opacity 表現，那兩個本來就在 look 裡。
const COUNT_DENSITY = 0.0386
const COUNT_MAX = 50000
const COUNT_MIN = 10000
const PAGE_BUDGET = { density: COUNT_DENSITY, max: COUNT_MAX, min: COUNT_MIN }
// 每張圖的取樣點數。⚠️ 全部必須一致，否則配對會有一撮粒子配不到對。
// 引擎點數可以大於它（buildImageTargets 會循環重用取樣點），也可以小於它
// （取樣是重要性採樣、順序隨機，取前 N 個仍是整張圖的均勻子集）。
const SAMPLES = 36000

// --- 效果（力矩陣 / 物理 / 色盤 / 光暈 / 相機 / 點數 / 速度）------------------
// 與原版 ParticleField 共用同一張表：app/utils/particleFieldLooks.js。
// 那裡有 sandbox demo 那 5 組「載入範例」的完整換算、為什麼 4 組的力矩陣被換掉，
// 以及「維持開場構圖」的 hold 參數說明。
//
//   （不帶參數）              每次進站隨機抽一組
//   ?hero-animation=1 ~ 5     指定一組
//   ?tool=1                   右下角開工具面板
//
// ⚠️ 用 let：frame() 每幀讀它，不需要響應式的開銷。
// ⚠️ species 由 look 決定，而「所有 spec 的 colors 都必須等於 species」——
//    morph 過程中不能改 species（setSpecies 會整場重生）。所以換效果時
//    getSpec 的快取要一起清掉重取樣，見 switchLook。
let look = resolveFieldLook(DEFAULT_FIELD_LOOK)

// 只給右側面板用的響應式狀態
// ⚠️ looks 這個別名不能省：auto-import 只掃 script，只在 template 出現的名字不會
//    被補上 import。
const looks = FIELD_LOOK_LIST
const activeLook = shallowRef(look)
const pinned = ref(false)
const toolMode = ref(false)
const switching = ref(false)
// 只給 ?tool=1 面板讀的「目前生效值」。⚠️ 引擎的 config 不是響應式的，所以每次
// 動到旋鈕都要自己同步這裡，不能讓面板直接讀 engine.config。
const knobs = reactive({
  count: 0, samples: 0, rMax: 0, pointSize: 0, dprCap: 0, shimmerMs: 0, shimmerAmp: 0,
})
// 四個檔位「已經換算成這張 canvas 的絕對值」。面板按 t0~t3 只是把其中一組灌進
// 草稿，不會直接套用 —— 灌完人可以再逐項微調，按了保存才生效。
// ⚠️ 要在這裡算而不是面板算：count 得用 canvas 面積換算，那是只有這裡知道的。
const tierPresets = ref([])
// 純顯示用的補充資訊（依面積算出來的點數、後端名稱）
const toolMeta = reactive({ autoCount: 0, backend: '' })
const { register: registerTool } = useParticleTool()
let unregisterTool = null

// 這一版開放哪幾個旋鈕。⚠️ 桌機沒有「不透明度」與「游走 / 環境擾動」那幾格 ——
// 透明度是每一格自己的（KEYS 裡的 opacity，跟著捲動插值），游走則是 hero 專屬的
// hold 機制、已經有那條滑桿了。
const TOOL_FIELDS = ['count', 'samples', 'rMax', 'pointSize', 'dprCap', 'shimmerAmp', 'shimmerMs']
// 「維持開場構圖」的力度。1 = 照 look.hold，0 = 完全放手（純湧現）。
let holdScale = 1
const holdPct = ref(100)

// --- 模擬速度 --------------------------------------------------------------
// 開場快速散開 → 待機極慢 → 依捲動速度即時加速。與原版 ParticleField 同一套。
// ⚠️ 只有開場那段是共用的（那是版面編排、不是效果）；待機速度與全速捲動速度
// 各組效果不同，在 look.speed 裡。
// ⚠️ 設計師定案（2026-09）：開場不加速，一進場就照 demo 原本的速度跑。
// 這支開關留著是因為「開場先散開再降速」在改版過程中反覆進出 —— 想看那一版
// 把它改成 true 就好，底下三個 INTRO 常數只在它為 true 時生效。
const INTRO_SPEED_BOOST = false
const SIM_SPEED_INTRO = 1.5
const INTRO_HOLD_MS = 1800
const INTRO_FADE_MS = 5000

// 引擎起手的模擬速度：不加速時直接從待機速度開始（look 會被 __fieldLook 換掉，
// 所以寫成函式每次現算，不是一次算好的常數）。
const startSimSpeed = () => (INTRO_SPEED_BOOST ? SIM_SPEED_INTRO : look.speed.idle)
const SCROLL_REF = 2200               // 捲動速度 px/s 到這個值就吃滿加速
const ATTACK = 0.14
const RELEASE = 0.022

const SCROLL_CALM = 0.6               // 捲動中把互動力場壓掉多少，遷移才乾淨

// --- 收攏成圖片時，互動力場要讓開 ------------------------------------------
// ⚠️ 這是「整頁只有一張 canvas」這一版最重要的一條規則，別把它當成微調。
//
// 症狀：抽到不同的 hero 效果，人像 / venue / faq 這幾格的品質就完全不一樣 ——
// 深海流光（#2）的人像五官清楚，鈷藍細胞（#1）的同一張人像則變成十幾坨孤立的
// 色塊，看不出是人。設計上這幾格跟「hero 跑哪組效果」無關，不該有這種差異。
//
// 原因不是 seek 不夠緊（grip 已經 82），是互動力場「在密處會累加」：
// 一顆粒子受到的吸引力是 rMax 內所有鄰居的總和，密度越高越強；而 seek 是每顆
// 固定的 pull × 距離。人像本來就是「亮處密、暗處疏」，所以密處的力場一定會贏，
// 把該分布在五官上的粒子抽成一坨坨菌落 —— 效果的自吸引越強（#1 的 snake self=1）
// 塌得越兇。這跟 particleFieldLooks 裡「minR 是唯一有效旋鈕」是同一件事的兩面。
//
// 解法：收攏成圖片的影格把互動力場降到引擎下限，畫面交給 seek + 閃動主導。
// 實測 1440×900、鈷藍細胞、停在人像那格 25 秒（6px 網格）：
//   force 0.94  佔格率 5.4% ／ 最密 5% 的格子吃掉 31% 的粒子 ／ 單格最多 165 顆
//   force 0.10  佔格率 11.8% ／ 16.6% ／ 51 顆   ← 與深海流光（17.9% ／ 79）同級
// 自由場那兩格（hero / outro）完全不受影響，效果的個性留著。
//
// ⚠️ 0.1 不是隨便挑的，是引擎 setForce 的下限（clamp 在 [0.1, 2.0]，見
//    particle-life-gpu.js）。寫 0 只會被夾回 0.1，不如照實寫。
// ⚠️ 那「粒子不就不動了嗎」——收攏到看得出形狀時本來就不可能有自發運動（seek 是
//    收斂到固定點的臨界阻尼彈簧，見下面 SHIMMER 那段的長註解）。這幾格的動態
//    一直都是靠閃動（週期性換一組目標點偏移）在做，不是靠互動力場。
const LOCK_FORCE = 0.1

// 收攏成圖片時的模擬速度。同樣是「不該被 hero 決定」的一項：待機速度在 look.speed
// .idle 裡，五組從 0.16 到 0.27 —— 而畫面上「閃動有多快」正比於它，所以同一張人像
// 在不同 hero 下會閃得不一樣快。這裡收攏時一律換成固定值。
//
// ⚠️ 值挑 0.45 的理由（不是憑感覺）：閃動是「每隔 SHIMMER_PERIOD_MS 換一組目標點
// 偏移，粒子再 seek 過去」，而 seek 的收斂速率是 pull × simSpeed（模擬時間是被
// simSpeed 縮放的）。simSpeed 0.16 時速率只有 1.76/s，一個 1 秒的週期裡粒子只走了
// 三分之一就被換到下一個目標，實測平均速率 2.2 px/s —— 看起來是慢慢飄，不是在閃。
// 0.45 時速率 4.95/s，0.2 秒就走完，顆粒真的「一顆一顆換位置」。
// ⚠️ 這裡敢把速度拉快，是因為收攏時互動力場已經被壓到 LOCK_FORCE ——
//    否則加速的會是整個力場，人像照樣被扯散。兩者是配套的。
const LOCK_SIM_SPEED = 0.45

// 收攏成圖片 / 菌落時的點大小。第三項「不該被 hero 決定」的參數，跟上面兩條同源。
//
// pointSize 是點的銳利核心半徑（sim px），而渲染是 HDR 加法混色 —— 感知亮度正比於
// N × pointSize²（docs/particle-performance.md §低檔位補償 的公式就是這條反解）。
// 五組效果從 0.8（深海流光 / 鈷藍細胞是 0.8 / 0.9）到 1.0（標本切片），核心面積與
// 亮度都差到 1.56 倍。落在滿版 hero 上那是效果的個性；落在同一張人像上就變成
// 「抽到標本切片的臉比較糊比較亮、抽到深海流光的比較銳比較暗」——
// 而人像 / venue / faq 這幾格跟 hero 跑哪一組完全無關，不該有這種差異。
//
// 值取 0.8 = biolum-drift（DEFAULT_FIELD_LOOK，也是上面 LOCK_FORCE 那段實測裡
// 「人像五官清楚」的那一組參考）。
// ⚠️ 純視覺常數：改它只會讓這幾格整體變亮變糊或變暗變銳，不影響物理，也完全不動
//    到 hero / outro。要調就配 ?hero-animation=1~5 逐組比對同一張人像。
const LOCK_POINT_SIZE = 0.8

// --- PL.IV 場地：活的菌落場 -------------------------------------------------
// 設計稿（Figma node 40004289-9149）標的「第三組動態」，畫的是一顆顆散開、
// 帶膜狀紋理的菌落。那正是 cellular 力矩陣的樣子：i===j 給 +0.8（自己抱團）、
// 其餘一律 -0.55（跟別的物種互斥）—— 完全對稱，所以會收斂成一顆顆互不往來的球。
//
// ⚠️ 這在 hero 是「壞掉」的定義（docs/living-particle-motion.md §1.1 拿它當呆板的
// 反例，particleFieldLooks 也因此把 #1 的矩陣換成 snake）。但在這一區，那個塌陷
// 就是設計要的東西 —— 差別在「hero 要一直演化，這裡要一群靜靜長著的菌落」。
// 別把這裡也「修正」成非對稱矩陣，會直接失去這一格存在的理由。
//
// force 照設計稿卡片上的 1.6（比自由場的 ~1.0 高）：塌得夠緊才有清楚的顆粒邊界。
// ⚠️ 收攏成圖片的那幾格是把 force 壓到 0.1，跟這裡剛好相反 —— 所以力場的目標值
//    改成「每一格自己決定」（見 frame() 的 forceFor），不能再用一個 imgLock 帶過。
//
// 卡片上另外兩個數字沒照抄，原因：
//   SPECIES 5   物種數是建引擎時決定的（setSpecies 會整場重生成粒子、targets 全毀），
//               而它由 look 決定（5～7）。cellular 產生器吃任意 n，5 或 7 都成立。
//   COUNT 1300  那是 sandbox 小畫布的點數，站上這張是滿版 canvas，照 PAGE_BUDGET。
const VENUE_PRESET = 'cellular'
const VENUE_FORCE = 1.0
const VENUE_SIM_SPEED = 0.3
// ⚠️ 沒有這一項，上面兩項就是白調的。minR 是硬核斥力半徑（dist < minR 就互斥），
// 等於「一顆菌落最多能擠多密」，也就是「菌落有多大」。look 給的是 5（幾乎可以壓成
// 一個點）—— 實測 cellular + minR 5：50000 顆全部縮成約 30 個 2~3px 的小點，整面
// 幾乎全黑，跟設計稿的一團團完全不同。這跟 particleFieldLooks 裡鈷藍細胞把 minR
// 拉到 16 是同一件事、同一個理由。離開這一格要記得換回 look.physics.minR。
// 實測（1440×900、50000 顆、10 顆菌落）：
//   minR 5   全部縮成約 30 個 2~3px 的點，畫面幾乎全黑
//   minR 18  約 35px 的實心小球，還是太小太硬
//   minR 44  約 70~80px、核心有顆粒、外圈帶暈 ← 最接近設計稿
//   minR 56  約 150px，但變成同心圓環（洋蔥狀），太有結構、不像菌落
const VENUE_MIN_R = 44

// 菌落的光暈參數。⚠️ 同樣不能照 look 走：五組之間 glowSize 差 1.7 倍（3~5）、
// glowIntensity 差 2.5 倍（0.012~0.03），而這一格是全站唯一真的把光暈打開的地方
// （收攏成圖片的那幾格現在一律關掉，見 frame() 的 glowWeight），所以那個差異會被
// 整片放大成「有時候菌落在發光、有時候只是一堆銳利的點」。
// 值取兩組本來就 showGlow: true 的效果之間（螢光群飛 4 / 0.022 / 5、
// 珊瑚薄膜 4.5 / 0.02 / 5）—— 那兩組是站上唯一被實際看過打開光暈的樣子。
const VENUE_GLOW = { glowSize: 4.2, glowIntensity: 0.021, glowSteepness: 5 }


// 菌落要待的那一塊（sim 座標的比例）。設計稿上點雲佔畫面左半，右半留給
// Taipei Popop 那段文字。
// ⚠️ 這一格用「把構圖放在該在的位置」而不是相機位移（其他格的 shift 那套）——
// 自由場的粒子只存在於 [0,W]×[0,H]，相機推出去會看到場的邊界（一條空白）。
// ⚠️ x1 要留出右邊那段文字（Taipei Popop 起點約在畫面 35% 處）。菌落中心會再往內
// 縮一個半徑，所以 0.33 之後菌落最右緣大約在 33%，不會壓到字。
const VENUE_REGION = { x0: 0.03, x1: 0.33, y0: 0.04, y1: 0.96 }
// 幾顆菌落、每顆多大（半徑佔畫布短邊的比例）。
// ⚠️ 這裡不用 PLSeeds 的 softClusters，雖然它也是「一團團圓群落」——
// 它的團數是從物種數推的（T=7 時只有 3～7 團），而且 cellular 會再把每一團依物種
// 拆成好幾顆（實測 4 團 × 7 物種 ≈ 25 顆小球，跟設計稿的十來顆大菌落差很多）。
// 直接寫團數與半徑，才控制得住「幾顆、多大、在哪」。
// ⚠️ 顆數 × 半徑要塞得進 VENUE_REGION 而且彼此留得出黑底空隙，否則菌落會黏成一大團
// （實測 10 顆 × 半徑 0.095 在 0.03~0.33 這條帶子裡放不下，拒絕取樣放棄後直接重疊，
// 畫面就變成左半邊一整片連續的細胞紋理，看不出一顆一顆）。
// 目前 7 顆 × 半徑 0.045~0.065 ≈ 佔那塊區域 15% 的面積，排得開還留得出空隙。
// ⚠️ 間距要抓得比半徑大方一點：菌落實際會脹得比目標圓盤大（物種互斥推出去的），
// 照半徑貼著排的話畫面上就是黏成一片。0.05 短邊 ≈ 45px 的黑底空隙。
const VENUE_GAP = 0.07
const VENUE_COLONIES = 7
// 一顆菌落裡切幾個小團、每個小團多大（佔菌落半徑的比例）。
// 設計稿一顆菌落裡大約十幾坨，大小不一。
const VENUE_BLOBS = [10, 18]
const VENUE_BLOB_R = [0.10, 0.24]
const VENUE_RADIUS = [0.045, 0.065]

// 收攏拉力的跟隨速度。ATTACK 快（收攏要跟得上捲動），RELEASE 慢（放手要拖一段）。
// ⚠️ RELEASE 不能快：回到自由場時若 pull 跟著 u 一起歸零，粒子就沒有力氣被帶回
// 滿版，會整團留在原地慢慢擴散。慢釋放讓 seek 在 u 歸零後還有約 1.4 秒把粒子
// 送回 spread（那組目標點就是「健康的滿版自由場」），再交還給物理。
const LOCK_ATTACK = 0.20
const LOCK_RELEASE = 0.012

// --- 閃動 ------------------------------------------------------------------
// 收攏鎖得夠緊到看得出形狀時，粒子就不可能有自發運動 —— seek 是「收斂到固定點的
// 臨界阻尼彈簧」，任何擾動都會被 v = mix(v, desiredV, grip·dt) 吃掉。這是機制上
// 的，調 force / grip / 加脈衝都沒用（原版 SpeakerField 有完整的踩坑紀錄）。
// 有效的作法是「讓目標點自己會動」：每隔一段時間換一組新的隨機偏移，粒子就會平滑
// 地滑向新位置。⚠️ 這一版 blend 已經被捲動進度佔用，所以只能把抖動烘進目標點，
// 不能像 SpeakerField 那樣讓 blend 在 1↔0 之間震盪。
// ⚠️ AMP 要跟 LOCK_SIM_SPEED 一起看，這是最容易踩的坑：粒子「實際走到的距離」不是
// AMP，是 AMP × 這個週期內 seek 收斂掉的比例。原本 simSpeed 0.16 / 週期 2200ms 時
// 只收斂三分之一，所以 AMP 寫 7、看起來其實只抖 2px；現在 simSpeed 0.45 收斂到八成，
// 同樣寫 7 就真的抖 6px —— 眼鏡框、眼睛在模擬空間只有 5～10px 寬，直接被抹掉。
// 3 是「加速之後」實際抖幅仍在 2～3px 的值，五官保得住。
const SHIMMER_AMP = 3
// 換一組新偏移的週期。⚠️ 這個值是照設計師 demo 影片量出來的，不是憑感覺調的：
// 把影片裡人像靜止那 1.5 秒切出 380×380 的臉部視窗，量相鄰兩幀的差異（相對亮度）——
//   間隔 0.03s → 5.7% ／ 0.1s → 14.6% ／ 0.2s → 23.3% ／ 0.5s → 29.4% ／ 1.0s → 30.3%
// 0.5 秒就飽和了，也就是「整片顆粒約 0.5 秒換過一輪」。原本這裡是 2200ms，
// 慢了四倍多，看起來是整片在慢慢呼吸而不是在閃。1000ms 是折衷：顆粒感明顯快起來，
// 又不會變成整張臉在抖（速率正比於 AMP / PERIOD，所以 AMP 同步從 7 降到 3，見上）。
const SHIMMER_PERIOD_MS = 1000

const AMBIENT_INTENSITY = 0.5
// 收攏到一定程度就把四層環境擾動關掉 —— tide 那層一發是 16–25 的大脈衝，
// 會把鎖好的形狀打散。兩個門檻做遲滯，避免在邊界上反覆開關。
const AMBIENT_OFF_AT = 0.35
const AMBIENT_ON_AT = 0.20

// 目標點失效（視窗改尺寸、fps 自適應觸發 setCount 整場重生）後多久重建。
// 兼作 resize 的 debounce，也讓 setCount 重生的粒子先離開生成點再配對。
// ⚠️ 以前是 3000，因為「自由場」那組目標點抓的是當下的粒子分布，抓太早會記成
// 一團緊湊的開場構圖。現在那兩格改成一律用 seedPattern 的構圖（見 buildAllShapes），
// 跟當下分布無關了，所以可以短很多 —— 而這段期間 frame() 是不收攏的，越短越好。
const REBUILD_SETTLE_MS = 700

// 開場多久之後量 fps、然後「馬上」建目標點。
//
// ⚠️ 這個值直接決定「進站第一趟往下捲會不會有反應」，不是效能微調。
// ready（= 目標點建好）之前 frame() 會在 setMorph 之前 return，也就是捲動完全
// 不會讓粒子收攏。原本這裡是 4000（fps 不夠還要再加 3000 才建），實測冷啟動用
// 滾輪往下捲：1.4 秒時 flow 已經 0.15、3.8 秒就整頁捲完到 flow=5，而 ready 到
// 4.2 秒才 true —— 整趟下去一格都沒觸發，要捲回最上面再下來才對得上。
// 這就是設計師回報的「第一次往下滾都沒正確觸發」。
//
// 900ms 是「getFps 已經有東西可讀」與「使用者還沒捲下去」的交界。順序也很重要：
// 先量 fps → 要減半就 setCount → 等 REBUILD_SETTLE_MS → 才建目標點。
// setCount 會重配 targets buffer，順序反了目標點會被清空（等於又回到這個 bug）。
const FPS_SAMPLE_MS = 900

// --- 讓「被按住的構圖」不要變成死的貼圖 --------------------------------------
// ⚠️ 機制上的必要，不是裝飾。seek 是「收斂到固定點的臨界阻尼彈簧」：粒子一到定位
// desiredV 就是 0，grip 會把速度歸零 —— 構圖守住的代價是畫面靜止（原版 ParticleField
// 實測平均速率從 27.8 px/s 掉到 1.1）。SpeakerField 的「閃動」長註解已經證明調
// forceFactor / grip / pull / ambient 全部無效。
//
// 這裡的解法是讓「握力自己呼吸」：grip 在 FLOOR ↔ 1 之間緩慢來回。
//   鬆的半週期 —— 力場贏，構圖鬆開、粒子照自己的規則流動
//   緊的半週期 —— seek 贏，粒子被帶回自己的構圖原點
// 構圖跑不掉（每輪都拉回原點），但畫面全程在動。每幀只多算一個 cos。
//
// ⚠️ 只作用在「自由場」那兩格（hero / outro）。收攏成圖片的影格需要穩定的握力，
//    跟著呼吸會讓人像與標本忽清忽糊。
const HOLD_BREATHE_MS = 7000          // 握力走完「鬆 → 緊 → 鬆」一輪
const HOLD_BREATHE_FLOOR = 0.18       // 最鬆的時候還留多少握力

// 換人：先炸開再重組（與原版 SpeakerField 同一套 spread/shape 機制）
const EXPLODE_MS = 520
const REFORM_MS = 1100
const EXPLODE_PUSH = 170
// flow 落在這個範圍內才播換人動畫。捲到 venue 之後才點名單的話，粒子早就是別的
// 形狀了，硬播「炸開再組成人像」只會看到一團東西突然變成臉又變回去。
const SWAP_FLOW_MIN = 1.35
const SWAP_FLOW_MAX = 2.65

const TAU = Math.PI * 2
// --------------------------------------------------------------------------

let engine = null
let stopAmbient = null
let ambientOn = false
let raf = 0
let triggers = []
let onVisibility = null
let onResize = null
let resizeTimer = 0
let reducedMotion = false

// --- 滑鼠推擠 --------------------------------------------------------------
// 引擎本來就有 disturb(x, y, radius, strength)（環境脈衝 PLAmbient 也是用它），
// 這裡只是把指標的位置餵進去，讓粒子被滑過的地方稍微被推開。
//
// ⚠️ 只給 (pointer: fine) 的裝置。觸控沒有 hover、手指按下去就是要捲頁，
// 在 touchmove 上推粒子會跟捲動搶事件。
//
// ⚠️ 每幀最多推一次，在 frame() 裡消費 —— pointermove 一秒可以噴上百次，
// 每次都 disturb 會把 pendingDisturb 疊到上限（引擎自己 clamp 在 40），
// 變成整片被掀開，不是「稍微推擠」。
// 量級參考：shader 是「速度 += falloff × strength」，falloff 從圓心的 1 線性掉到邊緣的 0，
// 引擎每幀再把 strength 乘 0.85 衰減。PLAmbient 的 breath 用 radius 200~400 / strength 7~13，
// 那是「明顯看得出來」的等級；一開始給 110/3.2 太保守，圈太小、涵蓋的粒子太少，滑過去沒感覺。
// 粒子被推開多遠 ≈ 初速 / 摩擦，所以「推得更遠」要調的是 MAX_PUSH（給的初速），
// 不是半徑（半徑只決定影響到多大一圈）。
const POINTER_RADIUS = 260      // 影響半徑（sim px，= canvas CSS px）
// ⚠️ 13 不是隨便訂的：引擎每幀把新脈衝併進舊的再衰減，穩態大約是這個值的三倍，
// 剛好落在原本的 40 附近 —— 也就是維持放寬 clamp 之前調好的手感。
const POINTER_MAX_PUSH = 13     // 滑動時的單幀最大推力
const POINTER_SPEED_GAIN = 2  // 這一幀滑了多少 px → 推力（慢慢滑也要推得動）
// 游標停著時也要持續輕推，粒子才會在游標周圍讓出一塊。只在移動時推的話，
// 手一停下來粒子立刻填回去，等於游標本身沒有存在感 —— 那就是「沒感覺」的來源。
//
// ⚠️ 這個值要很小。引擎每幀把新脈衝併進舊的（s += new * 0.45）再乘 0.85 衰減，
// 所以持續推的穩態強度是 idlePush * 3 左右 —— 給 2.5 實測會在 2.5 秒內把整個
// 半徑內的粒子清空，變成一個跟著游標的大洞，不是「稍微推擠」。
const POINTER_IDLE_PUSH = 0.8

// --- 互動模式：把粒子「吸過去」-------------------------------------------
// disturb 是速度脈衝，粒子被推向圓心後會直接衝過去再散開 —— 做不出「聚成一團」。
// 真正把粒子帶到某個位置的是引擎的 morph：每顆粒子各有一個目標點，靠 spring 拉過去
// （人像、菌落那幾格用的就是這套）。捏合時就把所有粒子的目標改成手指周圍的圓盤。
const GATHER_PULL = 42        // 拉力（morph pull）
const GATHER_GRIP = 26        // 握力：到位之後把粒子按在那裡，不然會彈開
const GATHER_IN = 0.09        // 捏住時 blend 往 1 靠的速度
const GATHER_OUT = 0.05       // 放開時回到原本形狀的速度
// ⚠️ 只吸「手附近」的粒子。全部五萬顆一起拉過來的話會變成一顆很密的球，
// 那不像撥動場域，像把整個宇宙塞進手裡。
const GATHER_REACH = 460      // 這個半徑外的粒子留在原地不參與
// 每顆粒子各自的跟隨速度。全部同步到位就是「啪」一下變成球；
// 讓快慢散開，手一移動就會拉出一條尾巴。
const GATHER_LAG_MIN = 0.03
const GATHER_LAG_MAX = 0.17
let gatherBuf = null          // Float32Array(count*2)：每顆粒子當下的目標座標
let gatherDisk = null         // 圓盤內的固定分佈（相對圓心，單位圓）
let gatherLag = null          // 每顆粒子的跟隨係數
let gatherOn = false          // 這一幀手是不是捏著
let gatherBlend = 0           // 0 = 原本的形狀，1 = 完全聚到手上
let gatherX = 0, gatherY = 0, gatherR = 0
let gatherSeeded = false
let gatherTypesUp = false             // 這次捏合的配色索引上傳過了沒

// --- 互動模式：把場靜下來 -------------------------------------------------
// hero 是自由場，粒子本來就在高速流動 —— 手推一下的位移比它自己亂跑的幅度還小，
// 所以互動看起來「沒效果」。互動模式時把模擬速度壓到很低、環境脈衝也關掉，
// 粒子幾乎定住，手一動就只剩下手造成的變化。
//
// 🔧 想比較開關前後的差別，把這個改成 false（改完存檔 HMR 會直接生效）。
const INTERACTIVE_CALM = true
const CALM_SIM_SPEED = 0.12   // 平常自由場大約 0.5~1.4；0.12 幾乎是靜止但還在呼吸
let calmNow = false           // 這一幀有沒有在安靜模式（給 __sameDbg 看）
let pointerOn = false
let pointerX = 0, pointerY = 0
let pointerPrevX = 0, pointerPrevY = 0
let pointerSeen = false
let onPointerMove = null
const pointerPushes = []   // 只有 dev 會塞東西進來，給 __sameDbg 看（只留最近 20 筆）
let pointerPushCount = 0

// 螢幕座標 → 模擬座標。sim space 就是 canvas 的 CSS 像素，但畫面有相機
// （setCameraZoom / setCameraOffset 在捲動時一直在動），要把它反轉掉，
// 否則放大時推的位置會跟看到的差一截。
function toSim (px, py) {
  const { W, H } = engine.size
  const zoom = engine.config?.cameraZoom ?? 1
  const cx = engine.config?.cameraX ?? 0
  const cy = engine.config?.cameraY ?? 0
  return {
    x: (px - W * 0.5) / zoom + W * 0.5 + cx,
    y: (py - H * 0.5) / zoom + H * 0.5 + cy,
  }
}

// 在每幀裡消費指標位置。回傳 void。
function applyPointerPush () {
  // ⚠️ 不看 pointerFresh：游標停著時 pointermove 不會再觸發，但排斥圈要一直在。
  // 只要指標曾經進過畫面（pointerSeen）就每幀推一次。
  // 互動模式（彩蛋）開著時交給手勢，兩個一起推會打架。
  if (!pointerOn || !pointerSeen || !engine || interactiveOn.value) return

  const dx = pointerX - pointerPrevX
  const dy = pointerY - pointerPrevY
  pointerPrevX = pointerX
  pointerPrevY = pointerY

  // 底噪 + 速度加成：停著是穩定的排斥圈，滑動時按這一幀的位移加大
  const speed = Math.hypot(dx, dy)
  const push = Math.min(POINTER_MAX_PUSH, POINTER_IDLE_PUSH + speed * POINTER_SPEED_GAIN)

  const { x, y } = toSim(pointerX, pointerY)
  engine.disturb?.(x, y, POINTER_RADIUS, push)
  if (import.meta.dev) {
    pointerPushCount++
    pointerPushes.push({ x: Math.round(x), y: Math.round(y), push: +push.toFixed(2) })
    if (pointerPushes.length > 20) pointerPushes.shift()   // 只留最近幾筆，別讓它一直長
  }
}

// 每段的 scrub 進度，加總 = flow
const segProgress = new Array(SEGMENTS.length).fill(0)
let flow = 0

const specs = new Map()               // 圖片路徑 → PLImage spec（同一張只取樣一次）
let baseSnap = null                   // 建所有 shapes 的那份粒子快照（換人時要沿用）
const shapes = []                     // 每個影格的每-slot 目標點 [x,y,x,y,…]
// 每個影格的每-slot 配色索引（查 palLin 的第幾色）。⚠️ 一定要跟 shapes 同步維護：
// 兩者都是以 slot 為索引、成對上傳給 shader 的 .xy / .zw 兩組。
const shapeTypes = []
// ?tool=1 面板可以覆寫的旋鈕。⚠️ 上面那幾個 const 一律留著當「預設值 / 出處」，
// 這裡另開一組 let 給面板寫 —— 面板調完覺得好要寫回原始碼時，才知道基準在哪。
// ⚠️ 用裸變數不是 ref：frame() 每幀讀 lockPointSize / shimmerAmpNow /
// shimmerMsNow，響應式在那條熱路徑上是白付的開銷（跟 look 同樣的理由）。
let lockPointSize = LOCK_POINT_SIZE
let shimmerAmpNow = SHIMMER_AMP
let shimmerMsNow = SHIMMER_PERIOD_MS
let samplesNow = SAMPLES
const palLin = []                     // 每個影格的線性光色盤
let ready = false
let targetsGen = -1
let targetsW = 0
let targetsH = 0

let curSeg = -1                       // 目前已上傳目標點的段落
let shimmerT0 = 0
let shimmerCycle = -1
let shimmerPeriod = SHIMMER_PERIOD_MS   // 目前生效的閃動週期（每一格可以不同）
let jitA = null                       // 閃動用的 scratch，避免每 2.2 秒配兩份大陣列
let jitB = null

let simSpeed = startSimSpeed()
let scrollHeat = 0
let appliedForce = look.physics.forceFactor
let pullNow = 0
let gripNow = 0
let lastScrollY = 0
let lastTime = 0
let introStart = 0
let readyAt = 0                       // 目標點第一次建好的時刻（dev 觀測用）
let lastOpacity = -1
let lastColorKey = ''
let colonyPreset = false              // 目前引擎跑的是不是菌落那組矩陣
// 點的外觀。⚠️ 兩個都用「不可能的初值」當哨兵，讓第一幀無條件套一次 ——
// switchLook 走的 applyFieldLook 會把 pointSize / 光暈整組寫回 look 的值，
// 快取著舊狀態的話，停在人像那一格換效果就不會被改回鎖定值。
let appliedPointSize = -1
let glowOn = null                     // true / false / null（還沒套過）

let swapping = false                  // 換人動畫進行中 → 捲動不要搶著寫 morph
let swapTween = null

// --- 小工具 ----------------------------------------------------------------
// shader 算的是 ndc = (pos - center) * (2*zoom/W)，所以畫面上位移的「視窗寬度
// 比例」= 相機位移(sim px) * zoom / W。反解如下。
// hero 與 outro 這兩格是「自由場」，它們的取景、透明度與握力由效果決定，
// 所以不能寫死在 KEYS 表裡 —— 換效果時要重寫。中間那幾格是收攏成圖片的，
// 跟效果無關（人像要多清楚是那一區自己的事），不動。
//
// outro 沿用它原本相對 hero 的比例（zoom 1.30/1.35、opacity 0.60/0.55），
// 這樣換到 zoom 比較大的效果時，兩端仍然是同一個關係、不會在票券區跳一下。
const OUTRO_ZOOM_RATIO = 1.30 / 1.35
const OUTRO_OPACITY_RATIO = 0.60 / 0.55

function applyLookToKeys () {
  KEYS[0].zoom = look.camera.zoom
  KEYS[0].opacity = look.visual.heroOpacity
  KEYS[0].pull = look.hold.pull
  KEYS[0].grip = look.hold.grip

  const outro = KEYS[KEYS.length - 1]
  outro.zoom = look.camera.zoom * OUTRO_ZOOM_RATIO
  outro.opacity = Math.min(1, look.visual.heroOpacity * OUTRO_OPACITY_RATIO)
  outro.pull = look.hold.pull
  outro.grip = look.hold.grip
}

function shiftToCamera (f, zoom, span) { return (f * span) / zoom }

function lerp (a, b, e) { return a + (b - a) * e }

function jitterInto (out, base, amp) {
  for (let i = 0; i < base.length; i += 2) {
    const a = Math.random() * TAU
    const r = amp * (0.3 + 0.7 * Math.random())
    out[i] = base[i] + Math.cos(a) * r
    out[i + 1] = base[i + 1] + Math.sin(a) * r
  }
  return out
}

function speakerPortrait (i) {
  return props.speakers[i]?.portrait || null
}

function specKey (src, fit, lumaBias) { return `${src}@${fit}@${lumaBias}` }

async function getSpec (src, fit, lumaBias = DEFAULT_LUMA_BIAS) {
  if (!src) return null
  const cacheKey = specKey(src, fit, lumaBias)
  if (specs.has(cacheKey)) return specs.get(cacheKey)
  const spec = await window.PLImage.prepare(src, {
    count: samplesNow,
    colors: look.rules.species,   // 必須等於 species，否則得 setSpecies（會整場重生）
    fit,
    lumaBias,
  })
  specs.set(cacheKey, spec)
  return spec
}

// 一個影格要拿的那份 spec（key 自己帶 fit 與 lumaBias）
function specOf (key) { return getSpec(key.src, key.fit, key.lumaBias) }

// PL.IV 的菌落構圖：在版面左半邊撒 VENUE_COLONIES 顆圓形群落，把 N 顆粒子依
// 面積分給它們。回傳的是 buildImageTargets 那組同樣的 {tx, ty, tt} 介面。
//
// 這組座標只決定「菌落長在哪、多大」；顆粒感、膜狀邊界、內部的緩慢蠕動都是
// cellular 力矩陣自己跑出來的（seek 在這一格是很鬆的，見 KEYS 的 pull/grip）。
//
// ⚠️ 物種是「一顆菌落裡各種都有」，不是一顆一種。這是對上設計稿的關鍵：
// 設計稿裡每顆菌落是十幾坨大小不一的亮塊（白、亮藍、深藍混在一起）而不是一顆平滑
// 的球 —— 那些亮塊就是 cellular 把同物種吸在一起、不同物種推開的結果，一顆菌落
// 內部自己分成好幾坨。
// 附帶效果（也是要的）：seek 把粒子按在菌落裡、cellular 又要把不同物種推開，
// 兩股力互相牽制 → 這個系統永遠到不了平衡，內部一直在重組。對稱矩陣本來會收斂成
// 死圖（docs/living-particle-motion.md §1.1），混色 + 收攏正好把那個靜止解破壞掉，
// 也就是設計師要的「閃動感」的來源。
function colonyTargets (N, T, W, H) {
  const tx = new Float32Array(N)
  const ty = new Float32Array(N)
  const tt = new Uint8Array(N)
  const m = Math.min(W, H)
  const r = VENUE_REGION
  const minX = W * r.x0; const spanX = W * (r.x1 - r.x0)
  const minY = H * r.y0; const spanY = H * (r.y1 - r.y0)

  // 1) 菌落位置。拒絕取樣，彼此留出 VENUE_GAP 的黑底空隙。
  const col = []
  for (let c = 0; c < VENUE_COLONIES; c++) {
    const R = (VENUE_RADIUS[0] + Math.random() * (VENUE_RADIUS[1] - VENUE_RADIUS[0])) * m
    let x = 0; let y = 0
    for (let att = 0; att < 400; att++) {
      x = minX + R + Math.random() * Math.max(1, spanX - 2 * R)
      y = minY + R + Math.random() * Math.max(1, spanY - 2 * R)
      let ok = true
      for (const o of col) {
        const dx = x - o.x; const dy = y - o.y
        const need = o.R + R + VENUE_GAP * m
        if (dx * dx + dy * dy < need * need) { ok = false; break }
      }
      if (ok) break
    }
    col.push({ x, y, R })
  }

  // 2) 每顆菌落再切成一小團一小團（設計稿的關鍵）。
  // ⚠️ 「小團」一定要寫進目標點，不能指望物理自己長出來。之前的版本是把粒子均勻
  // 灑滿整顆菌落、讓 cellular 慢慢把同物種吸成小團 —— 結果有兩個問題：
  //   a. 要十幾秒才成形，而使用者捲到這一區只看得到最初那一兩秒
  //   b. 就算等到了也是「均勻的斑點球」，設計師的說法是像繡球花
  // 直接把小團排進目標點，粒子一到位（約 0.5 秒）就是對的結構，
  // cellular 只是「加強」它：同物種互相吸（小團更緊）、異物種互斥（空隙更黑）。
  // 物理跟構圖同向，不是互相打架，所以既快又穩。
  const blobs = []
  for (const c of col) {
    const k = VENUE_BLOBS[0] + ((Math.random() * (VENUE_BLOBS[1] - VENUE_BLOBS[0] + 1)) | 0)
    for (let b = 0; b < k; b++) {
      // 小團中心撒在菌落圓內（sqrt 讓它均勻分布，不會全擠在中心）
      const a = Math.random() * TAU
      const rr = c.R * 0.82 * Math.sqrt(Math.random())
      blobs.push({
        x: c.x + Math.cos(a) * rr,
        y: c.y + Math.sin(a) * rr,
        R: c.R * (VENUE_BLOB_R[0] + Math.random() * (VENUE_BLOB_R[1] - VENUE_BLOB_R[0])),
        t: (Math.random() * T) | 0,      // 一小團一種顏色 → 亮塊乾淨、團與團之間有色差
      })
    }
  }

  // 3) 分粒子：依小團面積分配，密度才會一致
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

// --- 目標點 ----------------------------------------------------------------
// 用同一份快照把每個影格算成「以 slot 為索引」的目標點。
// slot 是粒子生成時指定、永不改變的身分（GPU 每幀 spatial sort 會重排陣列，
// array index 靠不住），shader 用 targets[slot] 查目標點。
// ⚠️ recolor: true —— 圖片影格的配色掛在「目標點」上，不是粒子的物種上。
// 完整理由見 useParticleMorph.buildSlotTargets 的長註解：這一版整頁共用一組粒子，
// 而它們是拿 hero 的 seedPattern 生成的，物種直方圖是隨機的（seeds 用的是沒有種子的
// Math.random），跟人像的配色直方圖對不上 —— 實測同一組 look 重整三次，臉的主色
// 從 6.8% / 15.5% / 18.6% 顆，差 2.7 倍，臉就跟著忽濃忽淡。
function shapeFromSpec (spec, snap, W, H, maxPx = 0) {
  const targets = buildImageTargets(fitInto(spec, W, H, maxPx), snap.length, W, H)
  const { shape, shapeType } = buildSlotTargets(
    snap, targets, spec.palette.length, W, { recolor: true },
  )
  return { shape, shapeType }
}

// 把一份 spec 的 fit 壓到「畫面上最多幾 px」以內。
//
// ⚠️ 這是人像在大視窗上會變成鬼影的原因，不是效果、不是物理。
// 點雲的大小是 fit × 視窗短邊，會跟著視窗長大；點數卻卡在 COUNT_MAX（50000，
// 那是 fps 撐得住的上限）。所以視窗越大，同一張臉就被同樣多的粒子攤得越稀 ——
// 實測 1440×900 時人像 612px、看得出五官；1590×1400 時人像長到 847×872，
// 每平方 px 的粒子只剩 0.5 倍，五官就散成一層霧（設計師說的「好可怕」）。
//
// buildImageTargets 的實際邊長是 fit × min(W / aspect, H)，所以反解出上限即可。
// ⚠️ 只縮不放：小視窗仍照 key.fit，1440×900 這個基準視窗完全不受影響。
function fitInto (spec, W, H, maxPx) {
  if (!maxPx) return spec
  const span = Math.min(W / spec.aspect, H)
  const fit = Math.min(spec.fit, maxPx / span)
  return fit === spec.fit ? spec : { ...spec, fit }
}

// 自由場影格的「目標點」就是快照當下的位置。pull 在那裡是 0，平常用不到它 ——
// 真正的用途是「回程」：從收攏狀態捲回來時，seek 會主動把粒子拉回這組滿版分布，
// 而不是放掉力場乾等它們慢慢擴散。
function spreadFromSnap (snap, n) {
  const out = new Float32Array(n * 2)
  for (const p of snap) {
    if (p.slot < n) { out[p.slot * 2] = p.x; out[p.slot * 2 + 1] = p.y }
  }
  return out
}

async function buildAllShapes () {
  if (!engine?.readParticles || !engine.setTargets) return false
  const snap = await engine.readParticles()
  const { W, H } = engine.size
  const spread = spreadFromSnap(snap, engine.config.count)

  // 自由場那兩格（hero / outro）的目標點：seedPattern 畫出來的開場構圖。
  // 那才是每組效果真正好看、也真正互相不同的樣子 —— 規則一接管幾秒內就洗掉了，
  // 所以交給 seek 力去維持（見 particleFieldLooks 的 hold 那段）。
  //
  // ⚠️ 五組「一律」用開場構圖，包含 hold.grip = 0 的深海流光 —— 別再把它改回
  // 「grip=0 就退回 spread（快照當下的分布）」。那個版本讓這份目標點的品質綁在
  // 「建的當下場域散開了沒」，於是開場非得等好幾秒才能建，而在建好之前整個 frame()
  // 是空轉的 —— 進站第一趟往下捲完全不會收攏（見 init 裡 FPS_SAMPLE_MS 那段）。
  // 改成一律用構圖之後，什麼時候建都一樣，才有辦法把建立時機提前到 1 秒出頭。
  // grip=0 那組實際上也沒差：它在 hero 那端 pull/grip 都是 0，這組座標只有「回程」
  // 那 1.4 秒的收尾會用到，而構圖本來就是張滿版分布。
  // 自由場與菌落那幾格「不」recolor —— 顏色維持跟著物種走。
  // ⚠️ 菌落那一格特別不能改：設計要的那些亮塊是 cellular 把同物種吸在一起塌出來的，
  // 顏色一旦不跟物種綁，同一坨就變成雜色，那個效果在視覺上直接消失。
  const ownTypes = new Float32Array(snap.length)
  for (const p of snap) ownTypes[p.slot] = p.s % look.rules.species

  let freeShape = spread
  let freeTypes = ownTypes
  try {
    const seed = buildSeedTargets(look.rules.seedPattern, snap.length, look.rules.species, W, H)
    const built = buildSlotTargets(snap, seed, look.rules.species, W)
    freeShape = built.shape
    freeTypes = built.shapeType
  } catch (err) {
    console.warn('[HomeField] 開場構圖目標點建立失敗，該影格退回當下分布', err)
  }

  // 菌落那一格（venue）的目標點：softClusters 的圓群落，壓進版面左半邊那塊。
  // 這組座標只負責「菌落長在哪」，長什麼樣是 cellular 力矩陣自己塌出來的。
  let colonyShape = freeShape
  let colonyTypes = freeTypes
  try {
    const built = buildSlotTargets(
      snap,
      colonyTargets(snap.length, look.rules.species, W, H),
      look.rules.species,
      W,
    )
    colonyShape = built.shape
    colonyTypes = built.shapeType
  } catch (err) {
    console.warn('[HomeField] 菌落構圖建立失敗，該影格退回自由場', err)
  }

  shapes.length = 0
  shapeTypes.length = 0
  palLin.length = 0
  const heroPal = window.PLPalettes.PALETTES[look.palette].particles
  const pushFree = () => {
    shapes.push(freeShape)
    shapeTypes.push(freeTypes)
    palLin.push(paletteToLinear(heroPal))
  }
  for (const key of KEYS) {
    if (key.mode === 'colonies') {
      shapes.push(colonyShape)
      shapeTypes.push(colonyTypes)
      palLin.push(paletteToLinear(heroPal))
      continue
    }
    if (!key.src) { pushFree(); continue }
    const spec = specs.get(specKey(key.src, key.fit, key.lumaBias))
    if (!spec) { pushFree(); continue }
    const built = shapeFromSpec(spec, snap, W, H, key.maxPx)
    shapes.push(built.shape)
    shapeTypes.push(built.shapeType)
    palLin.push(paletteToLinear(spec.palette))
  }

  baseSnap = snap
  jitA = new Float32Array(spread.length)
  jitB = new Float32Array(spread.length)
  targetsGen = engine.targetsGeneration
  targetsW = W
  targetsH = H
  curSeg = -1                          // 強制下一幀重新上傳
  shimmerT0 = performance.now()
  shimmerCycle = -1
  ready = true
  if (!readyAt) readyAt = performance.now()
  return true
}

function targetsStale () {
  if (!engine || !ready) return false
  const { W, H } = engine.size
  return engine.targetsGeneration !== targetsGen || W !== targetsW || H !== targetsH
}

function invalidateTargets () {
  ready = false
  pullNow = 0
  gripNow = 0
  engine?.setMorph?.(0, 0, 0)
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => { buildAllShapes() }, REBUILD_SETTLE_MS)
}

// --- 環境擾動的開關（遲滯）--------------------------------------------------
function syncAmbient (lockNorm) {
  if (reducedMotion) return
  if (ambientOn && lockNorm > AMBIENT_OFF_AT) {
    stopAmbient?.()
    stopAmbient = null
    ambientOn = false
  } else if (!ambientOn && lockNorm < AMBIENT_ON_AT) {
    stopAmbient = window.PLAmbient.start(() => engine, { intensity: look.ambient })
    ambientOn = true
  }
}

// 光暈的三個參數一起換。開的時候才需要呼叫（關著的話 shader 根本不跑那一趟 pass）。
function applyGlow (g) {
  engine.setGlowSize?.(g.glowSize)
  engine.setGlowIntensity?.(g.glowIntensity)
  engine.setGlowSteepness?.(g.glowSteepness)
}

// --- 每幀 ------------------------------------------------------------------
function frame (now) {
  raf = requestAnimationFrame(frame)
  if (!engine) return

  const t = now || performance.now()
  const y = window.scrollY

  // 停住時仍要更新時間 / 捲動基準，否則喚醒那一幀會算出爆炸的 dt 與捲動速度
  if (document.hidden || idle.value) {
    lastTime = t
    lastScrollY = y
    return
  }

  // 這一幀要不要進入「安靜模式」（互動模式專用）
  calmNow = INTERACTIVE_CALM && interactiveOn.value

  // 滑鼠推擠。放在最前面：它只是往引擎丟一個脈衝，跟下面的影格 / 力場計算無關，
  // 而且要在 pause 的早退之後 —— 停住的時候推了也不會有動靜。
  applyPointerPush()

  // --- 時間軸 → 影格 --------------------------------------------------------
  // ⚠️ 要在力場那段之前算：力場強度與模擬速度都是「每一格自己決定」的（見 modeMix）。
  const last = KEYS.length - 2
  const k = Math.max(0, Math.min(last, Math.floor(flow)))
  const u = Math.max(0, Math.min(1, flow - k))
  const e = u * u * (3 - 2 * u)        // smoothstep，兩端收尾自然
  const A = KEYS[k]
  const B = KEYS[k + 1]

  // 這一幀有多少比重落在某個 mode 上。0 = 完全不在，1 = 完全在。
  const modeMix = (m) => (A.mode === m ? 1 : 0) * (1 - e) + (B.mode === m ? 1 : 0) * e
  const colonyMix = modeMix('colonies')

  // 菌落那一格要換一組力矩陣（cellular），離開就換回 look 自己的。
  // ⚠️ setPreset 只重寫互動矩陣，不會重生成粒子、也不會動到 targets buffer —— 這是
  // 它能在捲動中途換的原因（setSpecies / setCount 就不行，那兩個會整場重來）。
  // 門檻做遲滯（0.35 / 0.65），避免停在交界處來回抖。矩陣是瞬間換的，但畫面不會跳
  // ——粒子是被新的力慢慢重新組織，看起來就是菌落長出來 / 化開。
  const wantColony = colonyPreset ? colonyMix > 0.35 : colonyMix > 0.65
  if (wantColony !== colonyPreset) {
    colonyPreset = wantColony
    engine.setPreset?.(wantColony ? VENUE_PRESET : look.rules.preset)
    engine.setMinR?.(wantColony ? VENUE_MIN_R : look.physics.minR)
  }

  // --- 點的外觀：每一格自己決定 --------------------------------------------
  // ⚠️ 跟 forceFor / speedFor 是同一條規則的第三、第四項：hero / outro 照 look
  // （那是效果的個性），收攏成圖片與菌落的那幾格用固定值。沒有這一段的話，
  // 「這次進站抽到哪一組 hero」會一路決定人像 / venue / faq 的銳利度與亮度。
  // 完整理由見 LOCK_POINT_SIZE 與 VENUE_GLOW 的長註解。
  const pointSizeFor = key => (key.mode === 'free' ? look.visual.pointSize : lockPointSize)
  const wantPointSize = lerp(pointSizeFor(A), pointSizeFor(B), e)
  if (Math.abs(wantPointSize - appliedPointSize) > 0.005) {
    appliedPointSize = wantPointSize
    engine.setPointSize?.(wantPointSize)   // 重寫 80 bytes 的 options buffer，所以設門檻
  }

  // 光暈是布林、不能插值 —— 算一個 0/1 的權重再插值，用遲滯（0.35 / 0.65）決定要不要
  // 翻面，跟上面菌落換矩陣同一套，避免停在交界處來回切。
  // ⚠️ 收攏成圖片的那幾格一律關掉：光暈是在銳利核心外再疊一張 pointSize × glowSize
  //    的加法 quad（面積約核心的 100 倍，見 docs/particle-performance.md 的 6a），
  //    疊在人像上就是把五官糊掉 —— 手機那張獨立人像本來就寫死 showGlow: false。
  // ⚠️ 手機一律不開（額外一趟全螢幕加法 pass，成本跟 DPR 平方成正比）。
  const glowWeight = key => (key.mode === 'image'
    ? 0
    : key.mode === 'colonies' ? (key.glow ? 1 : 0) : (look.visual.showGlow ? 1 : 0))
  const glowMix = lerp(glowWeight(A), glowWeight(B), e)
  const wantGlow = (glowOn ? glowMix > 0.35 : glowMix > 0.65) && !isMobile()
  if (wantGlow !== glowOn) {
    glowOn = wantGlow
    engine.setShowGlow?.(wantGlow)
    // 開的時候順便換成「這一格該用的那組」參數：菌落用固定值（見 VENUE_GLOW），
    // hero / outro 照 look —— 那兩格的光暈是效果的個性，不在這條規則的管轄範圍。
    if (wantGlow) applyGlow(colonyMix > 0.5 ? VENUE_GLOW : look.glow)
  }

  // --- 捲動速度 → 模擬速度 -------------------------------------------------
  const dt = lastTime ? Math.min(0.1, (t - lastTime) / 1000) : 0
  if (dt > 0) {
    // 開場包絡：先維持 INTRO 速度，再 smoothstep 降到待機速度，之後恆為 0。
    // INTRO_SPEED_BOOST = false 時整段跳過，intro 恆為 0 → 從第一幀就是待機速度。
    const age = t - introStart
    let intro = 0
    if (INTRO_SPEED_BOOST) {
      if (age < INTRO_HOLD_MS) {
        intro = 1
      } else if (age < INTRO_HOLD_MS + INTRO_FADE_MS) {
        const u = 1 - (age - INTRO_HOLD_MS) / INTRO_FADE_MS
        intro = u * u * (3 - 2 * u)
      }
    }
    const idleSpeed = look.speed.idle
    const introBase = idleSpeed + (SIM_SPEED_INTRO - idleSpeed) * intro
    // 每一格自己的模擬速度，兩格之間插值。收攏成圖片的用固定值（閃動快慢才不會
    // 跟著 hero 效果變，見 LOCK_SIM_SPEED），菌落場用自己的，自由場照 look。
    const speedFor = key => key.mode === 'image'
      ? LOCK_SIM_SPEED
      : key.mode === 'colonies' ? VENUE_SIM_SPEED : introBase
    const base = lerp(speedFor(A), speedFor(B), e)

    const heat = Math.min(1, (Math.abs(y - lastScrollY) / dt) / SCROLL_REF)
    const target = base + (look.speed.max - idleSpeed) * heat
    simSpeed += (target - simSpeed) * (target > simSpeed ? ATTACK : RELEASE)

    // 互動模式把場壓慢，讓手勢造成的變化看得出來（見 INTERACTIVE_CALM）。
    // ⚠️ 只壓「自由場」那幾格。morph 收攏（粒子聚成人像／菌落）的速度也吃 simSpeed，
    // 整個壓下去的話捲到 PL.III 要等很久人像才長得出來 —— 而那幾格的粒子本來就
    // 被 morph 按在形狀上、幾乎不亂跑，本來就不需要再壓。
    const freeNow = modeMix('free')
    const calmSpeed = CALM_SIM_SPEED + (simSpeed - CALM_SIM_SPEED) * (1 - freeNow)
    engine.setSimSpeed?.(calmNow ? calmSpeed : simSpeed)

    scrollHeat += (heat - scrollHeat) * (heat > scrollHeat ? ATTACK : RELEASE)
    // 力場同理，而且三種 mode 要的方向完全不同：圖片要壓到下限、菌落要開大。
    const free = look.physics.forceFactor * (1 - SCROLL_CALM * scrollHeat)
    const forceFor = key => key.mode === 'image'
      ? LOCK_FORCE
      : key.mode === 'colonies' ? VENUE_FORCE : free
    const wanted = lerp(forceFor(A), forceFor(B), e)
    if (Math.abs(wanted - appliedForce) > 0.01) {
      appliedForce = wanted
      engine.setForce?.(wanted)      // 會重寫 80 bytes 的 options buffer，所以設門檻
    }
  }
  lastTime = t
  lastScrollY = y

  // --- 相機 -----------------------------------------------------------------
  const { W, H } = engine.size
  const zoom = lerp(A.zoom, B.zoom, e)
  const shiftX = shiftToCamera(lerp(A.shift, B.shift, e), zoom, W)
  // 相機往下移 = 內容往上移，所以要內容往下推就得給負的 Y
  const shiftY = -shiftToCamera(lerp(A.shiftY, B.shiftY, e), zoom, H)

  const gripTarget = lerp(A.grip, B.grip, e)
  const lockNorm = Math.min(1, gripNow / 90)

  // 緩慢的電影感漂移：兩個不同週期的正弦疊加，避免看得出循環。
  // 收攏時要壓下來 —— 人像跟著漂會讓「看得出是誰」的那幾秒一直在晃。
  let dx = 0; let dy = 0; let dz = 1
  if (!reducedMotion) {
    const s = t * 0.001
    const g = 1 - 0.75 * lockNorm
    dx = (Math.sin(s * 0.021) * 42 + Math.sin(s * 0.006) * 26) * g
    dy = (Math.cos(s * 0.017) * 30 + Math.sin(s * 0.010) * 16) * g
    dz = 1 + 0.035 * Math.sin(s * 0.011) * g
  }
  engine.setCameraZoom?.(zoom * dz)
  engine.setCameraOffset?.(shiftX + dx, shiftY + dy)

  // --- 透明度 / 色盤 --------------------------------------------------------
  // 兩者都會重寫整個 buffer，所以設變化門檻，不要每幀寫。
  const opacity = lerp(A.opacity, B.opacity, e)
  if (Math.abs(opacity - lastOpacity) > 0.004) {
    lastOpacity = opacity
    engine.setParticleOpacity?.(opacity)
  }
  if (!swapping && palLin.length === KEYS.length) {
    const ck = `${k}:${Math.round(e * 200)}`
    if (ck !== lastColorKey) {
      lastColorKey = ck
      engine.setColors?.(lerpPaletteLinear(palLin[k], palLin[k + 1], e))
    }
  }

  // 互動模式下連環境脈衝也要關 —— 那個是「讓場永遠不靜止」用的，
  // 正好跟「靜下來看手勢」相反。
  syncAmbient(calmNow ? 1 : lockNorm)

  // --- 收攏 -----------------------------------------------------------------
  if (ready && targetsStale()) invalidateTargets()
  if (!ready || swapping) return

  // 段落改變 → 換一組目標點。⚠️ 只在這裡上傳（一次 count*16 bytes），不是每幀。
  // 週期也是每一格自己的（菌落那格要快四倍才有電弧感，見 VENUE_SHIMMER_MS）。
  // 用 e < 0.5 決定聽哪一格的，換週期時把起算點重設，避免 cycle 編號跳號亂閃。
  const periodMs = (e < 0.5 ? A.shimmerMs : B.shimmerMs) ?? shimmerMsNow
  if (periodMs !== shimmerPeriod) {
    shimmerPeriod = periodMs
    shimmerT0 = t
    shimmerCycle = -1
  }
  const shimmerNow = Math.floor((t - shimmerT0) / shimmerPeriod)
  if (k !== curSeg || (!reducedMotion && shimmerNow !== shimmerCycle && lockNorm > 0.05)) {
    curSeg = k
    shimmerCycle = shimmerNow
    // 幅度是「每一格自己的」：人像 3px（五官只有 20~40px 寬，抖過頭就糊），
    // 菌落 12px（一顆 100px 以上，3px 等於沒動）。見 SHIMMER_AMP / VENUE_SHIMMER。
    const ampA = reducedMotion ? 0 : (A.shimmer ?? shimmerAmpNow)
    const ampB = reducedMotion ? 0 : (B.shimmer ?? shimmerAmpNow)
    engine.setTargets(
      ampA ? jitterInto(jitA, shapes[k], ampA) : shapes[k],
      ampB ? jitterInto(jitB, shapes[k + 1], ampB) : shapes[k + 1],
    )
    // ⚠️ 配色索引一定要跟目標點同一批上傳 —— 兩者都是「以 slot 為索引、對應
    // .xy / .zw 兩組目標」，分開上傳會有一幀是「舊的顏色配新的位置」。
    // 閃動只動位置不動顏色，所以這裡吃的是沒有 jitter 的那份。
    engine.setShapeTypes?.(shapeTypes[k], shapeTypes[k + 1])
  }

  const pullTarget = lerp(A.pull, B.pull, e)
  pullNow += (pullTarget - pullNow) * (pullTarget > pullNow ? LOCK_ATTACK : LOCK_RELEASE)
  gripNow += (gripTarget - gripNow) * (gripTarget > gripNow ? LOCK_ATTACK : LOCK_RELEASE)
  if (pullNow < 0.02) { pullNow = 0; gripNow = 0 }

  // 握力呼吸。只吃「自由場」那兩格的權重 —— 收攏成圖片的影格要穩定的握力。
  // ⚠️ 乘在最後而不是乘進 pullTarget：LOCK_RELEASE 只有 0.012（約 1.4 秒的時間
  // 常數），呼吸若走那條平滑路徑會被削掉大半振幅。
  const freeWeight = modeMix('free')
  const breathe = reducedMotion
    ? 1
    : HOLD_BREATHE_FLOOR + (1 - HOLD_BREATHE_FLOOR) * (0.5 - 0.5 * Math.cos(t / HOLD_BREATHE_MS * TAU))
  const b = (1 - freeWeight) + freeWeight * breathe * holdScale

  // 互動模式的「吸過去」接管 morph：blend 由捏合狀態推向 1（聚到手上）或 0（回原形）。
  // ⚠️ 要放在原本的 setMorph 之後覆蓋掉它，而不是散在上面 —— 上面那段還負責
  // shimmer 與影格切換，跳過的話捏放一次之後粒子就回不到正確的形狀了。
  gatherBlend += ((gatherOn ? 1 : 0) - gatherBlend) * (gatherOn ? GATHER_IN : GATHER_OUT)
  if (gatherBlend < 0.002) gatherBlend = 0
  gatherOn = false          // 呼叫端每一幀都要重新宣告「還捏著」

  if (gatherBlend > 0 && updateGatherTargets(shapes[k])) {
    // A = 這一格原本的形狀，B = 被手帶著跑的那批目標，blend 在兩者之間過渡
    engine.setTargets(shapes[k], gatherBuf)
    // 兩端都用這一格的配色 —— 被捏走的粒子不該順便變色。
    // ⚠️ 只在進入捏合時上傳一次：這是一次 count×2 的整份 buffer 寫入，而這段
    //    每幀都會走到（gatherBuf 逐幀在動），逐幀寫等於白付一份頻寬。
    if (!gatherTypesUp) {
      gatherTypesUp = true
      engine.setShapeTypes?.(shapeTypes[k], shapeTypes[k])
    }
    engine.setMorph?.(GATHER_PULL, GATHER_GRIP, gatherBlend)
    curSeg = -1             // 放開之後強制重上傳這一格的目標點
    return
  }
  gatherTypesUp = false
  if (gatherBlend === 0) gatherSeeded = false

  engine.setMorph?.(pullNow * b, gripNow * b, e)
}

function syncPause () {
  // 固定背景永遠在視窗內，所以不必 IntersectionObserver；要理的是分頁隱藏
  //（rAF 在背景分頁只是降頻，不是停止）與使用者閒置。
  engine?.pause(document.hidden || idle.value)
}
watch(idle, () => syncPause())

// --- 換人 ------------------------------------------------------------------
// 兩段式：blend 1→0 把粒子往外拋，再在 blend=0（shape 權重為 0，換掉無縫）把
// shape 換成下一個人，blend 0→1 重組。位置全在 GPU 算，JS 每幀只寫 16 bytes 的
// morph uniform + 128 bytes 的色盤，所以 5 萬顆也不會掉幀。
function explodeXY (base, W, H) {
  const n = base.length / 2
  let cx = 0; let cy = 0
  for (let i = 0; i < n; i++) { cx += base[i * 2]; cy += base[i * 2 + 1] }
  cx /= n; cy /= n
  const out = new Float32Array(base.length)
  for (let i = 0; i < n; i++) {
    const dx = base[i * 2] - cx; const dy = base[i * 2 + 1] - cy
    const d = Math.hypot(dx, dy) || 1
    const push = EXPLODE_PUSH * (0.45 + 0.9 * Math.random())
    // 夾在畫布內 —— 拋到牆外會被 wall repel 彈回來，看起來像撞到看不見的東西
    out[i * 2] = Math.max(8, Math.min(W - 8, base[i * 2] + (dx / d) * push))
    out[i * 2 + 1] = Math.max(8, Math.min(H - 8, base[i * 2 + 1] + (dy / d) * push))
  }
  return out
}

function tween (obj, vars, ms, ease, onUpdate) {
  const { $gsap } = useNuxtApp()
  return new Promise((done) => {
    swapTween = $gsap.to(obj, {
      ...vars,
      duration: reducedMotion ? 0 : ms / 1000,
      ease,
      onUpdate,
      onComplete: done,
    })
  })
}

async function swapSpeaker (portrait) {
  if (!engine || !portrait) return
  const spec = await getSpec(portrait, KEYS[SPEAKER_KEY].fit, KEYS[SPEAKER_KEY].lumaBias)
  if (!spec || !ready || !baseSnap) return

  const { W, H } = engine.size
  const { shape: nextShape, shapeType: nextTypes } = shapeFromSpec(
    spec, baseSnap, W, H, KEYS[SPEAKER_KEY].maxPx,
  )
  const nextPal = paletteToLinear(spec.palette)

  // 不在人像那一段就別播動畫 —— 直接換掉，捲回去自然就是新的人
  if (flow < SWAP_FLOW_MIN || flow > SWAP_FLOW_MAX) {
    shapes[SPEAKER_KEY] = nextShape
    shapeTypes[SPEAKER_KEY] = nextTypes
    palLin[SPEAKER_KEY] = nextPal
    curSeg = -1
    lastColorKey = ''
    return
  }

  swapping = true
  swapTween?.kill()
  try {
    const snap = await engine.readParticles()
    const cur = spreadFromSnap(snap, engine.config.count)
    const exploded = explodeXY(cur, W, H)
    const fromPal = palLin[SPEAKER_KEY]
    const fromTypes = shapeTypes[SPEAKER_KEY]
    const state = { e: 1 }

    // 第一段：往外炸開。shape 先維持在「現在的位置」，blend 1→0 把粒子拋去 exploded。
    // 兩端同色 —— 炸開的過程不變色，變色留給第二段跟著重組一起做。
    engine.setTargets(exploded, cur)
    engine.setShapeTypes?.(fromTypes, fromTypes)
    engine.setMorph?.(KEYS[SPEAKER_KEY].pull, KEYS[SPEAKER_KEY].grip, 1)
    await tween(state, { e: 0 }, EXPLODE_MS, 'power2.out', () => {
      engine?.setMorph?.(KEYS[SPEAKER_KEY].pull, KEYS[SPEAKER_KEY].grip, state.e)
    })

    // 第二段：blend 已在 0 → 無縫把 shape 換成下一個人，再拉回去重組。
    // .xy 留舊配色、.zw 換新配色，blend 0→1 讓顏色跟著位置一起收攏成新的人。
    engine.setTargets(exploded, nextShape)
    engine.setShapeTypes?.(fromTypes, nextTypes)
    await tween(state, { e: 1 }, REFORM_MS, 'power2.inOut', () => {
      engine?.setMorph?.(KEYS[SPEAKER_KEY].pull, KEYS[SPEAKER_KEY].grip, state.e)
      engine?.setColors?.(lerpPaletteLinear(fromPal, nextPal, state.e))
    })
  } finally {
    shapes[SPEAKER_KEY] = nextShape
    shapeTypes[SPEAKER_KEY] = nextTypes
    palLin[SPEAKER_KEY] = nextPal
    // 交還給捲動：強制重新上傳這一段的目標點與色盤
    curSeg = -1
    lastColorKey = ''
    shimmerCycle = -1
    swapping = false
  }
}

// --- 初始化 ----------------------------------------------------------------
// 面板的滑桿：即時調整「維持開場構圖」的力度。只改一個裸變數，下一幀 frame()
// 就會用到 —— 不重生成粒子，所以拉的當下就看得到構圖收緊或散開。
// 把引擎現在的實際值抄進面板的顯示狀態。
// ⚠️ 每個「會改到這些值的地方」都要叫它：建引擎後、換效果後、fps 減半後。
function syncKnobs () {
  if (!engine) return
  knobs.count = engine.config.count
  knobs.samples = samplesNow
  knobs.rMax = engine.config.rMax
  knobs.pointSize = lockPointSize
  knobs.dprCap = engine.config.maxDpr
  knobs.shimmerMs = shimmerMsNow
  knobs.shimmerAmp = shimmerAmpNow
}

// 依 canvas 面積把四個檔位換算成絕對值（主要是 density → count）。
// resize 之後要重算，不然面板顯示的預設點數會停在舊視窗的大小。
function rebuildTierPresets () {
  const el = canvasRef.value
  if (!el) return
  tierPresets.value = Array.from({ length: TIER_COUNT }, (_, t) => {
    const k = tierKnobs('desktopField', t)

    // ⚠️ 形狀是 { tier, values } —— 面板拿 tier 當按鈕標籤、拿 values 灌草稿。
    // 三個呼叫端（這裡 / MobileField / SpeakerPortrait）必須一致。
    return {
      tier: t,
      values: {
        count: countFor(el, { density: k.density, max: k.countMax, min: k.countMin }),
        samples: k.samples,
        // rMax 0 = 「照 look 自己的」（見 particleTiers.js 的 desktopField 註解）
        rMax: k.rMax || look.physics.rMax,
        pointSize: k.pointSize,
        dprCap: k.dprCap,
        shimmerMs: k.shimmerMs,
        shimmerAmp: k.shimmerAmp,
      },
    }
  })
}

// 面板：一次套用一整組旋鈕。
//
// ⚠️ 刻意做成「按了保存才一次套用」而不是逐項即時：這組裡有兩項非常貴 ——
//   count    setCount 會 respawn 整場粒子、重配 targets buffer
//   samples  要把四張圖全部重新取樣（約 190ms / 張，主執行緒同步）
// 逐項即時等於每動一個數字就付一次那個代價，面板會卡到不能用。
//
// ⚠️ 也刻意不寫網址：邊調邊改 query 會讓人以為畫面在重載。要留下來的值請自己
// 抄回原始碼（各項的出處都在面板的說明區裡）。
async function applyKnobs (next) {
  if (!engine || !next) return

  // --- 純變數，下一幀 frame() 自己會讀到 ---------------------------------
  if (Number.isFinite(next.pointSize)) {
    lockPointSize = Math.max(0.1, Math.min(8, next.pointSize))
    knobs.pointSize = lockPointSize
    appliedPointSize = -1          // 強制下一幀重寫，不要被 0.005 的門檻擋掉
  }
  if (Number.isFinite(next.shimmerAmp)) {
    shimmerAmpNow = Math.max(0, Math.min(40, next.shimmerAmp))
    knobs.shimmerAmp = shimmerAmpNow
  }
  if (Number.isFinite(next.shimmerMs)) {
    shimmerMsNow = Math.max(120, Math.min(8000, next.shimmerMs))
    knobs.shimmerMs = shimmerMsNow
  }

  // --- 引擎的即時 setter（都不會重生粒子）--------------------------------
  if (Number.isFinite(next.rMax) && next.rMax !== knobs.rMax) {
    // ⚠️ setRMax 會重配 bin buffer 並重建 bind group（格子邊長是 rMax 算的），
    // 比其他 setter 貴得多，但不會動到粒子與 targets，所以不用重建目標點。
    engine.setRMax?.(next.rMax)
    knobs.rMax = engine.config.rMax
  }
  if (Number.isFinite(next.dprCap) && next.dprCap !== knobs.dprCap) {
    engine.setMaxDpr?.(next.dprCap)
    knobs.dprCap = engine.config.maxDpr
  }

  // --- 會重生 / 重取樣的兩項 ---------------------------------------------
  let needRebuild = false

  if (Number.isFinite(next.count) && Math.round(next.count) !== knobs.count) {
    // 下限比 COUNT_MIN 低，讓人可以刻意拉到「很稀」看極端；上限 120000 是安全帶
    //（力場成本 ∝ N²，再往上很容易把分頁鎖死）。
    engine.setCount?.(Math.max(2000, Math.min(120000, Math.round(next.count))))
    knobs.count = engine.config.count
    needRebuild = true
  }

  if (Number.isFinite(next.samples) && Math.round(next.samples) !== knobs.samples) {
    // ⚠️ 每張圖的取樣點數必須一致（點數不同會有一撮粒子配不到對），所以改了就得
    // 把快取整個丟掉重取樣 —— 跟 switchLook 換 species 時同一套流程。
    samplesNow = Math.max(2000, Math.min(80000, Math.round(next.samples)))
    knobs.samples = samplesNow
    specs.clear()
    switching.value = true
    const jobs = KEYS.filter(key => key.src).map(specOf)
    jobs.push(specOf({ ...KEYS[SPEAKER_KEY], src: speakerPortrait(speakerIndex.value) }))
    try {
      await Promise.all(jobs)
    } catch (err) {
      console.warn('[HomeField] 改取樣點數後重新取樣失敗，該影格維持自由場', err)
    }
    switching.value = false
    needRebuild = true
  }

  // 目標點是拿舊的粒子數 / 舊的取樣點算的，兩者一動就全部失效
  if (needRebuild) invalidateTargets()
}

function setHold (pct) {
  holdPct.value = Math.max(0, Math.min(200, Math.round(pct)))
  holdScale = holdPct.value / 100
}

// 換一組效果，不重建 canvas。
// ⚠️ 比原版 ParticleField 的同名函式重：這一版整條時間軸共用同一組粒子，而
// species 是 look 決定的，所有圖片點雲的 colors 都必須跟著改 —— 所以要清掉
// spec 快取、把 side / venue / faq / 講者四張圖全部重新取樣。約 190ms / 張。
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
  applyLookToKeys()

  // ⚠️ 換效果一律回到自動點數 —— 手動值是「這一組效果下我想看多稀」，
  // 換組之後那個數字沒有意義了，留著只會讓人以為是新效果的預設。
  const count = countFor(canvasRef.value, PAGE_BUDGET)
  toolMeta.autoCount = count
  applyFieldLook(engine, look, { count, allowGlow: !isMobile() })
  // applyFieldLook 剛把 pointSize / rMax 整組寫回新 look 的值，面板要跟著同步；
  // 檔位預設裡的 rMax 也吃 look，一起重算。
  syncKnobs()
  rebuildTierPresets()
  appliedForce = look.physics.forceFactor
  // ⚠️ applyFieldLook 剛把 pointSize 與光暈整組寫回新 look 的值。如果現在正停在
  // 人像 / venue 那幾格，下一幀必須把它們改回鎖定值 —— 所以把哨兵清掉強制重套。
  appliedPointSize = -1
  glowOn = null

  specs.clear()
  const jobs = KEYS.filter(key => key.src).map(specOf)
  jobs.push(specOf({ ...KEYS[SPEAKER_KEY], src: speakerPortrait(speakerIndex.value) }))
  try {
    await Promise.all(jobs)
  } catch (err) {
    console.warn('[HomeField] 換效果後重新取樣失敗，該影格維持自由場', err)
  }

  if (stopAmbient) { stopAmbient(); stopAmbient = null; ambientOn = false }
  if (!reducedMotion) {
    stopAmbient = window.PLAmbient.start(() => engine, { intensity: look.ambient })
    ambientOn = true
  }

  invalidateTargets()
  introStart = performance.now()   // 重生成的粒子要再跑一次開場包絡才散得開
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
  applyLookToKeys()
  appliedForce = look.physics.forceFactor

  const hero = window.PLPalettes.PALETTES[look.palette]
  const count = countFor(canvas, PAGE_BUDGET)
  toolMeta.autoCount = count

  engine = await window.makeEngine(canvas, {
    // ⚠️ 力矩陣不再寫死在這裡 —— 5 組效果各自帶一組，而且全都是「非對稱、沒有
    // 靜止解」的（對稱矩陣會收斂成不動的菌落球，畫面就死了，見 docs §4）。
    // 挑選準則與踩坑紀錄在 app/utils/particleFieldLooks.js 檔頭。
    species: look.rules.species,
    count,
    preset: look.rules.preset,
    seedPattern: look.rules.seedPattern,
    palette: hero.particles,
    bgFade: hero.bgFade,
    forceFactor: look.physics.forceFactor,
    friction: look.physics.friction,
    repel: look.physics.repel,
    minR: look.physics.minR,
    rMax: look.physics.rMax,
    simSpeed: startSimSpeed(),
    cameraZoom: KEYS[0].zoom,
    pointSize: look.visual.pointSize,
    particleOpacity: KEYS[0].opacity,
    // 手機一律關光暈（額外一趟全螢幕加法 pass，成本跟 DPR 平方成正比）；
    // 高密度時光暈也會糊成一片，只留銳利點。
    showGlow: look.visual.showGlow && !isMobile(),
    glowSize: look.glow.glowSize,
    glowIntensity: look.glow.glowIntensity,
    glowSteepness: look.glow.glowSteepness,
    cellSubdivisions: 2,
    maxDpr: maxDpr(),               // 全螢幕 HDR target，DPR 2 是 4 倍像素、視覺收益極小
  })
  backend.value = engine.backend
  toolMeta.backend = engine.backend
  syncKnobs()
  rebuildTierPresets()
  unregisterTool = registerTool({
    id: 'field',
    label: '滿版場',
    fields: TOOL_FIELDS,
    knobs,
    get presets () { return tierPresets.value },
    meta: toolMeta,
    apply: applyKnobs,
  })
  if (import.meta.dev) {
    window.__sameField = engine
    window.__sameLook = switchLook   // __sameLook('coral-membrane') 或 __sameLook(5)
    window.__sameHold = setHold      // __sameHold(0) = 放手、(100) = 照設定
  }

  if (!reducedMotion) {
    stopAmbient = window.PLAmbient.start(() => engine, { intensity: look.ambient })
    ambientOn = true
  }

  // 取樣所有影格的圖（含目前這位講者）。約 190ms / 張，在開場散開的那幾秒內做完。
  const jobs = KEYS.filter(key => key.src).map(specOf)
  jobs.push(specOf({ ...KEYS[SPEAKER_KEY], src: speakerPortrait(speakerIndex.value) }))
  try {
    await Promise.all(jobs)
  } catch (err) {
    console.warn('[HomeField] 圖片點雲取樣失敗，該影格維持自由場', err)
  }
  // 講者影格的圖是資料給的，不在 KEYS 表裡寫死
  KEYS[SPEAKER_KEY].src = speakerPortrait(speakerIndex.value)

  onVisibility = () => syncPause()
  document.addEventListener('visibilitychange', onVisibility)
  onResize = () => {
    invalidateTargets()
    // 檔位預設的 count 是拿 canvas 面積換算的，視窗一變就過期了
    rebuildTierPresets()
    toolMeta.autoCount = countFor(canvasRef.value, PAGE_BUDGET)
  }
  window.addEventListener('resize', onResize)

  // canvas 自己是 pointer-events-none（整頁的點擊都要能穿過去），所以聽 window。
  pointerOn = !reducedMotion && window.matchMedia?.('(pointer: fine)').matches
  if (pointerOn) {
    onPointerMove = (e) => {
      // 第一次進來先對齊，不然 prev 還停在 (0,0)，會算出一整個螢幕的位移
      if (!pointerSeen) {
        pointerPrevX = e.clientX
        pointerPrevY = e.clientY
        pointerSeen = true
      }
      pointerX = e.clientX
      pointerY = e.clientY
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
  }

  introStart = performance.now()
  lastScrollY = window.scrollY
  syncPause()

  if (import.meta.dev) {
    window.__sameDbg = () => ({
      // 滑鼠推擠：最近幾次真的送進引擎的脈衝（座標是模擬空間）
      pointerPushCount,
      calm: calmNow,
      engineSimSpeed: +(engine?.config?.simSpeed ?? 0).toFixed(3),
      gatherBlend: +gatherBlend.toFixed(3),
      lastPushes: pointerPushes.slice(-3),
      flow: +flow.toFixed(3),
      seg: curSeg,
      simSpeed: +simSpeed.toFixed(3),
      pull: +pullNow.toFixed(2),
      grip: +gripNow.toFixed(2),
      force: +engine.config.forceFactor.toFixed(2),
      ready,
      // 從開場到「目標點建好」花了多久。捲動對不上時先看這個 ——
      // 在它之前捲動是不會有任何收攏的（frame() 會直接 return）。
      readyMs: readyAt ? Math.round(readyAt - introStart) : null,
      swapping,
      paused: engine.config.paused,
    })
    // 每段 ScrollTrigger 的實際範圍與進度。捲動沒對上時先看這個 ——
    // start / end 會不會在「捲一輪回來」之後才變成正確值，就是版面還沒穩就 refresh 的徵兆。
    window.__sameTriggers = () => triggers.map((t, i) => ({
      seg: SEGMENTS[i].trigger,
      start: Math.round(t.start),
      end: Math.round(t.end),
      progress: +t.progress.toFixed(3),
    }))
  }
  frame()

  // 量 fps → 需要就減半 → 馬上建目標點。見 FPS_SAMPLE_MS 的長註解：
  // 在目標點建好之前，捲動不會讓粒子收攏，所以這段越短越好。
  setTimeout(async () => {
    const fps = engine?.getFps ? engine.getFps() : 60
    if (fps > 0 && fps < 45) {
      const halved = Math.round(count / 2)
      engine.setCount?.(halved)
      // ⚠️ 面板要顯示「引擎現在真的跑幾顆」，不是我們原本想給幾顆 —— 這段減半
      // 一觸發，knobs.count 就跟引擎對不上了。autoCount 維持幾何算出來的值，
      // 這樣面板上的對照數字仍然是「依面積算的點數」。
      knobs.count = halved
      // setCount 會整場重生成粒子，等它們離開生成點再配對
      await new Promise(r => setTimeout(r, REBUILD_SETTLE_MS))
    }
    await buildAllShapes()
  }, FPS_SAMPLE_MS)

  // --- 捲動 -----------------------------------------------------------------
  const { $ScrollTrigger } = useNuxtApp()
  if ($ScrollTrigger) {
    SEGMENTS.forEach((seg, i) => {
      if (!document.querySelector(seg.trigger)) return
      triggers.push($ScrollTrigger.create({
        trigger: seg.trigger,
        start: seg.start,
        end: seg.end,
        scrub: true,
        onUpdate: (self) => { segProgress[i] = self.progress; flow = segProgress.reduce((a, b) => a + b, 0) },
        onRefresh: (self) => { segProgress[i] = self.progress; flow = segProgress.reduce((a, b) => a + b, 0) },
      }))
    })
    $ScrollTrigger.refresh()
  }

  swapImpl.value = swapSpeaker
}

// 名單那邊改人 → 換圖。⚠️ 只在 swapImpl 沒被呼叫到的情況下當備援（例如程式碼
// 直接改 speakerIndex），正常路徑是 selectSpeaker() 直接 await swapSpeaker。
watch(speakerIndex, (i) => {
  KEYS[SPEAKER_KEY].src = speakerPortrait(i)
})

onMounted(() => { init() })

onBeforeUnmount(() => {
  unregisterTool?.()
  if (raf) cancelAnimationFrame(raf)
  swapTween?.kill()
  triggers.forEach(t => t.kill())
  triggers = []
  stopAmbient?.()
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  clearTimeout(resizeTimer)
  if (onResize) window.removeEventListener('resize', onResize)
  if (onPointerMove) window.removeEventListener('pointermove', onPointerMove)
  if (engine) { engine.destroy(); engine = null }
  // ⚠️ 帶著自己的實作去核對 —— 跨斷點切換時窄視窗那張（HomeSpeakerPortrait）
  // 可能已經先登記好了，無條件清會把它踢掉。見 useSpeakerFieldBus 的說明。
  resetSpeakerBus(swapSpeaker)
})

// 給互動模式（HomeHandField）用的施力入口。
// 傳進來的是「螢幕座標」，相機變換由這裡統一處理 —— 呼叫端不需要知道 zoom / offset。
// strength 正值往外推、負值往內吸（shader 是 v += dir * falloff * strength）。
function pushAt (screenX, screenY, radius, strength) {
  if (!engine || document.hidden || idle.value) return
  const { x, y } = toSim(screenX, screenY)
  engine.disturb?.(x, y, radius, strength)
}

// 互動模式的「吸過去」。amount 0 = 放開（粒子回到這一格原本的形狀）。
// ⚠️ 這支只記錄「手在哪、還捏著沒」——實際的目標點在 frame() 裡算，
// 因為那裡才知道這一格原本的形狀（shapes[k]），才有辦法讓範圍外的粒子留在原位。
function gatherAt (screenX, screenY, radius, amount) {
  if (!engine || !ready) return
  if (!amount) { gatherOn = false; return }
  const { x, y } = toSim(screenX, screenY)
  gatherX = x
  gatherY = y
  gatherR = radius
  gatherOn = true
}

// 每幀更新目標點。home 是這一格原本的形狀（Float32Array，x,y 交錯）。
function updateGatherTargets (home) {
  const count = engine.config.count
  if (!home || home.length < count * 2) return false

  if (!gatherBuf || gatherBuf.length !== count * 2) {
    gatherBuf = new Float32Array(count * 2)
    gatherDisk = new Float32Array(count * 2)
    gatherLag = new Float32Array(count)
    gatherSeeded = false
    // 圓盤內的均勻分佈與跟隨係數都只擲一次亂數。
    // ⚠️ 每幀重擲的話粒子會在團裡瘋狂抖動。sqrt 是為了面積均勻，不然點會擠在圓心。
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.sqrt(Math.random())
      gatherDisk[i * 2] = Math.cos(a) * r
      gatherDisk[i * 2 + 1] = Math.sin(a) * r
      gatherLag[i] = GATHER_LAG_MIN + Math.random() * (GATHER_LAG_MAX - GATHER_LAG_MIN)
    }
  }

  // 第一次要從「原本的位置」開始追，不然目標會從 (0,0) 一路飛過來
  if (!gatherSeeded) {
    gatherBuf.set(home.subarray(0, count * 2))
    gatherSeeded = true
  }

  const reach2 = GATHER_REACH * GATHER_REACH
  for (let i = 0; i < count; i++) {
    const ix = i * 2
    const hx = home[ix]
    const hy = home[ix + 1]
    const dx = hx - gatherX
    const dy = hy - gatherY

    let tx, ty
    if (dx * dx + dy * dy > reach2) {
      // 範圍外：目標就是原本的位置，等於不參與這次聚集
      tx = hx
      ty = hy
    } else {
      tx = gatherX + gatherDisk[ix] * gatherR
      ty = gatherY + gatherDisk[ix + 1] * gatherR
    }

    // 各自的跟隨速度 → 手一移動就拉出參差的尾巴
    const lag = gatherLag[i]
    gatherBuf[ix] += (tx - gatherBuf[ix]) * lag
    gatherBuf[ix + 1] += (ty - gatherBuf[ix + 1]) * lag
  }
  return true
}

defineExpose({ backend, pushAt, gatherAt })
</script>

<template>
  <canvas
    ref="canvasRef"
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-0 block h-full w-full"
  />

  <!-- ?tool=1 的工具面板。與原版 ParticleField 共用同一個元件。 -->
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
