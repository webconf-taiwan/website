<script setup lang="ts">
interface Props {
  size: 'sm' | 'lg'
}

defineProps<Props>()
</script>

<template>
  <button
    type="button"
    :class="{
      'size-[44px]': size === 'lg',
      'size-10': size === 'sm',
    }"
    class="flex-center border border-webconf-blue duration-300 hover:bg-webconf-blue"
    aria-label="開啟議程類型篩選選單"
  >
    <img
      src="/images/icon/filter.svg"
      alt="議程類型篩選"
    />
  </button>
</template>
