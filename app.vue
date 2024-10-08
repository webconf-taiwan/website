<script lang="ts" setup>
import { showEasterEgg } from './utils/easterEgg'

const { hasShownAnimation } = useLoadingState()

const route = useRoute()

showEasterEgg()
</script>

<template>
  <NuxtRouteAnnouncer />

  <Teleport to="body">
    <FirstLoadingAnimation v-if="!hasShownAnimation && route.name === 'index'" />
    <TilesBackground />
  </Teleport>

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
</style>
