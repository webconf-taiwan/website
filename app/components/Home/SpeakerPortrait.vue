<script setup>
// PL. III 的人像點雲 —— 手機／平板（< 1024px）專用的獨立小 canvas。
//
// ─── 為什麼跟桌機不一樣 ────────────────────────────────────────────────────
// 桌機是「整頁一張 canvas」：人像是同一群粒子沿捲動從 side.png 變過來、再變去菌落場
//（Home/Field.vue 的 speaker 影格）。那條時間軸要求 canvas 全程都在算，而且點數
// 得取全頁最吃密度的那一格當基準（50000 顆）。
//
// 窄視窗上那些都不需要：這一區的前後（PL.II / PL.IV）在手機版底色是不透明的，
// 根本看不到變形過程。所以這裡改成使用者實際會感知到的那一件事 ——
// 「點另一位講者，人像會炸開再重組成他」，其餘時間就是很輕的閃動待命。
//
// ─── canvas 為什麼放在觀景框「裡面」───────────────────────────────────────
// Home/SpeakerField 那張是鋪滿整個 section 的，理由是 WebGPU 的 compose pass 是
// clearValue{a:1} 的不透明黑，做成小方塊會有一塊硬邊壓在背景粒子上。
// 這裡沒有那個問題 —— 窄視窗的 PL.II～PL.V 是包在一層不透明「純黑」底上的
//（見 pages/index.vue），canvas 這個黑方塊跟它完全同色，邊界看不出來。
// ⚠️ 那層底色一定要是純黑。改成 #0a0a0c 之類的近黑，這個方塊就會現形
//（實測 canvas (0,0,0) vs 底 (10,10,12)）。
// 好處很大：canvas 只有觀景框那麼大（手機約 342²、平板被 max-w 夾在 420² 以內），
// 填充率與點數都跟著縮，而人像剛好落在設計稿要的那個框裡。
//
// ─── 物理參數抄的是「桌機這一版」，不是舊的三張 canvas 版 ────────────────
// ⚠️ 這一段是這支檔案最容易抄錯的地方。站上有兩套人像的物理參數：
//
//   Home/SpeakerField.vue（舊的三張 canvas 版）
//     force 1.0 ／ grip 70 ／ simSpeed 0.22 ／ opacity 0.9±0.1 的呼吸
//     閃動靠 blend 在 spread(抖動版) ↔ shape 之間來回擺盪
//     → 粒子晃得比較大，看起來比較「像一團會動的沙」
//
//   Home/Field.vue 的 speaker 影格（桌機現在跑的這一版）★ 這裡抄它
//     force 0.1（引擎下限）／ grip 82 ／ simSpeed 0.45 ／ opacity 0.72 固定
//     閃動直接烘進目標點（每 1 秒換一組小偏移），blend 不參與
//     → 幅度小很多、更接近真實照片
//
// 兩者的關鍵差異是 force：互動力場「在密處會累加」（一顆粒子受到的是 rMax 內所有
// 鄰居的總和），而人像本來就是亮處密、暗處疏 —— 力場一開，密處就贏過 seek，把該
// 攤在五官上的粒子抽成一坨坨菌落。把它壓到引擎下限（0.1）之後畫面才交給 seek 主導，
// 五官才守得住。那也是為什麼這裡敢把 simSpeed 拉到 0.45：加速的只有 seek 的收斂，
// 不是整個力場。兩者是配套的，別只改其中一個。
// 完整的實測數據（佔格率 5.4% → 11.8%）在 Home/Field.vue 的 LOCK_FORCE 註解。
//
// 位置全部在 GPU 上算，JS 每幀只寫 16 bytes 的 morph uniform（路線 C · shader
// seek 力，見 docs/point-cloud-effect.md §8）。
//
// ─── 兩種顯示模式：particle（粒子引擎）／ static（靜態圖）─────────────────────
// 只有「這台手機夠好」才跑上面那套粒子；手機（< 768px）上其餘一律換成事先渲染好的靜態點畫圖
// （speakers.json 的 portrait_static，/speakers/speaker-particle-NN.webp）：
//   · 沒有 WebGPU（cpuFallback）
//   · pre-flight 就有負面訊號（省流量、prefers-reduced-motion、記憶體小）
//   · 執行期量測發現整頁不順（檔位被降下來）—— 這時會從粒子換成靜態圖，見 toStatic
// 「夠好」的判斷就是檔位還在滿檔（TIER_DEFAULT）。靜態模式完全不載粒子套件、不取樣、
// 不建引擎，成本是一張圖。⚠️ 只限手機：平板與窄桌機視窗一律維持粒子。
// （唯一的例外是 makeEngine 靜默退到沒有 morph 的 CPU 引擎 —— 那時粒子根本不會動，
// 不管什麼裝置都改用靜態圖，見 init。）
// ⚠️ 這推翻了 particleTiers.js 早先「最低檔也要留著粒子、不換靜態圖」的設計 ——
// 那是在沒有這批靜態圖的時候寫的。MobileField（滿版自由場）仍然維持粒子不換圖。
//
// 靜態模式的換人動畫要跟框線同一拍（見 Speaker.vue 的 LEADER_OUT_MS / FRAME_DOT_MS /
// FRAME_GROW_MS）：框線淡出時圖從中心稍微縮小並淡出 → 換圖 → 框線放射長大時圖由中心
// 放大回來並淡入。

const props = defineProps({
  // 首頁資料的 speaker.items，只用來拿 portrait 路徑
  speakers: {
    type: Array,
    default: () => []
  }
})

const { loadParticleKit, registerNebula } = useParticleKit()
const { countFor, maxDpr, isMobile } = useParticleBudget()
const { paletteToLinear, lerpPaletteLinear, buildImageTargets, buildSlotTargets } = useParticleMorph()
const { idle } = useParticleStage()
const { speakerIndex, swapImpl, resetSpeakerBus } = useSpeakerFieldBus()
// 裝置效能檔位。
// ⚠️ 這支「不」在執行期換檔，而是 await 到檔位定案才建引擎 —— 換檔要走 setCount，
// 而 setCount 會 respawn 整場粒子並推進 targetsGeneration，在人像上那是「整張臉
// 重新點畫」，非常顯眼。而且這支的閃動迴圈（liveLoop）不像 MobileField 的 frame()
// 有查 targetsStale()，只有 resize handler 查 —— 真要中途換檔還得補一段手動重建。
// 靠等就好：這支掛載時使用者還在 hero，canvas 在畫面外、引擎是 paused 的。
const {
  tier, whenTierReady, knobs, cpuFallback, showFps, onTierChange,
  markActive, suspend, suspendReadback, noteRespawn,
} = useParticleQuality()

const canvasRef = ref(null)
const rootRef = ref(null)
const imgRef = ref(null)

// --- 顯示模式 ---------------------------------------------------------------
// ⚠️ 這一段在 setup 同步決定：檔位的 pre-flight 是同步就緒的（見 useParticleQuality.start），
// 而且這個元件包在 <ClientOnly> 裡、不會在 SSR 跑。沒有靜態圖資料時（不該發生）留在粒子模式。
const hasStaticImages = props.speakers.some(sp => sp.portrait_static)
// ⚠️ 只有「手機」（視窗 < 768px，isMobile）才會換成靜態圖。平板與窄桌機視窗維持粒子，
// 就算檔位被降下來也一樣（那邊只是變稀，見 MobileField / particleTiers）。
const wantsStatic = () => isMobile() && (cpuFallback.value || tier.value < TIER_DEFAULT)
const mode = ref(hasStaticImages && wantsStatic() ? 'static' : 'particle')
// canvas 與 <img> 換手時要重疊一小段，所以 canvas 不是跟著 mode 立刻拿掉
const showCanvas = ref(mode.value === 'particle')
const staticSrc = ref('')
let disposed = false
let pendingStatic = false           // 換人動畫中被降檔 → 等收完再換成靜態圖
let unsubTier = null
let nearIo = null
let staticTween = null

// 換人動畫的時序。⚠️ 要跟 Speaker.vue 的框線同一拍（LEADER_OUT_MS / FRAME_DOT_MS /
// FRAME_GROW_MS），改那邊時記得回來對。兩邊是各自跑的時間軸、不互相等待。
const STATIC_APPEAR_MS = 400        // 第一次出現（與換人無關）
const SWAP_OUT_MS = 260
const SWAP_DOT_MS = 130
const SWAP_GROW_MS = 520
// 「稍微」縮小：0.92 = 300px 的圖縮到 276px。框線是縮到 0.3，但圖跟著縮那麼多會像
// 整張臉被吸進一個點；設計要的是輕輕一個呼吸的感覺。
const SWAP_SCALE_MIN = 0.92

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const pngOf = url => url.replace(/\.webp(?=$|[?#])/i, '.png')
const staticSrcOf = portrait => props.speakers.find(sp => sp.portrait === portrait)?.portrait_static || ''

// 載入並解碼，回傳「實際載得到的網址」。⚠️ 不支援 WebP 的裝置會落到同名的 .png
// （約定：每個 .webp 旁邊都有同名 .png，見 particle-image.js 的 loadImage）。
// 兩種都失敗回空字串。同一個網址只載一次，預載與換人共用同一份結果。
const imageCache = new Map()
function resolveImage (url) {
  if (!url) return Promise.resolve('')
  if (imageCache.has(url)) return imageCache.get(url)
  const tryLoad = (src) => {
    const im = new Image()
    im.src = src
    const done = im.decode
      ? im.decode()
      : new Promise((resolve, reject) => { im.onload = resolve; im.onerror = reject })

    return done.then(() => src)
  }
  const p = tryLoad(url)
    .catch(() => (pngOf(url) !== url ? tryLoad(pngOf(url)) : ''))
    .catch(() => '')
  imageCache.set(url, p)

  return p
}

// 前後兩位先載好（輪播是左右滑，下一張幾乎一定是鄰居）。省流量模式不預載。
function prefetchNeighbors () {
  if (navigator.connection?.saveData) return
  const n = props.speakers.length
  if (n < 2) return
  const i = speakerIndex.value
  const run = () => [1, -1].forEach(d => resolveImage(props.speakers[(i + d + n) % n]?.portrait_static))
  if (window.requestIdleCallback) window.requestIdleCallback(run)
  else setTimeout(run, 800)
}

function tweenImg (vars) {
  const { $gsap } = useNuxtApp()

  return new Promise((done) => {
    staticTween = $gsap.to(imgRef.value, { ...vars, onComplete: done })
  })
}

// 靜態圖第一次（或從粒子換過來時）浮現：只淡入，不縮放。
function appearStatic () {
  const el = imgRef.value
  if (!el) return
  staticTween?.kill()
  const { $gsap } = useNuxtApp()
  if (!$gsap || reducedMotion) { el.style.opacity = '1'; return }
  staticTween = $gsap.to(el, { opacity: 1, duration: STATIC_APPEAR_MS / 1000, ease: 'power2.out' })
}

// 把網址掛上 <img> 並等它解碼完 —— 淡入的第一幀不能是空白。
async function mountStaticSrc (src) {
  staticSrc.value = src
  await nextTick()
  await imgRef.value?.decode?.().catch(() => {})
}

async function initStatic () {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  swapImpl.value = swapPortrait
  shownPortrait = props.speakers[speakerIndex.value]?.portrait || null

  // 框快進畫面才開始載 —— 靜態圖每張約 0.5MB，不要在首屏跟 hero 搶頻寬。
  await new Promise((resolve) => {
    if (!rootRef.value || !('IntersectionObserver' in window)) return resolve()
    nearIo = new IntersectionObserver((entries) => {
      if (entries.some(en => en.isIntersecting)) { nearIo.disconnect(); resolve() }
    }, { rootMargin: '100% 0px' })
    nearIo.observe(rootRef.value)
  })
  if (disposed) return

  const src = await resolveImage(staticSrcOf(shownPortrait))
  if (disposed || !src) return
  await mountStaticSrc(src)
  appearStatic()
  prefetchNeighbors()
}

// 靜態模式的換人：跟框線同一拍。
async function swapStatic (portrait) {
  const url = staticSrcOf(portrait)
  const el = imgRef.value
  if (!url || !el) return
  staticTween?.kill()
  const loading = resolveImage(url)          // 與淡出並行，載入時間藏在動畫裡

  if (reducedMotion) {
    const src = await loading
    if (src) { await mountStaticSrc(src); el.style.opacity = '1' }
    shownPortrait = portrait

    return
  }

  // 1) 淡出，同時由中心稍微縮小 —— 與框線 / 文字的淡出同一拍
  await tweenImg({ opacity: 0, scale: SWAP_SCALE_MIN, duration: SWAP_OUT_MS / 1000, ease: 'power2.in' })
  // 2) 換圖。圖沒載好就多等一下（框線這時是小方點那一拍）
  const [src] = await Promise.all([loading, sleep(SWAP_DOT_MS)])
  if (disposed) return
  if (src) await mountStaticSrc(src)
  // 3) 由中心放大回來並淡入 —— 與框線的放射長大同一拍
  await tweenImg({ opacity: 1, scale: 1, duration: SWAP_GROW_MS / 1000, ease: 'power2.out' })
  shownPortrait = portrait
  prefetchNeighbors()
}

// 執行期降檔：粒子 → 靜態圖。
// ⚠️ 換人動畫進行中不能拆引擎（tween 會打到 null），等 swapPortrait 收尾再換。
// ⚠️ 先讓圖蓋上去、粒子淡出，之後才拆引擎 —— 先拆的話中間會有一格黑。
async function toStatic () {
  if (mode.value === 'static' || !hasStaticImages) return
  if (switching) { pendingStatic = true; return }
  pendingStatic = false
  swapImpl.value = swapPortrait
  mode.value = 'static'                      // <img> 進 DOM（class 是 opacity-0，看不到）
  await nextTick()

  const src = await resolveImage(staticSrcOf(shownPortrait))
  if (disposed) return
  // 兩種格式都載不到 → 維持粒子，不能拆了之後留一片空白
  if (!src) { mode.value = 'particle'; return }
  await mountStaticSrc(src)
  appearStatic()
  const { $gsap } = useNuxtApp()
  if ($gsap && canvasRef.value && !reducedMotion) {
    $gsap.to(canvasRef.value, { opacity: 0, duration: STATIC_APPEAR_MS / 1000, ease: 'power2.out' })
  }
  await sleep(reducedMotion ? 0 : STATIC_APPEAR_MS)
  if (disposed) return
  teardownParticles()
  showCanvas.value = false
  prefetchNeighbors()
}

// --- ?tool=1 工具面板 -------------------------------------------------------
// ⚠️ 這一支只「登記」，不掛面板 —— 面板是 HomeMobileField 掛的（那支在窄視窗
// 一定存在，這支則是捲到 PL.III 才進場）。登記處見 useParticleTool。
const toolKnobs = reactive({
  count: 0, samples: 0, rMax: 0, pointSize: 0, dprCap: 0, shimmerAmp: 0, shimmerMs: 0,
})
const toolPresets = ref([])
const toolMeta = reactive({ autoCount: 0, backend: '', note: '' })
const { register: registerTool } = useParticleTool()
let unregisterTool = null
const TOOL_FIELDS = ['count', 'samples', 'rMax', 'pointSize', 'dprCap', 'shimmerAmp', 'shimmerMs']

// --- 可調參數 --------------------------------------------------------------
// ⚠️ 取樣點數、密度、rMax、pointSize、閃動幅度與週期都由檔位表提供（見
// app/utils/particleTiers.js 的 speakerPortrait），滿檔 t3 的值就是今天線上的樣子。
// 那張表的檔頭記著這幾個數字為什麼是這樣（特別是「效能不從 density 買、從 rMax 買」
// 那一段），改之前先讀。
//
// ⚠️ 「每張圖都要同一個取樣點數」這條規則仍然成立 —— 因為檔位在第一次
// PLImage.prepare() 之前就定案且此後不變，specs Map 裡所有 spec 必然同數。
let q = null

const SPECIES = 7           // 色盤長度，必須與 species 一致（morph 中不能改 species）
// 點雲佔 canvas 短邊的比例。
// ⚠️ canvas 是「整塊正方形觀景區」，不是框線那一格 —— 框線只佔它的 62%（見
// HomeSpeaker 的窄視窗版面）。設計稿的人像比框大、頭肩會溢出框線，跟桌機的
// 構圖一致，所以這個值要明顯大於 0.62：0.86 / 0.62 ≈ 1.4 倍框寬。
// ⚠️ 但也不能貼到 1.0：換人時粒子要往外炸開，沒有邊界留白的話整圈會壓在牆上
// （引擎的 wall repel 會把它們彈回來，看起來像撞到看不見的東西）。
// 0.86 在 342px 的觀景區上留約 24px 邊界，剛好夠下面那個 EXPLODE_PUSH 用。
const FIT = 0.86

// 鎖形的兩顆旋鈕：PULL = 每單位距離想要的靠攏速度；GRIP = 速度被導引的強度。
// 與 Home/Field.vue 的 speaker 影格同值。
const LOCK_PULL = 11
const LOCK_GRIP = 82

// 互動力場一律壓到引擎下限，全程不變（見檔頭）。
// ⚠️ 0.1 不是隨便挑的，是 setForce 的下限（clamp 在 [0.1, 2.0]）。寫 0 只會被夾回來。
const LOCK_FORCE = 0.1
// ⚠️ 要跟 LOCK_FORCE 一起看：敢把模擬速度拉到 0.45，是因為力場已經被壓掉，
// 加速的只有 seek 的收斂速率（pull × simSpeed = 4.95/s，0.2 秒就走完一個閃動週期，
// 顆粒真的「一顆一顆換位置」而不是慢慢飄）。
const SIM_SPEED = 0.45

// 閃動：讓「目標點自己會動」—— seek 是收斂到固定點的臨界阻尼彈簧，任何擾動都會被
// v = mix(v, desiredV, grip·dt) 吃掉，所以調 force / grip / ambient 都做不出自發
// 運動（Home/SpeakerField 有完整實測紀錄）。每隔一段時間換一組新的隨機偏移，
// 粒子就會平滑地滑向新位置。
// ⚠️ AMP 的單位是模擬 px，而模擬空間就是 canvas 的 CSS 尺寸。桌機那張人像是 612px
// （PORTRAIT_MAX_PX）配 AMP 3；這裡的人像只有約 294px（0.86 × 342），五官尺度是
// 它的 0.48 倍，所以 AMP 要跟著縮。照抄 3 的話眼睛、眼鏡框（模擬空間只剩 10~19px
// 寬）會被抹掉。
// ⚠️ 週期是照設計師 demo 影片量出來的（相鄰幀差異 0.5 秒就飽和 = 整片顆粒約 0.5 秒
// 換過一輪），別憑感覺調 —— 運動速率正比於 AMP / PERIOD。
// 值在檔位表裡（q.shimmerAmp / q.shimmerMs），t3 就是上面說的 1.5 / 1000ms。

// ⚠️ 不要調回 0.9 以上。渲染是 HDR 加法混色，臉的膚色是整張圖裡面積最大、密度最高
// 的一塊 —— 高透明度會讓它整片過曝糊成一坨橘色，眼窩、眼鏡、鼻樑這些暗部細節全被
// 蓋掉（桌機實測 0.95 完全看不到眼鏡、0.72 就看得到了）。
// 也不要疊「透明度呼吸」：那是舊版三張 canvas 的做法，跟上面的小幅閃動疊起來會變成
// 整張臉在明滅。
const PORTRAIT_OPACITY = 0.72

// 換人：先炸開再重組。第一段 spread=炸開位置、shape=現在位置，blend 1→0 把粒子往外拋；
// 第二段在 blend=0（shape 權重為 0，換掉無縫）把 shape 換成下一個人，blend 0→1 重組。
const EXPLODE_MS = 520
const REFORM_MS = 1100
// 往外拋的距離（模擬 px）。⚠️ 桌機那張是 170，但那是「547px 的人像放在 1300×720 的
// canvas 上」，四周有大量留白；這裡 canvas 就是人像框本身，照抄會整圈貼牆。
// 24 ≈ FIT 留下的那圈邊界，炸開看得出來又不會撞牆。
const EXPLODE_PUSH = 24

// targets 是模擬空間座標，canvas 尺寸一變就失效，要等尺寸穩定再重建
const RESIZE_SETTLE_MS = 300
// 進場提前量：框還在畫面外一點就開始跑，捲到的時候已經是活的
const ENTER_MARGIN = '25% 0px'
const TAU = Math.PI * 2
// --------------------------------------------------------------------------

let engine = null
let liveRaf = 0
let io = null
let onVisibility = null
let onResize = null
let resizeTimer = 0
let reducedMotion = false

const specs = new Map()             // portrait 路徑 → PLImage spec（同一張圖只取樣一次）
let inView = false                  // 觀景框在不在畫面上
let live = false                    // 是否要跑（inView && !hidden && !idle）
let switching = false               // 換人漸變中 —— 閃動要讓位，不要兩邊搶著寫 morph
let targetsReady = false
let targetsGen = -1
let targetsW = 0
let targetsH = 0
// morph blend。⚠️ 待命時「兩個目標槽塞同一組」（見 buildTargets），所以 blend 怎麼
// 給都一樣 —— 它只在換人的炸開／重組那 1.6 秒真正參與。
let blend = 1
let switchTween = null

let shapeXY = null                  // 目前人像的每-slot 目標點
let shimmerT0 = 0
let shimmerCycle = -1

// ⚠️ 「目前畫在畫面上的是哪一張」要自己記，不能從 speakerIndex 回推 ——
// useSpeakerFieldBus.selectSpeaker 是先把 speakerIndex 寫成新的、才 await swapImpl，
// 所以進到 swapPortrait 的當下 speakerIndex 已經是「下一位」了。拿它去查 fromSpec
// 會查到目標那張，炸開／重組的起點與配色就全錯（而且 spec === fromSpec 會讓整段
// 動畫被當成「同一張圖」直接略過）。
let shownPortrait = null

// --- 點雲取樣 --------------------------------------------------------------
async function getSpec (portrait) {
  if (!portrait) return null
  if (specs.has(portrait)) return specs.get(portrait)
  const spec = await window.PLImage.prepare(portrait, {
    count: q.samples,
    colors: SPECIES,
    fit: FIT,
  })
  specs.set(portrait, spec)
  return spec
}

// --- 目標點工具 ------------------------------------------------------------
// 三者都是「以 slot 為索引」的 [x,y,x,y,…]：GPU 每幀 spatial sort 會重排粒子陣列，
// 只有生成時指定的 slot 是穩定身分。
function snapshotXY (snap, n) {
  const out = new Float32Array(n * 2)
  for (const p of snap) {
    if (p.slot < n) { out[p.slot * 2] = p.x; out[p.slot * 2 + 1] = p.y }
  }
  return out
}

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

// 以人像中心為原點往外拋。加隨機量才像炸開，而不是整張等比放大。
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
    out[i * 2] = Math.max(4, Math.min(W - 4, base[i * 2] + (dx / d) * push))
    out[i * 2 + 1] = Math.max(4, Math.min(H - 4, base[i * 2 + 1] + (dy / d) * push))
  }
  return out
}

// 配對只決定「誰去哪個點」，同物種內就近配對 —— 每顆粒子去「自己顏色」的目標點，
// 重組出來的配色才會跟原圖一致。
async function resolveShape (spec) {
  // ⚠️ readParticles 是 GPU→CPU 的 mapAsync 硬同步，接著 buildSlotTargets 是
  // O(N log N) 的主執行緒排序。這段的幀時間不代表渲染負載。
  suspendReadback()
  const snap = await engine.readParticles()
  const { W, H } = engine.size
  const targets = buildImageTargets(spec, snap.length, W, H)
  const { shape } = buildSlotTargets(snap, targets, spec.palette.length, W)
  return { snap, shape, W, H }
}

// ⚠️ 兩個目標槽塞同一組「已經抖過的」座標，而不是舊版的 (抖動版, 原版) + blend 擺盪。
// 這一版的閃動是「換一組目標點」，不是「在兩組之間來回」—— 幅度小得多，也不會有
// blend 走完一輪時整張臉同步縮放的呼吸感。與 Home/Field.vue 的做法一致。
async function buildTargets (spec) {
  if (!engine?.readParticles || !engine.setTargets || !spec) return false
  const { shape, W, H } = await resolveShape(spec)
  shapeXY = shape
  const jit = reducedMotion ? shape : jitterXY(shape, q.shimmerAmp)
  engine.setTargets(jit, jit)
  targetsGen = engine.targetsGeneration
  targetsW = W
  targetsH = H
  targetsReady = true
  shimmerT0 = performance.now()
  shimmerCycle = -1
  return true
}

function targetsStale () {
  if (!engine || !targetsReady) return false
  const { W, H } = engine.size
  return engine.targetsGeneration !== targetsGen || W !== targetsW || H !== targetsH
}

// --- 閃動迴圈 --------------------------------------------------------------
// 這個迴圈唯一的工作是「每 q.shimmerMs 換一組目標點」。力場與透明度都是
// 常數（見檔頭），不需要逐幀寫。
//
// ⚠️ 離場／閒置就整個收工，不是只靠 engine.pause() —— 這裡每秒會配一份大的
// Float32Array 再上傳，沒人在看的時候完全沒有理由繼續。
// ⚠️ 換人中不能收：使用者可能在框已經捲出畫面時按左右箭頭（窄視窗的版面是框在上、
// 名字在下），那時 live 是 false，收掉的話炸開／重組會定格。
function liveLoop (now) {
  liveRaf = 0
  if (!engine || idle.value || (!live && !switching)) {
    syncPause()
    return
  }
  liveRaf = requestAnimationFrame(liveLoop)

  // 換人漸變期間讓位給 swapPortrait()，不要兩邊搶著寫 targets
  if (switching || reducedMotion || !targetsReady || !shapeXY) return

  const t = now || performance.now()
  const cycle = Math.floor((t - shimmerT0) / q.shimmerMs)
  if (cycle !== shimmerCycle) {
    shimmerCycle = cycle
    const jit = jitterXY(shapeXY, q.shimmerAmp)
    engine.setTargets(jit, jit)
  }
}

function startLiveLoop () {
  if (!liveRaf) liveRaf = requestAnimationFrame(liveLoop)
}

// --- 進場 / 離場 -----------------------------------------------------------
function syncPause () {
  if (!engine) return
  // 在畫面上或換人漸變中 → 要繼續算；其餘一律凍結（canvas 保留最後一幀）。
  // ⚠️ 這一版不需要「等力場淡回 0 再凍結」（舊版那樣做是因為 force 開到 1.0，
  // 定格會停在抖到一半的姿勢）。這裡 force 全程是引擎下限，粒子隨時都貼在人像上，
  // 停在哪一幀都是那張臉。
  const running = (live || switching) && !document.hidden && !idle.value
  engine.pause(!running)
  // ⚠️ 一定要誠實回報 —— 量測器靠這個知道畫面上真的有東西在算。
  markActive('speakerPortrait', running)
}

async function goLive () {
  if (!engine || live) return
  live = true
  syncPause()
  // 進場前 targets 可能已經失效（視窗轉向過）
  if (!targetsReady || targetsStale()) {
    const spec = specs.get(shownPortrait)
    if (spec) {
      await buildTargets(spec)
      blend = 1
    }
  }
  engine.setMorph?.(LOCK_PULL, LOCK_GRIP, blend)
  // 重新起算閃動的相位，並讓下一幀立刻換一組偏移（cycle = -1 保證對不上）
  shimmerT0 = performance.now()
  shimmerCycle = -1
  startLiveLoop()
}

function goIdle () {
  if (!live) return
  live = false
  // 目標點收回沒抖過的原版：定格那一幀最多只差一個閃動幅度（滿檔 1.5px），
  // 而下次進場時是從乾淨的形狀開始追，不會沿用上一輪的隨機偏移。
  if (shapeXY) engine?.setTargets?.(shapeXY, shapeXY)
  blend = 1
  engine?.setMorph?.(LOCK_PULL, LOCK_GRIP, 1)
  syncPause()
}

// 閒置狀態改變 → 立刻套用。醒來時 rAF 迴圈可能已經停了，要重新啟動。
watch(idle, (v) => {
  if (!engine) return
  syncPause()
  if (!v && live) startLiveLoop()
})

// --- 換人 ------------------------------------------------------------------
// 由 useSpeakerFieldBus 呼叫（名單在兄弟元件 HomeSpeaker 裡）。
// 版面那條時間軸（框線放射、引線延伸、打字）與這裡並行、彼此不等待。
function tween (obj, vars, ms, ease, onUpdate) {
  const { $gsap } = useNuxtApp()
  return new Promise((done) => {
    switchTween = $gsap.to(obj, {
      ...vars,
      duration: reducedMotion ? 0 : ms / 1000,
      ease,
      onUpdate,
      onComplete: done,
    })
  })
}

async function swapPortrait (portrait) {
  if (!portrait) return
  // 靜態模式（含粒子被降檔換成靜態圖之後）：換圖，不碰引擎
  if (mode.value === 'static') return swapStatic(portrait)
  if (!engine) return
  const fromSpec = specs.get(shownPortrait)
  const spec = await getSpec(portrait)
  if (!spec) return

  // 八個人目前輪流共用兩張臨時頭像 —— 同一張就沒有形狀要變，不做爆炸
  if (!targetsReady || !fromSpec || spec === fromSpec) {
    shownPortrait = portrait
    return
  }

  switching = true
  // 換人是刻意的一次性高成本演出（GSAP tween + 每幀 setColors 重寫整個色盤 buffer
  // + 兩次大 Float32Array 配置），不該拿來當常態的效能判斷依據。
  suspend(EXPLODE_MS + REFORM_MS + 800)
  switchTween?.kill()
  syncPause()
  try {
    const n = engine.config.count
    const { snap, shape, W, H } = await resolveShape(spec)
    const cur = snapshotXY(snap, n)
    const exploded = explodeXY(cur, W, H)
    const state = { e: 1 }

    // 第一段：往外炸開。shape 先維持在「現在的位置」，blend 1→0 把粒子拋去 exploded。
    engine.setTargets(exploded, cur)
    engine.setMorph?.(LOCK_PULL, LOCK_GRIP, 1)
    await tween(state, { e: 0 }, EXPLODE_MS, 'power2.out', () => {
      blend = state.e
      engine?.setMorph?.(LOCK_PULL, LOCK_GRIP, blend)
    })

    // 第二段：blend 已在 0 → 無縫把 shape 換成下一個人，再拉回去重組。
    const linFrom = paletteToLinear(fromSpec.palette)
    const linTo = paletteToLinear(spec.palette)
    engine.setTargets(exploded, shape)
    await tween(state, { e: 1 }, REFORM_MS, 'power2.inOut', () => {
      blend = state.e
      engine?.setMorph?.(LOCK_PULL, LOCK_GRIP, blend)
      engine?.setColors?.(lerpPaletteLinear(linFrom, linTo, state.e))
    })

    engine?.setColors?.(spec.palette)   // 收尾定色，config.palette 對齊
    shownPortrait = portrait
    blend = 1
    // 交回給閃動：以新人像為基準重新掛 spread/shape
    shapeXY = shape
    const jit = reducedMotion ? shape : jitterXY(shape, q.shimmerAmp)
    engine.setTargets(jit, jit)
    shimmerT0 = performance.now()
    shimmerCycle = -1
  } finally {
    // 中途失敗也要解鎖，否則之後就再也不能換人
    switching = false
    syncPause()
    startLiveLoop()
    if (pendingStatic) toStatic()
  }
}

// --- 初始化 ----------------------------------------------------------------
async function init () {
  // 靜態模式：不載粒子套件、不取樣、不建引擎（見檔頭）
  if (mode.value === 'static') { initStatic(); return }

  const canvas = canvasRef.value
  // 沒有人像可取樣，開了引擎也只會是一片空白的黑
  const portrait = props.speakers[speakerIndex.value]?.portrait || null
  if (!canvas || !portrait) return

  // 一開始就訂閱：建引擎的這段時間裡如果檔位被降下來，不能漏掉。
  unsubTier = onTierChange((t) => { if (t < TIER_DEFAULT && isMobile()) toStatic() })

  await loadParticleKit()
  registerNebula()
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ⚠️ 必須在第一次 getSpec() 之前 —— q.samples 決定取樣點數，而那要全圖一致。
  // 目前 pre-flight 是同步就緒的，所以這一行實際上不會等；等執行期量測上線之後
  // 它才會真的等一個量測視窗，而那正好也解掉「開場兩顆引擎同時全速」——
  // 這支建完引擎後 config.paused 預設是 false，要跑完 8 幀暖機 + 一次
  // readParticles 才 syncPause()，那十幾幀剛好疊在 MobileField 開場最忙的時刻。
  await whenTierReady()
  q = knobs('speakerPortrait')

  const spec = await getSpec(portrait)
  if (!spec || disposed || mode.value === 'static') return
  shownPortrait = portrait

  const count = countFor(canvas, { density: q.density, max: q.countMax, min: q.countMin })

  engine = await window.makeEngine(canvas, {
    species: SPECIES,
    count,
    palette: spec.palette,
    seedPattern: spec.pattern,      // 開場就直接長在人像上，不需要任何進場動畫
    preset: 'nebula',
    // ⚠️ 力場全程就是這個值，不做淡入淡出（見檔頭）。任何正的自吸引都會把人像
    // 凝結成一顆顆菌落，nebula 這組矩陣本身已經沒有自吸引，再壓到下限就更穩。
    forceFactor: LOCK_FORCE,
    friction: 0.4,
    minR: 4,
    // ⚠️ 30，不是抄桌機那套的 55。這是這一區最大的單點效能收益，理由要一起看：
    //
    // 引擎的力場計算是空間雜湊，每顆粒子掃自己周圍 (2·cellSub+1)² 個格子，
    // 格子邊長 = max(8, rMax / cellSub) —— 所以搜尋成本 ∝ rMax²。
    // 在這張 342² 的觀景區上：
    //   rMax 55 → cellSize 27.5 → 搜尋窗 137.5²，佔整張畫布的 16.2%，
    //             每顆粒子每幀跟全場約 1420 顆算力
    //   rMax 30 → cellSize 15   → 搜尋窗 75²，佔 4.8%，約 420 顆 → 算力剩 0.30 倍
    //
    // 為什麼砍得下去而且畫面不變：rMax 是「互動力場的作用半徑」，而這一區的
    // forceFactor 全程鎖在 LOCK_FORCE（0.1 = 引擎下限，見上面那段長註解）——
    // 力場本來就被刻意停用、畫面完全由 seek 主導。我們一直在為一個關掉的東西
    // 付全額搜尋成本。密度、平均粒距、五官清晰度都不受影響。
    //
    // ⚠️ 不要改成從 density 買效能：成本 ∝ d²，但感知細節只 ∝ √d（點畫的解析度
    // 就是平均粒距 = 1/√d）。這張人像在模擬空間只有約 294px，眼睛與眼鏡框只剩
    // 10~19px 寬 —— d = 0.075 的粒距 3.65px 已經卡在「約 3 顆粒子橫跨一條眼鏡框」
    // 那條線上。砍 density 就是拿眼鏡框換算力。
    //
    // ⚠️ 唯一的風險是 nebula 那組矩陣負責的「氣體感」（緩慢環流）會變弱。
    // 完整的取捨與量測方式見 docs/particle-performance.md §3。
    // 低檔位會再往下（見 particleTiers.js 的 speakerPortrait）。
    rMax: q.rMax,
    repel: 1.0,
    simSpeed: SIM_SPEED,
    cameraZoom: 1,
    pointSize: q.pointSize,
    particleOpacity: PORTRAIT_OPACITY,
    showGlow: false,
    cellSubdivisions: 2,
    // ⚠️ 取 min 而不是直接用檔位值 —— 契約是「只會減、不會加」。
    maxDpr: Math.min(maxDpr(), q.dprCap),
    bgFade: 'rgba(10,10,12,0.18)',  // 只有 CPU fallback 會用到；GPU 路徑是不透明黑
  })
  // 建引擎的這段時間裡已經卸載，或被降檔換成靜態圖了 → 這顆引擎沒人要
  if (disposed || mode.value === 'static') { engine.destroy(); engine = null; return }
  // makeEngine 在 WebGPU 初始化失敗時會「靜默」退到 CPU 引擎，它沒有 setTargets /
  // setMorph —— 收攏與換人全都不會動。這種情況直接改用靜態圖（以前是名字換了人像不變）。
  if (!engine.setTargets) {
    engine.destroy()
    engine = null
    toStatic()

    return
  }
  if (showFps()) engine.setShowFps?.(true)
  if (import.meta.dev) {
    window.__samePortrait = engine
    // 換人對不上時先看這個：shown 是「畫面上實際是哪一張」，跟 speakerIndex 不同步
    // 是正常的（換人動畫跑完才會對上），但停下來之後兩者必須一致。
    window.__samePortraitDbg = () => ({
      shown: shownPortrait,
      tier: tier.value,
      cpuFallback: cpuFallback.value,
      index: speakerIndex.value,
      count: engine.config.count,
      rMax: engine.config.rMax,
      inView,
      live,
      switching,
      targetsReady,
      paused: engine.config.paused,
    })
  }

  // 讓引擎先畫幾幀把畫面建立起來，再凍結 —— 否則定格下來的是空白 / 半成品。
  await new Promise((r) => {
    let n = 0
    const tick = () => (++n < 8 ? requestAnimationFrame(tick) : r())
    requestAnimationFrame(tick)
  })

  await buildTargets(spec)
  blend = 1
  engine.setMorph?.(LOCK_PULL, LOCK_GRIP, 1)

  onVisibility = () => syncPause()
  document.addEventListener('visibilitychange', onVisibility)

  onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(async () => {
      if (!targetsStale()) return
      const sp = specs.get(shownPortrait)
      if (!sp) return
      await buildTargets(sp)
      blend = 1
      engine?.setMorph?.(LOCK_PULL, LOCK_GRIP, 1)
    }, RESIZE_SETTLE_MS)
  }
  window.addEventListener('resize', onResize)

  // 只在觀景框看得到的時候跑。用 IntersectionObserver 而不是 ScrollTrigger ——
  // 這裡只要一個布林值，不需要 scrub 進度。
  io = new IntersectionObserver((entries) => {
    const next = entries.some(en => en.isIntersecting)
    if (next === inView) return
    inView = next
    if (next) goLive()
    else goIdle()
  }, { rootMargin: ENTER_MARGIN })
  io.observe(canvas)

  syncPause()
  // 名單那邊點下另一位時走這條 —— canvas 沒建好前 swapImpl 是 null，
  // 名單本身照常可用（只換文字，不做粒子動畫）。
  swapImpl.value = swapPortrait

  toolMeta.backend = engine.backend
  toolMeta.autoCount = count
  syncToolKnobs()
  rebuildToolPresets()
  unregisterTool = registerTool({
    id: 'portrait',
    label: '人像',
    fields: TOOL_FIELDS,
    knobs: toolKnobs,
    get presets () { return toolPresets.value },
    meta: toolMeta,
    apply: applyToolKnobs,
  })
}

// --- ?tool=1 面板的三個接口 -------------------------------------------------
function syncToolKnobs () {
  if (!engine) return
  toolKnobs.count = engine.config.count
  toolKnobs.samples = q.samples
  toolKnobs.rMax = engine.config.rMax
  toolKnobs.pointSize = engine.config.pointSize
  toolKnobs.dprCap = engine.config.maxDpr
  toolKnobs.shimmerAmp = q.shimmerAmp
  toolKnobs.shimmerMs = q.shimmerMs
}

function rebuildToolPresets () {
  const canvas = canvasRef.value
  if (!canvas) return
  toolPresets.value = Array.from({ length: TIER_COUNT }, (_, t) => {
    const k = tierKnobs('speakerPortrait', t)

    return {
      tier: t,
      values: {
        count: countFor(canvas, { density: k.density, max: k.countMax, min: k.countMin }),
        samples: k.samples,
        rMax: k.rMax,
        pointSize: k.pointSize,
        // 跟建引擎時同一條規則：只會減、不會加
        dprCap: Math.min(maxDpr(), k.dprCap),
        shimmerAmp: k.shimmerAmp,
        shimmerMs: k.shimmerMs,
      },
    }
  })
}

// ⚠️ q 是 tierKnobs 回傳的物件，而閃動迴圈每一輪都重讀 q.shimmerAmp / q.shimmerMs
// —— 所以改 q 就等於改行為，不需要另外一組覆寫變數（跟 MobileField 不同，
// 那邊的 opacity / drift 是被算式包住的，才需要覆寫變數）。
async function applyToolKnobs (next) {
  if (!engine || !next) return

  if (Number.isFinite(next.rMax)) engine.setRMax?.(next.rMax)
  if (Number.isFinite(next.pointSize)) engine.setPointSize?.(next.pointSize)
  if (Number.isFinite(next.dprCap)) engine.setMaxDpr?.(next.dprCap)
  if (Number.isFinite(next.shimmerAmp)) q.shimmerAmp = next.shimmerAmp
  if (Number.isFinite(next.shimmerMs)) q.shimmerMs = next.shimmerMs

  let needRebuild = false

  if (Number.isFinite(next.count) && Math.round(next.count) !== toolKnobs.count) {
    // ⚠️ setCount 會 respawn 並推進 targetsGeneration —— 這一支的閃動迴圈不像
    // MobileField 的 frame() 有查 targetsStale()，所以目標點得自己重建。
    engine.setCount?.(Math.round(next.count))
    noteRespawn()
    needRebuild = true
  }

  if (Number.isFinite(next.samples) && Math.round(next.samples) !== q.samples) {
    // ⚠️ 「每張圖都要同一個取樣點數」——改了就得把快取整個丟掉重取樣。
    q.samples = Math.round(next.samples)
    specs.clear()
    try {
      await getSpec(shownPortrait)
    } catch (err) {
      console.warn('[SpeakerPortrait] 改取樣點數後重新取樣失敗', err)
    }
    needRebuild = true
  }

  if (needRebuild) {
    // ⚠️ readParticles 是 GPU→CPU 的硬同步點，量測器要先閉嘴一段時間
    suspendReadback()
    try {
      await buildTargets(specs.get(shownPortrait))
    } catch (err) {
      console.warn('[SpeakerPortrait] 套用面板數值後重建目標點失敗', err)
    }
  }
  syncToolKnobs()
}

onMounted(() => { init() })

// 拆掉粒子那一整套（卸載、或降檔換成靜態圖時共用）
function teardownParticles () {
  unregisterTool?.()
  unregisterTool = null
  if (liveRaf) cancelAnimationFrame(liveRaf)
  liveRaf = 0
  markActive('speakerPortrait', false)
  switchTween?.kill()
  io?.disconnect()
  io = null
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  onVisibility = null
  clearTimeout(resizeTimer)
  if (onResize) window.removeEventListener('resize', onResize)
  onResize = null
  if (engine) { engine.destroy(); engine = null }
}

onBeforeUnmount(() => {
  disposed = true
  unsubTier?.()
  nearIo?.disconnect()
  staticTween?.kill()
  teardownParticles()
  // ⚠️ 只在「登記的確實是自己」時才清 —— 跨斷點切換時 Vue 可能先掛好桌機版那張
  // 再卸載這一支，無條件清會把剛登記好的實作踢掉（同 useParticleStage 的 releaseStage）。
  resetSpeakerBus(swapPortrait)
})
</script>

<template>
  <!-- 觀景框裡的人像。粒子模式：canvas 同時也是框內的底色（GPU 路徑必定是不透明純黑），
       而窄視窗這一段的底也是純黑，所以看不出這裡有個方塊。
       靜態模式：透明底的 <img>，直接落在那層純黑底上。
       ⚠️ <img> 的 opacity 一律交給 gsap 寫（class 的 opacity-0 只是起始值）—— 不要放進
       :style，否則 Vue 每次重繪都會把動畫寫到一半的值蓋回去。大小與 canvas 上的人像
       一致：都是觀景區的 FIT（0.86），置中。 -->
  <div
    ref="rootRef"
    class="pointer-events-none absolute inset-0 z-0 flex size-full items-center justify-center"
  >
    <canvas
      v-if="showCanvas"
      ref="canvasRef"
      aria-hidden="true"
      class="absolute inset-0 block size-full"
    />
    <img
      v-if="mode === 'static'"
      ref="imgRef"
      :src="staticSrc || undefined"
      alt=""
      aria-hidden="true"
      draggable="false"
      decoding="async"
      class="relative block select-none object-contain opacity-0"
      :style="{ width: `${FIT * 100}%`, height: `${FIT * 100}%` }"
    >
  </div>
</template>
