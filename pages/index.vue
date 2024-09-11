<script lang="ts" setup>
const { hasShownAnimation } = useLoadingState()

onMounted(() => {
  if (hasShownAnimation.value) {
    window.scrollTo(0, 0)
  }
})
</script>

<template>
  <HomeBanner />

  <section class="h-screen bg-black"></section>
</template>
