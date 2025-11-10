<script setup lang="ts">
type BlockType = 'blue' | 'white' | 'gray-frame'

interface Props {
  type?: BlockType
  position?: string
}

const { type, position } = defineProps<Props>()

const currentType = computed(() => {
  if (!type) {
    // 隨機選擇一個 type
    const types: BlockType[] = ['blue', 'white', 'gray-frame']
    return types[Math.floor(Math.random() * types.length)]
  }
  return type
})

const currentPosition = computed(() => {
  if (!position) {
    // 隨機生成圍繞上層元素 (GridCard) 邊線 25px 的位置
    const positions = [
      // 上邊線
      'top-[-25px] left-[10%]',
      'top-[-25px] left-[30%]',
      'top-[-25px] left-[50%]',
      'top-[-25px] left-[70%]',
      'top-[-25px] right-[10%]',
      // 下邊線
      'bottom-[-25px] left-[10%]',
      'bottom-[-25px] left-[30%]',
      'bottom-[-25px] left-[50%]',
      'bottom-[-25px] left-[70%]',
      'bottom-[-25px] right-[10%]',
      // 左邊線
      'left-[-25px] top-[10%]',
      'left-[-25px] top-[30%]',
      'left-[-25px] top-[50%]',
      'left-[-25px] top-[70%]',
      'left-[-25px] bottom-[10%]',
      // 右邊線
      'right-[-25px] top-[10%]',
      'right-[-25px] top-[30%]',
      'right-[-25px] top-[50%]',
      'right-[-25px] top-[70%]',
      'right-[-25px] bottom-[10%]',
    ]
    return positions[Math.floor(Math.random() * positions.length)]
  }
  return position
})

const { gsap } = useGsap()
const blockRef = ref<HTMLElement>()

onMounted(() => {
  if (!blockRef.value)
    return

  gsap.to(blockRef.value, {
    x: () => gsap.utils.random(-10, 10),
    y: () => gsap.utils.random(-10, 10),
    duration: gsap.utils.random(1, 1.5),
    ease: 'none',
    repeat: -1,
    repeatRefresh: true,
  })
})
</script>

<template>
  <div
    ref="blockRef"
    class="pointer-events-none absolute z-20 size-[18.29px] md:size-[22.05px]"
    :class="[
      currentPosition,
      {
        'bg-[#2F2ADB]': currentType === 'blue',
        'bg-webconf-gray ': currentType === 'white',
        'border-[7.05px] border-[#909090]': currentType === 'gray-frame',
      },
    ]"
  ></div>
</template>
