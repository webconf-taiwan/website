<script setup lang="ts">
useSeoMeta({
  title: '歷屆回顧',
})

const HISTORY_LIST = [
  {
    year: 2024,
    desc: '本屆科技年會將探討 UI/UX 設計的最新趨勢，包括使用者界面設計、使用者體驗優化、人機互動設計等議題，以深入探討如何打造出引人入勝的用戶體驗，提升產品的價值和競爭力。',
    link: 'https://2024.webconf.tw',
    img: '/images/history-2024.webp',
  },
  {
    year: 2023,
    desc: '重啟十年前的WebConf 研討會中，帶領與會者穿越時間，探索網路的過去、現在和未來。過去十年間，網路發生了巨大的變化，我們將重新審視網路的起源以及它在這些年裡的演進。',
    link: 'https://2023.webconf.tw',
    img: '/images/history-2023.webp',
  },
  {
    year: 2013,
    desc: '本屆科技年會將探討 UI/UX 設計的最新趨勢，包括使用者界面設計、使用者體驗優化、人機互動設計等議題，以深入探討如何打造出引人入勝的用戶體驗，提升產品的價值和競爭力。',
    link: 'https://2013.webconf.tw',
    img: '/images/history-2013.webp',
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
            HISTORY
          </h1>
          <div class="flex w-full flex-col gap-3 lg:w-fit">
            <span
              class="inline-block px-0 text-center text-h4-24 lg:pl-[150px] lg:pr-10"
            >歷屆回顧
            </span>
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

    <main class="lg:mb-40 lg:mt-[100px]">
      <ul class="flex w-full flex-col lg:gap-[100px] lg:px-[calc(100%/9)]">
        <li
          v-for="(item, index) in HISTORY_LIST"
          :key="item.year"
          :class="{
            'lg:self-end': index % 2 === 1,
          }"
          class="hover:blue-shadow group relative bg-black text-white duration-300 lg:w-[calc(100dvw/2)]"
        >
          <NuxtImg
            :src="item.img"
            :alt="item.year"
            class="size-full object-cover"
          />
          <div
            class="gap-5 p-5 duration-300 group-hover:bg-webconf-blue lg:flex 2xl:gap-[68px] 2xl:p-6"
          >
            <h2 class="text-h4-60">
              {{ item.year }}
            </h2>

            <p class="mt-3 text-body-18 lg:mt-0">
              {{ item.desc }}
            </p>

            <a
              :href="item.link"
              target="_blank"
              class="mt-6 inline-block bg-webconf-blue px-6 py-2 lg:hidden"
            >
              前往頁面
            </a>

            <a
              v-cursor="{
                scale: 5,
                duration: 0.5,
                backgroundColor: 'rgba(0, 46, 255, 0.9)',
                text: 'VIEW',
              }"
              :href="item.link"
              target="_blank"
              class="absolute left-0 top-0 mt-6 hidden size-full bg-webconf-blue px-6 py-2 lg:block lg:bg-transparent"
            >
            </a>
          </div>
        </li>
      </ul>
    </main>
  </div>
</template>

<style scoped>
.agenda-section {
  background-image: url("/images/sponsorsBanner.webp");
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
}
</style>
