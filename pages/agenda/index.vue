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

/**
 * TOOD :
 * 變更議程日期時，url 加上 query string
 */
</script>

<template>
  <ClientOnly>
    <FloatingActionButtons>
      <FilterButton v-if="isSmallerLg" />
      <MoveToTop :over-top="300" />
    </FloatingActionButtons>
  </ClientOnly>

  <div class="mx-auto mt-20 lg:mt-32">
    <SectionTitle class="mb-12 justify-center">
      <template #title>
        PROGRAM
      </template>
      <template #subTitle>
        議程
      </template>
    </SectionTitle>

    <AgendaTagsContainer class="mb-9 lg:mb-11" />

    <AgendaDatepicker />
  </div>
</template>

<style scoped></style>
