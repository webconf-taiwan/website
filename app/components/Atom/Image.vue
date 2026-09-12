<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: 'auto'
  },
  height: {
    type: [String, Number],
    default: 'auto'
  },
  loading: {
    type: String,
    default: 'lazy'
  }
})

const imageUrl = computed(() => props.src)
const isLoading = ref(true)
const hasError = ref(false)
</script>

<template>
  <div class="relative" :style="{ width, height }">
    <div
      v-if="isLoading && !hasError"
      class="absolute inset-0 flex items-center justify-center bg-gray-100"
    >
      <div class="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand"></div>
    </div>

    <div
      v-if="hasError"
      class="absolute inset-0 flex items-center justify-center bg-gray-100"
    >
      <span class="text-zh-body-md text-gray-400">圖片載入失敗</span>
    </div>

    <img
      v-show="!hasError"
      :src="imageUrl"
      :alt="alt"
      :loading="loading"
      class="size-full object-cover"
      @load="isLoading = false"
      @error="hasError = true"
    />
  </div>
</template>
