<script setup lang="ts">
import { EXTERNAL_LINKS } from '~/constants/externalLinks'

useSeoMeta({
  title: '歷屆回顧',
})

const WEBSITES = [
  {
    year: 2024,
    desc: '本屆科技年會將探討 UI/UX 設計的最新趨勢，包括使用者界面設計、使用者體驗優化、人機互動設計等議題，以深入探討如何打造出引人入勝的用戶體驗，提升產品的價值和競爭力。',
    link: 'https://2024.webconf.tw',
    img: '/images/history/webconf-2024.webp',
  },
  {
    year: 2023,
    desc: '重啟十年前的 WebConf 研討會中，帶領與會者穿越時間，探索網路的過去、現在和未來。過去十年間，網路發生了巨大的變化，我們將重新審視網路的起源以及它在這些年裡的演進。',
    link: 'https://2023.webconf.tw',
    img: '/images/history/webconf-2023.webp',
  },
  {
    year: 2013,
    desc: '本屆科技年會將探討 UI/UX 設計的最新趨勢，包括使用者界面設計、使用者體驗優化、人機互動設計等議題，以深入探討如何打造出引人入勝的用戶體驗，提升產品的價值和競爭力。',
    link: 'https://2013.webconf.tw',
    img: '/images/history/webconf-2013.webp',
  },
]

const hoveredImageIndex = ref(-1)
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
            HiSTORY
          </h1>
          <div class="flex w-full flex-col gap-3 lg:w-fit">
            <span
              class="inline-block px-0 text-center text-h4-24 lg:pl-[285px] lg:pr-10"
            >歷史回顧</span>
            <div class="order-[-1] flex items-center lg:order-1">
              <span class="size-3 bg-webconf-gray"></span>
              <span class="h-[1px] flex-1 bg-webconf-gray"></span>
              <span class="size-3 bg-webconf-gray"></span>
            </div>
          </div>
        </div>

        <div
          v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
          class="absolute bottom-0 left-0 z-30 h-[1px] w-full bg-webconf-gray"
        ></div>
      </div>
    </section>

    <main class="lg:mb-40 lg:mt-[100px]">
      <ul class="flex w-full flex-col lg:gap-[100px] lg:px-[calc(100%/9)]">
        <li
          v-for="(item, index) in WEBSITES"
          :key="item.year"
          :class="{
            'lg:self-end': index % 2 === 1,
          }"
          class="hover:blue-shadow group relative border-b border-webconf-gray/50 bg-black text-white duration-300 lg:w-[calc(100dvw/2)]"
          @mousemove="hoveredImageIndex = index"
          @mouseleave="hoveredImageIndex = -1"
        >
          <div class="size-full">
            <NuxtImg
              :src="item.img"
              :alt="`${item.year} WebConf 網站封面`"
              class="size-full object-cover"
            />
            <div
              class="gap-5 px-5 pb-12 pt-5 duration-300 lg:flex group-hover:lg:bg-webconf-blue 2xl:gap-[68px] 2xl:px-6 2xl:pb-10 2xl:pt-6"
            >
              <h2 class="text-h4-60">
                {{ item.year }}
              </h2>

              <p class="mt-3 text-body-18 lg:mt-0">
                {{ item.desc }}
              </p>

              <NuxtLink
                :to="item.link"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-6 inline-block bg-webconf-blue px-6 py-2 lg:hidden"
              >
                前往頁面
              </NuxtLink>

              <a
                v-cursor="{
                  scale: 5,
                  duration: 0.5,
                  backgroundColor: 'rgba(0, 46, 255, 0.9)',
                  text: 'VIEW',
                }"
                :href="item.link"
                target="_blank"
                rel="noopener noreferrer"
                class="absolute left-0 top-0 mt-6 hidden size-full bg-webconf-blue px-6 py-2 lg:block lg:bg-transparent"
              >
              </a>
            </div>
          </div>
        </li>
      </ul>
    </main>

    <NuxtImg
      v-for="(item, index) in WEBSITES"
      :key="item.year"
      :src="item.img"
      :alt="`${item.year} WebConf 網站封面`"
      :class="{
        'opacity-60': hoveredImageIndex === index,
      }"
      class="pointer-events-none fixed left-0 top-0 z-[-1] hidden h-[100dvh] w-screen object-cover opacity-0 blur-[8px] duration-500 ease-in-out group-hover:opacity-60 lg:block"
    />

    <section
      class="z-10 flex h-[500px] flex-col items-center justify-center border-y border-webconf-gray bg-[url('/images/CTABg.webp')] bg-cover bg-center bg-no-repeat"
    >
      <h3 class="text-h4-60 text-webconf-gray">
        歷屆活動花絮
      </h3>

      <ShareLinkButton
        :to="EXTERNAL_LINKS.WEBCONF_GALLERY_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-10"
      >
        前往回顧
      </ShareLinkButton>
    </section>
  </div>
</template>

<style scoped>
.agenda-section {
  background-image: url("/images/sponsorsBanner.webp");
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
}
@media (min-width: 640px) {
  .agenda-section {
    background-position: center;
  }
}
</style>
