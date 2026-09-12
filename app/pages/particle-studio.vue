<script setup>
// PL. Studio — 粒子靜態圖產生器（內部工具，非公開導覽項目）。
//
// 動機：手機上跑即時粒子模擬（見 Home/SpeakerPortrait.vue 的 CPU fallback）在低階裝置上
// 效果打折，不如直接把「粒子化的結果」做成一張靜態 PNG 帶去手機比對。
// 這頁就是產那張圖的地方：上傳照片 → 用跟正式站相同的取樣/繪製邏輯即時預覽 →
// 調參數找光影 → 下載 PNG。
//
// 取樣（PLImage.prepare）與繪製（renderSpecToCanvas）都是正式站現有邏輯的直接沿用：
//   取樣：public/particle-kit/particle-image.js（重要性採樣 + k-means 量化色盤）
//   繪製：Home/SpeakerPortrait.vue 的 drawPointCloud（CPU 路徑，加法混色）
// 這裡把「取景比例 fit」從取樣結果裡拆出來，改成即時可調的繪製參數（不用重新取樣），
// 因為 fit 只決定點雲在畫布裡的置中縮放，不影響取樣本身。
useSeoMeta({
  title: '粒子產生器 · Webconf',
  description: '把講者照片轉換成粒子點雲，調整取樣與光影參數後下載成靜態 PNG。'
})
defineOgImage('Default', { title: '粒子產生器 · Webconf', description: '把講者照片轉換成粒子點雲，調整取樣與光影參數後下載成靜態 PNG。' })

const { loadParticleKit } = useParticleKit()

const canvasRef = ref(null)

// --- 圖片來源 ----------------------------------------------------------------
// 兩種取樣對象的需求差很多，不是同一組預設值能通吃：
//   講者人像 —— 五官要保留，重點在人臉密度，公版預設就夠。
//   裝飾圖片 —— PL.IV/PL.V 兩隻標本（見 Home/VenueFaqField.vue）是很細的放射狀
//     尖刺紋理，取樣點數不夠會直接糊成一片白霧（那支正式站用到 52000 顆、
//     fit 0.82，見該檔案 SAMPLES/FIT 的長註解），跟人像的 32000/0.86 差很多。
// 切分類只換「快速選圖清單」+ 套一組合理起點，其餘（上傳、調整、下載）共用同一套邏輯。
const CATEGORIES = {
  speaker: { label: '講者人像', preset: { samples: 32000, sampleEdge: 960, fit: 0.86, dotPx: 3.2 } },
  decorative: { label: '裝飾圖片', preset: { samples: 52000, sampleEdge: 960, fit: 0.82, dotPx: 2.6 } }
}
const category = ref('speaker')
const speakerPortraits = ref([])   // 既有講者，快速試效果用
// 既有的裝飾標本（見 Home/VenueFaqField.vue 的 STAGES）。之後有新圖直接加在這裡。
const DECORATIVE_IMAGES = [
  { name: 'Venue 標本', url: '/source_images/venue.png' },
  { name: 'FAQ 標本', url: '/source_images/faq.png' },
  { name: 'Side 標本', url: '/source_images/side.png' }
]
const quickPicks = computed(() => category.value === 'speaker' ? speakerPortraits.value : DECORATIVE_IMAGES)
const uploaded = ref([])           // [{ url, name }]，session 內的上傳清單
const sourceUrl = ref(null)
const sourceName = ref('')

// --- 取樣參數（改了要重新取樣）------------------------------------------------
// ⚠️ 預設值刻意比正式站的手機檔位（16000 點 / 480px 取樣網格）高很多 ——
// 那組是「即時模擬」的效能預算，這裡是離線一次性產圖，換更高的取樣網格與
// 點數幾乎不花什麼代價（k-means / CDF 都是線性掃描，32000 點 + 960px 網格
// 仍在 100ms 內），但對五官細節的差異很明顯（低於 480px 取樣網格會糊成水彩)。
const samples = ref(32000)
const colorsK = ref(7)
const lumaBias = ref(0.6)
const sampleEdge = ref(960)
const seedVal = ref(1926)

// --- 繪製參數（改了只需重畫，不用重新取樣）------------------------------------
// ⚠️ fit 留在 0.86（跟正式站一致），不要拉滿 1.0 —— 講者照片本身就是頂到照片
// 邊界的半身照，fit=1.0 會讓頭髮、肩膀直接貼死畫布邊界，沒有任何呼吸空間，
// 看起來會像「被壓縮」（其實座標沒有變形，contain-fit 一定維持原圖比例，
// 只是留白被吃光了）。
const fit = ref(0.86)
const dotPx = ref(3.2)
const bgMode = ref('black')   // 'black' | 'transparent'
// 預設跟著圖片本身的比例走（置中、不裁切）——只有真的要套講者頭像那個固定
// 正方形觀景框時，才手動切到「正方形」。
const ratioKey = ref('native')
const longEdge = ref(1200)

const RATIOS = [
  { key: 'native', label: '原圖比例（依圖片自動抓）', w: null, h: null },
  { key: 'square', label: '正方形 1:1（頭像框）', w: 1, h: 1 },
  { key: 'portrait34', label: '直式 3:4', w: 3, h: 4 },
  { key: 'story', label: '直式 9:16（限動）', w: 9, h: 16 },
  { key: 'landscape43', label: '橫式 4:3', w: 4, h: 3 },
  { key: 'wide', label: '橫式 16:9', w: 16, h: 9 }
]
// 原圖比例：用取樣結果的 aspect（沒圖之前退回 1:1，避免除以 undefined）
const activeRatio = computed(() => {
  if (ratioKey.value === 'native') {
    const a = spec.value?.aspect || 1
    return { w: a, h: 1 }
  }
  return RATIOS.find(r => r.key === ratioKey.value) || RATIOS[1]
})
const outW = computed(() => activeRatio.value.w >= activeRatio.value.h ? longEdge.value : Math.round(longEdge.value * activeRatio.value.w / activeRatio.value.h))
const outH = computed(() => activeRatio.value.h >= activeRatio.value.w ? longEdge.value : Math.round(longEdge.value * activeRatio.value.h / activeRatio.value.w))

const spec = ref(null)
const loading = ref(false)
const error = ref('')

// --- 繪製：跟 Home/SpeakerPortrait.vue 的 drawPointCloud 同一套 contain-fit +
// 加法混色（'lighter'）邏輯，差別只在這裡直接吃「輸出像素尺寸」，不用管 DPR。
function renderSpecToCanvas (s, canvas, { fitRatio, dot, bg }) {
  const W = canvas.width
  const H = canvas.height
  const ctx = canvas.getContext('2d')

  ctx.globalCompositeOperation = 'source-over'
  if (bg === 'transparent') {
    ctx.clearRect(0, 0, W, H)
  } else {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, H)
  }

  const boxW = W * fitRatio
  const boxH = H * fitRatio
  const scale = Math.min(boxW / s.aspect, boxH)
  const drawW = scale * s.aspect
  const drawH = scale
  const x0 = (W - drawW) / 2
  const y0 = (H - drawH) / 2

  const d = Math.max(0.5, dot)
  const T = s.palette.length

  ctx.globalCompositeOperation = 'lighter'
  for (let t = 0; t < T; t++) {
    ctx.fillStyle = s.palette[t]
    for (let i = 0; i < s.count; i++) {
      if (s.types[i] % T !== t) continue
      ctx.fillRect(x0 + s.px[i] * drawW, y0 + s.py[i] * drawH, d, d)
    }
  }
  ctx.globalCompositeOperation = 'source-over'
}

// ⚠️ canvas 的 width/height 屬性交給模板的 :width/:height 綁定，這裡不再手動指定 ——
// 那兩個屬性同時也是 canvas 作為「replaced element」的內在尺寸（跟 <img> 的
// naturalWidth/Height 是同一回事），CSS 只要給 max-width/max-height 就會自動
// 等比縮放、不會變形。改由 JS 設寬高的舊寫法在 outW/outH 於同一輪改變時
// （例如切換外框比例）會跟畫面的 CSS 框對不齊，變形正是從那裡來的。
// 這裡必須等 nextTick，讓 Vue 先把新的 :width/:height 屬性寫進 DOM
// （那會清空 canvas 內容並重設內在尺寸），再依「當下真正的」canvas.width/height 畫，
// 兩者才不會對不上。
async function draw () {
  await nextTick()
  const canvas = canvasRef.value
  if (!canvas || !spec.value) return
  renderSpecToCanvas(spec.value, canvas, { fitRatio: fit.value, dot: dotPx.value, bg: bgMode.value })
}

async function resample () {
  if (!sourceUrl.value) return
  loading.value = true
  error.value = ''
  try {
    await loadParticleKit()
    spec.value = await window.PLImage.prepare(sourceUrl.value, {
      count: samples.value,
      colors: colorsK.value,
      lumaBias: lumaBias.value,
      sampleEdge: sampleEdge.value,
      seed: seedVal.value
    })
    await draw()
  } catch (e) {
    error.value = e?.message || String(e)
    spec.value = null
  } finally {
    loading.value = false
  }
}

const debouncedResample = useDebounceFn(resample, 200)

watch([samples, colorsK, lumaBias, sampleEdge], () => { debouncedResample() })
watch([fit, dotPx, bgMode, ratioKey, longEdge], () => { draw() })

async function loadFromUrl (url, name) {
  sourceUrl.value = url
  sourceName.value = name
  seedVal.value = 1926
  await resample()
}

// 分類切換／「恢復預設」共用同一組套值邏輯，避免兩處各寫一份會漏改其中一邊。
function applyPreset (cat) {
  const preset = CATEGORIES[cat].preset
  samples.value = preset.samples
  sampleEdge.value = preset.sampleEdge
  fit.value = preset.fit
  dotPx.value = preset.dotPx
}

async function setCategory (cat) {
  if (category.value === cat) return
  category.value = cat
  applyPreset(cat)
  const first = quickPicks.value[0]
  if (first) await loadFromUrl(first.url, first.name)
}

function resetPreset () {
  applyPreset(category.value)
}

// ⚠️ canvas 的 :width/:height 是綁在 outW/outH（見上面 activeRatio）——原圖比例模式下
// 那組值是從 spec.aspect 算的，spec 一變 null 就退回 1:1，但「目前這張圖剛好也是
// 1:1」（例如任何一位講者）時 outW/outH 不會變，屬性不變就不會觸發瀏覽器清空
// canvas，畫面會卡著上一張的殘影，卻已經看不到任何「已選圖片」的痕跡（誤導使用者
// 以為還在顯示目前的圖）。不能只靠屬性變化側面清空，這裡直接清乾淨。
function clearCanvasView () {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
}

// 若正在畫面上的就是這張，清掉來源、規格與畫面三者一起下車，不留殘影也不留假下載按鈕。
function dropIfShown (url) {
  if (sourceUrl.value !== url) return
  sourceUrl.value = null
  spec.value = null
  clearCanvasView()
}

// 上傳清單只是 session 內的暫存，留著沒在用的 blob URL 純粹是浪費記憶體 ——
// 超過上限就把最舊的擠掉（FIFO），不是不給傳，是不讓清單無限長。
const MAX_UPLOADS = 12

function onFiles (ev) {
  const files = Array.from(ev.target?.files || []).filter(f => f.type.startsWith('image/'))
  if (ev.target) ev.target.value = ''
  if (!files.length) return
  const added = files.map(f => ({ url: URL.createObjectURL(f), name: f.name }))
  uploaded.value.push(...added)
  while (uploaded.value.length > MAX_UPLOADS) {
    const evicted = uploaded.value.shift()
    dropIfShown(evicted.url)
    URL.revokeObjectURL(evicted.url)
  }
  loadFromUrl(added[0].url, added[0].name)
}

function removeUploaded (i) {
  const u = uploaded.value[i]
  if (!u) return
  dropIfShown(u.url)
  URL.revokeObjectURL(u.url)
  uploaded.value.splice(i, 1)
}

function clearUploaded () {
  uploaded.value.forEach((u) => {
    dropIfShown(u.url)
    URL.revokeObjectURL(u.url)
  })
  uploaded.value = []
}

async function reroll () {
  if (!sourceUrl.value) return
  seedVal.value = Math.floor(Math.random() * 1e6)
  await resample()
}

// 檔名裡塞關鍵參數 —— 這頁的用法就是同一張圖一次調出好幾版比較，
// 只有寬高的話幾版檔名會撞在一起（瀏覽器自動加 (1)(2)，事後完全認不出哪版是哪版）。
function slugify (s) {
  return String(s).replace(/\.[a-z0-9]+$/i, '').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9一-鿿_-]+/g, '')
}

function download () {
  const canvas = canvasRef.value
  if (!canvas || !spec.value) return
  canvas.toBlob((blob) => {
    if (!blob) return
    const base = slugify(sourceName.value || 'particle') || 'particle'
    const params = [
      `${Math.round(samples.value / 1000)}k`,
      `fit${Math.round(fit.value * 100)}`,
      `dot${dotPx.value.toFixed(1).replace('.', '_')}`,
      bgMode.value
    ].join('-')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `particle-${base}-${outW.value}x${outH.value}-${params}.png`
    a.click()
    URL.revokeObjectURL(a.href)
  }, 'image/png')
}

onMounted(async () => {
  const mod = await import('~/constants/data/speakers.json')
  speakerPortraits.value = (mod.default?.items || [])
    .filter(s => s.portrait)
    .map(s => ({ name: s.name, url: s.portrait }))
})

onBeforeUnmount(() => {
  uploaded.value.forEach(u => URL.revokeObjectURL(u.url))
})
</script>

<template>
  <div class="min-h-screen bg-black text-txt-white">
    <section class="container py-12 md:py-20">
      <h1 class="mb-2 text-3xl font-bold md:text-4xl">
        粒子產生器
      </h1>
      <p class="mb-8 max-w-2xl text-sm text-neutral-400 md:text-base">
        上傳講者照片，即時看到轉成粒子點雲的效果；調整取樣、色彩、光影參數找到最好看的一版，
        再下載成靜態 PNG 帶去手機上比對真實顯示效果。全程在瀏覽器裡處理，圖片不會上傳到伺服器。
      </p>

      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <!-- 左：選圖 + 預覽 + 輸出 -->
        <div>
          <!-- 兩種取樣對象的預設參數差很多（見上面 CATEGORIES 註解），
               切分類會順便套一組合理起點，不用每次手動調。 -->
          <div class="mb-3 inline-flex rounded-full border border-neutral-700 p-1">
            <button
              v-for="(c, key) in CATEGORIES"
              :key="key"
              type="button"
              class="rounded-full px-4 py-1.5 text-sm transition"
              :class="category === key ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'"
              @click="setCategory(key)"
            >
              {{ c.label }}
            </button>
          </div>

          <div class="mb-3 flex flex-wrap gap-2">
            <button
              v-for="p in quickPicks"
              :key="p.url"
              type="button"
              class="h-14 w-14 overflow-hidden rounded-lg border-2 transition"
              :class="sourceUrl === p.url ? 'border-white' : 'border-neutral-700 hover:border-neutral-400'"
              :title="p.name"
              @click="loadFromUrl(p.url, p.name)"
            >
              <img :src="p.url" :alt="p.name" class="h-full w-full object-cover">
            </button>

            <button
              v-for="(u, i) in uploaded"
              :key="u.url"
              type="button"
              class="relative h-14 w-14 overflow-hidden rounded-lg border-2 transition"
              :class="sourceUrl === u.url ? 'border-white' : 'border-neutral-700 hover:border-neutral-400'"
              :title="u.name"
              @click="loadFromUrl(u.url, u.name)"
            >
              <img :src="u.url" :alt="u.name" class="h-full w-full object-cover">
              <span
                class="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-black/70 text-xs leading-none text-neutral-300 hover:text-white"
                @click.stop="removeUploaded(i)"
              >×</span>
            </button>

            <label class="flex h-14 w-14 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-neutral-600 text-2xl leading-none text-neutral-400 transition hover:border-neutral-400 hover:text-white">
              +
              <input type="file" accept="image/*" multiple class="hidden" @change="onFiles">
            </label>
          </div>
          <!-- 上傳清單只是 session 暫存（見 MAX_UPLOADS），提供手動清空的路，
               不用等它自己滿了被擠掉或重整頁面才釋放記憶體。 -->
          <button
            v-if="uploaded.length"
            type="button"
            class="mb-3 text-xs text-neutral-500 underline decoration-neutral-700 underline-offset-2 hover:text-white"
            @click="clearUploaded"
          >
            清除全部上傳（{{ uploaded.length }}／最多 {{ MAX_UPLOADS }}）
          </button>

          <!-- ⚠️ 外層 flex justify-center 只負責置中；真正決定畫面比例的是 canvas
               自己的 width/height 屬性（內在尺寸，等同 <img> 的 naturalWidth/Height）。
               內層 div 用 inline-block 讓自己縮到跟 canvas 顯示尺寸一樣大，疊在上面的
               提示文字／loading 徽章才會準確蓋在照片範圍內，不會跟著撐滿整欄寬度。 -->
          <div class="flex justify-center">
            <div class="relative inline-block max-w-full overflow-hidden rounded-2xl bg-[#0a0a0c]">
              <canvas ref="canvasRef" :width="outW" :height="outH" class="block max-h-[70vh] max-w-full" />
              <p v-if="!sourceUrl" class="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-neutral-500">
                先選一張講者照片或上傳圖片
              </p>
              <p v-if="loading" class="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 font-mono text-xs tracking-widest text-neutral-300">
                取樣中…
              </p>
            </div>
          </div>
          <p v-if="error" class="mt-2 text-sm text-red-400">
            {{ error }}
          </p>

          <div class="mt-4 flex flex-wrap items-center gap-3">
            <button
              class="rounded-full bg-white px-5 py-2.5 text-sm text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!spec"
              @click="download"
            >
              下載 PNG
            </button>
            <button
              class="rounded-full border border-neutral-600 px-5 py-2.5 text-sm transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!sourceUrl"
              @click="reroll"
            >
              換一批點
            </button>
            <span v-if="spec" class="font-mono text-xs tracking-widest text-neutral-500">
              {{ spec.count.toLocaleString() }} 點 · {{ outW }}×{{ outH }}px
            </span>
          </div>

          <div v-if="spec" class="mt-3 flex items-center gap-1.5">
            <span class="mr-1 font-mono text-xs tracking-widest text-neutral-500">配色</span>
            <span v-for="c in spec.palette" :key="c" class="h-4 w-4 rounded-full border border-white/10" :style="{ background: c }" />
          </div>
        </div>

        <!-- 右：控制面板 -->
        <div class="space-y-6 rounded-2xl border border-neutral-800 p-5">
          <div class="flex items-center justify-between">
            <span class="font-mono text-xs tracking-widest text-neutral-500">
              {{ CATEGORIES[category].label }}預設
            </span>
            <button
              type="button"
              class="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300 transition hover:bg-white/5"
              @click="resetPreset"
            >
              恢復預設
            </button>
          </div>

          <!-- open 預設展開 —— 桌機看起來跟以前一樣全部攤開，手機才用得到收合。 -->
          <details open class="group">
            <summary class="mb-3 flex cursor-pointer list-none items-center justify-between font-mono text-xs tracking-widest text-neutral-500 [&::-webkit-details-marker]:hidden">
              取樣（改了會重新取樣）
              <span class="text-neutral-600 transition-transform group-open:rotate-180">⌄</span>
            </summary>

            <div class="mb-4">
              <div class="mb-1 flex items-center justify-between text-sm text-neutral-300">
                <span>取樣點數</span>
                <span class="font-mono text-xs text-neutral-500">{{ samples.toLocaleString() }}</span>
              </div>
              <input v-model.number="samples" type="range" min="2000" max="60000" step="500" class="w-full accent-white">
            </div>

            <div class="mb-4">
              <div class="mb-1 flex items-center justify-between text-sm text-neutral-300">
                <span>色彩量化數</span>
                <span class="font-mono text-xs text-neutral-500">{{ colorsK }}</span>
              </div>
              <input v-model.number="colorsK" type="range" min="2" max="7" step="1" class="w-full accent-white">
            </div>

            <div class="mb-4">
              <div class="mb-1 flex items-center justify-between text-sm text-neutral-300">
                <span>亮度加權</span>
                <span class="font-mono text-xs text-neutral-500">{{ lumaBias.toFixed(2) }}</span>
              </div>
              <input v-model.number="lumaBias" type="range" min="0" max="1" step="0.05" class="w-full accent-white">
            </div>

            <div>
              <div class="mb-1 flex items-center justify-between text-sm text-neutral-300">
                <span>取樣解析度上限</span>
                <span class="font-mono text-xs text-neutral-500">{{ sampleEdge }}px</span>
              </div>
              <input v-model.number="sampleEdge" type="range" min="240" max="1440" step="40" class="w-full accent-white">
            </div>
          </details>

          <details open class="group">
            <summary class="mb-3 flex cursor-pointer list-none items-center justify-between font-mono text-xs tracking-widest text-neutral-500 [&::-webkit-details-marker]:hidden">
              構圖（即時重畫）
              <span class="text-neutral-600 transition-transform group-open:rotate-180">⌄</span>
            </summary>

            <div class="mb-4">
              <div class="mb-1 flex items-center justify-between text-sm text-neutral-300">
                <span>取景比例 fit</span>
                <span class="font-mono text-xs text-neutral-500">{{ fit.toFixed(2) }}</span>
              </div>
              <input v-model.number="fit" type="range" min="0.5" max="1" step="0.01" class="w-full accent-white">
            </div>

            <label class="mb-4 block text-sm text-neutral-300">
              外框比例
              <select v-model="ratioKey" class="mt-1 w-full rounded-lg border border-neutral-700 bg-black px-3 py-2 text-sm">
                <option v-for="r in RATIOS" :key="r.key" :value="r.key">
                  {{ r.label }}
                </option>
              </select>
            </label>

            <div>
              <div class="mb-1 flex items-center justify-between text-sm text-neutral-300">
                <span>輸出長邊</span>
                <span class="font-mono text-xs text-neutral-500">{{ longEdge }}px</span>
              </div>
              <input v-model.number="longEdge" type="range" min="360" max="1600" step="20" class="w-full accent-white">
            </div>
          </details>

          <details open class="group">
            <summary class="mb-3 flex cursor-pointer list-none items-center justify-between font-mono text-xs tracking-widest text-neutral-500 [&::-webkit-details-marker]:hidden">
              光影（即時重畫）
              <span class="text-neutral-600 transition-transform group-open:rotate-180">⌄</span>
            </summary>

            <div class="mb-4">
              <div class="mb-1 flex items-center justify-between text-sm text-neutral-300">
                <span>點大小</span>
                <span class="font-mono text-xs text-neutral-500">{{ dotPx.toFixed(1) }}px</span>
              </div>
              <input v-model.number="dotPx" type="range" min="0.5" max="6" step="0.1" class="w-full accent-white">
            </div>

            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 text-sm text-neutral-300">
                <input v-model="bgMode" type="radio" value="black" class="accent-white"> 純黑背景
              </label>
              <label class="flex items-center gap-2 text-sm text-neutral-300">
                <input v-model="bgMode" type="radio" value="transparent" class="accent-white"> 透明背景
              </label>
            </div>
          </details>
        </div>
      </div>
    </section>
  </div>
</template>
