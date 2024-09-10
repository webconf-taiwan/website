<script lang="ts" setup>
const { hasShownAnimation } = useLoadingState()

onMounted(() => {
  if (hasShownAnimation.value) {
    window.scrollTo(0, 0)
  }
})
</script>

<template>
  <div class="w-full">
    <h1 class="text-2xl font-bold">
      WebConf Taiwan 2024
    </h1>

    <HomeAgendaSection />
  </div>
</template>

<style scoped></style>
