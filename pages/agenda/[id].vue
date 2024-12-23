<script setup lang="ts">
import type { ParsedAgendaData } from '~/types/agendas'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

definePageMeta({
  middleware: [
    (to, _from) => {
      const id = Array.isArray(to.params.id) ? to.params.id[0] : to.params.id

      if (id.endsWith('a2')) {
        const newId = id.replace(/a2$/, 'a')
        return navigateTo(`/agenda/${newId}`)
      }
    },
  ],
})

const route = useRoute()
const id = route.params.id as string
const agendasStore = useAgendasStore()

agendasStore.currentAgendaDrawerId = id

const { data: agendaMarkdownData, error } = await useAsyncData(
  'agendas',
  () => queryContent<ParsedAgendaData>(`agendas/${id}`).findOne(),
)

if (error.value) {
  throw createError({
    statusCode: 404,
    message: 'Page not found',
  })
}

if (agendaMarkdownData.value) {
  agendasStore.singleAgendaMarkdownData = agendaMarkdownData.value
}

const agenda = agendasStore.findAgendaById(id)

if (agenda) {
  agendasStore.setAgendaDrawerRenderData(agenda)
}

const speakerNames = agendasStore.agendaDrawerRenderData.map(item => item.speakerName).join('、')

useSeoMeta({
  title: `${agendaMarkdownData.value?.title} - ${speakerNames}`,
  description: agendaMarkdownData.value?.description,
  author: () => speakerNames,
  ogTitle: `${agendaMarkdownData.value?.title} - ${speakerNames}`,
  ogDescription: agendaMarkdownData.value?.description,
  twitterTitle: `${agendaMarkdownData.value?.title} - ${speakerNames}`,
  twitterDescription: agendaMarkdownData.value?.description,
  twitterCard: 'summary_large_image',
})

useSchemaOrg([
  defineWebPage({
    '@type': 'ProfilePage',
  }),
])

const ogImageOptions = {
  component: 'OgImageTemplate',
  props: {
    title: agendaMarkdownData.value?.title,
    description: agendaMarkdownData.value?.description,
    author: speakerNames,
    location: agendaMarkdownData.value?.location,
    date: agendaMarkdownData.value?.date.split('T')[0],
    startTime: agendaMarkdownData.value?.startTime,
    endTime: agendaMarkdownData.value?.endTime,
  },
}

defineOgImage(ogImageOptions)

onUnmounted(() => {
  agendasStore.singleAgendaMarkdownData = null
})
</script>

<template>
  <div class=" flex min-h-[calc(100dvh-100px)] px-5">
    <div class="mx-auto mb-[100px] mt-8 flex w-full max-w-[872px] flex-col bg-black px-4 py-8 lg:mb-[84px] lg:mt-16 lg:px-10 lg:py-8">
      <!-- 裝飾用 Header -->
      <div class="h-auto w-full">
        <NuxtImg
          src="/home/agenda/agenda-id-top-decorate.svg"
          alt="drawer-top-decorate-lg"
          class="block w-full sm:hidden"
        />
        <NuxtImg
          src="/home/agenda/agenda-id-top-decorate-lg.svg"
          alt="drawer-top-decorate-lg"
          class="hidden w-full sm:block"
        />
      </div>

      <Breadcrumb class="my-6 lg:mb-8 lg:mt-10">
        <BreadcrumbList class="gap-2">
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              class="text-base text-white hover:text-white"
            >
              首頁
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator>
            <Icon
              name="i-heroicons-chevron-right-20-solid"
              class="size-5 text-white"
            />
          </BreadcrumbSeparator>

          <BreadcrumbItem>
            <BreadcrumbLink
              href="/agenda"
              class="text-base text-white hover:text-white"
            >
              議程
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator>
            <Icon
              name="i-heroicons-chevron-right-20-solid"
              class="size-5 text-white"
            />
          </BreadcrumbSeparator>

          <BreadcrumbItem>
            <BreadcrumbPage class="text-base font-bold text-white">
              {{ speakerNames }}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div class="grow">
        <AgendaDrawerWrapper />
      </div>

      <!-- 裝飾用 Footer -->
      <div class="mt-auto flex h-auto w-full justify-center border-b border-primary-green pb-2">
        <NuxtImg
          src="/footer/bar.svg"
          alt="drawer-top-decorate-lg"
          width="56"
          height="10"
        />
      </div>
    </div>
  </div>
</template>
