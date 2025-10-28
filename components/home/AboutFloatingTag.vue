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

watch(tagRef, (newValue) => {
  if (newValue && newValue.$el) {
    const floatTag = (element: HTMLElement) => {
      gsap.to(element, {
        x: Math.random() * 40 - 20,
        y: Math.random() * 40 - 20,
        duration: Math.random() * 3 + 2,
        ease: 'power1.inOut',
        onComplete: () => floatTag(element),
      })
    }
    floatTag(newValue.$el)
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
