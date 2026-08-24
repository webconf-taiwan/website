<script setup>
// PL. III — Speaker（index-same.vue 版本）。
//
// 與 Home/SpeakerField.vue 的差別只有一個：這裡「沒有 canvas」。
// 人像點雲由頁面底層那張唯一的 HomeSameField 畫，這個元件只剩版面 —— 名單、
// 觀景框、引線、卷號。換人是把索引丟給 useSameFieldBus，由 field 那邊接手變形。
//
// 因為粒子是畫在背後那張 fixed canvas 上、而不是這一區自己的 canvas，所以：
//   · 這一區不能有不透明底色（會把自己的人像蓋掉），只能用半透明壓黑保可讀性
//   · 也就沒有原版那個「canvas 一定是實心黑方塊」的困擾，區塊邊界完全看不出來
//   · 人像的大小 / 位置由 field 的 speaker 影格（fit / shift）決定，不在這裡調

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})

const { speakerIndex, speakerBusy, selectSpeaker } = useSameFieldBus()

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
const CJK_RUN = /([㐀-鿿豈-﫿]+)/
function nameRuns (name) {
  return name.split(CJK_RUN).filter(Boolean).map(t => ({ t, zh: CJK_RUN.test(t) }))
}

// --- 換人的編排 ------------------------------------------------------------
// 設計要的順序（點下另一位時）：
//   1. 框線與框線上下的文字，連同引線一起淡出
//   2. 正方形框線「由小放到大」
//   3. 框線到定位之後，引線才從框邊延伸到名字
//   4. 同時框線上下的文字用打字效果進場
//
// ⚠️ 粒子那邊（HomeSameField.swapSpeaker）是另一條時間軸，兩邊「不互相等待」——
// 那邊是炸開 520ms + 重組 1100ms，這邊全長約 1.2 秒，收尾差不多同時。
// 刻意不做成一條共用的 timeline：粒子那條要等 readParticles（非同步、時間不定），
// 綁在一起的話版面動畫會被它卡住，反而更難對齊。
const LEADER_OUT_MS = 260
const LEADER_IN_MS = 420
// ⚠️ 這一段是「為什麼調小起始值卻看不出差別」的答案，改之前先讀：
//
// 1. 框線的大小是動 width / height，不是 transform: scale。
//    scale 會把 1px 的邊框一起縮 —— 起始 2% 時邊框是 0.02px，瀏覽器根本畫不出來，
//    所以小的時候畫面上是「什麼都沒有」，框線要到三成大才浮現。那才是 0.1 與 0.02
//    看起來一樣的真正原因，不是幅度不夠小。改動尺寸則邊框全程都是 1px。
// 2. ease 要選前段慢的。power3.out 前 10% 的時間就衝到 27% 大小，那個「點」只存在
//    一兩幀。power2.out 前 10% 是 19%，再配下面的「停一下」才看得出是從點放射開。
const FRAME_DOT_MS = 130       // 小方點先停這麼久，讓眼睛跟得上
const FRAME_GROW_MS = 520
// 框線從幾倍大開始長。0.02 = 300px 的框從 6px 開始，等於從中央一個點放射出來。
// ⚠️ transform: scale 連框線本身的粗細一起縮（1px 邊 → 0.02px），所以最初那幾格
// 根本畫不出來 —— 看起來就是「從無到有長出來」，而不是「一個小方塊突然出現」。
const FRAME_FROM = 0.3
const TYPE_MS = 560            // 打字全長（實際步進數 = 字數，見 playSwap）

const sectionRef = ref(null)
const frameRef = ref(null)          // 中央 300×300 觀景框（引線的終點）
const nameRefs = ref([])            // 八個名字按鈕（引線的起點）

// 引線。三個點：觀景框 → 斜線 → 名字底下的水平線。
// ⚠️ 底線不能用 CSS border-b 另外畫 —— 那是兩個獨立筆畫，接點會出現折角與缺口。
const leader = ref(null)
const leaderDraw = ref(1)
const leaderFade = ref(1)
// 框線與上下文字的動畫狀態。fade = 透明度，scale = 框線大小，
// type* = 打字進度 0..1（用 clip-path 從左往右揭開，配 steps() 就是一格一字）。
const frameFade = ref(1)
const frameScale = ref(1)
const typeTop = ref(1)
const typeBottom = ref(1)
let swapTweens = []      // 這一輪編排開出去的 tween，換人／卸載時要全部 kill
let onResize = null
let reducedMotion = false

const current = speakerIndex
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

// 引線：從被選中的名字拉一條斜線到中央觀景框。座標即時量出來。
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

// gsap tween 包成 promise，讓下面那條編排可以直接 await
function tween (obj, vars, ms, ease, onUpdate) {
  const { $gsap } = useNuxtApp()
  return new Promise((done) => {
    const tw = $gsap.to(obj, {
      ...vars,
      duration: reducedMotion ? 0 : ms / 1000,
      ease,
      onUpdate,
      onComplete: done,
    })
    swapTweens.push(tw)
  })
}

// 打字用的字數。⚠️ 步進數要等於「看得到的字數」，steps() 才會一格一字；
// 給固定值的話短字串會慢吞吞、長字串會一次跳好幾個字。
const topChars = computed(() =>
  (currentSpeaker.value?.tag || '').length + String(current.value + 1).length + 2)
const bottomChars = computed(() =>
  (currentSpeaker.value?.skills || []).join(' · ').length)

// 換人的版面編排。與粒子那條時間軸並行，彼此不等待（見檔頭 LEADER_OUT_MS 那段）。
async function playSwap () {
  killSwap()

  // reduced-motion：直接跳到定位，不做任何動畫
  if (reducedMotion) {
    frameFade.value = 1; frameScale.value = 1
    typeTop.value = 1; typeBottom.value = 1
    leaderFade.value = 1; leaderDraw.value = 1
    await nextTick()
    updateLeader()
    return
  }

  // 1) 淡出：框線、上下文字、引線一起。引線同時往中心收（dashoffset 回去）。
  // ⚠️ 這段刻意不重算 leader.value —— 它還要指著「舊的」那個名字，收起來才對得上。
  const out = { fade: frameFade.value, draw: leaderDraw.value }
  await tween(out, { fade: 0, draw: 0 }, LEADER_OUT_MS, 'power2.in', () => {
    frameFade.value = out.fade
    leaderFade.value = out.fade
    typeTop.value = out.fade
    typeBottom.value = out.fade
    leaderDraw.value = out.draw
  })

  // 2) 框線由小放到大。文字這時是「透明度已經回來、但還沒打出來」的狀態。
  frameScale.value = FRAME_FROM
  frameFade.value = 0
  typeTop.value = 0
  typeBottom.value = 0
  leaderFade.value = 1

  // 2a) 中央那個小方點先亮起來、停一下 —— 少了這拍，放射的起點看不見（見上面註解）
  const dot = { fade: 0 }
  await tween(dot, { fade: 1 }, FRAME_DOT_MS, 'none', () => { frameFade.value = dot.fade })

  // 2b) 放射長大
  const grow = { s: FRAME_FROM }
  await tween(grow, { s: 1 }, FRAME_GROW_MS, 'power2.out', () => { frameScale.value = grow.s })

  // 3) 框線到定位之後才量引線的終點 —— 早一步量到的是「放大中」的框，位置會偏。
  await nextTick()
  updateLeader()

  // 4) 引線延伸出去，同時上下文字打字進場。兩者並行，不互相等待。
  const line = { draw: 0 }
  const type = { top: 0, bottom: 0 }
  await Promise.all([
    leader.value
      ? tween(line, { draw: 1 }, LEADER_IN_MS, 'power2.out', () => { leaderDraw.value = line.draw })
      : Promise.resolve(),
    tween(type, { top: 1 }, TYPE_MS, `steps(${Math.max(1, topChars.value)})`, () => { typeTop.value = type.top }),
    tween(type, { bottom: 1 }, TYPE_MS, `steps(${Math.max(1, bottomChars.value)})`, () => { typeBottom.value = type.bottom }),
  ])
}

function killSwap () {
  for (const tw of swapTweens) tw.kill()
  swapTweens = []
}

// 版面與粒子同時跑，不互相等待
function select (i) {
  if (i === current.value || speakerBusy.value) return
  const next = SPEAKERS.value[i]
  playSwap()
  selectSpeaker(i, next?.portrait)
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  onResize = () => updateLeader()
  window.addEventListener('resize', onResize)
  nextTick(() => updateLeader())
})

onBeforeUnmount(() => {
  killSwap()
  if (onResize) window.removeEventListener('resize', onResize)
})
</script>

<template>
  <!-- data-same-speaker 是 HomeSameField 第 2 段（about → speaker）的觸發器。
       ⚠️ 底色只能是半透明 —— 人像就畫在背後那張 fixed canvas 上，
       給不透明底色會把自己的人像整片蓋掉。 -->
  <section
    id="speaker"
    ref="sectionRef"
    data-same-speaker
    class="relative z-10 overflow-clip bg-black/25 px-6 py-16 lg:min-h-[860px] lg:px-[60px] lg:py-0"
  >
    <!-- 引線：被選中的名字 → 中央觀景框 -->
    <svg
      v-if="leader"
      class="pointer-events-none absolute inset-0 z-1 hidden size-full lg:block"
      aria-hidden="true"
    >
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
         全程停在畫面左側、可以點著跳章（見 pages/index-same.vue）。 -->

    <!-- 名單 + 觀景框。桌機三欄（左四位／人像／右四位），手機單欄堆疊。 -->
    <div
      class="relative z-2 mx-auto mt-10 grid max-w-[1320px] grid-cols-1 gap-y-8 lg:mt-0 lg:min-h-screen lg:grid-cols-[1fr_300px_1fr] lg:content-center lg:gap-y-12"
    >
      <button
        v-for="(s, i) in LEFT"
        :key="s.name"
        type="button"
        :aria-current="current === i ? 'true' : undefined"
        class="group flex lg:col-start-1 lg:pl-[23.5%]"
        :class="[ROW[i], i % 2 === 0 ? 'lg:ml-10' : '']"
        @click="select(i)"
      >
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

      <!-- 中央觀景框：只有框線，人像是背後那張 canvas。
           換人時三樣東西各自動：框線縮放（frameScale）、整組淡出入（frameFade）、
           上下文字用 clip-path 從左往右揭開（typeTop / typeBottom = 打字）。
           ⚠️ 打字用 clip-path 而不是逐字塞 DOM：後者每格都要動一次 DOM，
           而且會讓文字寬度一直變、右對齊的那行會抖。 -->
      <div class="order-first flex flex-col items-stretch gap-y-2 lg:order-none lg:col-start-2 lg:row-span-4 lg:row-start-1">
        <div
          class="flex items-start justify-between font-serif text-[14px] font-bold italic leading-[1.4] tracking-[0.08em] text-pre-800"
          :style="{ opacity: frameFade }"
        >
          <span :style="{ clipPath: `inset(0 ${(1 - typeTop) * 100}% 0 0)` }">{{ currentSpeaker?.tag }}</span>
          <span :style="{ clipPath: `inset(0 ${(1 - typeTop) * 100}% 0 0)` }">{{ current + 1 }}/{{ SPEAKERS.length }}</span>
        </div>
        <!-- 外層是固定尺寸的佔位（版面不能跟著動畫抖），框線本身絕對定位在正中央、
             用 width/height 百分比放大。
             ⚠️ 不要改回 transform: scale —— 那會把 1px 的邊框一起縮，起始 2% 時邊框
             是 0.02px，瀏覽器畫不出來，於是「從小點放射」的前半段整段是空白的
             （見 script 裡 FRAME_DOT_MS 那段註解）。動 width/height 則邊框全程 1px。 -->
        <div class="relative aspect-square w-full lg:size-[300px]">
          <div
            ref="frameRef"
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-pre-800/80"
            :style="{
              width: `${frameScale * 100}%`,
              height: `${frameScale * 100}%`,
              opacity: frameFade,
            }"
          />
        </div>
        <div
          class="flex flex-wrap items-center justify-end gap-x-2 font-mono text-[12px] leading-[1.2] tracking-[0.2em] text-pre-800"
          :style="{ opacity: frameFade, clipPath: `inset(0 ${(1 - typeBottom) * 100}% 0 0)` }"
        >
          <template v-for="(sk, k) in currentSpeaker?.skills" :key="sk">
            <span v-if="k > 0" class="text-accent-1">·</span>
            <span>{{ sk }}</span>
          </template>
        </div>
      </div>

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
    <div class="relative z-2 mt-10 flex justify-center lg:absolute lg:inset-x-0 lg:bottom-[60px] lg:mt-0">
      <NuxtLink
        v-if="moreLink.href"
        :to="moreLink.href"
        :target="moreLink.target"
        :rel="linkRel(moreLink.target)"
        class="inline-flex items-center gap-x-1 border border-accent-1 bg-[#0a0a0c]/70 py-2 pl-5 pr-3 font-Noto text-[16px] font-medium leading-none tracking-[0.1em] text-pre-800 backdrop-blur-sm transition-colors hover:bg-accent-1/10"
      >
        {{ moreLink.label }}
        <span class="flex size-6 items-center justify-center">
          <AtomIcon name="arrow-right-thin" class="h-[5px] w-3" />
        </span>
      </NuxtLink>
    </div>
  </section>
</template>
