<script lang="ts" setup>
import { useDateCountdown } from '@/composables/useCountDown'
import { showEasterEgg } from './utils/easterEgg'

const { hasShownAnimation } = useLoadingState()
const { isTimeUp } = useDateCountdown()

const route = useRoute()

showEasterEgg()
</script>

<template>
  <Teleport to="body">
    <FirstLoadingAnimation v-if="!hasShownAnimation && route.name === 'index'" />
    <TilesBackground />
    <CountBar v-if="!isTimeUp" />
  </Teleport>

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
</style>
