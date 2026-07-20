<script setup>
// 虛擬綠幕 — 瀏覽器即時人像分割換背景（不用實體綠幕）。
// 相機 → MediaPipe ImageSegmenter（Selfie，即時 ~30fps）取人像遮罩 → 2D canvas 合成到選定背景
// → 可拍照下載 PNG、或錄影下載 webm。wasm/模型自架於 /public/mediapipe（同套件版本免對齊）。
// 全程在瀏覽器，影像不上傳。實作說明見 docs/greenscreen.md。
useHead({ title: '虛擬綠幕 · Webconf' })

const videoRef = ref(null)     // 相機來源（隱藏）
const outputRef = ref(null)    // 合成輸出 canvas（顯示 / 拍照 / 錄影來源）
const bgFileInput = ref(null)
const bgVideoFileInput = ref(null)
const bgVideoRef = ref(null)   // 影片背景來源（隱藏、loop）

const state = ref('idle')      // idle | starting | live | error
const errorMsg = ref('')
const recording = ref(false)
const withAudio = ref(false)   // 錄影是否含麥克風（預設關，開了才要麥克風權限）
const bgIndex = ref(0)
const fps = ref(0)

// 遮罩前景判定：confidenceMasks[0] 為前景機率。若某些裝置結果相反，把這個設 true 即可翻轉。
const INVERT_MASK = false

// 背景庫：程序繪製（免外部素材，開箱即用）。要加圖片/影片背景見 docs/greenscreen.md。
const BACKGROUNDS = [
  { name: '極光', type: 'gradient', colors: ['#0f2027', '#203a43', '#2c5364'] },
  { name: '霓虹', type: 'gradient', colors: ['#3a1c71', '#d76d77', '#ffaf7b'] },
  { name: '品牌藍', type: 'solid', color: '#110AFF' },
  { name: '純白', type: 'solid', color: '#f5f5f7' },
  { name: '動態光暈', type: 'animated' },
  { name: '原背景模糊', type: 'blur' },
  { name: '上傳圖片', type: 'upload' },
  { name: '上傳影片', type: 'uploadVideo' },
  // 要放預設影片背景：把 mp4 丟進 public/greenscreen/，在這裡加
  // { name:'場景A', type:'video', src:'/greenscreen/scene-a.mp4' }（見 docs/greenscreen.md §4）
]

// --- 非響應式執行期物件（不需觸發 render，故不用 ref）---
let stream = null
let segmenter = null
let running = false
let tsCounter = 0
let recorder = null
let recChunks = []
let uploadedBg = null      // HTMLImageElement
let uploadedBgUrl = null
let bgVideoReady = false   // 影片背景是否已可繪製
let uploadedVideoUrl = null
let onVis = null
// 離屏工作 canvas（一次建立、依影片尺寸調整）
let maskCv = null, maskCtx = null      // 遮罩（模型解析度，如 256×256）
let personCv = null, personCtx = null  // 只留人像的圖層（影片尺寸）
// fps 統計
let frameCount = 0, fpsClock = 0

function pickMime() {
  const cands = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4']
  for (const m of cands) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m
  }
  return ''
}

function ensureWorkCanvases() {
  if (!maskCv) { maskCv = document.createElement('canvas'); maskCtx = maskCv.getContext('2d', { willReadFrequently: true }) }
  if (!personCv) { personCv = document.createElement('canvas'); personCtx = personCv.getContext('2d') }
}

// cover-fit 繪製（等比填滿、置中裁切）
function drawCover(ctx, src, sw, sh, w, h) {
  const sr = sw / sh, dr = w / h
  let dw, dh, dx, dy
  if (sr > dr) { dh = h; dw = h * sr; dx = (w - dw) / 2; dy = 0 }
  else { dw = w; dh = w / sr; dx = 0; dy = (h - dh) / 2 }
  ctx.drawImage(src, dx, dy, dw, dh)
}

function drawBackground(ctx, w, h, tMs) {
  const bg = BACKGROUNDS[bgIndex.value]
  if (bg.type === 'solid') {
    ctx.fillStyle = bg.color; ctx.fillRect(0, 0, w, h)
  } else if (bg.type === 'gradient') {
    const g = ctx.createLinearGradient(0, 0, w, h)
    bg.colors.forEach((c, i) => g.addColorStop(i / (bg.colors.length - 1), c))
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  } else if (bg.type === 'animated') {
    ctx.fillStyle = '#05060a'; ctx.fillRect(0, 0, w, h)
    const t = tMs / 1000
    const blobs = [
      { c: '#3a1c71', x: 0.3 + 0.2 * Math.sin(t * 0.6), y: 0.35 + 0.15 * Math.cos(t * 0.5) },
      { c: '#0aa1ff', x: 0.7 + 0.18 * Math.cos(t * 0.4), y: 0.6 + 0.2 * Math.sin(t * 0.7) },
      { c: '#d76d77', x: 0.5 + 0.25 * Math.sin(t * 0.3 + 1), y: 0.5 + 0.2 * Math.cos(t * 0.45) },
    ]
    ctx.globalCompositeOperation = 'lighter'
    for (const b of blobs) {
      const cx = b.x * w, cy = b.y * h, r = Math.max(w, h) * 0.5
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      g.addColorStop(0, b.c); g.addColorStop(1, 'transparent')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    }
    ctx.globalCompositeOperation = 'source-over'
  } else if (bg.type === 'blur') {
    const v = videoRef.value
    ctx.save(); ctx.filter = 'blur(18px)'
    drawCover(ctx, v, v.videoWidth, v.videoHeight, w, h)
    ctx.restore()
  } else if (bg.type === 'upload') {
    if (uploadedBg) drawCover(ctx, uploadedBg, uploadedBg.naturalWidth, uploadedBg.naturalHeight, w, h)
    else { ctx.fillStyle = '#111'; ctx.fillRect(0, 0, w, h) }
  } else if (bg.type === 'uploadVideo' || bg.type === 'video') {
    const bv = bgVideoRef.value
    if (bv && bgVideoReady && bv.videoWidth) drawCover(ctx, bv, bv.videoWidth, bv.videoHeight, w, h)
    else { ctx.fillStyle = '#111'; ctx.fillRect(0, 0, w, h) }
  }
}

function renderFrame(now) {
  if (!running) return
  const v = videoRef.value, oc = outputRef.value
  if (v && oc && v.videoWidth) {
    const vw = v.videoWidth, vh = v.videoHeight
    if (oc.width !== vw || oc.height !== vh) {
      oc.width = vw; oc.height = vh
      ensureWorkCanvases()
      personCv.width = vw; personCv.height = vh
    }
    const octx = oc.getContext('2d')
    try {
      // 1) 分割：時間戳必須嚴格遞增（整數 ms）
      const ts = Math.max(tsCounter + 1, Math.round(now || performance.now()))
      tsCounter = ts
      const res = segmenter.segmentForVideo(v, ts)
      const mask = res.confidenceMasks?.[0]

      // 2) 背景
      drawBackground(octx, vw, vh, ts)

      // 3) 人像圖層：畫相機幀 → 用遮罩 alpha 做 destination-in（放大時的插值＝柔邊）
      if (mask) {
        const mw = mask.width, mh = mask.height
        const conf = mask.getAsFloat32Array()
        maskCv.width = mw; maskCv.height = mh
        const img = maskCtx.createImageData(mw, mh)
        for (let i = 0; i < conf.length; i++) {
          let a = conf[i]; if (INVERT_MASK) a = 1 - a
          img.data[i * 4 + 3] = a * 255      // rgb 留 0，只用 alpha
        }
        maskCtx.putImageData(img, 0, 0)

        personCtx.clearRect(0, 0, vw, vh)
        personCtx.drawImage(v, 0, 0, vw, vh)
        personCtx.save()
        personCtx.globalCompositeOperation = 'destination-in'
        personCtx.imageSmoothingEnabled = true
        personCtx.drawImage(maskCv, 0, 0, vw, vh)   // 256→影片尺寸，平滑放大＝柔化邊緣
        personCtx.restore()

        // 4) 人像鏡像（自拍感）疊到背景上；背景不鏡像
        octx.save()
        octx.translate(vw, 0); octx.scale(-1, 1)
        octx.drawImage(personCv, 0, 0)
        octx.restore()
      }
      res.close?.()
    } catch (e) {
      // 單幀失敗不中斷迴圈
    }

    // fps
    frameCount++
    if (!fpsClock) fpsClock = now || performance.now()
    const dt = (now || performance.now()) - fpsClock
    if (dt >= 500) { fps.value = Math.round((frameCount * 1000) / dt); frameCount = 0; fpsClock = now || performance.now() }
  }
  scheduleNext()
}

function scheduleNext() {
  const v = videoRef.value
  if (!running || !v) return
  if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(renderFrame)
  else requestAnimationFrame(renderFrame)
}

async function createSegmenter() {
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
  } catch (e) {
    return await ImageSegmenter.createFromOptions(fileset, opts('CPU'))   // 退回 CPU
  }
}

async function start() {
  if (state.value === 'starting' || state.value === 'live') return
  state.value = 'starting'
  errorMsg.value = ''
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('此裝置 / 瀏覽器不支援相機')
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: withAudio.value,
    })
    if (!segmenter) segmenter = await createSegmenter()
    const v = videoRef.value
    v.srcObject = stream
    await v.play()
    running = true
    state.value = 'live'
    scheduleNext()
  } catch (e) {
    errorMsg.value = (e && e.message) || String(e)
    state.value = 'error'
    stopStream()
  }
}

function stopStream() {
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
}

function stop() {
  running = false
  if (recording.value) stopRecording()
  stopStream()
  state.value = 'idle'
  fps.value = 0
}

function capturePhoto() {
  const oc = outputRef.value
  if (!oc) return
  oc.toBlob((b) => { if (b) downloadBlob(b, 'greenscreen.png') }, 'image/png')
}

function toggleRecord() {
  recording.value ? stopRecording() : startRecording()
}
function startRecording() {
  const oc = outputRef.value
  if (!oc || typeof MediaRecorder === 'undefined') { errorMsg.value = '此瀏覽器不支援錄影'; return }
  const cs = oc.captureStream(30)
  if (withAudio.value && stream) stream.getAudioTracks().forEach(t => cs.addTrack(t))
  const mime = pickMime()
  recChunks = []
  recorder = new MediaRecorder(cs, mime ? { mimeType: mime } : undefined)
  recorder.ondataavailable = (e) => { if (e.data && e.data.size) recChunks.push(e.data) }
  recorder.onstop = () => {
    const blob = new Blob(recChunks, { type: mime || 'video/webm' })
    const ext = (mime || '').includes('mp4') ? 'mp4' : 'webm'
    downloadBlob(blob, `greenscreen.${ext}`)
  }
  recorder.start()
  recording.value = true
}
function stopRecording() {
  try { recorder?.stop() } catch { /* noop */ }
  recording.value = false
}

function onBgFile(ev) {
  const f = ev.target?.files?.[0]
  if (!f || !f.type.startsWith('image/')) return
  if (uploadedBgUrl) URL.revokeObjectURL(uploadedBgUrl)
  uploadedBgUrl = URL.createObjectURL(f)
  const img = new Image()
  img.onload = () => { uploadedBg = img; bgIndex.value = BACKGROUNDS.findIndex(b => b.type === 'upload') }
  img.src = uploadedBgUrl
  if (ev.target) ev.target.value = ''
}
function onBgVideoFile(ev) {
  const f = ev.target?.files?.[0]
  if (!f || !f.type.startsWith('video/')) return
  if (uploadedVideoUrl) URL.revokeObjectURL(uploadedVideoUrl)
  uploadedVideoUrl = URL.createObjectURL(f)
  const bv = bgVideoRef.value
  bgVideoReady = false
  if (bv) {
    bv.src = uploadedVideoUrl
    bv.loop = true; bv.muted = true
    bv.onloadeddata = () => { bgVideoReady = true }
    bv.play().catch(() => { /* 需使用者互動已滿足（點了按鈕） */ })
  }
  bgIndex.value = BACKGROUNDS.findIndex(b => b.type === 'uploadVideo')
  if (ev.target) ev.target.value = ''
}
function selectBg(i) {
  const b = BACKGROUNDS[i]
  if (b.type === 'upload') { bgFileInput.value?.click(); return }
  if (b.type === 'uploadVideo') { bgVideoFileInput.value?.click(); return }
  bgIndex.value = i
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  onVis = () => { /* 分頁隱藏時 rVFC 本就會停；此處保留掛勾供未來擴充 */ }
  document.addEventListener('visibilitychange', onVis)
})
onBeforeUnmount(() => {
  running = false
  if (recording.value) stopRecording()
  stopStream()
  if (segmenter) { try { segmenter.close() } catch { /* noop */ } segmenter = null }
  if (uploadedBgUrl) URL.revokeObjectURL(uploadedBgUrl)
  if (uploadedVideoUrl) URL.revokeObjectURL(uploadedVideoUrl)
  if (onVis) document.removeEventListener('visibilitychange', onVis)
})
</script>

<template>
  <div class="min-h-screen bg-black text-txt-white">
    <section class="container py-16 md:py-24">
      <h1 class="text-zh-display-2 mb-2">
        虛擬綠幕
      </h1>
      <p class="text-zh-body-2 mb-8 max-w-2xl text-neutral-400">
        開相機，瀏覽器即時把你去背並換到選定的背景上——不用實體綠幕。可拍照下載，或錄影下載影片。全程在你的裝置上完成，影像不上傳伺服器。
      </p>

      <div class="relative overflow-hidden rounded-2xl bg-[#0a0a0c]">
        <!-- 隱藏的相機來源 -->
        <video ref="videoRef" class="hidden" playsinline muted />
        <!-- 隱藏的影片背景來源（loop） -->
        <video ref="bgVideoRef" class="hidden" playsinline muted loop />
        <!-- 合成輸出 -->
        <canvas ref="outputRef" class="block h-[64vh] min-h-[360px] w-full object-contain" />

        <!-- 疊層：非 live 狀態 -->
        <div
          v-if="state !== 'live'"
          class="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center"
        >
          <template v-if="state === 'idle'">
            <button class="rounded-full bg-white px-6 py-3 text-zh-body-1 text-black transition hover:bg-neutral-200" @click="start">
              開啟相機
            </button>
            <label class="flex cursor-pointer items-center gap-2 font-mono text-xs tracking-widest text-neutral-400">
              <input v-model="withAudio" type="checkbox" class="accent-white"> 錄影含麥克風聲音
            </label>
          </template>
          <template v-else-if="state === 'starting'">
            <p class="text-zh-body-1">
              啟動相機與分割模型中…
            </p>
            <p class="max-w-sm font-mono text-xs tracking-widest text-neutral-500">
              首次載入需下載分割模型與 wasm（約 11MB），之後瀏覽器會快取。
            </p>
          </template>
          <template v-else-if="state === 'error'">
            <p class="text-zh-body-1 text-red-400">
              {{ errorMsg }}
            </p>
            <button class="rounded-full border border-neutral-600 px-6 py-3 transition hover:bg-white/5" @click="start">
              重試
            </button>
          </template>
        </div>

        <!-- live 狀態：fps -->
        <p v-if="state === 'live'" class="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 font-mono text-xs tracking-widest text-neutral-300">
          {{ fps }} fps
        </p>
      </div>

      <!-- 背景選擇 -->
      <div v-if="state === 'live'" class="mt-4 flex flex-wrap gap-2">
        <button
          v-for="(bg, i) in BACKGROUNDS"
          :key="bg.name"
          class="rounded-full border px-4 py-2 text-sm transition"
          :class="i === bgIndex && bg.type !== 'upload' ? 'border-white bg-white text-black' : 'border-neutral-600 hover:bg-white/5'"
          @click="selectBg(i)"
        >
          {{ bg.name }}
        </button>
        <input ref="bgFileInput" type="file" accept="image/*" class="hidden" @change="onBgFile">
        <input ref="bgVideoFileInput" type="file" accept="video/*" class="hidden" @change="onBgVideoFile">
      </div>

      <!-- 動作列 -->
      <div v-if="state === 'live'" class="mt-4 flex flex-wrap items-center gap-3">
        <button class="rounded-full bg-white px-5 py-2.5 text-sm text-black transition hover:bg-neutral-200" @click="capturePhoto">
          拍照下載
        </button>
        <button
          class="rounded-full px-5 py-2.5 text-sm transition"
          :class="recording ? 'bg-red-500 text-white hover:bg-red-600' : 'border border-neutral-600 hover:bg-white/5'"
          @click="toggleRecord"
        >
          {{ recording ? '停止並下載影片' : '開始錄影' }}
        </button>
        <button class="rounded-full border border-neutral-600 px-5 py-2.5 text-sm transition hover:bg-white/5" @click="stop">
          關閉相機
        </button>
        <span class="font-mono text-xs tracking-widest text-neutral-500">
          影片格式 webm · 建議桌機 Chrome / Edge
        </span>
      </div>
    </section>
  </div>
</template>
