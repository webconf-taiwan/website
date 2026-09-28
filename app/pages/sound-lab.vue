<script setup>
// 背景音試聽頁（noindex，內部比稿用）。音檔由 scripts/generate-bgm.py 以程式合成，
// 放在 public/audio/lab/。
//
// ⚠️ 播放一律走 Web Audio，不用 <audio loop>：AAC 編碼頭尾有 padding，<audio loop>
// 在循環點會空一小段、聽得出斷掉。這裡自己排程下一輪，並在接縫做 1.5 秒等功率交叉淡化。
definePageMeta({ layout: false })
usePageSeo('/sound-lab')

const BASE = '/audio/lab'
const INTRO = { id: 'intro', title: 'Loading', file: 'intro.m4a', note: '約 8 秒單次播放，系統開機／鎖定：低頻 thump → 藍線在畫時資料 blip 越來越密、噪音由低往高掃、時脈 tick 加速 → 4.6 秒圓圈畫滿「鎖定」：低頻下潛＋數位 chirp＋金屬共鳴。' }
const AMBIENTS = [
  { id: 'a', title: 'A · Data Stream', file: 'ambient-a.m4a', note: '深色脈動 drone（四五度、沒有三度），每拍側鏈呼吸，資料 blip 一串串出現。' },
  { id: 'b', title: 'B · Circuit', file: 'ambient-b.m4a', note: '120 BPM 脈衝波音序琶音＋低音線＋時脈 tick，濾波器 20 秒緩慢開合（最有節奏感的一版）。' },
  { id: 'c', title: 'C · Signal', file: 'ambient-c.m4a', note: '稀疏的 modem 式 chirp、非諧波的聲納 ping、低頻電源 hum、忽強忽弱的無線電雜訊（最安靜的一版）。' }
]
const XFADE = 1.5          // 循環接縫的交叉淡化秒數
const INTRO_TO_AMBIENT = 5.0 // 完整流程：intro 播到這裡（4.6s 鎖定之後）開始淡入背景音
const AMBIENT_FADE_IN = 3.5

const playing = ref(null)  // 目前在播的 id（'intro' / 'a' / 'b' / 'c' / 'flow-a' …）
const volume = ref(0.8)
const flowTarget = ref('a')

let ctx = null
let master = null
const buffers = {}
let stopFns = []

async function ensureCtx () {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    master = ctx.createGain()
    master.gain.value = volume.value
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') await ctx.resume()
}

async function load (file) {
  if (!buffers[file]) {
    const res = await fetch(`${BASE}/${file}`)
    buffers[file] = await ctx.decodeAudioData(await res.arrayBuffer())
  }
  return buffers[file]
}

function stopAll (fade = 0.4) {
  stopFns.forEach(fn => fn(fade))
  stopFns = []
  playing.value = null
}

// 單次播放；回傳 stop(fade)
function playOnce (buffer, when, gainFrom = 1) {
  const src = ctx.createBufferSource()
  const g = ctx.createGain()
  src.buffer = buffer
  g.gain.value = gainFrom
  src.connect(g).connect(master)
  src.start(when)
  return {
    gain: g,
    stop: (fade) => {
      const now = ctx.currentTime
      g.gain.cancelScheduledValues(now)
      g.gain.setValueAtTime(g.gain.value, now)
      g.gain.linearRampToValueAtTime(0, now + fade)
      src.stop(now + fade + 0.05)
    }
  }
}

// 無縫循環：每一輪提前 XFADE 秒排下一輪，兩輪在接縫等功率交叉淡化
function playLoop (buffer, when, fadeIn = 0.6) {
  const dur = buffer.duration
  const bus = ctx.createGain()
  bus.gain.setValueAtTime(0, when)
  bus.gain.linearRampToValueAtTime(1, when + fadeIn)
  bus.connect(master)
  let timer = 0
  let alive = true
  const voices = []

  const schedule = (start, first) => {
    if (!alive) return
    const src = ctx.createBufferSource()
    const g = ctx.createGain()
    src.buffer = buffer
    src.connect(g).connect(bus)
    // 第一輪直接滿音量；之後每一輪都在開頭淡入、上一輪在結尾淡出（等功率）
    const curveIn = new Float32Array(32).map((_, i) => Math.sin((i / 31) * Math.PI / 2))
    const curveOut = new Float32Array(32).map((_, i) => Math.cos((i / 31) * Math.PI / 2))
    if (first) g.gain.setValueAtTime(1, start)
    else g.gain.setValueCurveAtTime(curveIn, start, XFADE)
    g.gain.setValueCurveAtTime(curveOut, start + dur - XFADE, XFADE)
    src.start(start)
    src.stop(start + dur + 0.05)
    voices.push(src)
    const next = start + dur - XFADE
    timer = setTimeout(() => schedule(next, false), Math.max(0, (next - ctx.currentTime - 1) * 1000))
  }
  schedule(when, true)

  return {
    stop: (fade) => {
      alive = false
      clearTimeout(timer)
      const now = ctx.currentTime
      bus.gain.cancelScheduledValues(now)
      bus.gain.setValueAtTime(bus.gain.value, now)
      bus.gain.linearRampToValueAtTime(0, now + fade)
      voices.forEach(v => { try { v.stop(now + fade + 0.05) } catch {} })
    }
  }
}

async function toggle (track) {
  await ensureCtx()
  if (playing.value === track.id) return stopAll()
  stopAll()
  const buffer = await load(track.file)
  const now = ctx.currentTime + 0.05
  const voice = track.id === 'intro' ? playOnce(buffer, now) : playLoop(buffer, now)
  stopFns.push(voice.stop)
  playing.value = track.id
  if (track.id === 'intro') setTimeout(() => { if (playing.value === 'intro') playing.value = null }, buffer.duration * 1000)
}

// 完整流程：intro → 和弦解決後淡入選定的背景音
async function playFlow () {
  await ensureCtx()
  const id = `flow-${flowTarget.value}`
  if (playing.value === id) return stopAll()
  stopAll()
  const amb = AMBIENTS.find(a => a.id === flowTarget.value)
  const [intro, bg] = await Promise.all([load(INTRO.file), load(amb.file)])
  const now = ctx.currentTime + 0.05
  const i = playOnce(intro, now)
  const l = playLoop(bg, now + INTRO_TO_AMBIENT, AMBIENT_FADE_IN)
  stopFns.push(i.stop, l.stop)
  playing.value = id
}

watch(volume, v => { if (master) master.gain.setTargetAtTime(v, ctx.currentTime, 0.05) })

onBeforeUnmount(() => {
  stopAll(0.1)
  setTimeout(() => ctx?.close(), 300)
})
</script>

<template>
  <div class="min-h-screen bg-bg-mid px-6 py-16 text-pre-800 lg:px-[60px]">
    <div class="mx-auto flex max-w-[880px] flex-col gap-12">
      <header class="flex flex-col gap-3 border-t border-pre-800/35 pt-8">
        <p class="text-meta text-pre-800/80">SOUND LAB</p>
        <h1 class="text-en-h2 italic">Background sound</h1>
        <p class="text-zh-body-md text-pre-800/70">
          loading 與進場後背景音的候選試聽稿，全部用程式合成（scripts/generate-bgm.py），沒有使用任何素材音檔。
          背景音都是 60 秒無縫循環。建議戴耳機聽。
        </p>
        <label class="mt-2 flex items-center gap-4 text-body-sm text-pre-800/70">
          音量
          <input v-model.number="volume" type="range" min="0" max="1" step="0.01" class="w-48 accent-[#7CC8F2]">
        </label>
      </header>

      <!-- 完整流程：模擬「進站 loading → 進場」的銜接 -->
      <section class="flex flex-col gap-4 border border-accent-1/40 p-6">
        <p class="text-meta text-accent-1">FULL FLOW</p>
        <p class="text-zh-body-md text-pre-800/80">
          Loading 音 → 4.6 秒「鎖定」後（{{ INTRO_TO_AMBIENT }} 秒）淡入背景音，聽兩段怎麼接。
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <button
            v-for="a in AMBIENTS"
            :key="a.id"
            type="button"
            class="border px-4 py-2 text-body-sm transition-colors duration-300"
            :class="flowTarget === a.id ? 'border-accent-1 text-accent-1' : 'border-pre-800/35 text-pre-800/70 hover:text-pre-800'"
            @click="flowTarget = a.id"
          >
            {{ a.title }}
          </button>
          <AtomButton intent="primary" size="md" rounded="none" class="ml-auto" @click="playFlow">
            {{ playing?.startsWith('flow') ? '停止' : '播放完整流程' }}
          </AtomButton>
        </div>
      </section>

      <section class="flex flex-col">
        <div
          v-for="track in [INTRO, ...AMBIENTS]"
          :key="track.id"
          class="flex flex-col gap-3 border-t border-pre-800/35 py-6 md:flex-row md:items-center md:gap-8"
        >
          <div class="flex flex-1 flex-col gap-1">
            <p class="text-en-h4 italic" :class="playing === track.id ? 'text-accent-1' : ''">{{ track.title }}</p>
            <p class="text-zh-body-md text-pre-800/[62%]">{{ track.note }}</p>
          </div>
          <AtomButton intent="primary" size="md" rounded="none" class="shrink-0" @click="toggle(track)">
            {{ playing === track.id ? '停止' : '播放' }}
          </AtomButton>
        </div>
      </section>
    </div>
  </div>
</template>
