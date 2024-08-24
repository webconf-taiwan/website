<script lang="ts" setup>
const online = useOnline()
</script>

<template>
  <div>
    <Logos class="mb-4" />
    <PageView v-if="online" />
    <div
      v-else
      class="text-gray-600 dark:text-gray-400"
    >
      You are offline.
    </div>
    <InputEntry />
  </div>
</template>

<style scoped></style>
