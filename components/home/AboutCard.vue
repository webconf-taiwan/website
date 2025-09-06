<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

const gsap = useGsap()
const aboutCardRef = ref<any>(null)

onMounted(() => {
  nextTick()

  const element = aboutCardRef.value.$el

  if (!element)
    return

  gsap.to(element, {
    scrollTrigger: {
      trigger: element,
      start: 'center center',
      endTrigger: '#about-section', // 指定 pages/index.vue 的 #about-section 元素
      end: 'bottom bottom',
      pin: element,
      pinSpacing: false,
    },
  })
})

const floatingTags = [
  {
    text: 'FRONTEND',
    position: {
      top: '20%',
      left: '-47%',
    },
  },
  {
    text: 'BACKEND',
    position: {
      bottom: '-3%',
      left: '-27%',
    },
  },
  {
    text: 'DEVOPS',
    position: {
      bottom: '-20%',
      right: '20%',
    },
  },
  {
    text: 'UI / UX',
    position: {
      right: '-10%',
      top: '-5%',
    },
  },
  {
    text: 'AGILE',
    position: {
      right: '-60%',
      top: '50%',
    },
  },
]
</script>

<template>
  <ShareGradientDotsCard
    ref="aboutCardRef"
    class="absolute left-1/2 top-60 z-10 mt-60 -translate-x-1/2 -translate-y-1/2 text-center text-white sm:max-w-[440px] lg:max-w-[640px]"
  >
    <div class="mx-auto inline-block py-[6px]">
      <h2 class="mx-10 flex text-h3-40">
        About
      </h2>
      <div class="mt-4 flex items-center">
        <span class="size-3 bg-white"></span>
        <span class="h-[1px] flex-1 bg-white"></span>
        <span class="size-3 bg-white"></span>
      </div>
    </div>

    <p class="mt-8 text-left text-body-16">
      WebConf
      是一年一度聚集網頁技術專家與愛好者的盛會。今年以「連結」為主題，聚焦在人與人、人與
      AI，以及人與網路之間的互動。我們將回顧網頁技術的關鍵演進，並探討 AI
      與機器學習如何優化體驗，行動優化與響應式設計的重要性，以及最新產業趨勢。WebConf
      不僅是專業知識的分享平台，更是交流與靈感激盪的舞台，邀你一同探索網頁未來的無限可能。
    </p>

    <ShareLinkButton
      to="/"
      class="mt-[60px]"
    >
      議程資訊
    </ShareLinkButton>

    <div>
      <HomeAboutFloatingTag
        v-for="tag in floatingTags"
        :key="tag.text"
        :text="tag.text"
        :position="tag.position"
        class="floating-tag absolute"
      />
    </div>
  </ShareGradientDotsCard>
</template>
