<script setup lang="ts">
const ORGANIZERS = [
  {
    name: '五倍學院',
    link: 'https://5xcampus.com/',
    logo: '/images/home/sponsors/5xcampus.svg',
    hoverLogo: '/images/home/sponsors/5xcampus-hover.svg',
    consecutiveText: '',
  },
  {
    name: '六角學院',
    link: 'https://www.hexschool.com/',
    logo: '/images/home/sponsors/hexschool.svg',
    hoverLogo: '/images/home/sponsors/hexschool-hover.svg',
    consecutiveText: '',
  },
  {
    name: '悠識學院',
    link: 'https://edu.userxper.com/',
    logo: '/images/home/sponsors/userxper.svg',
    hoverLogo: '/images/home/sponsors/userxper-hover.svg',
    consecutiveText: '',
  },
  {
    name: '昇新科技',
    link: 'https://www.instagram.com/ascentistech/',
    logo: '/images/home/sponsors/ascentisTech.svg',
    hoverLogo: '/images/home/sponsors/ascentisTech-hover.svg',
    consecutiveText: '',
  },
  {
    name: '鈦坦科技',
    link: 'https://titansoft.com/tw',
    logo: '/images/home/sponsors/titansoft.svg',
    hoverLogo: '/images/home/sponsors/titansoft-hover.svg',
    consecutiveText: '連續 3 年贊助',
  },
  {
    name: '版塊設計',
    link: 'https://blockstudio.tw/',
    logo: '/images/home/sponsors/BlockStudio.svg',
    hoverLogo: '/images/home/sponsors/BlockStudio-hover.svg',
    consecutiveText: '',
  },
  {
    name: 'WebCRACK 數位設計共享平台',
    link: 'https://webcrack.tw/',
    logo: '/images/home/sponsors/WebCRACK.svg',
    hoverLogo: '/images/home/sponsors/WebCRACK-hover.svg',
    consecutiveText: '',
  },
]
</script>

<template>
  <NuxtMarquee
    v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
    :auto-fill="true"
    :pause-on-hover="true"
    :pause-on-click="true"
    class="!overflow-x-clip border-t-[0.5px] border-webconf-gray bg-black"
  >
    <NuxtLink
      v-for="(organizer, index) in ORGANIZERS"
      :key="index"
      :to="organizer.link"
      :aria-label="organizer.name"
      target="_blank"
      class="group inline-block p-3 lg:py-10 lg:pl-12 lg:pr-[42px]"
    >
      <div class="relative">
        <NuxtImg
          :src="organizer.logo"
          :alt="organizer.name"
          width="150"
          class="aspect-[5/4] w-[96px] transition-opacity duration-300 sm:w-[120px] lg:w-[150px] lg:group-hover:opacity-0"
        />
        <NuxtImg
          :src="organizer.hoverLogo"
          :alt="organizer.name"
          width="150"
          class="absolute inset-0 aspect-[5/4] w-[96px] opacity-0 transition-opacity duration-300 sm:w-[120px] lg:w-[150px] lg:group-hover:opacity-100"
        />
        <span
          v-if="organizer.consecutiveText !== ''"
          class="absolute inset-x-0 bottom-[-3.6px] m-auto inline-block w-fit bg-white px-2 py-1 text-center text-[10px] font-semibold leading-[1.4] tracking-[0.02em] text-webconf-blue transition-colors duration-500 sm:bottom-1 lg:bottom-0 lg:group-hover:bg-webconf-blue lg:group-hover:text-white"
        >{{ organizer.consecutiveText }}</span>
      </div>
    </NuxtLink>
  </NuxtMarquee>
</template>
