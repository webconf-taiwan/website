<script setup lang="ts">
import { CUSTOM_AGENDA_ITEM, SPEAKERS } from '~/constants/agenda'

useSeoMeta({
  title: '講者陣容',
  description:
    'WebConf Taiwan 2025 再次集結產業各領域的專家，講者不只是分享技術與設計實務，更是一次難得的跨領域對話，你會聽到真實的挑戰、失敗背後的思考、團隊如何解題，以及那些改變產品方向的關鍵洞察。',
})

// 議程類型篩選
const { selectedTags, handleTagClick } = useSelectedTags()
const isMenuOpen = ref(false)
</script>

<template>
  <div>
    <ShareBanner
      title="SPEAKERS"
      sub-title="講者陣容"
    />

    <main
      class="mr-[-0.5px] min-h-screen border-b border-webconf-gray bg-black text-webconf-gray"
    >
      <section
        class="sticky top-[54px] z-10 border-b border-webconf-gray bg-black lg:hidden"
      >
        <div class="group flex justify-end p-4">
          <label class="flex items-center gap-3">
            <span
              class="text-[28px] font-semibold leading-none text-webconf-blue duration-300 group-hover:text-white"
            >
              FILTER
            </span>

            <ShareTagFilterMenuButton
              :is-menu-open="isMenuOpen"
              size="sm"
              :selected-tags-count="selectedTags.length"
              @click="isMenuOpen = true"
            />
          </label>
        </div>

        <div
          v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
          class="relative z-30"
        ></div>
      </section>

      <section class="relative flex">
        <LazyShareTagFilterMenuAside
          v-model:is-open="isMenuOpen"
          v-model:selected-tags="selectedTags"
          class="lg:top-[54.5px]"
          hydrate-on-idle
        />

        <!-- 講者卡片 -->
        <div
          class="relative z-0 grid w-full grid-cols-1 lg:grid-cols-3 xl:grid-cols-4"
        >
          <LazySpeakerCard
            v-for="(speaker, index) in [...SPEAKERS, CUSTOM_AGENDA_ITEM]"
            :key="`${speaker.name}-${index}`"
            :selected-tags="selectedTags"
            :speaker="speaker"
            :is-selected="
              speaker.tags?.some((tag) => selectedTags.includes(tag))
                || selectedTags.length === 0
            "
            hydrate-on-idle
            @tag-click="handleTagClick"
          />
        </div>
      </section>
    </main>

    <!-- 講者資訊彈跳視窗 -->
    <NuxtPage />
  </div>
</template>

<style scoped>
/* 淡入淡出效果 */
.speakers-fade-enter-active,
.speakers-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.speakers-fade-enter-from,
.speakers-fade-leave-to {
  opacity: 0;
}

.speakers-fade-enter-to,
.speakers-fade-leave-from {
  opacity: 1;
}

.speakers-fade-move {
  transition: opacity 0.3s ease-in-out;
}
</style>
