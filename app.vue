<script lang="ts" setup>
import { showEasterEgg } from './utils/easterEgg'

const { hasShownAnimation } = useLoadingState()

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
