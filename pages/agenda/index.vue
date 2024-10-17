<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { appDescription, appName, ogImageLink } from '~/constants'

useSeoMeta({
  title: '議程 | 2024 WebConf Taiwan',
  description: appDescription,
  ogTitle: appName,
  ogDescription: appDescription,
  ogImage: ogImageLink,
  twitterTitle: appName,
  twitterDescription: appDescription,
  twitterImage: ogImageLink,
  twitterCard: 'summary_large_image',
})

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')
</script>

<template>
  <div class="mx-auto mt-20 lg:mt-32">
    <SectionTitle class="mb-12 justify-center">
      <template #title>
        PROGRAM
      </template>
      <template #subTitle>
        議程
      </template>
    </SectionTitle>

    <AgendaTags class="mb-9 lg:mb-11" />

    <AgendaDatepicker />
  </div>

  <ClientOnly>
    <FloatingActionButtons v-if="isSmallerLg">
      <FilterButton />
      <MoveToTop :over-top="300" />
    </FloatingActionButtons>
  </ClientOnly>
</template>

<style scoped></style>
