<script setup lang="ts">
const SPEAKERS = [
  {
    name: '李建杭 AMOS',
    src: '/images/featuredSpeaker_Amos.png',
  },
  {
    name: '游舒帆 GIPI',
    src: '/images/featuredSpeaker_Gipi.png',
  },
  {
    name: 'KURO HSU',
    src: '/images/featuredSpeaker_Kuro.png',
  },
  {
    name: '奶綠茶',
    src: '/images/featuredSpeaker_Milk.png',
  },
]
</script>

<template>
  <section class="bg-black text-white">
    <!-- 區塊標題 -->
    <div
      v-arrow="{ speed1: '12s', color: 'white' }"
      class="flex items-center justify-between border-y-[0.5px] border-webconf-gray px-20 py-10"
    >
      <div class="flex items-start gap-4">
        <h2 class="text-center text-h4-60 font-bold">
          Featured Speakers
        </h2>
        <ShareBlueTag
          text="講者"
          class="!px-5"
        />
      </div>

      <ShareLinkButton
        to="#"
        class="text-center"
      >
        更多講者
      </ShareLinkButton>
    </div>

    <!-- 講者輪播 -->
    <div
      v-arrow="{ speed1: '10s', color: 'white' }"
      class="relative mx-auto grid max-w-[1440px] grid-cols-4"
    >
      <!-- 窗框 -->
      <div class="absolute inset-0 flex w-full">
        <div
          v-for="i in 4"
          :key="i"
          class="flex-1 border-x-[48px] border-y-[40px]"
        ></div>
      </div>
      <div
        v-for="(speaker, index) in SPEAKERS"
        :key="speaker.name"
        :class="{
          'border-l-[0.5px]': index !== 0,
          'border-r-[0.5px]':
            index !== SPEAKERS.length - 1 && (index + 1) % 4 !== 0,
        }"
        class="col-span-1 flex flex-col items-center justify-center border-y-[0.5px] border-webconf-gray/50 px-12 py-10"
      >
        <HomeSpeakerCard
          :speakers="SPEAKERS"
          :original-index="index"
        />
      </div>
    </div>
  </section>
</template>
