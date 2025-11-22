<script setup lang="ts">
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
</script>

<template>
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
          是一個聚集網頁技術愛好者與專家的年度盛會。今年，我們將以 「Connecting
          the Web to a Sustainable Future」
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
</template>
