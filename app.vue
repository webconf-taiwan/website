<script lang="ts" setup>
import { useDateCountdown } from '@/composables/useCountDown'
import AOS from 'aos'
import { showEasterEgg } from './utils/easterEgg'

const { hasShownAnimation } = useLoadingState()
const { isTimeUp } = useDateCountdown()

const route = useRoute()
const isHome = computed(() => route.name === 'index')

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
    <FirstLoadingAnimation v-if="!hasShownAnimation && isHome" />
    <TilesBackground />
    <CountBar v-if="!isTimeUp" />
  </Teleport>

  <Body :class="{ 'home-bg': isHome }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </Body>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: brightness(0%);
}
</style>
