<script setup lang="ts">
interface Props {
  isSelected?: boolean
  link: string
  disabledSquareEffect?: boolean
  showSquare?: boolean
}

const {
  isSelected = false,
  link,
  disabledSquareEffect = false,
  showSquare = true,
} = defineProps<Props>()

const cardRef = ref<HTMLElement>()
const { width, height } = useElementSize(cardRef, undefined, {
  box: 'border-box',
})

// 根據螢幕尺寸決定初始方塊大小 (行動版 20px, 桌面版 28px)
const initialSize = computed(() => (width.value >= 1280 ? 28 : 20))

// 計算 X 和 Y 軸各自需要的縮放比例，讓兩個方向同時到達邊界
const scaleX = computed(() => {
  const baseSize = showSquare ? initialSize.value : 1
  return width.value / baseSize
})

const scaleY = computed(() => {
  const baseSize = showSquare ? initialSize.value : 1
  return height.value / baseSize
})
</script>

<template>
  <div class="relative shadow-[0_0_0_0.5px_rgb(230,230,230)]">
    <NuxtLink
      ref="cardRef"
      class="group relative block h-full overflow-hidden bg-black transition-colors duration-300"
      :to="link"
    >
      <!-- 縮放特效方塊 -->
      <div
        v-if="!disabledSquareEffect"
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
      <div class="relative">
        <slot></slot>
      </div>

      <!-- 半透明遮罩 -->
      <div
        class="absolute inset-0 z-10 size-full bg-black opacity-0 duration-300"
        :class="{
          'block opacity-70': !!isSelected,
          'hidden': isSelected || isSelected === undefined,
        }"
      ></div>
    </NuxtLink>

    <slot name="floating-block"></slot>
  </div>
</template>
