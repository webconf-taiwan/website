<script setup lang="ts">
import type { AgendaItem, AgendaTag } from '~/types'
import { AGENDA_LIST } from '~/constants/agenda'

useSeoMeta({
  title: '議程資訊',
  description:
    'WebConf Taiwan 2025 完整議程資訊，包含兩天精彩內容、講者資訊、簡報與共筆連結。',
})

const { mainEvent, day1Event, day2Event } = useAgendaSeo()
useSchemaOrg([mainEvent, day1Event, day2Event])

// 將議程按時間分組
function groupAgendasByTime(agendas: AgendaItem[]) {
  return agendas.reduce(
    (acc, agenda) => {
      const time = agenda.startTime
      if (!acc[time]) {
        acc[time] = []
      }
      acc[time].push(agenda)
      return acc
    },
    {} as Record<string, AgendaItem[]>,
  )
}

const agendasAtDec12Morning = computed(() => {
  const morningAgendas = AGENDA_LIST.filter(
    item => item.day === '12' && item.startTime < '12:00',
  )
  return groupAgendasByTime(morningAgendas)
})

const agendasAtDec12Afternoon = computed(() => {
  const afternoonAgendas = AGENDA_LIST.filter(
    item => item.day === '12' && item.startTime >= '12:00',
  )
  return groupAgendasByTime(afternoonAgendas)
})

const agendasAtDec13Morning = computed(() => {
  const morningAgendas = AGENDA_LIST.filter(
    item => item.day === '13' && item.startTime < '12:00',
  )
  return groupAgendasByTime(morningAgendas)
})

const agendasAtDec13Afternoon = computed(() => {
  const afternoonAgendas = AGENDA_LIST.filter(
    item => item.day === '13' && item.startTime >= '12:00',
  )
  return groupAgendasByTime(afternoonAgendas)
})

// 根據當前日期決定預設顯示的議程
const selectedDate = ref(
  new Date() < new Date('2025-12-13T00:00:00+08:00') ? '12' : '13',
)

// 監聽 selectedDate 變化，切換時滾動到頂部
watch(selectedDate, () => {
  if (process.client) {
    const lenis = useLenis()
    if (lenis) {
      lenis.scrollTo(0)
    }
  }
})

// 根據選定日期動態獲取議程
const currentMorningAgendas = computed(() =>
  selectedDate.value === '12'
    ? agendasAtDec12Morning.value
    : agendasAtDec13Morning.value,
)

const currentAfternoonAgendas = computed(() =>
  selectedDate.value === '12'
    ? agendasAtDec12Afternoon.value
    : agendasAtDec13Afternoon.value,
)

const isMenuOpen = ref(false)
const showAside = ref(false)

const selectedTags = ref<AgendaTag[]>([])

function handleTagClick(tag: AgendaTag) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  }
  else {
    selectedTags.value = [...selectedTags.value, tag]
  }
}

// 延遲隱藏 aside 以確保過渡完成
watch(isMenuOpen, (newValue) => {
  if (newValue) {
    showAside.value = true
  }
  else {
    // 等待 leave transition 完成後再隱藏
    setTimeout(() => {
      showAside.value = false
    }, 200)
  }
})
</script>

<template>
  <div>
    <section class="flex-1">
      <ShareBanner
        title="Agenda"
        sub-title="議程資訊"
      />
    </section>

    <main class="border-b border-webconf-gray text-webconf-gray">
      <section
        class="sticky top-[54px] z-[15] border-b border-webconf-gray bg-black sm:top-[57px] lg:top-[54px]"
      >
        <div class="flex-center py-[6px] text-h4-24 lg:py-3">
          <AgendaEventDaySwitch v-model="selectedDate" />

          <ShareTagFilterMenuButton
            :is-menu-open="isMenuOpen"
            size="sm"
            :selected-tags-count="selectedTags.length"
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
        <aside
          :class="{
            'z-20 flex lg:z-[14]': isMenuOpen || showAside,
            'hidden lg:z-auto lg:flex': !isMenuOpen && !showAside,
          }"
          class="fixed top-[54.5px] h-[calc(100dvh-54px)] w-0 shrink-0 flex-col items-start self-start border-webconf-gray bg-black lg:sticky lg:top-[124.5px] lg:w-[228px] lg:border-r lg:p-4 2xl:w-[260px] 2xl:pl-12"
        >
          <ShareTagFilterMenuButton
            :is-menu-open="isMenuOpen"
            size="lg"
            :selected-tags-count="selectedTags.length"
            @click="isMenuOpen = true"
          />

          <ShareTagFilterMenu
            v-model:is-open="isMenuOpen"
            v-model:selected-tags="selectedTags"
          />

          <div
            :class="{
              'opacity-100': isMenuOpen,
              'opacity-0': !isMenuOpen,
            }"
            class="absolute inset-0 h-full w-[100dvw] bg-black/30 duration-300"
            @click="isMenuOpen = false"
          ></div>
        </aside>

        <div
          v-cursor="{
            scale: 0.5,
            duration: 0.5,
          }"
          class="grid grow grid-cols-3 bg-black"
        >
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
                @tag-click="handleTagClick"
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
                :data="agenda"
                :index="index"
                :time="time"
                :show-time="index === 0"
                :is-selected="
                  agenda.tags?.some((tag) => selectedTags.includes(tag))
                    || selectedTags.length === 0
                "
                @tag-click="handleTagClick"
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

    <!-- 講者資訊彈跳視窗 -->
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

.agenda-fade-move {
  transition: opacity 0.3s ease-in-out;
}
</style>
