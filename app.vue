<script lang="ts" setup>
import { appName } from '@/constants'

useHead({
  title: appName,
})
</script>

<template>
  <Teleport to="body">
    <!-- <TilesCanvas /> -->
    <TilesBackground />
  </Teleport>

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
</style>
