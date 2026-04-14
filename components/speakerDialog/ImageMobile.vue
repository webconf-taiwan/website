<script setup lang="ts">
import type { ContentCollectionItem } from '@nuxt/content'

defineProps<{
  speaker: ContentCollectionItem[]
  pageNumber: {
    current: ContentCollectionItem['meta']
    next: ContentCollectionItem['meta']
  }
}>()

const emit = defineEmits<{
  prev: []
  next: [speakers: ContentCollectionItem[]]
}>()

const mobileImageContainerRef = ref<HTMLElement | null>(null)
defineExpose({
  mobileImageContainerRef,
})

function handlePrev() {
  emit('prev')
}

function handleNext(speakers: any[]) {
  emit('next', speakers)
}
</script>

<template>
  <div
    class="relative z-10 flex justify-center border-b border-webconf-gray lg:hidden"
  >
    <!-- 圖片容器 -->
    <div class="max-w-[210px] overflow-hidden">
      <div
        ref="mobileImageContainerRef"
        style="will-change: transform"
        class="flex"
      >
        <!-- 當前講者照片 -->
        <NuxtImg
          :src="
            typeof pageNumber.current.image === 'string'
              ? pageNumber.current.image
              : '#'
          "
          width="350"
          height="498"
          alt="講者照片"
          placeholder
          class="shrink-0"
        />

        <!-- 下一張講者照片 -->
        <NuxtImg
          :src="
            typeof pageNumber.next.image === 'string'
              ? pageNumber.next.image
              : '#'
          "
          width="350"
          height="498"
          alt="下一位講者照片"
          loading="lazy"
          class="shrink-0"
        />
      </div>
    </div>
    <div class="absolute -bottom-2 left-10 flex gap-4">
      <div class="size-4 bg-webconf-gray"></div>
      <div class="size-4 bg-webconf-gray"></div>
      <div class="size-4 bg-webconf-gray"></div>
    </div>
    <div
      v-if="speaker && speaker.length > 1"
      class="absolute left-[19px] top-1/2 flex w-[calc(100%-38px)] translate-y-[-50%] justify-between gap-3"
    >
      <button
        type="button"
        class="border border-webconf-gray bg-black p-2 text-webconf-gray transition-colors hover:bg-webconf-gray hover:text-black"
        @click="handlePrev"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.6667 19L4 12M4 12L10.6667 5M4 12L20 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        class="border border-webconf-gray bg-black p-2 text-webconf-gray transition-colors hover:bg-webconf-gray hover:text-black"
        @click="handleNext(speaker)"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.3333 5L20 12M20 12L13.3333 19M20 12L4 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
