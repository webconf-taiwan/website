<script lang="ts" setup>
const { positionValue } = defineProps<{
  positionValue: number
}>()
</script>

<template>
  <div
    :class="`absolute left-${positionValue} top-${positionValue} size-[10px] border-l border-t border-primary-green`"
  ></div>
  <div
    :class="`absolute right-${positionValue} top-${positionValue} size-[10px] border-r border-t border-primary-green`"
  ></div>
  <div
    :class="`absolute bottom-${positionValue} right-${positionValue} size-[10px] border-b border-r border-primary-green`"
  ></div>
  <div
    :class="`absolute bottom-${positionValue} left-${positionValue} size-[10px] border-b border-l border-primary-green`"
  ></div>
</template>
