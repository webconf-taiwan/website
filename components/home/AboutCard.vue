<script setup lang="ts">
const gsap = useGsap()
const { width } = useWindowSize()
const aboutCardRef = ref<any>(null)
const scrollTriggerInstance = ref<any>(null)

watch([aboutCardRef, width], ([newRef, newWidth]) => {
  if (scrollTriggerInstance.value) {
    scrollTriggerInstance.value.kill()
    scrollTriggerInstance.value = null
  }

  if (newRef && newRef.$el && newWidth >= 640) {
    const element = newRef.$el

    scrollTriggerInstance.value = gsap.to(newRef.$el, {
      scrollTrigger: {
        trigger: element,
        start: 'center center',
        endTrigger: '#about-section',
        end: 'bottom bottom',
        pin: element,
        pinSpacing: false,
        scrub: true,
        anticipatePin: 1,
      },
    }).scrollTrigger
  }
})

const floatingTags = computed(() => [
  {
    text: 'FRONTEND',
    position: {
      default: { top: '-35%', left: '5%' },
      md: { top: '-22%', left: '-10%' },
      xl: { top: '20%', left: '-42%' },
    },
  },
  {
    text: 'BACKEND',
    position: {
      default: { bottom: '-17.5%', left: '6.5%' },
      md: { bottom: '-15%', left: '10%' },
      xl: { bottom: '-3%', left: '-27%' },
    },
  },
  {
    text: 'DEVOPS',
    position: {
      default: { bottom: '-25%', right: '6.5%' },
      md: { bottom: '-20%', right: '10%' },
      xl: { bottom: '-18%', right: '20%' },
    },
  },
  {
    text: 'UI / UX',
    position: {
      default: { right: '35%', top: '-17.5%' },
      md: { right: '30%', top: '-12.5%' },
      xl: { right: '-5%', top: '-5%' },
    },
  },
  {
    text: 'AGILE',
    position: {
      default: { right: '5%', top: '-27.5%' },
      md: { right: '-15%', top: '-28%' },
      xl: { right: '-47%', top: '50%' },
    },
  },
])

function getResponsivePosition(tagPosition: any) {
  if (width.value >= 1280 && tagPosition.xl) {
    return tagPosition.xl
  }
  else if (width.value >= 768 && tagPosition.md) {
    return tagPosition.md
  }
  return tagPosition.default
}
</script>

<template>
  <ShareGradientDotsCard
    ref="aboutCardRef"
    class="top-60 z-10 mx-auto text-center text-white sm:absolute sm:mt-60 sm:max-w-[440px] md:max-w-[524px] xl:max-w-[640px]"
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
        :position="getResponsivePosition(tag.position)"
        class="floating-tag absolute"
      />
    </div>
  </ShareGradientDotsCard>
</template>
