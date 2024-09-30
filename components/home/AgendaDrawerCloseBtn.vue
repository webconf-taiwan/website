<script lang="ts" setup>
const { closeDrawer } = defineProps<{
  closeDrawer: () => void
}>()
</script>

<template>
  <DrawerClose
    breakpoint="lg"
    @close="closeDrawer"
  />
</template>
