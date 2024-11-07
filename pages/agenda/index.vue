<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import AgendaSlotsWrapper from '~/components/agenda/AgendaSlotsWrapper.vue'
import { appDescription, appName } from '~/constants'
import type { AgendaItem, ParsedAgendaData } from '~/types/agendas'

const { $lenis } = useNuxtApp()

const agendasStore = useAgendasStore()

useSeoMeta({
  title: '議程',
  ogTitle: `議程 | ${appName}`,
  ogDescription: appDescription,
  twitterTitle: `議程 | ${appName}`,
})

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')

const drawerSlideDirection = computed(() => {
  return isSmallerLg.value ? 'slide-up-full' : 'slide-left'
})

const agendaDrawer = useTemplateRef('agendaDrawer')

function triggerAgenda(agenda: AgendaItem) {
  agendasStore.currentAgendaDrawerId = agenda.id
  agendasStore.setAgendaDrawerRenderData(agenda)
  agendaDrawer.value?.open()
}

provide('triggerAgenda', triggerAgenda)

const { data: agendasMarkdownData } = await useAsyncData('agendas', () => queryContent<ParsedAgendaData>('agendas').find())
agendasStore.agendasMarkdownData = agendasMarkdownData.value

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: '首頁', item: '/' },
      { name: '議程' },
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
        <FilterButton v-if="isSmallerLg" />
        <MoveToTop :over-top="300" />
      </FloatingActionButtons>
    </ClientOnly>
    <div class="mx-auto">
      <SectionTitle class="mb-5 justify-center lg:mb-12">
        <template #title>
          PROGRAM
        </template>
        <template #subTitle>
          議程
        </template>
      </SectionTitle>
      <AgendaTagsWrapper class="mb-9 lg:mb-11" />
      <AgendaSlotsWrapper />
    </div>

    <Teleport to="body">
      <Drawer
        ref="agendaDrawer"
        :slide-direction="drawerSlideDirection"
        drawer-class="lg:w-[60dvw]"
        @close="agendasStore.resetContentTab"
      >
        <DrawerContentLayout>
          <template #content>
            <AgendaDrawerWrapper />
          </template>
        </DrawerContentLayout>
      </Drawer>
    </Teleport>
  </main>
</template>

<style scoped></style>
