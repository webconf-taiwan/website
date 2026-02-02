<script setup lang="ts">
interface Props {
  isSelected?: boolean
  fillEffect?: boolean
  /**
  /**
   * showSquare
   * - true: 顯示方塊，填充效果以矩形縮放呈現
   * - false: 以 1px 顯示，填充效果以淡入淡出呈現
   */
  showSquare?: boolean
  /**
   * 客製化方塊目標寬度（若無則使用卡片本身寬度）
   */
  squareTargetWidth?: number
  /**
   * 客製化方塊目標高度（若無則使用卡片本身高度）
   */
  squareTargetHeight?: number
  /**
   * 是否顯示右側邊框 (Desktop)
   */
  showRightBorder?: boolean
}

const {
  isSelected = true,
  fillEffect = false,
  showSquare = true,
  showRightBorder = true,
} = defineProps<Props>()

const cardRef = ref<HTMLElement>()
const { width, height } = useElementSize(cardRef, undefined, {
  box: 'border-box',
})
const { width: windowWidth } = useWindowSize()

// 根據螢幕尺寸決定初始方塊大小 (行動版 20px, 桌面版 28px)
// 對應 ShareScaleSquare 的 size-5 (20px) 與 lg:size-7 (28px)
const initialSize = computed(() => (windowWidth.value >= 1024 ? 28 : 20))
</script>

<template>
  <div
    ref="cardRef"
    class="group relative h-full border-b-[0.5px] border-webconf-gray bg-black duration-300"
    :class="{
      'lg:border-r-[0.5px]': showRightBorder,
    }"
  >
    <ShareScaleSquare
      v-if="fillEffect"
      :target-width="squareTargetWidth ?? width"
      :target-height="squareTargetHeight ?? height"
      :initial-size="initialSize"
      :show-square="showSquare"
    />

    <!-- 卡片內容 -->
    <div class="relative h-full">
      <slot></slot>
    </div>

    <div
      :class="{
        'opacity-0': isSelected,
        'opacity-70': !isSelected,
      }"
      class="pointer-events-none absolute inset-0 z-[5] size-full bg-black duration-300"
    ></div>
  </div>
</template>
