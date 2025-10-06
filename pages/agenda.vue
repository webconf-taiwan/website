<script setup lang="ts">
useSeoMeta({
  title: '議程資訊',
})

type AgendaTag
  = | 'AI'
    | 'Agile'
    | 'Frontend'
    | 'Backend'
    | 'Security'
    | '軟體設計'
    | '產品應用'
    | '產品思維'
    | '團隊管理'
    | '產業應用'
    | '設計實務'

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
    topic: '從冷知識到漏洞：你不懂的 Web，駭客懂',
    speakerInfo: [
      {
        name: '胡立',
        title: `技術部落格 Huli's blog / 站長`,
      },
    ],
    tags: ['Frontend', 'Security', 'Backend'],
  },
  {
    topic: '程式碼與尿布：媽媽工程師的生存指南',
    speakerInfo: [
      {
        name: 'Hannah',
        title: 'Remote / Frontend ',
      },
    ],
    tags: ['Frontend'],
  },
  {
    topic: '大 AI 時代，工程師的成長之路 / 從 Junior 到 Staff',
    speakerInfo: [
      {
        name: '奶綠茶',
        title: 'PositiveGrid Staff Frontend Engineer',
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
    topic: 'AI 時代下， Product Sense 就是你的秘密武器',
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
  {
    topic: '軟體開發邪教的救贖：AI 時代更應掌握的 TDD 技能',
    speakerInfo: [
      {
        name: 'Kuma Syu',
        title: '緯雲有限公司 / R&D Manager',
      },
    ],
    tags: ['AI', '軟體設計', '產品思維'],
  },
  {
    topic: '零基礎打造 400 萬用戶，我們犯了哪些錯誤',
    speakerInfo: [
      {
        name: 'Max Chen',
        title: '對稱資訊股份有限公司 / 面試趣 CEO',
      },
    ],
    tags: ['產品應用', '產品思維'],
  },
  {
    topic: '產品 OKR 的訂立與 Roadmap 展開',
    speakerInfo: [
      {
        name: '曾友志',
        title: '下午先生有限公司 / 資深產品顧問',
      },
    ],
    tags: ['產品思維', '團隊管理'],
  },
  {
    topic: 'React 優化實戰分析 / 掌握 React 進階技術 x 底層思維',
    speakerInfo: [
      {
        name: 'ThisWeb (Kun)',
        title: 'ThisWeb / 前端工程師',
      },
    ],
    tags: ['Frontend'],
  },
  {
    topic: '願 Web API 原力與你同在',
    speakerInfo: [
      {
        name: 'MUKI',
        title: 'MUKI space* / 前端工程師',
      },
    ],
    tags: ['Frontend', 'AI'],
  },
  {
    topic: '掌握田野中的「人」：真實場域研究的人際溝通與信任建立',
    speakerInfo: [
      {
        name: 'Joey',
        title: '引鹿創新體驗研究室  / UX 總監',
      },
    ],
    tags: ['設計實務', '團隊管理'],
  },
  {
    topic: '以打詐為例，服務設計如何讓公共數位服務有感',
    speakerInfo: [
      {
        name: '卓致遠',
        title: '致遠體驗設計 / 體驗總監',
      },
    ],
    tags: ['設計實務', '產品思維'],
  },
  {
    topic: '服務設計師的傳說：90% 的時間在讓設計發生',
    speakerInfo: [
      {
        name: '郭心喻',
        title:
          'Government of Nova Scotia 加拿大新斯科舍省政府 <br /> / Senior Service Designer 資深服務設計師',
      },
    ],
    tags: ['軟體設計', '設計實務', '產品思維', '產業應用'],
  },
  {
    topic: '從設計到共識：悠識如何在每一次新專案裡，用溝通建立信任關係',
    speakerInfo: [
      {
        name: '林星妤',
        title: '悠識數位 / Senior Experience Designer',
      },
      {
        name: '黃明硯',
        title: '悠識數位 /  Experience Designer',
      },
    ],
    tags: ['設計實務', '產品思維'],
  },
  {
    topic: '從研究到上線：全流程設計與 AI 協作專案實戰',
    speakerInfo: [
      {
        name: 'Niki Liu',
        title: '新加坡商鈦坦科技 / Senior Product Designer',
      },
    ],
    tags: ['AI', '設計實務', '產品思維'],
  },
  {
    topic: '從使用者到工程師：AI 在企業怎麼落地？',
    speakerInfo: [
      {
        name: 'Shirney Huang 黃琇琳',
        title: 'Aiworks / CEO',
      },
    ],
    tags: ['AI'],
  },
  {
    topic: 'GenAI 時代下的測試三板斧',
    speakerInfo: [
      {
        name: '柯仁傑',
        title: 'Odd-e / Technical Coach',
      },
    ],
    tags: ['軟體設計'],
  },
  {
    topic: '培養十倍速 PM：從工具到習慣',
    speakerInfo: [
      {
        name: '趙柏強',
        title: 'Stable Progress / Growth Companion',
      },
    ],
    tags: ['AI', '產品思維', '團隊管理', 'Agile'],
  },
  {
    topic: '對微前端的美好想像',
    speakerInfo: [
      {
        name: 'Eric Lee',
        title: '前端輕鬆聊 / Senior Software Engineer',
      },
    ],
    tags: ['Frontend', '軟體設計'],
  },
  {
    topic: 'AI 時代下， 如何運用數據幫助產品發揮影響力',
    speakerInfo: [
      {
        name: '姜乃文',
        title: '天下雜誌集團 / 主任分析師',
      },
    ],
    tags: ['AI', '產品思維', '產業應用', '團隊管理'],
  },
  {
    topic: '走在同業前面：國泰的雲端轉型洞察與啟示',
    speakerInfo: [
      {
        name: '顏勝豪 Otto',
        title: '國泰金控  / 協理',
      },
    ],
    tags: ['AI', '產業應用'],
  },
]
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
          class="absolute bottom-0 left-0 z-20 h-[1px] w-full bg-webconf-gray"
        ></div>
      </div>
    </section>

    <main class="text-webconf-gray">
      <!-- 活動日期 -->
      <section
        class="sticky top-[55px] z-10 border-b border-webconf-gray bg-black"
      >
        <div
          class="container px-5 py-4 text-h4-24 sm:px-8 sm:py-5 lg:px-20 lg:py-6"
        >
          Dec. 12-13
        </div>

        <div
          v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
          class="relative z-[100]"
        ></div>
      </section>

      <!-- 議程列表 -->
      <section class="container sm:px-8 lg:px-20">
        <ul
          class="border-x-0 border-x-webconf-gray/50 bg-black sm:border-x-[0.5px]"
        >
          <li
            v-for="item in AGENDA_LIST"
            :key="item.topic"
            class="flex flex-col gap-10 border-b-[0.5px] border-b-webconf-gray px-5 pb-10 pt-6 sm:flex-row sm:justify-between sm:px-10 sm:pb-[68px] sm:pt-8"
          >
            <!-- 議程主題 -->
            <div class="sm:flex-[3] lg:flex-[5]">
              <h2 class="text-h3-40 leading-[1.1]">
                {{ item.topic }}
              </h2>
              <div class="mt-4 flex flex-wrap gap-3 sm:mt-5">
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
            <ul
              class="flex w-full gap-6 sm:flex-1 sm:flex-col sm:self-end lg:min-w-[200px]"
            >
              <li
                v-for="speaker in item.speakerInfo"
                :key="speaker.name"
                class="w-full"
              >
                <h3 class="text-h4-24 leading-[1.1]">
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
      </section>
    </main>

    <!-- 提示 -->
    <section class="py-[120px] text-center text-webconf-gray">
      <p class="text-h5-20">
        \ 更多精彩議程即將釋出 /
      </p>
    </section>
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
</style>
