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
// class 與 data-fade 都靠 Vue 的 fallthrough attrs 落到根元素上。
//
// ⚠️ PL.VII（CodeOfConduct）沒有用這一支：它只印 code 一行，後面接的是大標題，
// 版面語彙跟這裡的三行卷號不同。

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
  <div
    class="flex flex-row items-baseline gap-x-4 py-8 lg:flex-col lg:gap-x-0"
    :class="divider ? 'border-t border-pre-800/35' : ''"
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
