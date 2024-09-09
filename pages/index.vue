<script lang="ts" setup>
const { hasShownAnimation } = useLoadingState()

onMounted(() => {
  if (hasShownAnimation.value) {
    window.scrollTo(0, 0)
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">
      WebConf Taiwan 2024
    </h1>
  </div>
</template>

<style scoped></style>
