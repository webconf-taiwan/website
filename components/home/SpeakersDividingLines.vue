<script setup lang="ts">
defineProps<{
  isShowSkeleton: boolean
}>()
</script>

<template>
  <div
    v-show="!isShowSkeleton"
    class="grid-speakers-separator-line left-0"
  ></div>
  <div
    v-show="!isShowSkeleton"
    class="grid-speakers-separator-line left-1/2 sm:left-1/3"
  ></div>
  <div
    v-show="!isShowSkeleton"
    class="grid-speakers-separator-line hidden sm:left-2/3 sm:block"
  ></div>
</template>
