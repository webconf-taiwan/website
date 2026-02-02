<script setup lang="ts">
/**
 * TagFilterMenuButton
 * 開啟議程類型篩選選單的按鈕
 */
interface Props {
  isMenuOpen: boolean
  size: 'sm' | 'lg'
  selectedTagsCount: number
}

defineProps<Props>()
</script>

<template>
  <label class="group relative z-20">
    <button
      type="button"
      :class="{
        'size-11': size === 'lg',
        'size-10': size === 'sm',
        'bg-webconf-blue': selectedTagsCount > 0,
      }"
      class="flex-center relative border border-webconf-blue duration-300 group-hover:bg-webconf-blue lg:bg-black"
      aria-label="開啟議程類型篩選選單"
    >
      <img
        src="/images/icon/filter.svg"
        alt="議程類型篩選"
      />

      <span
        v-if="selectedTagsCount > 0"
        class="flex-center absolute -right-1 -top-1 size-[14px] rounded-full border border-black bg-white text-[8px] text-black lg:hidden"
        aria-label="已選中的議程類型數量"
      >
        {{ selectedTagsCount }}
      </span>
    </button>

    <div
      class="tag-filter-title mt-2 hidden -translate-x-1 text-left text-h4-60 text-webconf-blue duration-300 group-hover:text-white lg:block"
    >
      FILTER
      <span
        v-if="selectedTagsCount > 0"
        class="inline-block -translate-y-2 translate-x-2 text-h5-20 leading-none"
      >
        ({{ selectedTagsCount }})
      </span>
    </div>
  </label>
</template>

<style scoped>
.tag-filter-title {
  writing-mode: vertical-lr;
}
</style>
