<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { appDescription, appName } from '~/constants'
import type { ParsedAgendaData } from '~/types/agendas'

const { $lenis } = useNuxtApp()

const agendasStore = useAgendasStore()

useSeoMeta({
  title: '講者',
  ogTitle: `講者 | ${appName}`,
  ogDescription: appDescription,
  twitterTitle: `講者 | ${appName}`,
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
