<script setup lang="ts">
const ORGANIZERS = [
  {
    name: '五倍學院',
    logo: '/images/5xcampus.webp',
  },
  {
    name: '六角學院',
    logo: '/images/hexschool.webp',
  },
  {
    name: '悠識學院',
    logo: '/images/userxper.webp',
  },
]
</script>

<template>
  <NuxtMarquee
    v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
    :auto-fill="true"
    class="!overflow-x-clip border-t-[0.5px] border-webconf-gray bg-black"
  >
    <div
      v-for="(organizer, index) in ORGANIZERS"
      :key="index"
      class="py-5 pl-6 pr-[21px] sm:py-6 sm:pl-[28.8px] sm:pr-[25.2px] lg:py-10 lg:pl-12 lg:pr-[42px]"
    >
      <NuxtImg
        :src="organizer.logo"
        :alt="organizer.name"
        format="webp"
        width="150"
        class="aspect-[5/4] w-[75px] sm:w-[90px] lg:w-[150px]"
      />
    </div>
  </NuxtMarquee>
</template>
