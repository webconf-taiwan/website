<script lang="ts" setup>
import { appName } from '@/constants'
import { showEasterEgg } from './utils/easterEgg'

const { hasShownAnimation } = useLoadingState()

useHead({
  title: appName,
})

showEasterEgg()
</script>

<template>
  <Teleport to="body">
    <FirstLoadingAnimation v-if="!hasShownAnimation" />
    <TilesBackground />
  </Teleport>

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
</style>
