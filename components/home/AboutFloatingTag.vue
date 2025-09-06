<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

interface Props {
  text: string
  position?: {
    top?: string
    left?: string
    bottom?: string
    right?: string
  }
}

const _ = defineProps<Props>()

const gsap = useGsap()
const tagRef = ref<any>(null)

onMounted(() => {
  nextTick()

  if (!tagRef.value)
    return

  const floatTag = (element: HTMLElement) => {
    gsap.to(element, {
      // 每次動畫都會產生一個以 DOM 的座標為原點的隨機座標
      x: Math.random() * 40 - 20,
      y: Math.random() * 40 - 20,
      duration: Math.random() * 3 + 2,
      ease: 'power1.inOut',

      // 使用遞迴呼叫讓動畫停止後可以進入下一次動畫
      onComplete: () => floatTag(element),
    })
  }
  floatTag(tagRef.value.$el)
})
</script>

<template>
  <ShareBlueTag
    ref="tagRef"
    :text="text"
    :style="position"
    class="floating-tag absolute"
  />
</template>
