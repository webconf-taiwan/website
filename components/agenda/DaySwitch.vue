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
      class="flex h-10 w-[213px] border border-webconf-blue lg:h-[46px] lg:w-[150px]"
    >
      <button
        type="button"
        class="flex-center w-full duration-300"
        :class="
          selectedDate === '12'
            ? 'bg-webconf-blue text-white'
            : 'text-webconf-gray'
        "
        aria-label="篩選 12 月 12 日的議程"
        @click="selectedDate = '12'"
      >
        12
      </button>
      <button
        type="button"
        class="flex-center w-full duration-300"
        :class="
          selectedDate === '13'
            ? 'bg-webconf-blue text-white'
            : 'text-webconf-gray'
        "
        aria-label="篩選 12 月 13 日的議程"
        @click="selectedDate = '13'"
      >
        13
      </button>
    </div>
  </div>
</template>
