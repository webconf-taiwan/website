<script setup>
// 首頁桌機的「影片版」背景 —— 沒有可用 WebGPU 的電腦用它取代 HomeField 那張即時粒子 canvas。
//
// ─── 為什麼要有這一版 ──────────────────────────────────────────────────────
// 沒有 WebGPU 時粒子套件會退到 canvas2d 的 CPU 引擎：物理全在主執行緒算，而且沒有 morph
//（收攏成 side.png、講者人像、菌落場那些變形本來就做不出來，畫面只剩自由場在飄）。
// 實測 Snapdragon X 這類 Windows ARM 筆電整頁卡到不能用。
// 既然這些機器看到的本來就只有「自由場」，就把它事先錄成一段循環影片：
// 解碼走硬體，幾乎不吃 CPU / GPU，畫面還比即時算的密。
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
//
// ─── 其他區塊 ──────────────────────────────────────────────────────────────
// PL.III 講者改用手機版那套靜態點畫圖（HomeSpeakerPortrait forceStatic，見 Speaker.vue）；
// 其餘區塊背後就是這段影片一路循環（桌機那幾區本來就沒有底色）。

const VIDEO_WEBM = '/videos/hero-field-biolum.webm'
const VIDEO_MP4 = '/videos/hero-field-biolum.mp4'
const POSTER_SRC = '/videos/hero-field-biolum-poster.jpg'
// loading 最多等影片這麼久 —— 網路慢就先收 loading、讓 poster 頂著，影片載到再自己播
const INTRO_WAIT_MS = 3000

const { trackIntro } = useSiteIntro()
const { idle } = useParticleStage()

const videoRef = ref(null)
let reducedMotion = false

// 分頁在背景、或使用者閒置太久（跟粒子同一個門檻，見 useParticleStage）就暫停，省電
function sync () {
  const v = videoRef.value
  if (!v) return
  if (reducedMotion || document.hidden || idle.value) v.pause()
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
  sync()
  trackIntro(waitFirstFrame())
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', sync)
})

// 跟 HomeField 同一個介面。backend 留空 = hero 右下角只顯示「simulation · live」。
// 互動彩蛋的 pushAt / gatherAt 不提供（呼叫端是 ?. 呼叫）。
defineExpose({ backend: ref('') })
</script>

<template>
  <video
    ref="videoRef"
    :poster="assetUrl(POSTER_SRC)"
    aria-hidden="true"
    muted
    loop
    playsinline
    preload="auto"
    disablepictureinpicture
    class="pointer-events-none fixed inset-0 z-0 block size-full object-cover"
  >
    <!-- 瀏覽器照順序挑第一個能播的：webm 比較小，放前面 -->
    <source :src="assetUrl(VIDEO_WEBM)" type="video/webm">
    <source :src="assetUrl(VIDEO_MP4)" type="video/mp4">
  </video>
</template>
