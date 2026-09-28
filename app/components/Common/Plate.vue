<script setup>
// 區塊卷號（PL. II / II. / ABOUT 那三行）。PL.II ～ PL.VI 都用這一支。
//
// 窄視窗橫排一行、桌機直排 —— 這是設計稿的規則，不是各區塊各自的選擇，
// 所以寫在元件裡。定位（絕對定位、左右邊距）才是各區塊自己的事，用 class 傳進來：
//
//   <CommonPlate :data="plate" data-fade="in" />
//   <CommonPlate :data="plate" class="lg:absolute lg:inset-x-[60px] lg:top-[60px]" />
//   <CommonPlate :data="plate" :divider="false" />
//
// class 落在根元素（有分隔線時是畫線的外層）；data-fade 在有分隔線時會轉給內層文字，
// 線本身不淡入（見 template）。
//
// ⚠️ PL.VII（CodeOfConduct）沒有用這一支：它只印 code 一行，後面接的是大標題，
// 版面語彙跟這裡的三行卷號不同。

// attrs 自己分配（見 template）：有分隔線時 data-fade 要落在內層文字，不能落在畫線的外層
defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const outerAttrs = computed(() => {
  const { 'data-fade': _fade, ...rest } = attrs
  return rest
})

defineProps({
  // { code, number, label }
  data: {
    type: Object,
    default: () => ({})
  },
  // 頂端那條分隔線。About 的線要橫貫整個區塊（畫在外層 grid 容器上），
  // 這裡再畫一條會變成兩條，所以那邊要關掉。
  divider: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <!-- 有分隔線：外層畫線＋吃呼叫端的定位 class，data-fade 只給內層文字。
       ⚠️ 線不能跟著淡入 —— 右欄自己也有一段 border-t，卷號這段往上飄、另一段不動，
       一條線看起來會斷成兩截各自進場。 -->
  <div
    v-if="divider"
    v-bind="outerAttrs"
    class="border-t border-pre-800/35 py-6 lg:py-8"
  >
    <div
      :data-fade="attrs['data-fade']"
      class="flex flex-row items-baseline gap-x-4 lg:flex-col lg:gap-x-0"
    >
      <p class="text-meta text-pre-800/80">
        {{ data.code }}
      </p>
      <p class="text-en-display text-pre-800">
        {{ data.number }}
      </p>
      <p class="text-meta text-pre-800/80">
        {{ data.label }}
      </p>
    </div>
  </div>
  <!-- 沒有分隔線：維持單層，所有 attrs（含 PlatePage 覆寫 flex 排列的 class）都在根元素 -->
  <div
    v-else
    v-bind="attrs"
    class="flex flex-row items-baseline gap-x-4 py-6 lg:py-8 lg:flex-col lg:gap-x-0"
  >
    <p class="text-meta text-pre-800/80">
      {{ data.code }}
    </p>
    <p class="text-en-display text-pre-800">
      {{ data.number }}
    </p>
    <p class="text-meta text-pre-800/80">
      {{ data.label }}
    </p>
  </div>
</template>
