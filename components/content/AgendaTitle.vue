<script setup lang="ts">
defineProps<{
  isWorkshop?: boolean
}>()
</script>

<template>
  <h3 class="mb-2 text-[1.75rem] font-medium leading-9 text-white [&_p]:inline">
    <span
      v-if="isWorkshop"
      class="mb-2 mr-2 inline-block h-8 content-center border border-primary-green/30 bg-primary-faint-green px-2 text-xl tracking-wider"
    >
      工作坊
    </span>
    <slot></slot>
  </h3>
</template>
