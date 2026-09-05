<script setup>
// PL. I — Hero。一鏡到底版首頁的第一屏。
//
// ⚠️ section 上的 data-same-hero 不能拿掉：HomeField 用 querySelector 找它，
// 當作粒子第 1 段變形（滿版自由場 → side.png）的 ScrollTrigger 觸發器。
// 詳細的時間軸在 pages/index.vue 的檔頭。

const props = defineProps({
  // 首頁資料的 hero 區塊
  data: {
    type: Object,
    default: () => ({})
  },
  // 右下角要接在 note 後面的繪圖後端（webgpu / webgl2 / canvas2d）。
  // 這是執行期才知道的東西、不是資料，所以由頁面把 canvas 的狀態傳進來。
  backend: {
    type: String,
    default: ''
  }
})

const content = computed(() => props.data || {})

// 進場：hero 在首屏，ScrollTrigger 的 start 一載入就已經越過，等同「載入即播」。
// 位移給大一點（預設 16 太含蓄，壓不住背後一直在動的粒子場）。
const heroRef = ref(null)
useFadeIn(heroRef, { y: 28, step: 0.12 })
</script>

<template>
  <section
    id="hero"
    ref="heroRef"
    data-same-hero
    class="relative z-10 flex min-h-[calc(100dvh-52px)] flex-col items-center justify-center bg-black/30 px-6 py-20 text-center"
  >
    <p data-fade="in" class="font-mono mb-6 text-fs-micro uppercase text-white/55">
      {{ content.plate_label }}
    </p>

    <h1 data-fade="in" class="mb-6 font-serif text-[clamp(72px,13vw,240px)] italic leading-[0.95] tracking-[-0.02em]">
      {{ content.title }}
    </h1>

    <p data-fade="in" class="mb-3 font-serif text-[clamp(18px,2.2vw,30px)] italic leading-snug">
      {{ content.subtitle }}
    </p>

    <p data-fade="in" class="mb-10 font-mono text-fs-micro uppercase text-white/55">
      {{ content.keywords }}
    </p>

    <a
      data-fade="in"
      :href="content.cta?.href"
      :target="content.cta?.target"
      :rel="linkRel(content.cta?.target)"
      class="inline-block border border-[#71c1f0]/60 px-8 py-3 font-zh text-fs-btn text-[#efe6d2] transition-colors hover:border-[#71c1f0] hover:bg-[#71c1f0]/10"
    >
      {{ content.cta?.label }}
    </a>

    <!-- 四角的「標本標籤」：科學紀錄語彙，桌機才出現 -->
    <div class="pointer-events-none absolute inset-x-6 bottom-8 hidden items-end justify-between lg:flex">
      <div data-fade="in" class="text-left">
        <p class="font-mono text-fs-micro uppercase text-white/55">
          {{ content.corner_left?.label }}
        </p>
        <p class="font-serif text-fs-caption italic text-white/55">
          {{ content.corner_left?.note }}
        </p>
      </div>
      <div data-fade="in" class="text-right">
        <p class="font-mono text-fs-micro uppercase text-white/55">
          {{ content.corner_right?.label }}
        </p>
        <!-- note 後面接的是執行期才知道的繪圖後端，不是資料 -->
        <p class="font-serif text-fs-caption italic text-white/55">
          {{ content.corner_right?.note }}{{ backend ? ` · ${backend}` : '' }}
        </p>
      </div>
    </div>
  </section>
</template>
