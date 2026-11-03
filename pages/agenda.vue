<script setup lang="ts">
import type { AgendaItem } from '~/types'
import { GROUPED_AGENDAS } from '~/constants/agenda'

// 開關講者彈窗（/agenda ↔ /agenda/:id）只換子路由，不捲動，留在原本的位置；從別頁進來才回到頂端
definePageMeta({
  scrollToTop: (to, from) => to.matched[0]?.path !== from.matched[0]?.path,
})

useSeoMeta({
  title: '議程資訊',
  description:
    'WebConf Taiwan 2025 完整議程資訊，包含兩天精彩內容、講者資訊、簡報與共筆連結。',
})

const { mainEvent, day1Event, day2Event } = useAgendaSeo()
useSchemaOrg([mainEvent, day1Event, day2Event])

// 議程資料
const {
  agendasAtDec12Morning,
  agendasAtDec12Afternoon,
  agendasAtDec13Morning,
  agendasAtDec13Afternoon,
} = GROUPED_AGENDAS

// 監聽 selectedDate 變化，切換時滾動到頂部
const selectedDate = ref('12')

watch(selectedDate, () => {
  const lenis = useLenis()
  if (lenis) {
    lenis.scrollTo(0)
  }
})

// 根據選定日期動態獲取議程
const currentMorningAgendas = computed(() =>
  selectedDate.value === '12' ? agendasAtDec12Morning : agendasAtDec13Morning,
)

const currentAfternoonAgendas = computed(() =>
  selectedDate.value === '12'
    ? agendasAtDec12Afternoon
    : agendasAtDec13Afternoon,
)

// 第一個時段的卡片在首屏，講者頭像直接放進 HTML 優先下載
const firstMorningTime = computed(
  () => Object.keys(currentMorningAgendas.value)[0],
)

// 議程類型篩選
const { selectedTags, handleTagClick } = useSelectedTags()
const isMenuOpen = ref(false)

// 講者彈窗的照片：碰到卡片時以 high 插隊，多人議程一次抓全部講者
const { preloadSpeakerDialog, warmSpeakerDialogs } = useSpeakerDialogImages()

function speakerIdsOf(agenda: AgendaItem) {
  return agenda.speakerInfo?.map(speaker => speaker.speakerId) ?? []
}

function speakerIdsOfDay(day: '12' | '13') {
  const groups
    = day === '12'
      ? [agendasAtDec12Morning, agendasAtDec12Afternoon]
      : [agendasAtDec13Morning, agendasAtDec13Afternoon]

  return groups.flatMap(group =>
    Object.values(group).flat().flatMap(speakerIdsOf),
  )
}

let stopWarm: (() => void) | undefined

// 頁面 load 後趁空閒只預熱目前顯示那天的講者；切到另一天再換那天的。
// 以前一進來就把兩天全部講者、每人三種尺寸一次排進去（近 150 個請求），
// 塞住同一條連線，點開彈窗要的照片跟換頁要的 _payload.json 都被拖慢
function warmDay(day: string) {
  stopWarm?.()
  stopWarm = warmSpeakerDialogs([
    ...new Set(speakerIdsOfDay(day as '12' | '13')),
  ])
}

onMounted(() => warmDay(selectedDate.value))
watch(selectedDate, warmDay)

onBeforeUnmount(() => stopWarm?.())

// 講者彈窗：多人議程只接受這幾組講者
const {
  speakers: dialogSpeakers,
  speakerIds: dialogSpeakerIds,
  open: openSpeakerDialog,
  close: closeSpeakerDialog,
} = useSpeakerDialog({
  allowedGroups: [
    ['3', '4'],
    ['33', '34'],
    ['00', '23', '24'],
  ],
})
</script>

<template>
  <div>
    <ShareBanner
      title="AGENDA"
      sub-title="議程資訊"
    />

    <main class="border-b border-webconf-gray text-webconf-gray">
      <section
        class="sticky top-[54px] z-[15] border-b border-webconf-gray bg-black sm:top-[57px] lg:top-[54px]"
      >
        <div class="flex-center py-[6px] text-h4-24 lg:py-3">
          <AgendaEventDaySwitch v-model="selectedDate" />

          <ShareTagFilterMenuButton
            :selected-tags-count="selectedTags.length"
            size="sm"
            class="ml-3 lg:hidden"
            @click="isMenuOpen = true"
          />

          <div
            class="hidden grow text-center text-h4-24 lg:grid lg:grid-cols-3"
          >
            <h3 class="col-span-1">
              M 棟
            </h3>
            <h3 class="col-span-1">
              F 棟
            </h3>
            <h3 class="col-span-1">
              A2 棟
            </h3>
          </div>
        </div>

        <div
          v-arrow="{ speed1: '10s', color: '#E6E6E6' }"
          class="relative z-30 hidden lg:block"
        ></div>
      </section>

      <section class="relative flex">
        <ShareTagFilterMenuAside
          v-model:is-open="isMenuOpen"
          v-model:selected-tags="selectedTags"
        />

        <div class="grid grow grid-cols-3 bg-black">
          <transition-group
            name="agenda-fade"
            tag="div"
            class="col-span-3"
            appear
          >
            <div
              v-if="selectedDate === '12'"
              class="relative"
            >
              <time
                class="sticky top-[107px] z-10 flex h-7 w-full items-center bg-webconf-gray px-5 text-btn-16 text-webconf-blue lg:top-[124px] lg:ml-[-86px] lg:w-[86px] lg:justify-center"
              >
                <span>09:00</span>
                <span class="lg:hidden">{{ ` - ` }}</span>
                <span class="lg:hidden">09:10</span>
              </time>

              <h2
                key="opening-speech"
                class="col-span-3 border-b-[0.5px] border-webconf-gray/50 bg-black px-5 py-7 text-h4-24 lg:py-10 lg:text-center xl:py-14"
              >
                開幕致詞
              </h2>
            </div>
          </transition-group>

          <transition-group
            name="agenda-fade"
            tag="div"
            class="col-span-3"
            appear
          >
            <div
              v-for="(agendas, time) in currentMorningAgendas"
              :key="`morning-${selectedDate}-${time}`"
              class="relative grid grid-cols-1 lg:grid-cols-3"
            >
              <!-- 時間標記 (行動版) -->
              <div
                class="sticky top-[107px] z-10 flex h-7 w-full items-center bg-webconf-gray px-5 text-btn-16 text-webconf-blue xs:top-[107px] sm:top-[109px] lg:top-[107px] lg:hidden"
              >
                <time :datetime="time">
                  {{ time }}
                </time>
                <span>{{ ` - ` }}</span>
                <time :datetime="agendas[0].endTime">
                  {{ agendas[0].endTime }}
                </time>
              </div>

              <AgendaCard
                v-for="(agenda, index) in agendas"
                :key="`${time}-${index}`"
                :data="agenda"
                :index="index"
                :time="time"
                :show-time="index === 0"
                :is-selected="
                  agenda.tags?.some((tag) => selectedTags.includes(tag))
                    || selectedTags.length === 0
                "
                :selected-tags="selectedTags"
                :priority="time === firstMorningTime"
                @tag-click="handleTagClick"
                @open="openSpeakerDialog(speakerIdsOf(agenda))"
                @mouseenter="preloadSpeakerDialog(speakerIdsOf(agenda))"
                @focusin="preloadSpeakerDialog(speakerIdsOf(agenda))"
                @touchstart.passive="preloadSpeakerDialog(speakerIdsOf(agenda))"
              />
            </div>
          </transition-group>

          <transition-group
            name="agenda-fade"
            tag="div"
            class="col-span-3"
            appear
          >
            <h2
              key="lunch-break"
              class="col-span-3 border-b-[0.5px] border-webconf-gray/50 bg-black px-5 py-7 text-h4-24 lg:py-10 lg:text-center xl:py-14"
            >
              午休時間
            </h2>
          </transition-group>

          <transition-group
            name="agenda-fade"
            tag="div"
            class="col-span-3"
            appear
          >
            <div
              v-for="(agendas, time) in currentAfternoonAgendas"
              :key="`afternoon-${selectedDate}-${time}`"
              class="relative grid grid-cols-1 lg:grid-cols-3"
            >
              <!-- 時間標記 (行動版) -->
              <div
                class="sticky top-[107px] z-10 flex h-7 w-full items-center bg-webconf-gray px-5 text-btn-16 text-webconf-blue xs:top-[107px] sm:top-[109px] lg:top-[107px] lg:hidden"
              >
                <time :datetime="time">
                  {{ time }}
                </time>
                <span>{{ ` - ` }}</span>
                <time :datetime="agendas[0].endTime">
                  {{ agendas[0].endTime }}
                </time>
              </div>

              <AgendaCard
                v-for="(agenda, index) in agendas"
                :key="`${time}-${index}`"
                :selected-tags="selectedTags"
                :data="agenda"
                :index="index"
                :time="time"
                :show-time="index === 0"
                :is-selected="
                  agenda.tags?.some((tag) => selectedTags.includes(tag))
                    || selectedTags.length === 0
                "
                @tag-click="handleTagClick"
                @open="openSpeakerDialog(speakerIdsOf(agenda))"
                @mouseenter="preloadSpeakerDialog(speakerIdsOf(agenda))"
                @focusin="preloadSpeakerDialog(speakerIdsOf(agenda))"
                @touchstart.passive="preloadSpeakerDialog(speakerIdsOf(agenda))"
              />
            </div>
          </transition-group>

          <transition-group
            name="agenda-fade"
            tag="div"
            class="col-span-3"
            appear
          >
            <div
              v-if="selectedDate === '13'"
              class="relative"
            >
              <time
                class="sticky top-[107px] z-[5] flex h-7 w-full items-center bg-webconf-gray px-5 text-btn-16 text-webconf-blue lg:top-[124px] lg:ml-[-86px] lg:w-[86px] lg:justify-center"
              >
                <span>17:15</span>
                <span class="lg:hidden">{{ ` - ` }}</span>
                <span class="lg:hidden">17:25</span>
              </time>

              <h2
                key="opening-speech"
                class="col-span-3 border-b-[0.5px] border-webconf-gray/50 bg-black px-5 py-7 text-h4-24 lg:py-10 lg:text-center xl:py-14"
              >
                閉幕致詞
              </h2>
            </div>
          </transition-group>
        </div>
      </section>
    </main>

    <!-- 講者資訊彈跳視窗：渲染在這裡，點卡片當下就打開；子路由只負責網址 -->
    <AgendaSpeakersDetailsDialog
      v-if="dialogSpeakers.length > 0"
      :speaker="dialogSpeakers"
      :speaker-ids="dialogSpeakerIds"
      @close="closeSpeakerDialog"
    />
    <NuxtPage />
  </div>
</template>

<style scoped>
/* 議程淡入淡出效果 */
.agenda-fade-enter-active,
.agenda-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.agenda-fade-enter-from,
.agenda-fade-leave-to {
  opacity: 0;
}

.agenda-fade-enter-to,
.agenda-fade-leave-from {
  opacity: 1;
}

/*
 * 切換日期時舊的那天直接移出版面，只讓新的一天淡入。
 * 舊的留在版面上淡出時，兩天的議程會疊在一起，頁面高度瞬間變兩倍再縮回來，看起來會閃一下
 */
.agenda-fade-leave-active {
  display: none;
}

.agenda-fade-move {
  transition: opacity 0.3s ease-in-out;
}
</style>
