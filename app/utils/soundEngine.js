// 背景音引擎（純 Web Audio，沒有框架依賴）。狀態與生命週期由 plugins/sound.client.js 管。
//
// 兩件事：
//   1. loading 音：public/audio/intro-build.m4a（開機 → 藍線在畫，4.6~6.5s 可循環）＋
//      intro-lock.m4a（圓圈真的畫滿那一刻才播）。音檔由 scripts/generate-bgm.py 產生。
//   2. 背景音：即時生成（不是音檔），試聽頁 A · Data Stream 的配方 ——
//        深色脈衝波 drone（四五度、沒有三度）→ 低通濾波器（LFO 緩慢開合）
//        → 每拍一次的側鏈下壓 ＋ 高頻 hiss ＋ 一串串的資料 blip
//      每一顆 blip 什麼時候出現、音高、左右都是當下隨機決定 —— 無限、不會重複。
//      換頁／換區塊時 setScene() 讓 drone 滑音到新的和聲、濾波器與密度跟著變。
//
// ⚠️ 排程用 lookahead（每 25ms 醒一次，把接下來 0.2s 內的事件排進 AudioContext 時間軸），
// 不是 setTimeout 直接發聲 —— setTimeout 會抖，節拍一抖就聽得出來。

const BPM = 120
const BEAT = 60 / BPM
const STEP = BEAT / 4
const LOOKAHEAD = 0.2
const TICK_MS = 25

export const INTRO_LOOP_START = 4.6   // ⚠️ 要跟 scripts/generate-bgm.py 的 BUILD_LOOP_START / END 一致
export const INTRO_LOOP_END = 6.5

// 場景：drone 的和聲（相對 root 的半音，沒有三度）、濾波器、blip 密度
export const SCENES = {
  default: { root: 26, voices: [0, 12, 19, 17], cutoff: 420, density: 0.45, blips: [1600, 2400, 3200, 4800] },
  hero: { root: 26, voices: [0, 12, 19, 17], cutoff: 360, density: 0.4, blips: [1600, 2400, 3200, 4800] },
  about: { root: 26, voices: [0, 12, 19, 24], cutoff: 460, density: 0.45, blips: [2400, 3200, 4800] },
  speaker: { root: 24, voices: [0, 12, 19, 26], cutoff: 420, density: 0.35, blips: [1600, 2400, 3200] },
  venue: { root: 21, voices: [0, 12, 19, 17], cutoff: 520, density: 0.55, blips: [1200, 1600, 2400, 3200] },
  faq: { root: 28, voices: [0, 12, 19, 22], cutoff: 480, density: 0.45, blips: [2400, 3200, 4800, 6000] },
  ticket: { root: 26, voices: [0, 12, 19, 24], cutoff: 700, density: 0.65, blips: [2400, 3200, 4800, 6000] },
  agenda: { root: 28, voices: [0, 12, 19, 17], cutoff: 600, density: 0.6, blips: [2400, 3200, 4800, 6000] },
  quiet: { root: 24, voices: [0, 12, 19, 17], cutoff: 300, density: 0.2, blips: [1600, 2400] },
}

// 每個 voice 的音量、脈衝寬度、左右（跟 generate-bgm.py 的 A 版同一組）
const VOICE_SHAPE = [
  { vol: 0.16, duty: 0.5, pan: 0 },
  { vol: 0.2, duty: 0.25, pan: -0.3 },
  { vol: 0.14, duty: 0.3, pan: 0.3 },
  { vol: 0.09, duty: 0.2, pan: -0.5 },
]

const midi = m => 440 * 2 ** ((m - 69) / 12)

function pulseWave (ctx, duty, n = 24) {
  const real = new Float32Array(n + 1)
  const imag = new Float32Array(n + 1)
  for (let k = 1; k <= n; k++) real[k] = Math.sin(Math.PI * k * duty) / k
  return ctx.createPeriodicWave(real, imag)
}

function noiseBuffer (ctx, sec = 2) {
  const buf = ctx.createBuffer(2, ctx.sampleRate * sec, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  return buf
}

function reverbIR (ctx, sec = 3.5) {
  const n = Math.floor(ctx.sampleRate * sec)
  const buf = ctx.createBuffer(2, n, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    let lp = 0
    for (let i = 0; i < n; i++) {
      // 一階低通讓高頻衰得快一點 → 空間感而不是金屬板
      lp += 0.35 * ((Math.random() * 2 - 1) - lp)
      d[i] = lp * Math.exp(-6.9 * i / n)
    }
  }
  return buf
}

export function createSoundEngine (ctx) {
  // ---- 輸出：master → 壓縮 → 喇叭；另一路送殘響 ----------------------------
  const master = ctx.createGain()
  master.gain.value = 0
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -18
  comp.ratio.value = 3
  master.connect(comp).connect(ctx.destination)

  const reverb = ctx.createConvolver()
  reverb.buffer = reverbIR(ctx)
  const reverbSend = ctx.createGain()
  reverbSend.gain.value = 0.35
  reverbSend.connect(reverb).connect(master)

  // ---- loading 音 ----------------------------------------------------------
  const buffers = {}
  async function load (url) {
    if (!buffers[url]) {
      buffers[url] = fetch(url).then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b))
    }
    return buffers[url]
  }

  let buildSrc = null
  let buildGain = null

  async function playIntroBuild (base) {
    const buf = await load(`${base}/intro-build.m4a`)
    buildSrc = ctx.createBufferSource()
    buildSrc.buffer = buf
    buildSrc.loop = true
    buildSrc.loopStart = INTRO_LOOP_START
    buildSrc.loopEnd = INTRO_LOOP_END
    buildGain = ctx.createGain()
    buildGain.gain.value = 0.9
    buildSrc.connect(buildGain).connect(ctx.destination)
    buildSrc.start()
  }

  async function playIntroLock (base) {
    const buf = await load(`${base}/intro-lock.m4a`)
    const now = ctx.currentTime
    if (buildSrc) {
      buildGain.gain.setTargetAtTime(0, now, 0.03)
      buildSrc.stop(now + 0.3)
      buildSrc = null
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const g = ctx.createGain()
    g.gain.value = 0.9
    src.connect(g).connect(ctx.destination)
    src.start(now)
  }

  function stopIntro () {
    if (!buildSrc) return
    buildGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05)
    buildSrc.stop(ctx.currentTime + 0.4)
    buildSrc = null
  }

  // ---- 背景音：drone ---------------------------------------------------------
  const ambient = ctx.createGain()     // 背景音總音量（淡入淡出用）
  ambient.gain.value = 0
  ambient.connect(master)
  ambient.connect(reverbSend)

  const duck = ctx.createGain()        // 側鏈下壓
  duck.connect(ambient)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.value = 1.2
  filter.frequency.value = SCENES.default.cutoff
  filter.connect(duck)

  // 濾波器 LFO：15 秒一個週期緩慢開合
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 1 / 15
  const lfoDepth = ctx.createGain()
  lfoDepth.gain.value = SCENES.default.cutoff * 0.45
  lfo.connect(lfoDepth).connect(filter.frequency)
  lfo.start()

  const voices = VOICE_SHAPE.map((shape, i) => {
    const osc = ctx.createOscillator()
    osc.setPeriodicWave(pulseWave(ctx, shape.duty))
    osc.frequency.value = midi(SCENES.default.root + SCENES.default.voices[i])
    const g = ctx.createGain()
    g.gain.value = shape.vol
    const p = ctx.createStereoPanner()
    p.pan.value = shape.pan
    osc.connect(g).connect(p).connect(filter)
    osc.start()
    return osc
  })

  // 高頻 hiss，跟 drone 一起被側鏈壓
  const hiss = ctx.createBufferSource()
  hiss.buffer = noiseBuffer(ctx)
  hiss.loop = true
  const hissBand = ctx.createBiquadFilter()
  hissBand.type = 'bandpass'
  hissBand.frequency.value = 8000
  hissBand.Q.value = 0.7
  const hissGain = ctx.createGain()
  hissGain.gain.value = 0.05
  hiss.connect(hissBand).connect(hissGain).connect(duck)
  hiss.start()

  // ---- 背景音：blip ----------------------------------------------------------
  let scene = SCENES.default
  let brightness = 0

  function blip (when, f, pan, vol = 0.11) {
    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = f
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, when)
    g.gain.linearRampToValueAtTime(vol, when + 0.001)
    g.gain.setTargetAtTime(0, when + 0.001, 0.006)
    const p = ctx.createStereoPanner()
    p.pan.value = pan
    osc.connect(g).connect(p).connect(ambient)
    osc.start(when)
    osc.stop(when + 0.05)
  }

  function burstAt (when, count, pan) {
    const base = scene.blips[Math.floor(Math.random() * scene.blips.length)]
    for (let k = 0; k < count; k++) {
      const f = base * [1, 1.5, 2, 0.75][Math.floor(Math.random() * 4)]
      blip(when + k * STEP / 2, f, pan)
    }
  }

  // ---- lookahead 排程：每拍的側鏈、每小節看要不要來一串 blip ------------------
  const DUCK_DEPTH = 0.5
  const DUCK_ATTACK = 0.008
  const DUCK_RATE = 6
  // 一拍結束時側鏈回到的值（下一拍從這裡壓下去，避免增益跳階 → 喀聲）
  const DUCK_END = 1 - DUCK_DEPTH * Math.exp(-(BEAT - DUCK_ATTACK) * DUCK_RATE)

  let nextBeat = 0
  let beatIndex = 0
  let timer = 0
  let running = false

  function schedule () {
    const horizon = ctx.currentTime + LOOKAHEAD
    while (nextBeat < horizon) {
      const t = nextBeat
      duck.gain.setValueAtTime(DUCK_END, t)
      duck.gain.linearRampToValueAtTime(1 - DUCK_DEPTH, t + DUCK_ATTACK)
      duck.gain.setTargetAtTime(1, t + DUCK_ATTACK, 1 / DUCK_RATE)
      if (beatIndex % 4 === 0 && Math.random() < scene.density) {
        const offset = Math.floor(Math.random() * 16) * STEP
        burstAt(t + offset, 4 + Math.floor(Math.random() * 9), Math.random() * 1.6 - 0.8)
      }
      nextBeat += BEAT
      beatIndex++
    }
  }

  function startAmbient (fadeSec = 3.5) {
    const now = ctx.currentTime
    master.gain.setTargetAtTime(1, now, 0.05)
    ambient.gain.cancelScheduledValues(now)
    ambient.gain.setValueAtTime(ambient.gain.value, now)
    ambient.gain.linearRampToValueAtTime(1, now + fadeSec)
    if (!running) {
      running = true
      nextBeat = Math.max(nextBeat, now + 0.05)
      schedule()
      timer = setInterval(schedule, TICK_MS)
    }
  }

  function stopAmbient (fadeSec = 0.8) {
    const now = ctx.currentTime
    ambient.gain.cancelScheduledValues(now)
    ambient.gain.setValueAtTime(ambient.gain.value, now)
    ambient.gain.linearRampToValueAtTime(0, now + fadeSec)
    clearInterval(timer)
    running = false
  }

  function applyCutoff () {
    const base = scene.cutoff * (1 + brightness * 1.2)
    filter.frequency.setTargetAtTime(base, ctx.currentTime, 0.4)
    lfoDepth.gain.setTargetAtTime(base * 0.45, ctx.currentTime, 0.4)
  }

  // 換場景：drone 各聲部滑音到新和聲（約 3 秒），濾波器跟著變
  function setScene (key) {
    const next = SCENES[key] || SCENES.default
    if (next === scene) return
    scene = next
    const now = ctx.currentTime
    voices.forEach((osc, i) => osc.frequency.setTargetAtTime(midi(scene.root + scene.voices[i]), now, 1.0))
    applyCutoff()
  }

  // 粒子收攏程度（0~1）→ 濾波器打開
  function setBrightness (v) {
    const next = Math.max(0, Math.min(1, v))
    if (Math.abs(next - brightness) < 0.02) return
    brightness = next
    applyCutoff()
  }

  // 推粒子 → 立刻一小串 blip（呼叫端自己節流）
  function burst (strength = 0.5, pan = 0) {
    if (!running) return
    burstAt(ctx.currentTime + 0.01, 2 + Math.round(strength * 6), Math.max(-1, Math.min(1, pan)))
  }

  function setVolume (v, sec = 0.3) {
    master.gain.setTargetAtTime(v, ctx.currentTime, sec / 3)
  }

  function destroy () {
    clearInterval(timer)
    running = false
    stopIntro()
  }

  return { playIntroBuild, playIntroLock, stopIntro, startAmbient, stopAmbient, setScene, setBrightness, burst, setVolume, destroy, isRunning: () => running }
}
