<script setup>
// 議程頁的 DAY 1 / DAY 2 切換（Figma：左欄篩選上方那組按鈕；手機版在標題下方、旁邊接篩選鈕）。
// 桌機與手機各放一份，共用同一個 v-model。
defineProps({
  // [{ id, label }]
  days: { type: Array, default: () => [] },
})

const active = defineModel({ type: String, default: '' })
</script>

<template>
  <div class="flex bg-bg-mid/70 backdrop-blur-[5px]">
    <!-- 相鄰兩顆的邊框疊在一起（-ml-px），選中的那顆浮到上層，亮色邊框才不會被蓋掉一邊 -->
    <button
      v-for="(day, i) in days"
      :key="day.id"
      type="button"
      class="relative flex-1 border px-6 py-3 text-zh-btn font-medium transition-colors duration-300"
      :class="[
        i > 0 && '-ml-px',
        day.id === active
          ? 'z-10 border-accent-1 bg-gradient-to-b from-[#0F1D4E] to-[#0F1D4E]/30 text-accent-1'
          : 'border-pre-800/35 text-pre-800',
      ]"
      :aria-pressed="day.id === active"
      @click="active = day.id"
    >
      {{ day.label }}
    </button>
  </div>
</template>
