<script lang="ts" setup>
import { useDateCountdown } from '@/composables/useCountDown'
import AOS from 'aos'
import { showEasterEgg } from './utils/easterEgg'

const { hasShownAnimation } = useLoadingState()
const { isTimeUp } = useDateCountdown()

const route = useRoute()

showEasterEgg()

onMounted(() => {
  AOS.init({
    duration: 1000,
    once: true,
  })
})
</script>

<template>
  <NuxtRouteAnnouncer />

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
