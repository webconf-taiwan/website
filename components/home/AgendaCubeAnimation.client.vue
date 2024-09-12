<script setup lang="ts">
interface Props {
  animationData: object
  width: number
  height: number
  loop?: boolean
  autoplay?: boolean
  speed?: number
}

const props = withDefaults(defineProps<Props>(), {
  loop: true,
  autoplay: true,
  speed: 1,
})

const lottieOptions = computed(() => {
  return {
    animationData: props.animationData,
    loop: props.loop,
    autoplay: props.autoplay,
    speed: props.speed,
  }
})

watch(() => props.animationData, (newVal) => {
  lottieOptions.value.animationData = newVal
})

watch(() => props.loop, (newVal) => {
  lottieOptions.value.loop = newVal
})

watch(() => props.autoplay, (newVal) => {
  lottieOptions.value.autoplay = newVal
})

watch(() => props.speed, (newVal) => {
  lottieOptions.value.speed = newVal
})
</script>

<template>
  <div
    v-lottie="lottieOptions"
    :style="{ width: `${width}px`, height: `${height}px` }"
  ></div>
</template>
