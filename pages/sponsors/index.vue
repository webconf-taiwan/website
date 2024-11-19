<script setup lang="ts">
import { appDescription, appName } from '~/constants'

const { $lenis } = useNuxtApp()

useSeoMeta({
  title: '贊助',
  ogTitle: `贊助 | ${appName}`,
  ogDescription: appDescription,
  twitterTitle: `贊助 | ${appName}`,
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
  <main class="layout-grid mt-8 min-h-screen lg:mt-[70px]">
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
