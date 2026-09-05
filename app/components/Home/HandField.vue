<script setup>
// 互動模式（彩蛋）的手勢輸入：相機 → MediaPipe HandLandmarker → 對粒子場施力。
//
// 手勢設計（三個，都不用記口訣，張手／捏手是本能動作）：
//   1. 張開手掌  → 推開。手掌中心當力場中心，張得越開、推得越遠。
//   2. 捏合（拇指碰食指）→ 吸引。粒子被捏成一團跟著指尖跑。
//      引擎的 disturb strength 給負值就是往圓心吸（shader 是 v += dir * falloff * w），
//      所以推跟吸是同一支 API，不用改 shader。
//   3. 握拳 → 放手。不推也不吸，方便把手移到別的位置再開始。
// 兩隻手會各自成為一個獨立的力場，可以一手推一手吸。
//
// ⚠️ 相機影像不離開瀏覽器：MediaPipe 的 wasm 與模型都是本站自架
// （public/mediapipe/），沒有任何一幀被送出去。
// ⚠️ video 元素必須真的在版面上（不能 display:none），否則部分瀏覽器不會解碼影格，
// detectForVideo 會一直拿到同一張。所以是縮到角落當預覽，不是藏起來。

const props = defineProps({
  // 張開手掌 →（x, y, radius, strength）速度脈衝，把粒子推開
  onPush: {
    type: Function,
    default: null
  },
  // 捏合 →（x, y, radius, amount）把粒子真的聚到那個點；amount 0 = 放開
  onGather: {
    type: Function,
    default: null
  }
})

const { fail } = useInteractiveMode()
// 手勢不會產生滑鼠／捲動事件，不主動 poke 的話閒置計時器會在十秒後把粒子停掉 ——
// 手還在鏡頭前揮，畫面卻定格了。
const { poke } = useParticleStage()

const videoRef = ref(null)
const ready = ref(false)
const handCount = ref(0)
const hint = ref('把手伸到鏡頭前')
// 畫面上的力場指示圈。看不到手對應到哪裡，是「感覺沒反應」的一大來源。
const active = ref(null)

let stream = null
let landmarker = null
let raf = 0
let lastVideoTime = -1
let lastPoke = 0
// 相機只有 30fps，但畫面是 60fps。只在有新影格時施力的話，等於一半的幀
// 沒有力場，脈衝被引擎衰減掉 —— 手感會變得斷斷續續。
// 所以辨識結果先存起來，rAF 每一幀都把它套到粒子場上。
let hold = null          // { x, y, radius, strength }（螢幕座標）
let smoothX = 0, smoothY = 0, smoothed = false
let disposed = false

// --- 手勢判定的門檻（都相對手掌大小正規化，所以離鏡頭遠近不影響）-----------
const PINCH_ON = 0.35        // 拇指↔食指距離 / 手掌大小，小於這個算捏合
const FIST_UNDER = 0.55      // 四指平均伸展度低於這個算握拳
const OPEN_OVER = 0.9        // 高於這個算完全張開

// 力場參數。比滑鼠推擠重一些 —— 手勢的定位沒有滑鼠準，力道小了會覺得沒反應。
const PUSH_RADIUS = 320
const PUSH_MAX = 34
// 吸力的半徑刻意比推力小：力量集中在指尖附近，粒子才會明顯「聚成一團」，
// 範圍拉太大只會變成整片緩緩位移，看起來反而沒感覺。
// 捏合是把粒子聚成一團，半徑 = 那團的大小，不是力場範圍
const PULL_RADIUS = 140
const PULL_MAX = 34
// 力場中心的平滑係數。手部關鍵點每幀會抖幾個 px，直接拿來當中心的話
// 力場會跟著顫，粒子看起來只是在原地震動、不像被手帶著走。
const SMOOTH = 0.35

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

// 手掌大小：手腕(0) 到中指根(9)。用它把所有距離正規化，
// 手離鏡頭遠近就不會改變手勢的判定結果。
function palmSize (lm) {
  return Math.max(1e-4, dist(lm[0], lm[9]))
}

// 四指（食指~小指）的伸展度：指尖離手腕 / 指根離手腕。伸直時 > 1，彎起來接近 0.6。
function extension (lm) {
  const wrist = lm[0]
  const tips = [8, 12, 16, 20]
  const mcps = [5, 9, 13, 17]
  let sum = 0
  for (let i = 0; i < 4; i++) {
    sum += dist(lm[tips[i]], wrist) / Math.max(1e-4, dist(lm[mcps[i]], wrist))
  }
  return sum / 4
}

function readGesture (lm) {
  const size = palmSize(lm)
  const pinch = dist(lm[4], lm[8]) / size      // 拇指尖 ↔ 食指尖
  const open = extension(lm)

  if (pinch < PINCH_ON) {
    // 捏合 → 吸。捏得越緊吸力越強
    const grip = 1 - Math.min(1, pinch / PINCH_ON)
    return {
      kind: 'pull',
      // 力場中心用兩指的中點，視覺上就是「捏住的那一點」
      x: (lm[4].x + lm[8].x) / 2,
      y: (lm[4].y + lm[8].y) / 2,
      radius: PULL_RADIUS,
      strength: -(2 + grip * PULL_MAX),
    }
  }

  if (open < FIST_UNDER) return { kind: 'fist' }   // 握拳 → 不施力

  // 張開手掌 → 推。從剛好不算握拳到完全張開之間做線性
  const t = Math.min(1, (open - FIST_UNDER) / Math.max(0.01, OPEN_OVER - FIST_UNDER))
  return {
    kind: 'push',
    x: lm[9].x,
    y: lm[9].y,
    radius: PUSH_RADIUS,
    strength: 2 + t * PUSH_MAX,
  }
}

async function createLandmarker () {
  const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision')
  // 兩個路徑都走 assetUrl —— 部署到子路徑時 app.baseURL 不是 '/'，寫死會 404
  const fileset = await FilesetResolver.forVisionTasks(assetUrl('/mediapipe/wasm'))
  const opts = (delegate) => ({
    baseOptions: { modelAssetPath: assetUrl('/mediapipe/hand_landmarker.task'), delegate },
    runningMode: 'VIDEO',
    numHands: 2,
    // 門檻調低一點：這是玩具互動，寧可偶爾抖一下也不要手舉在那裡卻沒反應
    minHandDetectionConfidence: 0.4,
    minHandPresenceConfidence: 0.4,
    minTrackingConfidence: 0.4,
  })
  try {
    return await HandLandmarker.createFromOptions(fileset, opts('GPU'))
  } catch {
    return await HandLandmarker.createFromOptions(fileset, opts('CPU'))
  }
}

function loop () {
  raf = requestAnimationFrame(loop)
  const video = videoRef.value
  if (!landmarker || !video || video.readyState < 2) return

  // 同一張影格不要重複推論（相機 30fps、畫面 60fps，會白跑一半）
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime
    readFrame(video)
  }

  // ⚠️ 施力在迴圈外面、每一幀都做，不是只在有新影格時。
  if (!hold) return
  if (hold.pull) {
    // 捏合走 morph（真的把粒子帶過來），不是速度脈衝
    props.onGather?.(hold.x, hold.y, hold.radius, 1)
  } else {
    props.onPush?.(hold.x, hold.y, hold.radius, hold.strength)
  }
}

function readFrame (video) {
  let res
  try {
    res = landmarker.detectForVideo(video, performance.now())
  } catch {
    return
  }

  const hands = res?.landmarks || []
  handCount.value = hands.length
  if (!hands.length) {
    hint.value = '把手伸到鏡頭前'
    hold = null
    smoothed = false
    active.value = null
    return
  }

  // 看到手就當作使用者在場。節流成每秒一次 —— poke 內部會 clearTimeout + setTimeout，
  // 每幀都做沒有意義。
  const now = performance.now()
  if (now - lastPoke > 1000) {
    lastPoke = now
    poke()
  }

  // ⚠️ 只吃一隻手。引擎同時只保留一個 disturb，第二隻手會直接覆蓋掉第一隻，
  // 而且合併時 strength 是相加的 —— 一手推一手吸會互相抵消成沒反應。
  const g = readGesture(hands[0])

  if (g.kind === 'fist') {
    hint.value = '握拳＝放手'
    hold = null
    active.value = null
    return
  }

  // 前鏡頭是鏡像的：畫面上的右邊對應影像的左邊，不翻的話手往右移、粒子往左跑
  const tx = (1 - g.x) * window.innerWidth
  const ty = g.y * window.innerHeight
  if (!smoothed) {
    smoothX = tx
    smoothY = ty
    smoothed = true
  } else {
    smoothX += (tx - smoothX) * SMOOTH
    smoothY += (ty - smoothY) * SMOOTH
  }

  hold = { x: smoothX, y: smoothY, radius: g.radius, strength: g.strength, pull: g.kind === 'pull' }
  hint.value = g.kind === 'pull' ? '捏住了 —— 粒子被吸過來' : '張開手掌推開粒子'
  // 給畫面上的指示圈用
  active.value = { x: smoothX, y: smoothY, r: g.radius, pull: g.kind === 'pull' }
}

onMounted(async () => {
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('這個瀏覽器不支援相機')
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    })
    if (disposed) return
    videoRef.value.srcObject = stream
    await videoRef.value.play()
    landmarker = await createLandmarker()
    if (disposed) return
    ready.value = true
    loop()
  } catch (err) {
    console.warn('[HandField] 互動模式啟動失敗', err)
    fail(err?.name === 'NotAllowedError' ? '相機權限被拒絕了' : (err?.message || '相機啟動失敗'))
  }
})

onBeforeUnmount(() => {
  disposed = true
  if (raf) cancelAnimationFrame(raf)
  // ⚠️ 一定要把 track 停掉，否則分頁上的相機指示燈會一直亮著
  stream?.getTracks().forEach(t => t.stop())
  stream = null
  landmarker?.close?.()
  landmarker = null
})
</script>

<template>
  <!-- 力場指示圈：標出手勢作用在畫面上的哪個位置、目前是推還是吸 -->
  <div
    v-if="active"
    class="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors"
    :class="active.pull ? 'border-accent-1 bg-accent-1/10' : 'border-pre-800/60'"
    :style="{
      left: `${active.x}px`,
      top: `${active.y}px`,
      width: `${active.r * 2}px`,
      height: `${active.r * 2}px`,
    }"
  ></div>

  <div class="pointer-events-none fixed bottom-5 left-5 z-50 flex flex-col items-start gap-2">
    <!-- 自己的預覽。鏡像顯示，這樣舉左手畫面上就是左邊，不會有「反過來」的錯覺。 -->
    <div class="relative overflow-hidden rounded border border-accent-1/60 bg-black/60 backdrop-blur-md">
      <video
        ref="videoRef"
        class="block h-[135px] w-[180px] -scale-x-100 object-cover"
        playsinline
        muted
      ></video>
      <span
        v-if="!ready"
        class="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-pre-800/80"
      >
        啟動中…
      </span>
    </div>

    <p class="max-w-[220px] font-mono text-[11px] leading-[1.5] tracking-[0.1em] text-pre-800/80">
      {{ hint }}<br>
      <span class="text-pre-800/50">偵測到 {{ handCount }} 隻手 · Esc 離開</span>
    </p>
  </div>
</template>
