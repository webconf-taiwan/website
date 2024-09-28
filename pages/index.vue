<script lang="ts" setup>
import { appDescription, appName } from '~/constants'

const { hasShownAnimation } = useLoadingState()
const tilesBackgroundStore = useTilesBackgroundStore()
const nuxtApp = useNuxtApp()

useSeoMeta({
  title: appName,
  description: appDescription,
  ogTitle: appName,
  ogDescription: appDescription,
  ogImage: '/og-image.webp',
  twitterTitle: appName,
  twitterDescription: appDescription,
  twitterImage: '/og-image.webp',
  twitterCard: 'summary_large_image',
})

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
