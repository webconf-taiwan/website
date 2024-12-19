<script setup lang="ts">
import { appDescription, appName, ogImageUrl } from '~/constants'

const { $lenis } = useNuxtApp()
const siteConfig = useSiteConfig()

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

    <div class="mx-auto">
      <SectionTitle class="mb-5 justify-start lg:mb-12">
        <template #title>
          VENUE
        </template>
        <template #subTitle>
          場域
        </template>
      </SectionTitle>

      <section class="flex flex-col justify-center">
        <NuxtImg
          src="/venue/location.png"
          alt="場域外觀"
          class="w-full"
        />

        <div class="relative mt-5 p-5">
          <!-- 四邊定位的正方形 -->
          <div class="absolute inset-0 size-[10px] border-l border-t border-primary-green"></div>
          <div class="absolute bottom-0 right-0 size-[10px] border-b border-r border-primary-green"></div>
          <div class="absolute bottom-0 left-0 size-[10px] border-b border-l border-primary-green"></div>
          <div class="absolute right-0 top-0 size-[10px] border-r border-t border-primary-green"></div>

          <div class="flex items-center space-x-3">
            <h2 class="text-xl font-bold">
              瓶蓋工廠台北製造所
            </h2>
            <Icon
              name="heroicons:arrow-top-right-on-square"
              class="text-2xl text-primary-green"
            />
          </div>

          <p class="mt-4">
            115 台北市南港區南港路二段 13 號
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped></style>
