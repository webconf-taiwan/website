<script setup lang="ts">
interface Props {
  isSelected?: boolean
  disabledSquareEffect?: boolean
  showSquare?: boolean
  isMenuOpen?: boolean
}

const {
  isSelected = true,
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
  <div
    ref="cardRef"
    class="group relative h-full border-b-[0.5px] border-webconf-gray bg-black duration-300 lg:border-r-[0.5px]"
  >
    <!-- 縮放特效方塊 -->
    <div
      v-if="!disabledSquareEffect"
      class="absolute left-0 top-0 origin-top-left bg-webconf-blue duration-300 ease-out lg:block"
      :style="{
        '--scale-x': scaleX,
        '--scale-y': scaleY,
      }"
      :class="{
        'size-5 group-hover:[transform:scale(var(--scale-x),var(--scale-y))]  lg:size-7 ':
          showSquare,
        'size-full opacity-0 group-hover:opacity-100': !showSquare,
      }"
    ></div>

    <!-- 卡片內容 -->
    <div class="relative">
      <slot></slot>
    </div>

    <!-- 半透明遮罩 -->
    <div
      v-if="!isSelected && !isMenuOpen"
      :class="{
        'opacity-0': isSelected || isMenuOpen,
        'opacity-70': !isSelected && !isMenuOpen,
      }"
      class="absolute inset-0 z-10 size-full bg-black opacity-70 duration-300"
    ></div>

    <slot name="floating-block"></slot>
  </div>
</template>
