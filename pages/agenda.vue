<script setup lang="ts">
type AgendaTag
  = | 'AI'
    | '產品思維'
    | '團隊管理'
    | 'Agile'
    | '設計實務'
    | 'Frontend'
    | 'Security'

interface SpeakerInfo {
  name: string
  title: string
}

interface AgendaItem {
  topic: string
  speakerInfo: SpeakerInfo[]
  tags: AgendaTag[]
}

const AGENDA_LIST: AgendaItem[] = [
  {
    topic: 'B2B 服務的 AI Agent 產品設計原則',
    speakerInfo: [
      {
        name: 'Happy',
        title: '91APP / 產品長',
      },
    ],
    tags: ['AI', '產品思維', '產業應用', '團隊管理'],
  },
  {
    topic: '從冷知識到漏洞：你不懂的 JavaScript，駭客懂',
    speakerInfo: [
      {
        name: '胡立',
        title: `技術部落格 Huli's blog / 站長`,
      },
    ],
    tags: ['Frontend', 'Security'],
  },
  {
    topic: '大 AI 時代，工程師的成長之路 - 從 Junior 到 Staff',
    speakerInfo: [
      {
        name: '乃綠茶',
        title: 'PositiveGrid staff frontend engineer',
      },
    ],
    tags: ['Frontend'],
  },
  {
    topic: '別再瞎忙了！讓 AI 幫產品團隊找到對的問題',
    speakerInfo: [
      {
        name: 'Peter',
        title: '漸強實驗室 / Product Lead',
      },
    ],
    tags: ['AI', '產品思維', '團隊管理', 'Agile'],
  },
  {
    topic: 'AI 時代下， Product sense 就是你的秘密武器',
    speakerInfo: [
      {
        name: 'Chris',
        title: 'PicCollage 拼貼趣 <br /> / 資深產品設計經理',
      },
      {
        name: 'Tiyna',
        title: 'PicCollage 拼貼趣 <br /> / 資深產品設計師',
      },
    ],
    tags: ['AI', '設計實務', '產品思維'],
  },
]

// SEO Schema
const agendaStructuredData = AGENDA_LIST.map(item => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  'name': item.topic,
  'description': item.topic,
  'startDate': '2025-12-12T09:00',
  'endDate': '2025-12-13T18:00',
  'eventStatus': 'https://schema.org/EventScheduled',
  'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
  'location': {
    '@type': 'Place',
    'name': '瓶蓋工廠台北製造所',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '115台北市南港區南港路二段13號',
      'addressLocality': '台北市',
      'addressRegion': '南港區',
      'postalCode': '115',
      'addressCountry': '台灣',
    },
  },
  'performer': item.speakerInfo.map(speaker => ({
    '@type': 'Person',
    'name': speaker.name,
    'jobTitle': speaker.title.replace(/<br \/>/g, ' '),
  })),
}))

useSeoMeta({
  title: '議程表 - 網站名稱',
  ogTitle: '議程表 - 網站名稱',
  description: '查看所有精彩議程，涵蓋 AI、產品思維、前端、資安等主題。',
  ogDescription: '查看所有精彩議程，涵蓋 AI、產品思維、前端、資安等主題。',
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(agendaStructuredData),
    },
  ],
})
</script>

<template>
  <section class="flex-1">
    <div
      class="agenda-section relative h-80 border-b border-webconf-gray text-webconf-gray lg:h-400"
    >
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
            stroke-width="1"
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
            stroke-width="1"
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
            stroke-width="1"
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
    </div>
  </section>

  <main class="text-webconf-gray">
    <!-- 活動日期 -->
    <section>
      <div
        v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
        class="relative border-b border-webconf-gray px-5 py-4 text-h4-24 md:px-20 md:py-6"
      >
        Dec. 12-13
      </div>
      <div v-arrow="{ speed1: '8s', color: '#E6E6E6' }"></div>
    </section>

    <!-- 議程列表 -->
    <ul class="container border-x-[0.5px] border-x-webconf-gray/50">
      <li
        v-for="item in AGENDA_LIST"
        :key="item.topic"
        class="flex flex-col gap-10 border-b-[0.5px] border-b-webconf-gray px-5 pb-10 pt-6 md:flex-row md:justify-between md:px-10 md:pb-[68px] md:pt-8"
      >
        <!-- 議程主題 -->
        <div>
          <h2 class="text-h3-40">
            {{ item.topic }}
          </h2>
          <div class="mt-4 flex gap-3 md:mt-5">
            <span
              v-for="tag in item.tags"
              :key="tag + item.topic"
              class="gap-3 bg-webconf-blue px-4 py-[6px] text-xs font-semibold text-webconf-gray"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- 講者資訊 -->
        <ul class="flex gap-6 md:w-[200px] md:flex-col md:self-end">
          <li
            v-for="speaker in item.speakerInfo"
            :key="speaker.name"
            class="w-full"
          >
            <h3 class="text-h4-24">
              {{ speaker.name }}
            </h3>
            <p
              class="mt-2 text-xs"
              v-html="speaker.title"
            ></p>
          </li>
        </ul>
      </li>
    </ul>
  </main>

  <!-- 提示 -->
  <section class="py-[120px] text-center text-webconf-gray">
    <p class="text-h5-20">
      \ 更多精彩議程即將釋出 /
    </p>
  </section>
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
</style>
