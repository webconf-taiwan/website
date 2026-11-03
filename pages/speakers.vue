<script setup lang="ts">
import { CUSTOM_AGENDA_ITEM, SPEAKERS } from '~/constants/agenda'

// 開關講者彈窗（/speakers ↔ /speakers/:id）只換子路由，不捲動，留在原本的位置；從別頁進來才回到頂端
definePageMeta({
  scrollToTop: (to, from) => to.matched[0]?.path !== from.matched[0]?.path,
})

useSeoMeta({
  title: '講者陣容',
  description:
    'WebConf Taiwan 2025 再次集結產業各領域的專家，講者不只是分享技術與設計實務，更是一次難得的跨領域對話，你會聽到真實的挑戰、失敗背後的思考、團隊如何解題，以及那些改變產品方向的關鍵洞察。',
})

// 議程類型篩選
const { selectedTags, handleTagClick } = useSelectedTags()
const isMenuOpen = ref(false)

// 首屏的卡片數（桌機一排最多 4 張，手機一屏約 4 張）；這幾張照片直接放進 HTML 優先下載
const FIRST_SCREEN_CARDS = 4

// 講者彈窗的照片：碰到卡片時以 high 插隊，其餘在頁面 load 後趁空閒依卡片順序預熱
const speakerCards = [...SPEAKERS, CUSTOM_AGENDA_ITEM]
const { preloadSpeakerDialog, warmSpeakerDialogs } = useSpeakerDialogImages()
let stopWarm: (() => void) | undefined

onMounted(() => {
  stopWarm = warmSpeakerDialogs(
    speakerCards.map(speaker => speaker.speakerId),
  )
})

onBeforeUnmount(() => stopWarm?.())

const {
  speakers: dialogSpeakers,
  speakerIds: dialogSpeakerIds,
  open: openSpeakerDialog,
  close: closeSpeakerDialog,
} = useSpeakerDialog()
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
        <ShareTagFilterMenuAside
          v-model:is-open="isMenuOpen"
          v-model:selected-tags="selectedTags"
          class="lg:top-[54.5px]"
        />

        <!-- 講者卡片 -->
        <div
          class="relative z-0 grid w-full grid-cols-1 lg:grid-cols-3 xl:grid-cols-4"
        >
          <SpeakerCard
            v-for="(speaker, index) in speakerCards"
            :key="`${speaker.name}-${index}`"
            :selected-tags="selectedTags"
            :speaker="speaker"
            :priority="index < FIRST_SCREEN_CARDS"
            :is-selected="
              speaker.tags?.some((tag) => selectedTags.includes(tag))
                || selectedTags.length === 0
            "
            @tag-click="handleTagClick"
            @open="openSpeakerDialog([speaker.speakerId])"
            @mouseenter="preloadSpeakerDialog([speaker.speakerId])"
            @focusin="preloadSpeakerDialog([speaker.speakerId])"
            @touchstart.passive="preloadSpeakerDialog([speaker.speakerId])"
          />
        </div>
      </section>
    </main>

    <!-- 講者資訊彈跳視窗：渲染在這裡，點卡片當下就打開；子路由只負責網址 -->
    <AgendaSpeakersDetailsDialog
      v-if="dialogSpeakers.length > 0"
      :speaker="dialogSpeakers"
      :speaker-ids="dialogSpeakerIds"
      type="speakers"
      @close="closeSpeakerDialog"
    />
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
