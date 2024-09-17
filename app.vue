<script lang="ts" setup>
import { appName } from '@/constants'

const { hasShownAnimation } = useLoadingState()

useHead({
  title: appName,
})
</script>

<template>
  <Teleport to="body">
    <!-- <FirstLoadingAnimation v-if="!hasShownAnimation" /> -->
    <TilesBackground />
  </Teleport>

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
</style>
