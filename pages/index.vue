<script lang="ts" setup>
const tilesBackgroundStore = useTilesBackgroundStore()
const nuxtApp = useNuxtApp()

nuxtApp.hook('page:finish', async () => {
  window.scrollTo(0, 0)
  await nextTick(() => {
    nuxtApp.$lenis.scrollTo(0)
  })
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
</script>

<template>
  <main class="layout-grid min-h-screen">
    <HomeBanner />
    <HomeAgendaSection />
    <HomeSpeakersSection ref="speakerSectionRef" />
    <HomeInformation />
    <HomeNews />
  </main>
</template>
