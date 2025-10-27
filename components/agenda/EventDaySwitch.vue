<script setup lang="ts">
const selectedDate = defineModel<string>({ required: true })
</script>

<template>
  <div
    class="flex items-center justify-end gap-2 lg:w-[228px] lg:pl-4 2xl:w-[260px] 2xl:pl-12"
  >
    <span>DEC. </span>

    <div
      v-cursor="{
        scale: 0.5,
        duration: 0.5,
      }"
      class="relative flex h-10 w-[213px] overflow-hidden border border-webconf-blue lg:h-[46px] lg:w-[150px]"
    >
      <!-- 滑動的藍色背景 -->
      <div
        class="absolute inset-y-0 w-1/2 bg-webconf-blue transition-transform duration-300 ease-in-out"
        :class="selectedDate === '13' ? 'translate-x-full' : 'translate-x-0'"
      ></div>

      <button
        type="button"
        class="flex-center relative z-10 w-full transition-colors duration-300"
        :class="selectedDate === '12' ? 'text-white' : 'text-webconf-gray'"
        aria-label="篩選 12 月 12 日的議程"
        @click="selectedDate = '12'"
      >
        12
      </button>
      <button
        type="button"
        class="flex-center relative z-10 w-full transition-colors duration-300"
        :class="selectedDate === '13' ? 'text-white' : 'text-webconf-gray'"
        aria-label="篩選 12 月 13 日的議程"
        @click="selectedDate = '13'"
      >
        13
      </button>
    </div>
  </div>
</template>
