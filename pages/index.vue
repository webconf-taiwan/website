<script lang="ts" setup>
const { hasShownAnimation } = useLoadingState()
const nuxtApp = useNuxtApp()

nuxtApp.hook('page:finish', () => {
  window.scrollTo(0, 0)
})

onMounted(() => {
  if (hasShownAnimation.value) {
    window.scrollTo(0, 0)
  }
})
</script>

<template>
  <HomeBanner />
  <HomeAgendaSection />
  <HomeSpeakersSection />
</template>
