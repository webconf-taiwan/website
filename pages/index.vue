<script lang="ts" setup>
import { appDescription, appName, ogImageUrl } from '~/constants'

const tilesBackgroundStore = useTilesBackgroundStore()
const nuxtApp = useNuxtApp()
const siteConfig = useSiteConfig()

useSeoMeta({
  description: appDescription,
  ogTitle: appName,
  ogDescription: appDescription,
  ogImage: `${siteConfig.url}${ogImageUrl}`,
  twitterTitle: appName,
  twitterDescription: appDescription,
  twitterImage: `${siteConfig.url}${ogImageUrl}`,
  twitterCard: 'summary_large_image',
})

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
