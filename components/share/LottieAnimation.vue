<script setup lang="ts">
interface Props {
  src?: string
  width?: string
  height?: string
  loop?: boolean
  autoplay?: boolean
  speed?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '200px',
  loop: true,
  autoplay: true,
  speed: 1,
})

const containerRef = ref<HTMLElement>()

// 使用 Lottie composable
const { load, play, pause, stop, isLoaded } = useLottie()

// 計算容器樣式
const containerStyle = computed(() => ({
  width: props.width,
  height: props.height,
}))

// 載入動畫
async function loadAnimation() {
  if (!containerRef.value || !props.src)
    return

  await load(containerRef.value, {
    src: props.src,
    loop: props.loop,
    autoplay: props.autoplay,
    speed: props.speed,
  })
}

// 暴露方法給父組件使用
defineExpose({
  play,
  pause,
  stop,
  isLoaded,
  speed: props.speed,
})

// 生命週期
onMounted(() => {
  if (process.client) {
    nextTick(() => {
      loadAnimation()
    })
  }
})
</script>

<template>
  <ClientOnly>
    <div
      ref="containerRef"
      :style="containerStyle"
    ></div>
  </ClientOnly>
</template>
