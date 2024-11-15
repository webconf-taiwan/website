<script setup lang="ts">
import { appDescription, appName } from '~/constants'

const { $lenis } = useNuxtApp()

useSeoMeta({
  title: '主辦',
  ogTitle: `主辦 | ${appName}`,
  ogDescription: appDescription,
  twitterTitle: `主辦 | ${appName}`,
})

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: '首頁', item: '/' },
      { name: '主辦' },
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
  <main class="layout-grid mb-20 mt-8 min-h-screen lg:mb-24 lg:mt-[70px]">
    <ClientOnly>
      <FloatingActionButtons>
        <MoveToTop :over-top="300" />
      </FloatingActionButtons>
    </ClientOnly>
    <div class="mx-auto">
      <SectionTitle class="mb-8 justify-center lg:mb-12">
        <template #title>
          STAFF
        </template>
        <template #subTitle>
          主辦團隊
        </template>
      </SectionTitle>
      <StaffWrapper />
    </div>
  </main>
</template>
