<script lang="ts" setup>
const { hasShownAnimation } = useLoadingState()
const tilesBackgroundStore = useTilesBackgroundStore()
const nuxtApp = useNuxtApp()

nuxtApp.hook('page:finish', () => {
  window.scrollTo(0, 0)
})

const speakerSectionRef = useTemplateRef('speakerSectionRef')
useIntersectionObserver(
  speakerSectionRef,
  ([{ isIntersecting }]) => {
    tilesBackgroundStore.isReduceTargetOpacity = isIntersecting
  },
  {
    rootMargin: '-40% 0px -40% 0px',
  },
)

onMounted(() => {
  if (hasShownAnimation.value) {
    window.scrollTo(0, 0)
  }
})
</script>

<template>
  <HomeBanner />
  <HomeAgendaSection />
  <HomeSpeakersSection ref="speakerSectionRef" />
  <HomeInformation />
  <HomeNews />
</template>
