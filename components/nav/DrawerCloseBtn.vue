<script lang="ts" setup>
const { closeDrawer } = defineProps<{
  closeDrawer: () => void
}>()
</script>

<template>
  <button
    class="fixed right-0 top-0 p-3"
    @click="closeDrawer"
  >
    <Icon
      name="material-symbols:close"
      class="size-6 text-primary-green"
    />
  </button>
</template>
