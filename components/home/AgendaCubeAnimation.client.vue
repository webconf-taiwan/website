<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  animationData: object
  width?: string
  height?: string
  loop?: boolean
  autoplay?: boolean
  speed?: number
}

const {
  animationData,
  width = '100%',
  height = 'auto',
  loop = true,
  autoplay = true,
  speed = 1,
} = defineProps<Props>()

const lottieOptions = ref({
  animationData,
  loop,
  autoplay,
  speed,
})

watch(() => animationData, (newVal) => {
  lottieOptions.value.animationData = newVal
})

watch(() => loop, (newVal) => {
  lottieOptions.value.loop = newVal
})

watch(() => autoplay, (newVal) => {
  lottieOptions.value.autoplay = newVal
})

watch(() => speed, (newVal) => {
  lottieOptions.value.speed = newVal
})
</script>

<template>
  <div
    v-lottie="lottieOptions"
    :style="{ width, height }"
  ></div>
</template>
