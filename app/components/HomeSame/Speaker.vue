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

const LEADER_OUT_MS = 260
const LEADER_IN_MS = 420

const sectionRef = ref(null)
const frameRef = ref(null)          // 中央 300×300 觀景框（引線的終點）
const nameRefs = ref([])            // 八個名字按鈕（引線的起點）

// 引線。三個點：觀景框 → 斜線 → 名字底下的水平線。
// ⚠️ 底線不能用 CSS border-b 另外畫 —— 那是兩個獨立筆畫，接點會出現折角與缺口。
const leader = ref(null)
const leaderDraw = ref(1)
const leaderFade = ref(1)
let leaderTween = null
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

// 先把舊的往中心收起並淡出，換好座標後再從中心畫出去。
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

// 引線與粒子同時跑，不互相等待
function select (i) {
  if (i === current.value || speakerBusy.value) return
  const next = SPEAKERS.value[i]
  animateLeader()
  selectSpeaker(i, next?.portrait)
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  onResize = () => updateLeader()
  window.addEventListener('resize', onResize)
  nextTick(() => updateLeader())
})

onBeforeUnmount(() => {
  leaderTween?.kill()
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

      <!-- 中央觀景框：只有框線，人像是背後那張 canvas -->
      <div class="order-first flex flex-col items-stretch gap-y-2 lg:order-none lg:col-start-2 lg:row-span-4 lg:row-start-1">
        <div class="flex items-start justify-between font-serif text-[14px] font-bold italic leading-[1.4] tracking-[0.08em] text-pre-800">
          <span>{{ currentSpeaker?.tag }}</span>
          <span>{{ current + 1 }}/{{ SPEAKERS.length }}</span>
        </div>
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
