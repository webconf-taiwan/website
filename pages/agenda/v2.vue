<script setup lang="ts">
import type { AgendaItem } from '~/types'

useSeoMeta({
  title: '議程資訊',
})

const AGENDA_LIST: AgendaItem[] = [
  // 12/12 09:00
  {
    title: 'B2B 服務的 AI Agent 產品設計原則',
    speakerInfo: [
      {
        name: 'Happy',
        avatarUrl: '91APP / 產品長',
      },
    ],
    tags: ['AI', '產品思維', '產業應用', '團隊管理'],
    day: '12',
    startTime: '09:00',
    endTime: '09:50',
  },
  {
    title: '從冷知識到漏洞：你不懂的 Web,駭客懂',
    speakerInfo: [
      {
        name: '胡立',
        avatarUrl: `技術部落格 Huli's blog / 站長`,
      },
    ],
    tags: ['Frontend', 'Backend', 'Security'],
    day: '12',
    startTime: '09:00',
    endTime: '09:50',
  },
  {
    title: '程式碼與尿布：媽媽工程師的生存指南',
    speakerInfo: [
      {
        name: 'Hannah',
        avatarUrl: 'Remote / Frontend ',
      },
    ],
    tags: ['Frontend'],
    day: '12',
    startTime: '09:00',
    endTime: '09:50',
  },
  // 12/12 10:00
  {
    title: '大 AI 時代,工程師的成長之路 / 從 Junior 到 Staff',
    speakerInfo: [
      {
        name: '奶綠茶',
        avatarUrl: 'PositiveGrid Staff Frontend Engineer',
      },
    ],
    tags: ['Frontend'],
    day: '12',
    startTime: '10:00',
    endTime: '10:50',
  },
  {
    title: '別再瞎忙了！讓 AI 幫產品團隊找到對的問題',
    speakerInfo: [
      {
        name: 'Peter',
        avatarUrl: '漸強實驗室 / Product Lead',
      },
    ],
    tags: ['AI', '產品思維', '團隊管理', 'Agile'],
    day: '12',
    startTime: '10:00',
    endTime: '10:50',
  },
  {
    title: 'AI 時代下， Product Sense 就是你的秘密武器',
    speakerInfo: [
      {
        name: 'Chris',
        avatarUrl: 'PicCollage 拼貼趣 <br /> / 資深產品設計經理',
      },
      {
        name: 'Tiyna',
        avatarUrl: 'PicCollage 拼貼趣 <br /> / 資深產品設計師',
      },
    ],
    tags: ['AI', '設計實務', '產品思維'],
    day: '12',
    startTime: '10:00',
    endTime: '10:50',
  },
  // 12/12 11:00
  {
    title: '軟體開發邪教的救贖：AI 時代更應掌握的 TDD 技能',
    speakerInfo: [
      {
        name: 'Kuma Syu',
        avatarUrl: '緯雲有限公司 / R&D Manager',
      },
    ],
    tags: ['AI', '軟體設計', '產品思維'],
    day: '12',
    startTime: '11:00',
    endTime: '11:50',
  },
  {
    title: '零基礎打造 400 萬用戶，我們犯了哪些錯誤',
    speakerInfo: [
      {
        name: 'Max Chen',
        avatarUrl: '對稱資訊股份有限公司 / 面試趣 CEO',
      },
    ],
    tags: ['產品思維', '產業應用'],
    day: '12',
    startTime: '11:00',
    endTime: '11:50',
  },
  {
    title: '產品 OKR 的訂立與 Roadmap 展開',
    speakerInfo: [
      {
        name: '曾友志',
        avatarUrl: '下午先生有限公司 / 資深產品顧問',
      },
    ],
    tags: ['產品思維', '團隊管理'],
    day: '12',
    startTime: '11:00',
    endTime: '11:50',
  },
  // 12/12 13:00
  {
    title: 'React 優化實戰分析 / 掌握 React 進階技術 x 底層思維',
    speakerInfo: [
      {
        name: 'ThisWeb (Kun)',
        avatarUrl: 'ThisWeb / 前端工程師',
      },
    ],
    tags: ['Frontend'],
    day: '12',
    startTime: '13:00',
    endTime: '13:50',
  },
  {
    title: '願 Web API 原力與你同在',
    speakerInfo: [
      {
        name: 'MUKI',
        avatarUrl: 'MUKI space* / 前端工程師',
      },
    ],
    tags: ['AI', 'Frontend'],
    day: '12',
    startTime: '13:00',
    endTime: '13:50',
  },
  {
    title: '掌握田野中的「人」：真實場域研究的人際溝通與信任建立',
    speakerInfo: [
      {
        name: 'Joey',
        avatarUrl: '引鹿創新體驗研究室  / UX 總監',
      },
    ],
    tags: ['設計實務', '團隊管理'],
    day: '12',
    startTime: '13:00',
    endTime: '13:50',
  },
  // 12/12 14:00
  {
    title: '以打詐為例，服務設計如何讓公共數位服務有感',
    speakerInfo: [
      {
        name: '卓致遠',
        avatarUrl: '致遠體驗設計 / 體驗總監',
      },
    ],
    tags: ['設計實務', '產品思維'],
    day: '12',
    startTime: '14:00',
    endTime: '14:50',
  },
  {
    title: '同步聯播',
    day: '12',
    startTime: '14:00',
    endTime: '14:50',
  },
  {
    title: '同步聯播',
    day: '12',
    startTime: '14:00',
    endTime: '14:50',
  },
]

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

const selectedDate = ref(new Date() <= new Date('2025-12-13') ? '12' : '13')
</script>

<template>
  <div>
    <section class="flex-1">
      <div class="agenda-section relative h-80 text-webconf-gray lg:h-400">
        <!-- 浮動方框 -->
        <ShareLayoutBlocks />
        <!-- 桌機使用 -->
        <svg
          class="absolute inset-0 hidden size-full sm:block"
          viewBox="0 0 1440 400"
          preserveAspectRatio="xMidYMid slice"
        >
          <!-- 右側斜線 -->
          <g>
            <!-- 靜態軌道 -->
            <line
              x1="995"
              y1="0"
              x2="1410"
              y2="400"
              stroke="#E6E6E6"
              stroke-width="0.5"
            />
          </g>

          <!-- 左側斜線 -->
          <g>
            <!-- 靜態軌道 -->
            <line
              x1="0"
              y1="55"
              x2="345"
              y2="400"
              stroke="#E6E6E6"
              stroke-width="0.5"
            />
          </g>
        </svg>
        <!-- 平板以下使用 -->
        <svg
          class="absolute inset-0 block size-full sm:hidden"
          viewBox="0 0 360 320"
          preserveAspectRatio="xMidYMid slice"
        >
          <!-- 右側斜線 -->
          <g>
            <!-- 靜態軌道 -->
            <line
              x1="185"
              y1="0"
              x2="525"
              y2="320"
              stroke="#E6E6E6"
              stroke-width="0.5"
            />
          </g>
        </svg>
        <div
          class="absolute left-[50%] top-[45%] flex w-fit -translate-x-1/2 flex-col items-center justify-center gap-6 px-6 sm:top-[38%] lg:top-[50%] lg:w-full lg:flex-row lg:items-end"
        >
          <h1 class="text-h1-96 text-white">
            AGENDA
          </h1>
          <div class="flex w-full flex-col gap-3 lg:w-fit">
            <span
              class="inline-block px-0 text-center text-h4-24 lg:pl-[150px] lg:pr-10"
            >議程頁</span>
            <div class="order-[-1] flex items-center lg:order-1">
              <span class="size-3 bg-white"></span>
              <span class="h-[1px] flex-1 bg-white"></span>
              <span class="size-3 bg-white"></span>
            </div>
          </div>
        </div>
        <div
          v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
          class="absolute bottom-0 left-0 z-30 h-[1px] w-full bg-webconf-gray"
        ></div>
      </div>
    </section>

    <main class="text-webconf-gray">
      <section
        class="sticky top-[54px] z-10 border-b border-webconf-gray bg-black"
      >
        <div class="flex-center py-[6px] text-h4-24 xl:py-3">
          <!-- 日期篩選 -->
          <AgendaDaySwitch v-model="selectedDate" />

          <!-- 議程類型篩選 -->
          <AgendaTagFilter
            size="sm"
            class="ml-3 xl:hidden"
          />

          <!-- 廳號 -->
          <div
            class="hidden grow text-center text-h4-24 xl:grid xl:grid-cols-3"
          >
            <div class="col-span-1">
              M 棟
            </div>
            <div class="col-span-1">
              F 棟
            </div>
            <div class="col-span-1">
              A2 棟
            </div>
          </div>
        </div>

        <div
          v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
          class="relative z-30"
        ></div>
      </section>

      <!-- 議程列表 -->
      <section class="flex">
        <!-- 議程類型篩選清單 -->
        <aside
          class="hidden shrink-0 flex-col items-start gap-2 border-r border-webconf-gray bg-black p-4 xl:flex xl:w-[228px] xl:pl-4 2xl:w-[260px] 2xl:pl-12"
        >
          <AgendaTagFilter size="lg" />
          <span
            class="topic-filter-title inline-block text-left text-h4-60 text-webconf-blue"
          >
            FILTER
          </span>
        </aside>

        <div
          v-cursor="{
            scale: 0.5,
            duration: 0.5,
          }"
          class="grid grow grid-cols-3 gap-[0.5px] bg-webconf-gray/50"
        >
          <!-- 上午議程 -->
          <div
            v-for="(agendas, time) in agendasAtDec12Morning"
            :key="time"
            class="relative col-span-3 grid grid-cols-1 gap-[0.5px] xl:grid-cols-3"
          >
            <!-- 時間標記 (行動版) -->
            <div
              class="sticky top-[107px] z-[5] flex h-7 w-full items-center bg-webconf-gray px-5 text-btn-16 text-webconf-blue xl:hidden"
            >
              {{ time }}
              <span>{{ ` - ${agendas[0].endTime}` }}</span>
            </div>

            <AgendaCard
              v-for="(agenda, index) in agendas"
              :key="`${time}-${index}`"
              :data="agenda"
              :index="index"
              :time="time"
              :show-time="index === 0"
            />
          </div>

          <!-- 中午休息 -->
          <div
            class="col-span-3 border-b border-webconf-gray bg-black py-14 text-center text-h4-24"
          >
            午休
          </div>

          <!-- 下午議程 -->
          <div
            v-for="(agendas, time) in agendasAtDec12Afternoon"
            :key="time"
            class="relative col-span-3 grid grid-cols-1 gap-[0.5px] xl:grid-cols-3"
          >
            <!-- 時間標記 (行動版) -->
            <div
              class="sticky top-[107px] z-[5] flex h-7 w-full items-center bg-webconf-gray px-5 text-btn-16 text-webconf-blue xl:hidden"
            >
              {{ time }}
              <span>{{ ` - ${agendas[0].endTime}` }}</span>
            </div>

            <AgendaCard
              v-for="(agenda, index) in agendas"
              :key="`${time}-${index}`"
              :data="agenda"
              :index="index"
              :time="time"
              :show-time="index === 0"
            />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.agenda-section {
  background-image: url("/images/sponsorsBanner.webp");
  background-repeat: no-repeat;
  background-position: center top;
  background-size: auto 400px;
}
@media (min-width: 640px) {
  .agenda-section {
    background-position: center;
    background-size: cover;
  }
}

.topic-filter-title {
  writing-mode: vertical-lr;
  transform: translateX(-4px);
}
</style>
