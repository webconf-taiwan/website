<script setup lang="ts">
const $img = useImage()

const SPEAKERS = [
  {
    name: 'Happy',
    src: '/images/speakers/carousel-01_happy.webp',
  },
  {
    name: 'Gipi',
    src: '/images/speakers/carousel-02_gipi.webp',
  },
  {
    name: 'Will 保哥',
    src: '/images/speakers/carousel-03_will.webp',
  },
  {
    name: '胡立',
    src: '/images/speakers/carousel-04_huli.webp',
  },
  {
    name: 'Hannah',
    src: '/images/speakers/carousel-05_hannah.webp',
  },
  {
    name: '奶綠茶',
    src: '/images/speakers/carousel-06_milkmidi.webp',
  },
  {
    name: 'KURO',
    src: '/images/speakers/carousel-07_kuro.webp',
  },
  {
    name: 'Peter',
    src: '/images/speakers/carousel-08_peter.webp',
  },
  {
    name: 'Chris',
    src: '/images/speakers/carousel-09_chris.webp',
  },
  {
    name: 'Tinya',
    src: '/images/speakers/carousel-10_tinya.webp',
  },
]

const speakerAssets = computed(() =>
  SPEAKERS.map(speaker => ({
    ...speaker,
    src: $img(speaker.src, { width: 282, height: 448 }),
  })),
)

const { width } = useWindowSize()
const isHovered = ref(false)
const speakerCards = ref<any[]>([])
const forceRerenderKey = ref(0)
const displayCardLengthArr = computed(() => {
  if (width.value >= 1600) {
    return Array.from({ length: 5 }, (_, index) => index)
  }

  if (width.value >= 1024) {
    return Array.from({ length: 4 }, (_, index) => index)
  }

  return Array.from({ length: 3 }, (_, index) => index)
})

watch(displayCardLengthArr, () => {
  forceRerenderKey.value++
  // 重置所有卡片的內部索引
  speakerCards.value.forEach((card) => {
    if (card && typeof card.resetIndex === 'function') {
      card.resetIndex()
    }
  })
})

function handleNext() {
  speakerCards.value.forEach((card) => {
    card.slideToNext()
  })
}

function handlePrev() {
  speakerCards.value.forEach((card) => {
    card.slideToPrev()
  })
}
</script>

<template>
  <div class="sm:pt-20">
    <section
      class="relative z-10 border-b-[0.5px] border-white bg-black text-white"
    >
      <!-- 區塊標題 -->
      <div
        v-arrow="{ speed1: '12s', color: 'white' }"
        class="relative flex items-center justify-between border-y-[0.5px] border-white px-5 py-10 sm:px-8 xl:px-20"
      >
        <div class="flex items-start gap-2 md:gap-4">
          <h2 class="text-center text-h4-60">
            Featured Speakers
          </h2>
          <ShareBlueTag
            text="講者"
            class="!px-3 !py-1 md:!px-5 md:!py-2"
          />
        </div>

        <ShareLinkButton
          to="/coming-soon"
          class="hidden text-center xl:block"
        >
          更多講者
        </ShareLinkButton>

        <!-- 箭頭軌道 -->
        <div
          v-arrow="{ speed1: '10s', color: 'white' }"
          class="absolute bottom-0 left-0 w-screen"
        ></div>
      </div>

      <!-- 講者輪播 -->
      <div class="relative">
        <div
          class="relative left-1/2 grid w-[768px] -translate-x-1/2 grid-cols-3 lg:left-0 lg:mx-auto lg:w-full lg:translate-x-0 lg:grid-cols-4 3xl:grid-cols-5"
          @mouseover="isHovered = true"
          @mouseleave="isHovered = false"
        >
          <!-- 講者卡片 -->
          <HomeFeaturedSpeakerCard
            v-for="index in displayCardLengthArr"
            :key="`${speakerAssets[index].name}-${forceRerenderKey}`"
            :ref="(el) => (speakerCards[index] = el)"
            :speakers="speakerAssets"
            :original-index="index"
            :initial-index="index"
            :is-parent-hovered="isHovered"
          />
        </div>

        <!-- 輪播按鈕 -->
        <button
          v-cursor="{
            scale: 2,
            duration: 0.5,
            backgroundColor: 'rgba(0, 46, 255, 0.9)',
            icon: 'arrow-left',
          }"
          type="button"
          class="absolute left-0 top-0 hidden h-full w-20 xl:block"
          aria-label="下一位講者"
          @click="handleNext"
        ></button>

        <button
          v-cursor="{
            scale: 2,
            duration: 0.5,
            backgroundColor: 'rgba(0, 46, 255, 0.9)',
            icon: 'arrow-right',
          }"
          type="button"
          class="absolute right-0 top-0 hidden h-full w-20 xl:block"
          aria-label="上一位講者"
          @click="handlePrev"
        ></button>
      </div>
    </section>

    <!-- 動作按鈕 -->
    <div
      class="grid grid-cols-1 gap-6 pb-[132px] pt-6 md:grid-cols-3 md:px-8 md:pb-20 md:pt-10 xl:hidden"
    >
      <ShareSlideController
        @next="handleNext"
        @prev="handlePrev"
      />

      <div class="justify-self-center">
        <ShareLinkButton to="/coming-soon">
          更多講者
        </ShareLinkButton>
      </div>
    </div>
  </div>
</template>
