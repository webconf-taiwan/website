<script lang="ts" setup>
const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <button
    class="absolute right-0 top-0 p-3"
    @click="emit('close')"
  >
    <Icon
      size="40"
      name="i-heroicons-x-mark"
      class="text-primary-green"
    />
  </button>
</template>
