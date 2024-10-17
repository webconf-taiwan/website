<script setup lang="ts">
</script>

<template>
  <button
    type="button"
    class="flex size-10 items-center justify-center bg-primary-green"
    style="clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 12px 100%, 0% calc(100% - 12px));"
    @click="() => console.log('click')"
  >
    <Icon
      name="i-heroicons-adjustments-horizontal"
      class="text-black"
      size="24"
    />
  </button>
</template>

<style scoped></style>
