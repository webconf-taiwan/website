<script setup lang="ts">
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

const { gsap } = useGsap()
const tagRef = ref<any>(null)
let animation: gsap.core.Tween | null = null

function floatTag(element: HTMLElement) {
  animation = gsap.to(element, {
    x: Math.random() * 40 - 20,
    y: Math.random() * 40 - 20,
    duration: Math.random() * 3 + 2,
    ease: 'power1.inOut',
    onComplete: () => floatTag(element),
  })
}

onMounted(() => {
  // 等待 ClientOnly 渲染完成
  nextTick(() => {
    if (tagRef.value?.$el) {
      floatTag(tagRef.value.$el)
    }
  })
})

onBeforeUnmount(() => {
  if (animation) {
    animation.kill()
    animation = null
  }
})
</script>

<template>
  <ClientOnly>
    <ShareBlueTag
      ref="tagRef"
      :text="text"
      :style="position"
      class="floating-tag absolute"
    />
  </ClientOnly>
</template>
