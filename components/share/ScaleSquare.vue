<script setup lang="ts">
interface Props {
  targetWidth: number
  targetHeight: number
  initialSize: number
  showSquare?: boolean
}

const props = defineProps<Props>()

const scaleX = computed(() => props.targetWidth / props.initialSize)
const scaleY = computed(() => props.targetHeight / props.initialSize)
</script>

<template>
  <div
    class="absolute left-0 top-0 origin-top-left bg-webconf-blue duration-300 ease-out lg:block"
    :style="{
      '--scale-x': scaleX,
      '--scale-y': scaleY,
    }"
    :class="{
      'size-5 group-hover:[transform:scale(var(--scale-x),var(--scale-y))] lg:size-7 ':
        showSquare,
      'size-full opacity-0 group-hover:opacity-100': !showSquare,
    }"
  ></div>
</template>
