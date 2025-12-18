<script setup lang="ts">
interface Props {
  isSelected?: boolean
  fillEffect?: boolean
  /**
   * showSquare
   * - true: 顯示方塊，填充效果以矩形縮放呈現
   * - false: 以 1px 顯示，填充效果以淡入淡出呈現
   */
  showSquare?: boolean
}

const {
  isSelected = true,
  fillEffect = false,
  showSquare = true,
} = defineProps<Props>()

const cardRef = ref<HTMLElement>()
const { width, height } = useElementSize(cardRef, undefined, {
  box: 'border-box',
})

// 根據螢幕尺寸決定初始方塊大小 (行動版 20px, 桌面版 28px)
const initialSize = computed(() => (width.value >= 1280 ? 28 : 20))
</script>

<template>
  <div
    ref="cardRef"
    class="group relative h-full border-b-[0.5px] border-webconf-gray bg-black duration-300 lg:border-r-[0.5px]"
  >
    <ShareScaleSquare
      v-if="fillEffect"
      :target-width="width"
      :target-height="height"
      :initial-size="initialSize"
      :show-square="showSquare"
    />

    <!-- 卡片內容 -->
    <div class="relative">
      <slot></slot>
    </div>

    <div
      :class="{
        'opacity-0': isSelected,
        'opacity-70': !isSelected,
      }"
      class="pointer-events-none absolute inset-0 z-[5] size-full bg-black duration-300"
    ></div>

    <slot name="floating-block"></slot>
  </div>
</template>
