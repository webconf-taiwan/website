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
</script>

<template>
  <!-- banner -->
  <h1 class="bg-red-500 text-[100px] text-black">
    議程頁
  </h1>

  <main class="text-webconf-gray">
    <!-- 活動日期 + 箭頭動畫 -->
    <div
      v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
      class="border-y border-webconf-gray px-5 py-4 text-h4-24 md:px-20 md:py-6"
    >
      Dec. 12-13
    </div>

    <!-- 列表 -->
    <ul class="container border-x-[0.5px] border-x-webconf-gray/50">
      <!-- 議程項目 -->
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
</template>
