<script setup lang="ts">
const speakers = [
  {
    name: 'Happy',
    src: '/images/speakers/1_李昆謀.webp',
    link: '/speakers/1',
  },
  {
    name: '游舒帆 Gipi',
    src: '/images/speakers/18_游舒帆_Gipi.webp',
    link: '/speakers/18',
  },
  {
    name: '保哥 Will',
    src: '/images/speakers/2_Will_保哥.webp',
    link: '/speakers/2',
  },
  {
    name: 'Huli',
    src: '/images/speakers/17_Huli.webp',
    link: '/speakers/17',
  },
  {
    name: 'Hannah',
    src: '/images/speakers/28_hannah.webp',
    link: '/speakers/28',
  },
  {
    name: '奶綠茶',
    src: '/images/speakers/29_奶綠.webp',
    link: '/speakers/29',
  },
  {
    name: 'Kuro Hsu',
    src: '/images/speakers/38_KURO.webp',
    link: '/speakers/38',
  },
  {
    name: 'Peter',
    src: '/images/speakers/20_Peter_Su.webp',
    link: '/speakers/20',
  },
  {
    name: '陳偉仁',
    src: '/images/speakers/3_陳偉仁_Chris_Chen.webp',
    link: '/speakers/3',
  },
  {
    name: '黃庭亞',
    src: '/images/speakers/4_黃庭亞-Yaya.webp',
    link: '/speakers/4',
  },
]

const { width } = useWindowSize()
const isHovered = ref(false)
const speakerCards = ref<any[]>([])
const forceRerenderKey = ref(0)

// 固定為 3 防止 hydration mismatch
const displayCardLengthArr = ref(
  Array.from({ length: 3 }, (_, index) => index),
)

onMounted(() => {
  const updateCardLength = () => {
    let length = 3

    if (width.value >= 1600) {
      length = 5
    }
    else if (width.value >= 1024) {
      length = 4
    }

    displayCardLengthArr.value = Array.from({ length }, (_, index) => index)
  }

  updateCardLength()
  watch(width, updateCardLength)
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

function handleSlideToPrev() {
  speakerCards.value.forEach((card) => {
    card.slideToLeft()
  })
}

function handleSlideToNext() {
  speakerCards.value.forEach((card) => {
    card.slideToRight()
  })
}
</script>

<template>
  <div class="sm:pt-20">
    <section
      class="relative z-10 border-b-[0.5px] border-white bg-black text-white"
    >
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
          to="/speakers"
          class="hidden text-center xl:block"
        >
          更多講者
        </ShareLinkButton>

        <div
          v-arrow="{ speed1: '10s', color: 'white' }"
          class="absolute bottom-0 left-0 w-screen"
        ></div>
      </div>

      <div class="relative">
        <div
          class="relative left-1/2 grid w-[768px] -translate-x-1/2 grid-cols-3 lg:left-0 lg:mx-auto lg:w-full lg:translate-x-0 lg:grid-cols-4 3xl:grid-cols-5"
          @mouseover="isHovered = true"
          @mouseleave="isHovered = false"
        >
          <!-- 講者卡片 -->
          <HomeFeaturedSpeakerCard
            v-for="index in displayCardLengthArr"
            :key="`${speakers[index].name}-${forceRerenderKey}`"
            :ref="(el) => (speakerCards[index] = el)"
            :speakers="speakers"
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
          @click="handleSlideToNext"
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
          @click="handleSlideToPrev"
        ></button>
      </div>
    </section>

    <div
      class="grid grid-cols-1 gap-6 pb-[132px] pt-6 md:grid-cols-3 md:px-8 md:pb-20 md:pt-10 xl:hidden"
    >
      <ShareSlideController
        @next="handleSlideToNext"
        @prev="handleSlideToPrev"
      />

      <div class="justify-self-center">
        <ShareLinkButton to="/speakers">
          更多講者
        </ShareLinkButton>
      </div>
    </div>
  </div>
</template>
