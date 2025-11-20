<script lang="ts" setup>
useSeoMeta({
  title: '贊助廠商',
  description:
    'WebConf Taiwan 是一個聚集網頁技術愛好者與專家的年度盛會。今年，我們將以 「Connecting the Web to a Sustainable Future」 為主題，探索網頁技術如何推動永續發展，並帶來創新解方，從技術演進到社會責任，共同思考網路世界的未來。誠摯邀請您成為 WebConf Taiwan 的贊助夥伴，一同連結技術與未來，攜手打造更永續的網路生態！',
})

const SPONSORSINFO = [
  {
    id: 1,
    name: '鈦坦科技',
    logo: '/images/sponsors/titansoft.svg',
    badge: '連續第三年贊助',
    description:
      '新加坡商鈦坦科技是一間軟體開發公司,致力於線上軟體平台客製開發與維護,以及代理 Atlassian 旗下產品,以自身實際使用經驗提供一站式導入服務。',
    socialLinks: [
      {
        name: 'web',
        icon: '/images/icon/web.svg',
        url: 'https://titansoft.com/tw',
      },
      {
        name: 'fb',
        icon: '/images/icon/fb.svg',
        url: 'https://www.facebook.com/TitansoftTW',
      },
      {
        name: 'youtube',
        icon: '/images/icon/youtube.svg',
        url: 'https://www.youtube.com/channel/UC_530TqXXizuzA5Ut8wFp4w',
      },
      {
        name: 'ig',
        icon: '/images/icon/ig.svg',
        url: 'https://www.instagram.com/titaner_titansoft',
      },
    ],
  },
  {
    id: 2,
    name: '昇新科技',
    logo: '/images/sponsors/ascentisTech.svg',
    badge: '',
    description:
      'AscentisTech 專注於打造全球領先的線上軟體開發平台,匯集實力堅強、技術與數據背景的菁英團隊,具備高效能系統架構設計、多語系支援與模組化整合能力。',
    socialLinks: [
      {
        name: 'fb',
        icon: '/images/icon/fb.svg',
        url: 'https://www.facebook.com/AscentisTech',
      },
      {
        name: 'ig',
        icon: '/images/icon/ig.svg',
        url: 'https://www.instagram.com/ascentistech/',
      },
    ],
  },
]

const ORGANIZERS = [
  {
    id: 1,
    name: '五倍學院',
    logo: '/images/sponsors/5xcampus.svg',
    description: [
      '五倍學院十餘年來深耕程式教育，陪伴無數學員從零起步，成為引領時代的軟體工程師與 AI 開發人才。',
      '我們以實戰為核心，打造最貼近產業需求的課程，內容涵蓋前後端網頁技術、AI 工具應用與自動化實作，幫助學員在瞬息萬變的科技浪潮中不斷成長，用技術實現自我價值。',
      '同時，我們也為企業提供專業的技術顧問與教育訓練服務，協助優化開發流程、強化團隊戰力，讓技術成為驅動組織創新與成長的關鍵力量，提升效率、創造更高價值。',
    ],
    socialLinks: [
      {
        name: 'web',
        icon: '/images/icon/web.svg',
        url: 'https://5xcampus.com/',
      },
      {
        name: 'fb',
        icon: '/images/icon/fb.svg',
        url: 'https://www.facebook.com/5xruby',
      },
      {
        name: 'youtube',
        icon: '/images/icon/youtube.svg',
        url: 'https://www.youtube.com/c/5xruby-edu',
      },
      {
        name: 'ig',
        icon: '/images/icon/ig.svg',
        url: 'https://www.instagram.com/5xcampus/',
      },
    ],
  },
  {
    id: 2,
    name: '六角學院',
    logo: '/images/sponsors/hexschool.svg',
    description: [
      '六角學院是一所專注培養軟體工程師與數位人才的職能學校，目前已累積超過 30,000 名學員。我們的核心使命，是讓更多人透過程式學習，為自己的職涯創造更多選擇與可能性。',
      '課程橫跨前端、後端到全端開發，強調實戰專題、系統化學習規劃與職涯陪跑機制，不只教會寫程式，更著重溝通力、解決問題能力與自學能力等「工程師思維」，協助學員在 AI 時代持續成長與轉職發展。',
    ],
    socialLinks: [
      {
        name: 'web',
        icon: '/images/icon/web.svg',
        url: 'https://www.hexschool.com/',
      },
      {
        name: 'fb',
        icon: '/images/icon/fb.svg',
        url: 'https://www.facebook.com/hexschool',
      },
      {
        name: 'youtube',
        icon: '/images/icon/youtube.svg',
        url: 'https://www.youtube.com/@hexschool',
      },
      {
        name: 'ig',
        icon: '/images/icon/ig.svg',
        url: 'https://www.instagram.com/hexschool/',
      },
    ],
  },
  {
    id: 3,
    name: '悠識學院',
    logo: '/images/sponsors/userxper.svg',
    description: [
      '悠識學院致力於推動實戰型的 UX（使用者體驗）學習活動，課程主題聚焦使用者訪談、問卷調查、數據分析等專業方法，幫助學員從真實案例中培養洞察與分析能力。我們長期關注設計與科技的交會，定期舉辦以 AI/UX、DesignOps 設計營運與數位職涯發展為主題的講座與實務研討，協助設計師與產品團隊掌握產業趨勢、拓展跨領域視野。',
      '此外，悠識學院也經營多元社群平台——包含 Circle 社群、IG、Threads，以及 Podcast《UX 有差嗎？》，邀請內部研究員、設計師及同業專家們，分享從事使用者體驗工作的第一線觀察。',
    ],
    socialLinks: [
      {
        name: 'web',
        icon: '/images/icon/web.svg',
        url: 'https://blog.userxper.com/writer/userxper-edu/',
      },
      {
        name: 'fb',
        icon: '/images/icon/fb.svg',
        url: 'https://www.facebook.com/userxper.tw',
      },
      {
        name: 'youtube',
        icon: '/images/icon/youtube.svg',
        url: 'https://www.youtube.com/@UserXper',
      },
      {
        name: 'ig',
        icon: '/images/icon/ig.svg',
        url: 'https://www.instagram.com/userxper/',
      },
    ],
  },
]

const DECORATIVEIMAGES = [
  {
    id: 1,
    src: '/images/home/sponsors/sponsors-1.webp',
    width: 254,
    height: 169,
    alt: 'WebConf Taiwan 活動照片',
    class:
      'blue-shadow sponsors-img-filter absolute left-[-94px] top-[392px] hidden xl:block',
  },
  {
    id: 2,
    src: '/images/home/sponsors/sponsors-2.webp',
    width: 361,
    height: 241,
    alt: 'WebConf Taiwan 活動照片',
    class:
      'blue-shadow sponsors-img-filter absolute right-[-40px] top-[80px] hidden xl:block',
  },
  {
    id: 3,
    src: '/images/home/sponsors/sponsors-3.webp',
    width: 348,
    height: 232,
    alt: 'WebConf Taiwan 活動照片',
    class:
      'blue-shadow sponsors-img-filter absolute bottom-[80px] left-[-28px] hidden xl:block',
  },
  {
    id: 4,
    src: '/images/home/sponsors/sponsors-4.webp',
    width: 240,
    height: 160,
    alt: 'WebConf Taiwan 活動照片',
    class:
      'blue-shadow sponsors-img-filter absolute bottom-[383px] right-[-28px] hidden xl:block',
  },
]

const SUPPORTSTARGET = [
  {
    id: 1,
    title: '品牌曝光',
    image: '/images/home/sponsors/sponsors-brand.webp',
    description: '透過活動網站、社群平台與現場的場地陳設皆將呈現您的品牌',
  },
  {
    id: 2,
    title: '精準觸及',
    image: '/images/home/sponsors/sponsors-target.webp',
    description: '對網頁開發者、設計師、產品經理與產業決策者，直接建立聯繫',
  },
  {
    id: 3,
    title: '專業交流',
    image: '/images/home/sponsors/sponsors-communication.webp',
    description: '直接與業界專家對話，拓展未來合作與人才招募的可能性',
  },
  {
    id: 4,
    title: '共創永續價值',
    image: '/images/home/sponsors/sponsors-sustainability.webp',
    description: '與我們一同推廣「科技 x 永續」的願景，展現企業責任與影響力',
  },
]

const CO_ORGANIZERS = [
  {
    id: 1,
    name: '版塊設計',
    logo: '/images/home/sponsors/BlockStudio.svg',
    description: [
      '版塊是網站立體化數位體驗的探險者，從數位策略規劃到品牌視覺識別再到動態特效網站 ，全方位視覺數位形象設計公司。以動態特效為核心、網站設計為起點，為客戶提供全面的數位形象策略解。',
    ],
    socialLinks: [
      {
        name: 'web',
        icon: '/images/icon/web.svg',
        url: 'https://blockstudio.tw',
      },
    ],
  },
  {
    id: 2,
    name: 'WebCRACK',
    logo: '/images/home/sponsors/WebCRACK.svg',
    description: [
      'WebCRACK 是一個專屬於數位設計的線上共享平台，匯聚國內數位設計的能量，創造資源媒合、知識傳遞及作品認證的創意樞紐，構建完整的數位設計生態圈。',
      '從知識系統建構開始，WebCRACK 聚集設計資源與智慧，為設計師提供實用的設計資訊；透過作品展示認證，讓設計作品被看見並實現價值；更以培育數位人才為目標，透過交流與知識分享，助力未來設計力量的成長。',
      '我們相信，透過共享交流機制，WebCRACK 不僅促進設計產業升級，更提升整體產業品質，為數位設計注入無限可能。',
    ],
    socialLinks: [
      {
        name: 'web',
        icon: '/images/icon/web.svg',
        url: 'https://webcrack.tw/',
      },
    ],
  },
]
</script>

<template>
  <section class="flex-1">
    <!-- Banner 區塊 -->
    <div
      class="sponsors-banner-section relative h-80 text-webconf-gray lg:h-400"
    >
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
        viewBox="0 0 640 320"
        preserveAspectRatio="xMidYMid slice"
      >
        <!-- 右側斜線 -->
        <g>
          <!-- 靜態軌道 -->
          <line
            x1="330"
            y1="0"
            x2="650"
            y2="320"
            stroke="#E6E6E6"
            stroke-width="0.5"
          />
        </g>
      </svg>

      <div
        class="absolute left-[50%] top-[45%] flex w-full -translate-x-1/2 flex-col items-center justify-center gap-6 px-5 sm:top-[38%] sm:px-6 lg:top-[50%] lg:flex-row lg:items-end"
      >
        <h1 class="text-h1-96 text-white">
          SPONSORS
        </h1>
        <div class="flex w-full flex-col gap-3 lg:w-fit">
          <span
            class="inline-block px-0 text-center text-h4-24 lg:pl-[285px] lg:pr-10"
          >贊助廠商</span>
          <div class="order-[-1] flex items-center lg:order-1">
            <span class="size-3 bg-webconf-gray"></span>
            <span class="h-[1px] flex-1 bg-webconf-gray"></span>
            <span class="size-3 bg-webconf-gray"></span>
          </div>
        </div>
      </div>

      <div
        v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
        class="absolute bottom-0 left-0 z-20 h-[1px] w-full bg-webconf-gray"
      ></div>
    </div>

    <!-- 贊助商區塊 -->
    <div
      class="flex flex-col border-b border-webconf-gray bg-black text-white lg:flex-row"
    >
      <div
        class="sponsors-title-section sticky top-[47px] z-10 border-b py-3 pl-5 xs:top-[55px] sm:top-[57px] lg:top-[55px] lg:border-b-0 lg:pl-12 lg:pr-[152px] lg:pt-10"
      >
        <h2
          class="inline-block text-h4-24 text-webconf-gray lg:text-[60px] lg:leading-[1.2] lg:tracking-[0em] lg:[writing-mode:vertical-rl]"
        >
          贊助商
        </h2>
      </div>

      <div
        v-for="sponsor in SPONSORSINFO"
        :key="sponsor.id"
        class="sponsors-content flex-1 lg:border-l"
      >
        <div
          class="relative grid place-content-center border-b-[0.5px] border-webconf-frame py-4 before:absolute before:inset-0 before:block before:size-5 before:bg-webconf-blue before:content-[''] lg:py-0 lg:before:size-7"
        >
          <!-- 徽章元素 -->
          <span
            v-if="sponsor.badge"
            class="absolute right-0 top-0 block bg-webconf-gray px-[16px] py-[6px] text-[12px] font-semibold leading-[1.4] tracking-[0.02em] text-webconf-blue"
          >
            {{ sponsor.badge }}
          </span>

          <NuxtImg
            :src="sponsor.logo"
            width="375"
            height="300"
            :alt="`贊助商${sponsor.name}標誌`"
          />
        </div>

        <div class="px-5 py-8 lg:px-10 lg:pb-[60px] lg:pt-10">
          <h3 class="mb-3 text-h3-40 text-white lg:mb-6">
            {{ sponsor.name }}
          </h3>

          <ul class="mb-6 flex gap-3 lg:mb-8">
            <li
              v-for="(link, index) in sponsor.socialLinks"
              :key="index"
              v-cursor="{
                scale: 0.5,
                duration: 0.5,
              }"
              class="border border-webconf-blue/90 transition-colors duration-500 hover:bg-webconf-blue"
            >
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="block p-[10px]"
              >
                <NuxtImg
                  :src="link.icon"
                  width="24"
                  height="24"
                  :alt="link.name"
                />
              </a>
            </li>
          </ul>

          <p class="text-body-16 text-webconf-gray">
            {{ sponsor.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- 主辦單位區塊 -->
    <div
      class="relative mt-[95px] flex flex-col border-y border-webconf-gray bg-black text-white lg:mt-[141px] lg:flex-row"
    >
      <div
        v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
        class="absolute z-30 w-full"
      ></div>
      <div
        class="sponsors-title-section sticky top-[47px] z-20 border-b py-3 pl-5 xs:top-[55px] sm:top-[57px] lg:top-[55px] lg:border-b-0 lg:pl-12 lg:pr-[152px] lg:pt-10"
      >
        <h2
          class="inline-block text-h4-24 text-webconf-gray lg:text-[60px] lg:leading-[1.2] lg:tracking-[0em] lg:[writing-mode:vertical-rl]"
        >
          主辦單位
        </h2>
      </div>

      <div
        v-for="organizer in ORGANIZERS"
        :key="organizer.id"
        class="sponsors-content flex-1 lg:border-l"
      >
        <div
          class="relative grid place-content-center border-b-[0.5px] border-webconf-frame before:absolute before:inset-0 before:block before:size-5 before:bg-webconf-blue before:content-[''] lg:before:size-7"
        >
          <NuxtImg
            :src="organizer.logo"
            width="225"
            height="180"
            :alt="`主辦單位${organizer.name}標誌`"
          />
        </div>

        <div class="px-5 py-8 lg:px-10 lg:pb-12 lg:pt-10">
          <h3 class="mb-3 text-h3-40 text-white lg:mb-6">
            {{ organizer.name }}
          </h3>

          <ul class="mb-6 flex gap-3 lg:mb-8">
            <li
              v-for="(link, index) in organizer.socialLinks"
              :key="index"
              v-cursor="{
                scale: 0.5,
                duration: 0.5,
              }"
              class="border border-webconf-blue/90 transition-colors duration-500 hover:bg-webconf-blue"
            >
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="block p-[10px]"
              >
                <NuxtImg
                  :src="link.icon"
                  width="24"
                  height="24"
                  :alt="link.name"
                />
              </a>
            </li>
          </ul>

          <p class="text-body-16 text-webconf-gray">
            <span
              v-for="(paragraph, index) in organizer.description"
              :key="index"
              class="organizer-description-paragraph inline-block"
            >
              {{ paragraph }}
            </span>
          </p>
        </div>
      </div>

      <NuxtImg
        class="absolute right-[14.3906px] top-[-409.219px] -z-10 hidden lg:block"
        src="/images/sponsors/sponsors-line.svg"
        width="908"
        height="749"
      />
      <NuxtImg
        class="absolute right-[-36px] top-[-186.375px] -z-10 block lg:hidden"
        src="/images/sponsors/sponsors-line-mobile.svg"
        width="394"
        height="326"
      />
    </div>

    <!-- 品牌夥伴區塊 -->
    <div
      class="relative mt-[95px] flex flex-col border-y border-webconf-gray bg-black text-white lg:mt-[141px] lg:flex-row"
    >
      <div
        v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
        class="absolute z-30 w-full"
      ></div>
      <div
        class="sponsors-title-section sticky top-[47px] z-20 border-b py-3 pl-5 xs:top-[55px] sm:top-[57px] lg:top-[55px] lg:border-b-0 lg:pl-12 lg:pr-[152px] lg:pt-10"
      >
        <h2
          class="inline-block text-h4-24 text-webconf-gray lg:text-[60px] lg:leading-[1.2] lg:tracking-[0em] lg:[writing-mode:vertical-rl]"
        >
          品牌夥伴
        </h2>
      </div>

      <div
        v-for="organizer in CO_ORGANIZERS"
        :key="organizer.id"
        class="sponsors-content flex-1 lg:border-l"
      >
        <div
          class="relative grid place-content-center border-b-[0.5px] border-webconf-frame before:absolute before:inset-0 before:block before:size-5 before:bg-webconf-blue before:content-[''] lg:before:size-7"
        >
          <NuxtImg
            :src="organizer.logo"
            width="225"
            height="180"
            :alt="`品牌夥伴${organizer.name}標誌`"
          />
        </div>

        <div class="px-5 py-8 lg:px-10 lg:pb-12 lg:pt-10">
          <h3 class="mb-3 text-h3-40 text-white lg:mb-6">
            {{ organizer.name }}
          </h3>

          <ul class="mb-6 flex gap-3 lg:mb-8">
            <li
              v-for="(link, index) in organizer.socialLinks"
              :key="index"
              v-cursor="{
                scale: 0.5,
                duration: 0.5,
              }"
              class="border border-webconf-blue/90 transition-colors duration-500 hover:bg-webconf-blue"
            >
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="block p-[10px]"
              >
                <NuxtImg
                  :src="link.icon"
                  width="24"
                  height="24"
                  :alt="link.name"
                />
              </a>
            </li>
          </ul>

          <p class="text-body-16 text-webconf-gray">
            <span
              v-for="(paragraph, index) in organizer.description"
              :key="index"
              class="organizer-description-paragraph inline-block"
            >
              {{ paragraph }}
            </span>
          </p>
        </div>
      </div>

      <NuxtImg
        class="absolute left-[-331.188px] top-[-423.328px] -z-10 hidden lg:block"
        src="/images/sponsors/sponsors-line.svg"
        width="908"
        height="749"
      />
      <NuxtImg
        class="absolute left-[-169.188px] top-[-166.266px] -z-10 block lg:hidden"
        src="/images/sponsors/sponsors-line-mobile.svg"
        width="394"
        height="326"
      />
    </div>

    <!-- 贊助招募內容 -->
    <div class="relative pt-[95px] md:pb-[116px] md:pt-[141px]">
      <!-- 活動照片 -->
      <NuxtImg
        v-for="image in DECORATIVEIMAGES"
        :key="image.id"
        :src="image.src"
        :width="image.width"
        :height="image.height"
        :alt="image.alt"
        :class="image.class"
      />
      <ShareGradientDotsCard
        class="relative m-auto my-0 max-w-[960px] pt-12 text-webconf-gray"
      >
        <!-- 贊助招募 -->
        <div class="pb-[60px] pt-3 sm:pb-20 sm:pt-0">
          <div class="m-auto w-fit">
            <h2 class="px-10 pb-4 text-h3-40">
              贊助招募
            </h2>
            <div class="flex items-center pb-6 sm:pb-12">
              <span class="size-3 bg-webconf-gray"></span>
              <span class="h-[1px] flex-1 bg-webconf-gray"></span>
              <span class="size-3 bg-webconf-gray"></span>
            </div>
          </div>

          <p class="text-body-18 text-white">
            WebConf Taiwan
            是一個聚集網頁技術愛好者與專家的年度盛會。今年，我們將以
            「Connecting the Web to a Sustainable Future」
            為主題，探索網頁技術如何推動永續發展，並帶來創新解方，從技術演進到社會責任，共同思考網路世界的未來。誠摯邀請您成為
            WebConf Taiwan
            的贊助夥伴，一同連結技術與未來，攜手打造更永續的網路生態！
          </p>
        </div>

        <!-- 四大支持 -->
        <div class="pb-[60px] text-white">
          <h2 class="pb-10 text-center text-h3-40">
            我們將提供四大支持
          </h2>

          <ul
            class="grid grid-cols-1 gap-x-0 gap-y-8 sm:grid-cols-2 sm:gap-x-[60px] sm:gap-y-8"
          >
            <li
              v-for="support in SUPPORTSTARGET"
              :key="support.id"
              class="flex items-center justify-center gap-6 py-0 sm:py-6"
            >
              <div class="pic">
                <NuxtImg
                  :src="support.image"
                  width="100"
                  height="100"
                  :alt="support.title"
                  class="aspect-[1/1] w-[60px] sm:w-[100px]"
                />
              </div>
              <div class="flex flex-1 flex-col gap-0 sm:gap-4">
                <h3 class="text-h4-24">
                  {{ support.title }}
                </h3>
                <p class="text-body-16">
                  {{ support.description }}
                </p>
              </div>
            </li>
          </ul>
        </div>

        <ShareLinkButton
          to="mailto:hi@webconf.tw"
          class="m-auto mb-[60px] flex w-fit sm:mb-0"
        >
          聯絡我們
        </ShareLinkButton>
      </ShareGradientDotsCard>

      <NuxtImg
        class="absolute right-[-36px] top-[-96.6406px] -z-10 block lg:hidden"
        src="/images/sponsors/sponsors-line-mobile.svg"
        width="394"
        height="326"
      />
    </div>
  </section>
</template>

<style scoped>
.sponsors-banner-section {
  background-image: url("/images/sponsorsBanner.webp");
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
}

@media (min-width: 640px) {
  .sponsors-banner-section {
    background-position: center;
  }
}

.sponsors-title-section {
  background-image: url("/images/sponsors/sponsorsBg-mobile.webp");
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: 100% 121px;
}

@media (min-width: 1024px) {
  .sponsors-title-section {
    background-image: url("/images/sponsors/sponsorsBg.webp");
    background-size: 100% 215px;
  }
}

.sponsors-content + .sponsors-content {
  border-top: 1px solid #e6e6e6;
}
.organizer-description-paragraph + .organizer-description-paragraph {
  padding-top: 1rem;
}
</style>
