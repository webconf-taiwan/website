<script setup lang="ts">
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
</script>

<template>
  <div class="mx-auto">
    <SectionTitle class="mb-12 justify-center">
      <template #title>
        PROGRAM
      </template>
      <template #subTitle>
        議程
      </template>
    </SectionTitle>

    <AgendaTags />
  </div>
</template>

<style scoped></style>
