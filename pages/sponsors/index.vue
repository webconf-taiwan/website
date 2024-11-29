<script setup lang="ts">
import { appDescription, appName, ogImageUrl } from '~/constants'

const { $lenis } = useNuxtApp()
const siteConfig = useSiteConfig()

useSeoMeta({
  title: '贊助',
  description: appDescription,
  ogTitle: `贊助 | ${appName}`,
  ogDescription: appDescription,
  ogImage: `${siteConfig.url}${ogImageUrl}`,
  twitterTitle: `贊助 | ${appName}`,
  twitterDescription: appDescription,
  twitterImage: `${siteConfig.url}${ogImageUrl}`,
  twitterCard: 'summary_large_image',
})

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: '首頁', item: '/' },
      { name: '贊助' },
    ],
  }),
  defineWebPage({
    '@type': 'CollectionPage',
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

    <SponsorBanner />
    <SponsorSection />
    <SponsorOrganizerSection />
  </main>
</template>

<style scoped></style>
