<script setup>
// PL. III — Speaker。首頁第二張粒子 canvas，獨立於背景那張滿版場。
//
// 為什麼不共用背景那一張（設計師原本想的是整頁一張 canvas 讓粒子跑來跑去）：
// 這一區的目標是「看得出是誰」，粒子必須被 seek 力釘死在人像輪廓上；背景那張要的
// 是「一直在演化的生態」，兩者對 forceFactor / morphGrip 的需求剛好相反，同一張
// canvas 沒辦法同時滿足。
// 拆成兩張還有個附帶好處：這區捲到畫面中央時背景已經被整片蓋掉，可以直接把背景那張
// pause 掉 —— 同時只有一張在算，fps 比共用還好。交棒的仲裁在 useParticleStage()。
//
// ⚠️ canvas 為什麼要鋪滿整個 section，而不是設計稿上那個 550×550：
// WebGPU 引擎的 compose pass 是 clearValue{a:1} 的「不透明黑」（bgFade 只有 CPU
// fallback 才吃），所以 canvas 一定是實心方塊。做成 550×550 就會有一塊硬邊黑方塊
// 壓在背景粒子上，邊界看得出來。鋪滿整區反而乾淨：整片均勻蓋掉背景（正是設計要的
// 效果），人像大小改由 FIT 控制。
//
// 運作方式與首頁 ParticleField 同一套（路線 C · shader seek 力，見
// docs/point-cloud-effect.md §8）：位置全部在 GPU 上算，JS 每幀只寫 16 bytes 的
// morph uniform。三種狀態都只是同一組旋鈕的不同值：
//
//   靜止（進場前）  pause(true)。canvas 保留最後一幀，是定格不是空白。
//   閃動（上台後）  高 grip 把粒子釘在輪廓上 → 只剩很小的互動力場在輪廓「內」
//                   抖動，人物全程清楚；再疊一層很慢的全域透明度呼吸。
//   換人（點擊）    setTargets(現在這位, 下一位) 之後 tween blend 0→1。
//                   ⚠️ 不是 people.vue 那套每幀從 JS respawn 上傳 32k 顆粒子 ——
//                   那條路在這個點數下會掉幀，這條只寫 uniform，所以順。

const { loadParticleKit, registerNebula } = useParticleKit()
const { countFor, maxDpr } = useParticleBudget()
const { paletteToLinear, lerpPaletteLinear, buildImageTargets, buildSlotTargets } = useParticleMorph()
const { activeStage, idle, claimStage, releaseStage } = useParticleStage()

const STAGE = 'speaker'

// --- 講者資料 --------------------------------------------------------------
// 內容由首頁資料的 speaker 區塊提供（見 pages/index-old.vue）。
// portrait 是去背 PNG，執行期用 PLImage.prepare 取樣成點雲（與首頁 side.png 同一條路，
// 不走 people.vue 的預烘 JSON —— prepare 只取樣到 480px，縮圖後檔案大小跟 JSON 一樣，
// 但換照片只要丟檔案、不用跑 bake.py）。
// ⚠️ 目前只有兩張臨時頭像（Figma 上標「待照片收集完再替換」），所以八個人輪流共用。
// 照片到齊後只要改 home.json 裡各自的 portrait 路徑即可，程式都不用動。
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})

const SPEAKERS = computed(() => props.data?.items || [])
const plate = computed(() => props.data?.plate || {})
const moreLink = computed(() => props.data?.more_link || {})

// 左右各四位（設計稿的構圖：人像置中，名單分列兩側）
const LEFT = computed(() => SPEAKERS.value.slice(0, 4))
const RIGHT = computed(() => SPEAKERS.value.slice(4))

// grid 列位置要寫成完整 class 字面量 —— Tailwind 是掃原始碼字串的，
// `lg:row-start-${i}` 這種拼接它看不到，產不出 CSS。
const ROW = ['lg:row-start-1', 'lg:row-start-2', 'lg:row-start-3', 'lg:row-start-4']

// 名字中英混排：中文用 Noto Serif TC Bold（不斜），英文用 Inria Serif Bold Italic。
// 設計稿的「保哥 Will」就是這樣拼的 —— 拆成 runs 之後，之後加講者不必再手動切 span。
const CJK_RUN = /([㐀-鿿豈-﫿]+)/
function nameRuns (name) {
  return name.split(CJK_RUN).filter(Boolean).map(t => ({ t, zh: CJK_RUN.test(t) }))
}

// --- 可調參數 --------------------------------------------------------------
const SAMPLES = 32000       // ⚠️ 每張圖都要同一個點數，否則換人配對會有一撮粒子配不到對
// 引擎點數。⚠️ 這裡以前直接用 SAMPLES，等於所有裝置都跑 32000 顆 —— 這一區在
// 手機上實測 49fps 的原因。改成依 canvas 面積算（見 useParticleBudget）：
// DENSITY = 桌機的 32000 ÷ 1440×900，所以桌機完全不變，窄視窗才會往下縮。
// 引擎點數小於 SAMPLES 是安全的：buildImageTargets / registerPattern 都用
// `i % spec.count` 取點，而 prepare() 的取樣順序是隨機的 → 前 N 個仍是均勻子集。
const COUNT_DENSITY = 0.0247
const COUNT_MAX = SAMPLES
const COUNT_MIN = 9000
const SPECIES = 7           // 色盤長度，必須與 species 一致（morph 中不能改 species）
// 點雲佔 canvas 短邊的比例。canvas 現在是整個 section，桌機約 720 高，
// 0.76 × 720 ≈ 547px ≈ 設計稿的 550。改這個值就是改人像大小。
const FIT = 0.76

// 「活起來」的三個來源 —— ⚠️ 這三個要一起看，任何一個壓太低畫面就是死的。
// 第一版把 force 設 0.15、grip 設 90、又沒開 ambient，三個都往「不動」壓，
// 結果就是一張會呼吸的貼圖。以下數值直接對齊首頁 ParticleField 的實測值。
//
// 1) 鎖形的兩顆旋鈕：PULL = 每單位距離想要的靠攏速度；GRIP = 速度被導引的強度。
//    grip 調大 = 抓得更緊，但輪廓裡剩下的 particle-life 運動就越少。
//    實測 pull 8–12 / grip 60–100 才守得住形狀又留得住運動。
const LOCK_PULL = 10
const LOCK_GRIP = 70

// 2) 互動力場。靜止時 0（完全不動），上台後升到這個值。
const LIVE_FORCE = 1.0
const FORCE_FADE_MS = 700   // 上台/下台時力場的淡入淡出

const SIM_SPEED = 0.22

// 3) 閃動 —— 這一段是實測出來的，別憑直覺改。
//
// ⚠️ 先講什麼「沒有用」，免得之後有人again走一遍：調 forceFactor（0.15→1.0）、
// 調 grip/pull（維持彈簧常數掃 70/10 到 8/88）、加 PLAmbient 脈衝、加 disturb
// （每 60ms 四發）—— 全部實測都是 0～1.4 px/s，畫面等同靜止。
// 原因是 seek 本質是「收斂到固定點的臨界阻尼彈簧」：那是穩定平衡，任何擾動都會
// 被 v = mix(v, desiredV, grip·dt) 吃掉。只要形狀鎖得夠緊到看得出臉，就不可能有
// 自發運動 —— 這是機制上的，不是參數沒調對。
//
// 有效的作法是「讓目標點自己會動」：seek 有 spread / shape 兩組目標點，
//   shape  = 人像原點
//   spread = 人像原點 + 每顆粒子各自的小隨機偏移
// 讓 blend 在 1 → 0 → 1 之間緩慢來回，每顆粒子就在自己的小範圍內游走。
// 實測 2.4～3.8 px/s，而分布從 418×526 只變成 419×536 —— 形狀在數學上就跑不掉，
// 因為 blend 回到 1 時每顆粒子必定回到自己的人像原點。
//
// 每走完一輪就換一組新的隨機偏移，才不會變成固定頻率的整體「呼吸」。
// ⚠️ 只能在 blend=1 的瞬間換 —— 那時 spread 的權重正好是 0，換掉不會跳。
// ⚠️ AMP 是「五官清晰度 vs 閃動幅度」的取捨，這是這個效果唯一真正要調的旋鈕。
// 臉上的眼睛、嘴巴特徵在模擬空間只有 20–40px 寬，AMP 12 就會把它們糊掉
//（實測畫面會變成一團看不出是誰的橘色團塊）。7 左右是清晰度還在、又看得出在動的位置。
// 運動速率正比於 AMP / PERIOD，要更明顯優先縮短 PERIOD，不要放大 AMP。
const SHIMMER_AMP = 7           // 每顆粒子的游走半徑（模擬 px）
const SHIMMER_PERIOD_MS = 1800  // blend 走完 1→0→1 一輪

// 全域透明度呼吸（疊在上面的另一層）。週期約 11 秒，慢到不會讓人分心。
const OPACITY_BASE = 0.9
const OPACITY_SWING = 0.1
const OPACITY_HZ = 0.09

// 4) 換人：先炸開再重組。用的是同一組 spread/shape 機制 ——
//    第一段 spread=炸開位置、shape=現在位置，blend 1→0 把粒子往外拋；
//    第二段在 blend=0（shape 權重為 0，換掉無縫）把 shape 換成下一個人，blend 0→1 重組。
const EXPLODE_MS = 520
const REFORM_MS = 1100
const EXPLODE_PUSH = 170        // 往外拋的距離（模擬 px）

// 5) 引線的進退場：A 往中心收起並淡出 → B 從中心畫出去
const LEADER_OUT_MS = 260
const LEADER_IN_MS = 420

// targets 是模擬空間座標，canvas 尺寸一變就失效，要等尺寸穩定再重建
const RESIZE_SETTLE_MS = 300
const TAU = Math.PI * 2
// --------------------------------------------------------------------------

const sectionRef = ref(null)
const canvasRef = ref(null)
const frameRef = ref(null)          // 中央 300×300 觀景框（引線的終點）
const nameRefs = ref([])            // 八個名字按鈕（引線的起點）
const current = ref(0)
const switching = ref(false)
const backend = ref('')
// 引線。三個點：觀景框 → 斜線 → 名字底下的水平線。
// ⚠️ 底線不能用 CSS border-b 另外畫 —— 那是兩個獨立筆畫，接點會出現折角與缺口。
// 整條走同一個 polyline，接縫才會不見，而且「從中心畫出去」會連底線一起畫。
// 起點固定在觀景框那端：dashoffset 是從終點往回收的，起點放中心，
// 畫出去的方向才會是設計上要的「中心 → 名字」。
const leader = ref(null)            // { p1, p2, p3 }，各為 [x, y]
const leaderDraw = ref(1)           // 0..1，畫出去的比例
const leaderFade = ref(1)

const currentSpeaker = computed(() => SPEAKERS.value[current.value] || null)
const leaderPoints = computed(() => {
  const l = leader.value
  return l ? [l.p1, l.p2, l.p3].map(p => p.join(',')).join(' ') : ''
})
const leaderLen = computed(() => {
  const l = leader.value
  if (!l) return 0
  return Math.hypot(l.p2[0] - l.p1[0], l.p2[1] - l.p1[1])
    + Math.hypot(l.p3[0] - l.p2[0], l.p3[1] - l.p2[1])
})

let engine = null
let liveRaf = 0
let onVisibility = null
let onResize = null
let resizeTimer = 0
let scrollTrigger = null
let reducedMotion = false

const specs = new Map()             // portrait 路徑 → PLImage spec（同一張圖只取樣一次）
let live = false                    // 是否「在台上」（= activeStage === STAGE）
let force = 0                       // 力場的當前值（逐幀淡入淡出）
let appliedForce = 0                // 上次真的寫進引擎的值（setForce 會重寫 80 bytes，設門檻）
let targetsReady = false
let targetsGen = -1
let targetsW = 0
let targetsH = 0
let blend = 1                       // morph blend：0 = spread，1 = shape
let switchTween = null
let leaderTween = null

// 目前人像的每-slot 目標點（[x0,y0,x1,y1,…]）。閃動的隨機偏移與換人的重組都以它為基準。
let shapeXY = null
let shimmerT0 = 0
let shimmerCycle = -1

// ---------------------------------------------------------------------------
// 點雲取樣：同一張圖只取樣一次，之後從 Map 拿（約 190ms / 32k 點）。
// ---------------------------------------------------------------------------
async function getSpec (portrait) {
  if (specs.has(portrait)) return specs.get(portrait)
  const spec = await window.PLImage.prepare(portrait, {
    count: SAMPLES,
    colors: SPECIES,
    fit: FIT,
  })
  specs.set(portrait, spec)
  return spec
}

// ---------------------------------------------------------------------------
// 目標點工具。三者都是「以 slot 為索引」的 [x,y,x,y,…]，因為 GPU 每幀 spatial sort
// 會重排粒子陣列，只有生成時指定的 slot 是穩定身分。
// ---------------------------------------------------------------------------

// 目前粒子位置
function snapshotXY (snap, n) {
  const out = new Float32Array(n * 2)
  for (const p of snap) {
    if (p.slot < n) { out[p.slot * 2] = p.x; out[p.slot * 2 + 1] = p.y }
  }
  return out
}

// 閃動用：每顆粒子在自己原點附近的一個隨機小偏移
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

// 換人用：以人像中心為原點往外拋。加隨機量才像炸開，而不是整張等比放大。
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

// 算出某張人像的每-slot 目標點。配對只決定「誰去哪個點」，同物種內就近配對 ——
// 每顆粒子去「自己顏色」的目標點，重組出來的配色才會跟原圖一致。
async function resolveShape (spec) {
  const snap = await engine.readParticles()
  const { W, H } = engine.size
  const targets = buildImageTargets(spec, snap.length, W, H)
  const { shape } = buildSlotTargets(snap, targets, spec.palette.length, W)
  return { snap, shape, W, H }
}

// 掛上一張人像並進入「閃動待命」：shape = 人像原點，spread = 加了隨機偏移的版本。
async function buildTargets (spec) {
  if (!engine?.readParticles || !engine.setTargets) return false
  const { shape, W, H } = await resolveShape(spec)
  shapeXY = shape
  engine.setTargets(jitterXY(shape, SHIMMER_AMP), shape)
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

// ---------------------------------------------------------------------------
// 每幀：力場淡入淡出 + 透明度呼吸。只在「上台中 / 正在淡出」時跑。
// ---------------------------------------------------------------------------
function liveLoop (now) {
  liveRaf = requestAnimationFrame(liveLoop)
  if (!engine) return

  // 閒置就整個收工。⚠️ 光靠 engine.pause() 不夠 —— 這個迴圈自己每 1.8 秒會配一份
  // 64000 元素的 Float32Array 再上傳 512KB（jitterXY + setTargets），閒置時純屬浪費。
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

  if (!reducedMotion) {
    engine.setParticleOpacity?.(
      OPACITY_BASE + OPACITY_SWING * Math.sin(t * 0.001 * OPACITY_HZ * TAU),
    )
  }

  // --- 閃動 ---------------------------------------------------------------
  // blend 走 1 → 0 → 1；每輪回到 1 時換一組新的隨機偏移，避免變成固定的整體呼吸。
  // 換人漸變期間讓位給 switchSpeaker()，不要兩邊搶著寫 morph。
  if (live && !switching.value && !reducedMotion && targetsReady && shapeXY) {
    const u = (t - shimmerT0) / SHIMMER_PERIOD_MS
    const cycle = Math.floor(u)
    if (cycle !== shimmerCycle) {
      shimmerCycle = cycle
      // ⚠️ 只能在這個時機換 —— 此刻 blend=1，spread 的權重正好是 0，換掉不會跳
      engine.setTargets(jitterXY(shapeXY, SHIMMER_AMP), shapeXY)
    }
    blend = 0.5 + 0.5 * Math.cos((u - cycle) * TAU)
    engine.setMorph?.(LOCK_PULL, LOCK_GRIP, blend)
  }

  // 已經下台且力場淡完 → 收工，讓引擎回到完全凍結
  if (!live && force <= 0) {
    cancelAnimationFrame(liveRaf)
    liveRaf = 0
    engine.setForce?.(0)
    appliedForce = 0
    engine.setParticleOpacity?.(OPACITY_BASE)
    syncPause()
  }
}

function startLiveLoop () {
  if (!liveRaf) liveRaf = requestAnimationFrame(liveLoop)
}

// ---------------------------------------------------------------------------
// 上台 / 下台
// ---------------------------------------------------------------------------
function syncPause () {
  if (!engine) return
  // 上台中、換人漸變中、或力場還沒淡完 → 要繼續算；其餘一律凍結（保留末幀）。
  // 閒置超過 5 秒也停 —— 使用者沒在看的時候沒有理由讓 GPU 全速跑（會發燙）。
  const running = (live || switching.value || force > 0) && !document.hidden && !idle.value
  engine.pause(!running)
}

// 閒置狀態改變 → 立刻套用。醒來時 rAF 迴圈可能已經停了，要重新啟動。
watch(idle, (v) => {
  if (!engine) return
  syncPause()
  if (!v && live) startLiveLoop()
})

async function goLive () {
  if (!engine) return
  live = true
  syncPause()
  // 進場前 targets 可能已經失效（視窗改過尺寸）
  if (!targetsReady || targetsStale()) {
    const spec = specs.get(currentSpeaker.value?.portrait)
    if (spec) {
      await buildTargets(spec)
      blend = 1
    }
  }
  engine.setMorph?.(LOCK_PULL, LOCK_GRIP, blend)
  shimmerT0 = performance.now()     // 從 blend=1 重新起算，接上去不會跳
  shimmerCycle = -1
  startLiveLoop()
}

function goIdle () {
  live = false
  // 不直接 pause —— 讓 liveLoop 把力場淡回 0 再凍結，否則會定格在「抖到一半」的姿勢。
  // 定格前把 blend 收回 1，人像才會停在乾淨的原始形狀。
  engine?.setMorph?.(LOCK_PULL, LOCK_GRIP, 1)
  blend = 1
  startLiveLoop()
}

// GSAP tween 包成 promise，讓下面的兩段式流程可以直接 await
function tween ($gsap, obj, vars, ms, ease, onUpdate) {
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

// ---------------------------------------------------------------------------
// 換人：先炸開、再重組成下一個人。
// 兩段都只是同一組 spread/shape 在 blend 上來回，位置全在 GPU 算，JS 每幀只寫
// 16 bytes 的 morph uniform + 128 bytes 的色盤 —— 所以 32k 顆也不會掉幀。
//
// 接縫為什麼不會跳：blend=0 時 shape 的權重是 0，這時把 shape 從「現在的位置」
// 換成「下一個人」不影響任何粒子的目標點。同理閃動換 spread 是在 blend=1 做。
// ---------------------------------------------------------------------------
async function switchSpeaker (spec, fromPalette) {
  const { $gsap } = useNuxtApp()
  const n = engine.config.count
  const { snap, shape, W, H } = await resolveShape(spec)

  const cur = snapshotXY(snap, n)
  const exploded = explodeXY(cur, W, H)
  const state = { e: 1 }

  // 第一段：往外炸開。shape 先維持在「現在的位置」，blend 1→0 把粒子拋去 exploded。
  engine.setTargets(exploded, cur)
  engine.setMorph?.(LOCK_PULL, LOCK_GRIP, 1)
  await tween($gsap, state, { e: 0 }, EXPLODE_MS, 'power2.out', () => {
    blend = state.e
    engine?.setMorph?.(LOCK_PULL, LOCK_GRIP, blend)
  })

  // 第二段：blend 已在 0 → 無縫把 shape 換成下一個人，再拉回去重組。
  const linFrom = paletteToLinear(fromPalette)
  const linTo = paletteToLinear(spec.palette)
  engine.setTargets(exploded, shape)
  await tween($gsap, state, { e: 1 }, REFORM_MS, 'power2.inOut', () => {
    blend = state.e
    engine?.setMorph?.(LOCK_PULL, LOCK_GRIP, blend)
    engine?.setColors?.(lerpPaletteLinear(linFrom, linTo, state.e))
  })

  engine?.setColors?.(spec.palette)   // 收尾定色，config.palette 對齊
  blend = 1
  // 交回給閃動：以新人像為基準重新掛 spread/shape
  shapeXY = shape
  engine.setTargets(jitterXY(shape, SHIMMER_AMP), shape)
  shimmerT0 = performance.now()
  shimmerCycle = -1
}

// 引線的進退場：先把舊的往中心收起並淡出，換好座標後再從中心畫出去。
// ⚠️ 收起期間刻意不重算 leader.value —— 它還要指著「舊的」那個名字。
async function animateLeader () {
  const { $gsap } = useNuxtApp()
  const s = { draw: leaderDraw.value, fade: leaderFade.value }
  const sync = () => { leaderDraw.value = s.draw; leaderFade.value = s.fade }

  leaderTween?.kill()
  if (leader.value && !reducedMotion) {
    await new Promise((done) => {
      leaderTween = $gsap.to(s, {
        draw: 0, fade: 0, duration: LEADER_OUT_MS / 1000, ease: 'power2.in', onUpdate: sync, onComplete: done,
      })
    })
  }

  await nextTick()
  updateLeader()                      // 這時 current 已經是新的了
  s.draw = 0; s.fade = 1; sync()
  if (!leader.value) return

  await new Promise((done) => {
    leaderTween = $gsap.to(s, {
      draw: 1, duration: reducedMotion ? 0 : LEADER_IN_MS / 1000, ease: 'power2.out', onUpdate: sync, onComplete: done,
    })
  })
}

async function select (i) {
  if (i === current.value || switching.value || !engine) return
  const fromSpec = specs.get(currentSpeaker.value?.portrait)

  // 點了就算「在看這區」—— 順手把台搶過來，維持「同時只有一張在動」
  claimStage(STAGE)

  const spec = await getSpec(SPEAKERS.value[i].portrait)

  switching.value = true
  syncPause()
  current.value = i                   // 文字、highlight、計數立刻跟上

  // 引線與粒子同時跑，不互相等待
  const line = animateLeader()

  try {
    // 八個人輪流共用兩張圖，同一張就沒有形狀要變 —— 不做爆炸，只換文字
    if (fromSpec && spec !== fromSpec && targetsReady) {
      switchTween?.kill()
      await switchSpeaker(spec, fromSpec.palette)
    }
    await line
  } finally {
    // 中途失敗也要解鎖，否則 switching 卡住之後就再也不能換人
    switching.value = false
    syncPause()
  }
}

// ---------------------------------------------------------------------------
// 引線：從被選中的名字拉一條斜線到中央觀景框。
// 設計稿是一條固定向量（Gipi → 框），但這裡選取會變，所以改成量元素位置即時算。
// 左欄從名字右緣拉到框的左緣，右欄鏡像。
// ---------------------------------------------------------------------------
function updateLeader () {
  const section = sectionRef.value
  const frame = frameRef.value
  const el = nameRefs.value[current.value]
  if (!section || !frame || !el || window.innerWidth < 1024) {
    leader.value = null
    return
  }
  const s = section.getBoundingClientRect()
  const f = frame.getBoundingClientRect()
  const n = el.getBoundingClientRect()
  // SVG 是 absolute inset-0，原點在 section 的 padding box；getBoundingClientRect
  // 給的是 border box。clientTop/clientLeft 就是兩者的差（border 寬度）。
  const ox = s.left + section.clientLeft
  const oy = s.top + section.clientTop
  const isLeft = current.value < LEFT.value.length
  const y = n.bottom - oy
  leader.value = {
    p1: [(isLeft ? f.left : f.right) - ox, f.top + f.height / 2 - oy],
    p2: [(isLeft ? n.right : n.left) - ox, y],
    p3: [(isLeft ? n.left : n.right) - ox, y],
  }
}

// ---------------------------------------------------------------------------
async function init () {
  const canvas = canvasRef.value
  // 沒有講者資料（API 掛了）就整個不啟動 —— 點雲的來源就是人像，
  // 沒有人像可取樣，開了引擎也只會是一片空白的黑。
  if (!canvas || !currentSpeaker.value) return

  await loadParticleKit()
  registerNebula()
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const spec = await getSpec(currentSpeaker.value.portrait)

  engine = await window.makeEngine(canvas, {
    species: SPECIES,
    count: countFor(canvas, { density: COUNT_DENSITY, max: COUNT_MAX, min: COUNT_MIN }),
    palette: spec.palette,
    seedPattern: spec.pattern,      // 開場就直接長在人像上，不需要任何進場動畫
    preset: 'nebula',
    forceFactor: 0,                 // 進場前完全靜止
    friction: 0.4,
    minR: 4,
    rMax: 55,
    repel: 1.0,
    simSpeed: SIM_SPEED,
    cameraZoom: 1,
    pointSize: 0.9,
    particleOpacity: OPACITY_BASE,
    showGlow: false,
    cellSubdivisions: 2,
    maxDpr: maxDpr(),               // 與 ParticleField 同：DPR 2 是 4 倍像素、視覺收益極小
    bgFade: 'rgba(10,10,12,0.18)',  // 只有 CPU fallback 會用到；GPU 路徑是不透明黑
  })
  backend.value = engine.backend
  if (import.meta.dev) window.__speakers = engine

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
    updateLeader()
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(async () => {
      if (!targetsStale()) return
      const sp = specs.get(currentSpeaker.value?.portrait)
      if (!sp) return
      await buildTargets(sp)
      blend = 1
      engine?.setMorph?.(LOCK_PULL, LOCK_GRIP, 1)
    }, RESIZE_SETTLE_MS)
  }
  window.addEventListener('resize', onResize)
  updateLeader()

  // 交棒：區塊頂邊捲到畫面中央 = 背景粒子已經被這區蓋掉 → 搶台。
  // 底邊離開畫面中央就交還，背景那張自己會醒回來。
  const { $ScrollTrigger } = useNuxtApp()
  if ($ScrollTrigger) {
    scrollTrigger = $ScrollTrigger.create({
      trigger: sectionRef.value,
      start: 'top center',
      end: 'bottom center',
      onToggle: self => (self.isActive ? claimStage(STAGE) : releaseStage(STAGE)),
    })
    $ScrollTrigger.refresh()
    // ⚠️ onToggle 只在「狀態改變」時觸發。init 是 async 的，使用者可能在它完成前
    // 就捲到這一區了 —— 那時 trigger 一建立就是 active，沒有「改變」，onToggle
    // 永遠不會叫。必須自己補一次。
    if (scrollTrigger.isActive) claimStage(STAGE)
  }

  // 首屏就落在這一區時，watch 早在引擎就緒前就跑過了，這裡補一次
  if (activeStage.value === STAGE) goLive()
  else syncPause()
}

// 台上/台下由 useParticleStage 單一仲裁 —— 這裡只負責「聽到就照做」
watch(activeStage, (v) => {
  if (!engine) return
  if (v === STAGE) goLive()
  else goIdle()
})

onMounted(() => { init() })

onBeforeUnmount(() => {
  releaseStage(STAGE)
  if (liveRaf) cancelAnimationFrame(liveRaf)
  switchTween?.kill()
  leaderTween?.kill()
  if (scrollTrigger) scrollTrigger.kill()
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  clearTimeout(resizeTimer)
  if (onResize) window.removeEventListener('resize', onResize)
  if (engine) { engine.destroy(); engine = null }
})

defineExpose({ backend })
</script>

<template>
  <!-- data-field-return 是背景粒子場的「回程」觸發器：這一區進場時，背景場開始
       從 side.png 的收攏構圖散回滿版自由場。等捲到票券區時已經散完 ——
       那一區在被 PL.III～PL.V 蓋住的期間就完成了，見 ParticleField 的說明。 -->
  <section
    id="speaker"
    ref="sectionRef"
    data-field-return
    class="relative z-10 overflow-clip px-6 py-16 lg:min-h-[720px] lg:px-[60px] lg:py-0"
  >
    <!-- 粒子人像：鋪滿整區、墊在所有文字底下。
         它同時也是這一區的底色（GPU 路徑必定是不透明黑），順便把背景粒子場整片蓋掉。 -->
    <canvas
      ref="canvasRef"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 z-0 block size-full"
    />

    <!-- 引線：被選中的名字 → 中央觀景框。座標由 updateLeader() 即時量出來。 -->
    <svg
      v-if="leader"
      class="pointer-events-none absolute inset-0 z-1 hidden size-full lg:block"
      aria-hidden="true"
    >
      <!-- dasharray = 全長、dashoffset 從全長收到 0 → 從起點（中心）往終點（名字）畫出去 -->
      <polyline
        :points="leaderPoints"
        :stroke-dasharray="leaderLen"
        :stroke-dashoffset="leaderLen * (1 - leaderDraw)"
        :stroke-opacity="0.8 * leaderFade"
        fill="none"
        stroke="#EFE6D2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <!-- 卷號標籤 -->
    <div class="relative z-2 flex flex-col border-t border-pre-800/35 py-8 lg:absolute lg:inset-x-[60px] lg:top-[60px]">
      <p class="font-mono text-[12px] leading-[1.2] tracking-[0.2em] text-pre-800/80">
        {{ plate.code }}
      </p>
      <p class="font-serif text-[56px] italic leading-none tracking-[0.02em] text-pre-800">
        {{ plate.number }}
      </p>
      <p class="font-mono text-[12px] leading-[1.2] tracking-[0.2em] text-pre-800/80">
        {{ plate.label }}
      </p>
    </div>

    <!-- 章節錨點不在這裡 —— 已經抽成頁面層級的 fixed 元件 CommonChapterNav，
         全程停在畫面左側、由捲動位置決定亮哪顆、可以點著跳章。 -->

    <!-- 名單 + 觀景框。桌機三欄（左四位／人像／右四位），手機單欄堆疊。 -->
    <div
      class="relative z-2 mx-auto mt-10 grid max-w-[1320px] grid-cols-1 gap-y-8 lg:mt-0 lg:min-h-screen lg:grid-cols-[1fr_300px_1fr] lg:content-center lg:gap-y-12"
    >
      <!-- 左欄。pl-[23.5%] 是欄寬的比例，在 1440 下 = 120px，剛好讓文字落在設計稿的
           x=180；單雙數再各多推 40px，就是設計稿那個交錯的構圖。 -->
      <button
        v-for="(s, i) in LEFT"
        :key="s.name"
        type="button"
        :aria-current="current === i ? 'true' : undefined"
        class="group flex lg:col-start-1 lg:pl-[23.5%]"
        :class="[ROW[i], i % 2 === 0 ? 'lg:ml-10' : '']"
        @click="select(i)"
      >
        <!-- 底線只能跟文字一樣寬（設計稿是 caption 容器的下緣），所以 w-max -->
        <span
          :ref="el => { if (el) nameRefs[i] = el }"
          class="flex w-max flex-col items-start gap-y-2 pb-4 text-left"
          :class="current === i ? 'border-b border-pre-800/80 lg:border-b-0' : ''"
        >
          <span
            class="text-[28px] leading-[1.2] tracking-[0.02em] transition-colors"
            :class="current === i ? 'text-accent-1' : 'text-pre-800 group-hover:text-accent-1'"
          >
            <span
              v-for="(r, k) in nameRuns(s.name)"
              :key="k"
              :class="r.zh ? 'font-zh font-bold' : 'font-serif font-bold italic'"
            >{{ r.t }}</span>
          </span>
          <span class="flex items-center gap-x-1 font-mono text-[14px] leading-[1.4] tracking-[0.06em] text-pre-800/[62%]">
            {{ s.org }}
            <span class="text-accent-1">·</span>
            {{ s.role }}
          </span>
        </span>
      </button>

      <!-- 中央觀景框 -->
      <div class="order-first flex flex-col items-stretch gap-y-2 lg:order-none lg:col-start-2 lg:row-span-4 lg:row-start-1">
        <div class="flex items-start justify-between font-serif text-[14px] font-bold italic leading-[1.4] tracking-[0.08em] text-pre-800">
          <span>{{ currentSpeaker?.tag }}</span>
          <span>{{ current + 1 }}/{{ SPEAKERS.length }}</span>
        </div>
        <!-- 只有框線 —— 人像是底下那張 canvas，這是「觀察窗」不是圖片容器 -->
        <div
          ref="frameRef"
          class="aspect-square w-full border border-pre-800/80 lg:size-[300px]"
        />
        <div class="flex flex-wrap items-center justify-end gap-x-2 font-mono text-[12px] leading-[1.2] tracking-[0.2em] text-pre-800">
          <template v-for="(sk, k) in currentSpeaker?.skills" :key="sk">
            <span v-if="k > 0" class="text-accent-1">·</span>
            <span>{{ sk }}</span>
          </template>
        </div>
      </div>

      <!-- 右欄。同左欄，只是基準比例不同（1440 下 = 131px → x=1001） -->
      <button
        v-for="(s, i) in RIGHT"
        :key="s.name"
        type="button"
        :aria-current="current === i + LEFT.length ? 'true' : undefined"
        class="group flex lg:col-start-3 lg:pl-[25.7%]"
        :class="[ROW[i], i % 2 === 0 ? 'lg:ml-10' : '']"
        @click="select(i + LEFT.length)"
      >
        <span
          :ref="el => { if (el) nameRefs[i + LEFT.length] = el }"
          class="flex w-max flex-col items-start gap-y-2 pb-4 text-left"
          :class="current === i + LEFT.length ? 'border-b border-pre-800/80 lg:border-b-0' : ''"
        >
          <span
            class="text-[28px] leading-[1.2] tracking-[0.02em] transition-colors"
            :class="current === i + LEFT.length ? 'text-accent-1' : 'text-pre-800 group-hover:text-accent-1'"
          >
            <span
              v-for="(r, k) in nameRuns(s.name)"
              :key="k"
              :class="r.zh ? 'font-zh font-bold' : 'font-serif font-bold italic'"
            >{{ r.t }}</span>
          </span>
          <span class="flex items-center gap-x-1 font-mono text-[14px] leading-[1.4] tracking-[0.06em] text-pre-800/[62%]">
            {{ s.org }}
            <span class="text-accent-1">·</span>
            {{ s.role }}
          </span>
        </span>
      </button>
    </div>

    <!-- 更多講者 -->
    <div class="relative z-2 mt-10 flex justify-center lg:absolute lg:inset-x-0 lg:top-[663px] lg:mt-0 lg:-translate-y-1/2">
      <NuxtLink
        v-if="moreLink.href"
        :to="moreLink.href"
        :target="moreLink.target"
        :rel="linkRel(moreLink.target)"
        class="inline-flex items-center gap-x-1 border border-accent-1 bg-[#0a0a0c] py-2 pl-5 pr-3 font-Noto text-[16px] font-medium leading-none tracking-[0.1em] text-pre-800 transition-colors hover:bg-accent-1/10"
      >
        {{ moreLink.label }}
        <span class="flex size-6 items-center justify-center">
          <AtomIcon name="arrow-right-thin" class="h-[5px] w-3" />
        </span>
      </NuxtLink>
    </div>
  </section>
</template>
