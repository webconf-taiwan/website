<script setup lang="ts">
/**
 * TagFilterMenuAside
 * 議程類型篩選選單側邊欄
 */
import type { AgendaTag } from '~/types'

const isOpen = defineModel<boolean>('isOpen', {
  required: true,
})
const selectedTags = defineModel<AgendaTag[]>('selectedTags', {
  required: true,
})

const showAside = ref(false)

// 延遲隱藏 aside 以確保過渡完成
watch(isOpen, (newValue) => {
  if (newValue) {
    showAside.value = true
  }
  else {
    setTimeout(() => {
      showAside.value = false
    }, 200)
  }
})
</script>

<template>
  <aside
    :class="{
      'z-20 flex lg:z-[14]': isOpen || showAside,
      'hidden lg:z-auto lg:flex': !isOpen && !showAside,
    }"
    class="fixed top-[54.5px] h-[calc(100dvh-54px)] w-0 shrink-0 flex-col items-start self-start border-webconf-gray bg-black lg:sticky lg:top-[124.5px] lg:w-[228px] lg:border-r lg:p-4 2xl:w-[260px] 2xl:pl-12"
  >
    <ShareTagFilterMenuButton
      size="lg"
      :selected-tags-count="selectedTags.length"
      @click="isOpen = true"
    />

    <ShareTagFilterMenu
      v-model:is-open="isOpen"
      v-model:selected-tags="selectedTags"
    />

    <div
      :class="{
        'opacity-100': isOpen,
        'opacity-0': !isOpen,
      }"
      class="absolute inset-0 size-full bg-black/30 duration-300"
      @click="isOpen = false"
    ></div>
  </aside>
</template>
