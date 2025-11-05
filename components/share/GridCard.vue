<script setup lang="ts">
import type { AgendaTag, SpeakerInfo } from '~/types'

const props = defineProps<{
  data: SpeakerInfo & {
    tags: AgendaTag[]
  }
  isSelected: boolean
  index: number
  link: string
  showSquare: boolean
}>()

const cardRef = ref<HTMLElement>()
const { width, height } = useElementSize(cardRef, undefined, {
  box: 'border-box',
})

// 根據螢幕尺寸決定初始方塊大小 (行動版 20px, 桌面版 28px)
const initialSize = computed(() => (width.value >= 1280 ? 28 : 20))

// 計算 X 和 Y 軸各自需要的縮放比例，讓兩個方向同時到達邊界
// 當 showSquare 為 false 時，使用較小但穩定的基礎大小以確保跨平台相容性
const scaleX = computed(() => {
  const baseSize = props.showSquare ? initialSize.value : 1
  return width.value / baseSize
})

const scaleY = computed(() => {
  const baseSize = props.showSquare ? initialSize.value : 1
  return height.value / baseSize
})
</script>

<template>
  <div
    class="relative border-b-[0.5px] border-webconf-gray/50 lg:border-r-[0.5px]"
  >
    <NuxtLink
      ref="cardRef"
      class="group relative block h-full overflow-hidden bg-black transition-colors duration-300"
      :to="link"
    >
      <!-- 縮放特效方塊 -->
      <div
        class="absolute left-0 top-0 z-0 origin-top-left bg-webconf-blue transition-transform duration-300 ease-out group-hover:[transform:scale(var(--scale-x),var(--scale-y))] lg:block"
        :style="{
          '--scale-x': scaleX,
          '--scale-y': scaleY,
        }"
        :class="{
          'size-5 lg:size-7': showSquare,
          'size-px': !showSquare,
        }"
      ></div>

      <!-- 卡片內容 -->
      <div class="relative z-10">
        <slot></slot>
      </div>

      <!-- 半透明遮罩 -->
      <div
        class="absolute inset-0 z-10 size-full bg-black opacity-0 duration-300"
        :class="{
          'block opacity-70': !isSelected,
          'hidden': isSelected,
        }"
      ></div>
    </NuxtLink>
  </div>
</template>
