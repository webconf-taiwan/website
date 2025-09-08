<script setup lang="ts">
const SPEAKERS = [
  {
    name: '李建杭 AMOS',
  },
  {
    name: '游舒帆 GIPI',
  },
  {
    name: 'KURO HSU',
  },
  {
    name: '奶綠茶',
  },
]
</script>

<template>
  <section class="bg-black text-white">
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

    <div
      v-arrow="{ speed1: '10s', color: 'white' }"
      class="grid grid-cols-4"
    >
      <div
        v-for="(speaker, index) in SPEAKERS"
        :key="speaker.name"
        class="col-span-1 flex flex-col items-start justify-center gap-5 border-y-[0.5px] border-webconf-gray/50 px-12 py-10"
        :class="{
          'border-l-[0.5px]': index !== 0,
          'border-r-[0.5px]':
            index !== SPEAKERS.length - 1 && (index + 1) % 4 !== 0,
        }"
      >
        <div class="h-[376px] w-full max-w-[264px] bg-blue-600"></div>
        <h3 class="text-h4-24">
          {{ speaker.name }}
        </h3>
      </div>
    </div>
  </section>
</template>
