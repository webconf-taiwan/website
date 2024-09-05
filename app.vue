<script lang="ts" setup>
import { appName } from '@/constants'

useHead({
  title: appName,
})
</script>

<template>
  <TilesBackground />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
</style>
