<script setup>
// 首頁桌機的「影片版」粒子背景 —— 沒有可用 WebGPU 的電腦用它代替 HomeField 那張即時粒子 canvas。
//
// ─── 為什麼要有這一版 ──────────────────────────────────────────────────────
// 沒有 WebGPU 時粒子套件會退到 canvas2d 的 CPU 引擎：物理全在主執行緒算，而且沒有 morph
//（收攏成 side.png、講者人像、菌落場那些變形本來就做不出來，畫面只剩自由場在飄）。
// 實測 Snapdragon X 這類 Windows ARM 筆電整頁卡到不能用。
// 既然這些機器看到的本來就只有「自由場」，就把它事先錄成一段循環影片：
// 解碼走硬體，幾乎不吃 CPU / GPU。
//
// ─── 放在哪 ────────────────────────────────────────────────────────────────
// ⚠️ 不是整頁 fixed：自由場一路鋪在 PL.II～PL.V 的文字後面太亂（粒子版那幾區是收攏成形狀的，
// 留得出空白；影片沒有）。所以只放在原本就是「自由場」的兩段，各自一支（見 pages/index.vue）：
//   · PL.I hero
//   · 票券 → 贊助 → Code of Conduct（含 CoC 的毛玻璃，backdrop-blur 會把它糊掉）
// 其餘區塊就是頁面底色。
// 這個元件是 absolute 鋪滿「父層」，影片本身 sticky、一個畫面高 —— 父層很高（票券那段）時
// 影片不會被 object-cover 放大好幾倍，而是在這段範圍內跟著畫面走、離開這段就跟著捲走。
// 外層用 overflow-clip（不是 hidden）：hidden 會變成捲動容器，sticky 就黏不住了；
// clip 只裁切，也擋住父層比一個畫面矮時（hero）影片溢出到下一區。
//
// 窄視窗（< 1024）則是 fixed 一支（prop fixed），對應原本 HomeMobileField 那張 fixed canvas：
// 窄視窗的 PL.II～PL.V 本來就鋪了不透明底色（見 pages/index.vue），中間那段自然被蓋住，
// 所以不必拆成兩支。只在 hero 與票券～CoC 看得到時才播（activeIn），中間那段暫停。
//
// ─── 這支影片怎麼來的 ──────────────────────────────────────────────────────
// 在有 WebGPU 的機器上開 /?hero-animation=2（Bioluminescent Drift 深海流光），1920×1080，
// 等開場散開穩定（約 60 秒）後用 canvas.captureStream 錄 33 秒，再用 ffmpeg：
//   · 頭尾做 1.5 秒交叉淡化 → 30 秒無縫循環（最後一幀 ≈ 第一幀）
//   · 縮到 1600 寬、24fps，出兩個格式，<video> 先給 webm、不支援的瀏覽器才用 mp4：
//       webm  VP9 two-pass 3Mbps（約 11MB）—— 優先
//       mp4   H.264 CRF 32（約 14MB）—— 後備
// ⚠️ VP9 不能用 CRF 模式：細小粒子點滿畫面，CRF 42 反而 31MB。要用指定位元率的 two-pass。
//    AV1 實測也比 mp4 大，所以沒出。
// 要換效果就照上面重錄，兩個檔名跟著改。

const props = defineProps({
  // 首屏那一支（hero）：一進站就載，而且 loading 要等它出第一幀。
  // 其他的（票券那段）等快進畫面才載 —— 同一支影片，到那時通常已經在快取裡了。
  intro: {
    type: Boolean,
    default: false
  },
  // 鋪滿整個畫面、fixed 不動（窄視窗用）。預設是 absolute 鋪滿父層、影片 sticky（桌機用）。
  fixed: {
    type: Boolean,
    default: false
  },
  // fixed 時：這些區塊有任一個在畫面上才播。不給 = 看自己（absolute 版就是這樣）。
  activeIn: {
    type: Array,
    default: () => []
  }
})

const VIDEO_WEBM = '/videos/hero-field-biolum.webm'
const VIDEO_MP4 = '/videos/hero-field-biolum.mp4'
const POSTER_SRC = '/videos/hero-field-biolum-poster.jpg'
// loading 最多等影片這麼久 —— 網路慢就先收 loading、讓 poster 頂著，影片載到再自己播
const INTRO_WAIT_MS = 3000

const { trackIntro } = useSiteIntro()
const { idle } = useParticleStage()

const rootRef = ref(null)
const videoRef = ref(null)
let reducedMotion = false
const visible = new Set()           // 目前在畫面上的觀察對象
let io = null

// 看得到、分頁在前景、使用者沒閒置太久（跟粒子同一個門檻，見 useParticleStage）才播
function sync () {
  const v = videoRef.value
  if (!v) return
  if (reducedMotion || !visible.size || document.hidden || idle.value) v.pause()
  else v.play().catch(() => {})
}

function waitFirstFrame () {
  const v = videoRef.value
  if (!v || v.readyState >= 2) return Promise.resolve()
  return Promise.race([
    new Promise(resolve => v.addEventListener('loadeddata', resolve, { once: true })),
    new Promise(resolve => setTimeout(resolve, INTRO_WAIT_MS)),
  ])
}

watch(idle, sync)

onMounted(() => {
  // prefers-reduced-motion：只留 poster（第一幀），不播
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.addEventListener('visibilitychange', sync)
  io = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)
    sync()
  }, { rootMargin: '25% 0px' })   // 快進畫面就先開始載／播，進來時已經在動
  const targets = props.activeIn.length
    ? props.activeIn.map(sel => document.querySelector(sel)).filter(Boolean)
    : [rootRef.value]
  targets.forEach(el => io.observe(el))
  if (props.intro) trackIntro(waitFirstFrame())
})

onBeforeUnmount(() => {
  io?.disconnect()
  document.removeEventListener('visibilitychange', sync)
})
</script>

<template>
  <div
    ref="rootRef"
    aria-hidden="true"
    class="pointer-events-none inset-0 z-0"
    :class="fixed ? 'fixed' : 'absolute overflow-clip'"
  >
    <video
      ref="videoRef"
      :poster="assetUrl(POSTER_SRC)"
      muted
      loop
      playsinline
      :preload="intro ? 'auto' : 'none'"
      disablepictureinpicture
      class="block w-full object-cover"
      :class="fixed ? 'h-full' : 'sticky top-0 h-screen'"
    >
      <!-- 瀏覽器照順序挑第一個能播的：webm 比較小，放前面 -->
      <source :src="assetUrl(VIDEO_WEBM)" type="video/webm">
      <source :src="assetUrl(VIDEO_MP4)" type="video/mp4">
    </video>
  </div>
</template>
