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
    v-arrow="{ speed1: '12s', color: 'white' }"
    :auto-fill="true"
    class="!overflow-x-clip border-t-[0.5px] border-webconf-gray bg-black"
  >
    <div
      v-for="(organizer, index) in ORGANIZERS"
      :key="index"
      class="py-10 pl-12 pr-[42px]"
    >
      <NuxtImg
        :src="organizer.logo"
        :alt="organizer.name"
        format="webp"
        width="150"
        height="120"
      />
    </div>
  </NuxtMarquee>
</template>
