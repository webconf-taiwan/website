<script setup lang="ts">
import type { Staff } from '~/types'

useSeoMeta({
  title: '主辦團隊',
})

const STAFF: Staff[] = [
  {
    name: '高見龍',
    title: '掃地兼敲鐘',
    avatarUrl: '/images/speakers_v2/1_李昆謀.webp',
    links: ['https://www.facebook.com/gaokai.long'],
  },
  {
    name: '廖洧杰',
    title: '專業推坑王',
    avatarUrl: '/images/speakers_v2/1_李昆謀.webp',
    links: ['https://www.facebook.com/liao.wei.jie.1'],
  },
  {
    name: '理查哥',
    title: 'UX 土地公',
    avatarUrl: '/images/speakers_v2/1_李昆謀.webp',
    links: ['https://www.facebook.com/richard.li.12914'],
  },
  {
    name: 'Sabrina',
    title: '萬年工頭',
    avatarUrl: '/images/speakers_v2/1_李昆謀.webp',
    links: ['https://www.facebook.com/sabrina.huang.12914'],
  },
  {
    name: 'Melissa',
    title: '錢錢擔當',
    avatarUrl: '/images/speakers_v2/1_李昆謀.webp',
    links: ['https://www.facebook.com/melissa.huang.12914'],
  },
  {
    name: '薛羽婷',
    title: '設計軌講者獵人',
    avatarUrl: '/images/speakers_v2/1_李昆謀.webp',
    links: ['https://www.facebook.com/xueyu.teng.12914'],
  },
  {
    name: '陳彥宇',
    title: '設計小夥伴',
    avatarUrl: '/images/speakers_v2/1_李昆謀.webp',
    links: ['https://www.facebook.com/chen.yu.12914'],
  },
  {
    name: 'EG',
    title: '設計小夥伴',
    avatarUrl: '/images/speakers_v2/1_李昆謀.webp',
    links: ['https://www.facebook.com/eg.huang.12914'],
  },
  {
    name: '豪萱',
    title: '設計小夥伴',
    avatarUrl: '/images/speakers_v2/1_李昆謀.webp',
    links: ['https://www.facebook.com/hao.huang.12914'],
  },
  {
    name: 'Nina',
    title: '設計小夥伴',
    avatarUrl: '/images/speakers_v2/1_李昆謀.webp',
    links: ['https://www.facebook.com/nina.huang.12914'],
  },
  {
    name: '楊正弘',
    title: '設計小夥伴',
    avatarUrl: '/images/speakers_v2/1_李昆謀.webp',
    links: ['https://www.facebook.com/yang.huang.12914'],
  },
  {
    name: 'Antonio',
    title: '開發小農夫',
    avatarUrl: '/images/speakers_v2/1_李昆謀.webp',
    links: ['https://www.facebook.com/antonio.huang.12914'],
  },
  {
    name: 'Shin',
    title: '開發小農夫',
    avatarUrl: '/images/speakers_v2/1_李昆謀.webp',
    links: ['https://www.facebook.com/shin.huang.12914'],
  },
]
</script>

<template>
  <div>
    <section class="flex-1">
      <div class="speakers-section relative h-80 text-webconf-gray lg:h-400">
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
            STAFF
          </h1>
          <div class="flex w-full flex-col gap-3 lg:w-fit">
            <span
              class="inline-block px-0 text-center text-h4-24 lg:pl-[150px] lg:pr-10"
            >主辦團隊
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

    <main
      class="flex flex-col border-b border-webconf-gray bg-black text-webconf-gray lg:flex-row"
    >
      <aside
        class="sticky top-[54px] z-10 w-full shrink-0 flex-col items-start self-start border-b border-webconf-gray bg-black lg:h-[calc(100dvh-54px)] lg:w-[228px] lg:border-b-0 lg:border-r lg:p-4 2xl:w-[260px] 2xl:pl-12"
      >
        <h2
          class="-translate-x-1 px-5 py-6 text-left text-h4-60 text-webconf-blue duration-300 group-hover:text-white lg:mt-2 lg:block lg:[writing-mode:vertical-lr]"
        >
          2025 PARTNERS
        </h2>

        <div
          v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
          class="lg:hidden"
        ></div>
      </aside>

      <div
        v-cursor="{
          scale: 0.5,
          duration: 0.5,
        }"
        class="relative z-0 grid w-full grid-cols-1 gap-[0.5px] lg:grid-cols-3 xl:grid-cols-4"
      >
        <ShareGridCard
          v-for="(staff, index) in STAFF"
          :key="`${staff.name}-${index}`"
          link="/staff/v2"
          :show-square="false"
        >
          <div class="flex gap-3 p-5 lg:flex-col lg:p-7 xl:p-9">
            <div class="relative shrink-0">
              <NuxtImg
                src="/images/speakers_v2/1_李昆謀.webp"
                :alt="staff.name"
                width="220"
                height="314"
                class="aspect-speaker-img-full h-[144px] w-[100px] object-cover grayscale duration-300 group-hover:grayscale-0 lg:size-full"
              />

              <ShareGradientMask class="group-hover:opacity-0" />
              <ShareNoiseMask class="group-hover:opacity-0" />
            </div>

            <div class="flex flex-col">
              <div class="grow">
                <h3 class="text-h4-24 leading-[1.4]">
                  {{ staff.name }}
                </h3>
                <p
                  class="text-xs leading-[1.4] text-gray-500 group-hover:text-white"
                >
                  {{ staff.title }}
                </p>
              </div>

              <ul class="mt-3 flex flex-wrap gap-3">
                <li
                  v-for="link in staff.links"
                  :key="link"
                  class="border border-webconf-blue/90 transition-colors duration-500 hover:bg-webconf-blue"
                >
                  <a
                    :href="link"
                    class="block p-[10px]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <NuxtImg
                      src="/images/icon/ig.svg"
                      width="24"
                      height="24"
                      :alt="`${staff.name} ${link}`"
                    />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </ShareGridCard>
      </div>
    </main>
  </div>
</template>

<style scoped>
.speakers-section {
  background-image: url("/images/sponsorsBanner.webp");
  background-repeat: no-repeat;
  background-position: center top;
  background-size: auto 400px;
}

@media (min-width: 640px) {
  .speakers-section {
    background-position: center;
    background-size: cover;
  }
}
</style>
