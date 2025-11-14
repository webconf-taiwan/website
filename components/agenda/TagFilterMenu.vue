<script setup lang="ts">
import type { AgendaTag } from '~/types'

const isOpen = defineModel<boolean>('isOpen', { required: true })
const selectedTags = defineModel<AgendaTag[]>('selectedTags', {
  required: true,
})

const tags: AgendaTag[] = [
  'Frontend',
  'Backend',
  'DevOps',
  'Security',
  'Agile',
  'AI',
  '產品思維',
  '產業應用',
  '團隊管理',
  '軟體設計',
  '設計實務',
]

// 監聽 ESC 鍵關閉選單
function handleEscKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

watch(isOpen, (newValue) => {
  if (newValue) {
    window.addEventListener('keydown', handleEscKey)
  }
  else {
    window.removeEventListener('keydown', handleEscKey)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscKey)
})

// 處理標籤切換
function toggleTag(tag: AgendaTag) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  }
  else {
    selectedTags.value = [...selectedTags.value, tag]
  }
}
</script>

<template>
  <transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-200 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <section
      v-if="isOpen"
      key="tag-filter-menu"
      class="tag-filter-menu absolute left-0 top-0 z-50 h-full w-screen border-webconf-gray bg-black px-12 py-6 lg:size-full lg:w-[228px] lg:border-r lg:pl-4 2xl:w-[260px] 2xl:pl-12"
    >
      <button
        class="flex-center group size-10 bg-white duration-300 hover:bg-webconf-blue lg:size-[44px]"
        aria-label="關閉篩選選單"
        @click="isOpen = false"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.9614 4.96985C18.2542 4.67687 18.73 4.67705 19.0229 4.96985C19.3156 5.26265 19.3156 5.73751 19.0229 6.0304L13.0601 11.9952L19.0308 17.9698C19.3235 18.2628 19.3236 18.7376 19.0308 19.0304C18.7379 19.323 18.263 19.3231 17.9702 19.0304L12.0005 13.0568L6.03076 19.0304C5.73796 19.3231 5.26312 19.3231 4.97021 19.0304C4.67742 18.7376 4.67755 18.2628 4.97021 17.9698L10.9399 11.9952L4.97803 6.0304C4.68536 5.73755 4.68545 5.26268 4.97803 4.96985C5.27101 4.67705 5.74675 4.67687 6.03955 4.96985L12.0005 10.9347L17.9614 4.96985Z"
            class="fill-webconf-black duration-300 group-hover:fill-white"
          />
        </svg>
      </button>

      <ul class="mt-7 flex flex-col gap-2 lg:mt-6">
        <li>
          <label
            class="flex items-center gap-[10px] text-body-18 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-webconf-blue"
            role="button"
            tabindex="0"
            @click="selectedTags = []"
            @keydown.enter.prevent="selectedTags = []"
            @keydown.space.prevent="selectedTags = []"
          >
            <span
              :class="{ 'border-white bg-white': selectedTags.length === 0 }"
              class="inline-block size-3 border-2 border-webconf-blue duration-300"
            ></span>

            <span
              :class="{ 'text-white': selectedTags.length === 0 }"
              class="text-gray-500 duration-300"
            >{{ "全部" }}</span>
          </label>
        </li>

        <li
          v-for="tag in tags"
          :key="tag"
        >
          <label
            class="flex items-center gap-[10px] text-body-18 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-webconf-blue"
            @keydown.enter.prevent="toggleTag(tag as AgendaTag)"
            @keydown.space.prevent="toggleTag(tag as AgendaTag)"
          >
            <input
              v-model="selectedTags"
              type="checkbox"
              :value="tag"
              class="sr-only"
            />

            <span
              :class="{
                'border-white bg-white': selectedTags.includes(
                  tag as AgendaTag,
                ),
              }"
              class="inline-block size-3 border-2 border-webconf-blue duration-300"
            ></span>

            <span
              :class="{ 'text-white': selectedTags.includes(tag as AgendaTag) }"
              class="text-gray-500 duration-300"
            >{{ tag }}</span>
          </label>
        </li>
      </ul>
    </section>
  </transition>
</template>

<style scoped>
.tag-filter-menu {
  background-image: url("/images/tag-filter-menu-bg.webp");
  background-position: top right;
  background-repeat: repeat-y;
}
</style>
