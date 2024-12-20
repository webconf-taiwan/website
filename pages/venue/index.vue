<script setup lang="ts">
import { appDescription, appName, ogImageUrl } from '~/constants'

const { $lenis } = useNuxtApp()
const siteConfig = useSiteConfig()
const tilesBackgroundStore = useTilesBackgroundStore()

const venueFloorPlanRef = useTemplateRef('venueFloorPlanRef')
useIntersectionObserver(
  venueFloorPlanRef,
  ([{ isIntersecting }]) => {
    tilesBackgroundStore.isReduceTargetOpacity = isIntersecting
  },
  {
    rootMargin: '-40% 0px -40% 0px',
  },
)

useSeoMeta({
  title: '場域',
  description: appDescription,
  ogTitle: `場域 | ${appName}`,
  ogDescription: appDescription,
  ogImage: `${siteConfig.url}${ogImageUrl}`,
  twitterTitle: `場域 | ${appName}`,
  twitterDescription: appDescription,
  twitterImage: `${siteConfig.url}${ogImageUrl}`,
  twitterCard: 'summary_large_image',
})

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: '首頁', item: '/' },
      { name: '場域' },
    ],
  }),
  defineWebPage({
    '@type': 'WebPage',
  }),
])

onMounted(() => {
  $lenis.scrollTo(0)
})
</script>

<template>
  <main class="layout-grid mb-11 mt-8 min-h-screen lg:mt-[70px]">
    <ClientOnly>
      <FloatingActionButtons>
        <MoveToTop :over-top="300" />
      </FloatingActionButtons>
    </ClientOnly>

    <div class="mx-auto w-full max-w-[1162px]">
      <SectionTitle class="mb-5 justify-center lg:mb-12">
        <template #title>
          VENUE
        </template>
        <template #subTitle>
          場域
        </template>
      </SectionTitle>

      <VenueFloorPlan
        ref="venueFloorPlanRef"
        class="mb-[50px]"
      />
      <VenueTraffic />
    </div>
  </main>
</template>

<style scoped></style>
