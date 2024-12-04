<script setup lang="ts">
import type { ParsedAgendaData } from '~/types/agendas'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { appDescription, appName, ogImageUrl } from '~/constants'

const { $lenis } = useNuxtApp()
const siteConfig = useSiteConfig()
const agendasStore = useAgendasStore()

useSeoMeta({
  title: '講者',
  description: appDescription,
  ogTitle: `講者 | ${appName}`,
  ogDescription: appDescription,
  ogImage: `${siteConfig.url}${ogImageUrl}`,
  twitterTitle: `講者 | ${appName}`,
  twitterDescription: appDescription,
  twitterImage: `${siteConfig.url}${ogImageUrl}`,
  twitterCard: 'summary_large_image',
})

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')

const { data: agendasMarkdownData } = await useAsyncData('agendas', () => queryContent<ParsedAgendaData>('agendas').find())
agendasStore.agendasMarkdownData = agendasMarkdownData.value

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: '首頁', item: '/' },
      { name: '講者' },
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
  <main class="layout-grid mb-[60px] mt-8 min-h-screen lg:mt-[70px]">
    <ClientOnly>
      <FloatingActionButtons>
        <FilterButton v-if="isSmallerLg" />
        <MoveToTop :over-top="300" />
      </FloatingActionButtons>
    </ClientOnly>
    <div class="mx-auto">
      <SectionTitle class="mb-5 justify-center lg:mb-12">
        <template #title>
          SPEAKERS
        </template>
        <template #subTitle>
          講者
        </template>
      </SectionTitle>
      <AgendaTagsWrapper class="mb-9 lg:mb-11" />
      <SpeakerWrapper class="mb-20 lg:mb-[150px]" />
    </div>
  </main>
</template>
