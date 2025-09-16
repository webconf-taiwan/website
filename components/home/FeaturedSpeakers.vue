<script setup lang="ts">
import { ref } from 'vue'

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

const isHovered = ref(false)
const speakerCards = ref<any[]>([])

function handleNext() {
  speakerCards.value.forEach((card) => {
    card.slideToNext()
  })
}

function handlePrev() {
  speakerCards.value.forEach((card) => {
    card.slideToPrev()
  })
}
</script>

<template>
  <div class="py-20">
    <section
      class="border-y-[0.5px] border-webconf-gray/50 bg-black text-white"
    >
      <!-- 區塊標題 -->
      <div
        v-arrow="{ speed1: '12s', color: 'white' }"
        class="flex items-center justify-between border-y-[0.5px] border-webconf-gray/50 px-20 py-10"
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
      <div class="relative">
        <div
          class="relative mx-auto grid max-w-[1440px] grid-cols-4"
          @mouseover="isHovered = true"
          @mouseleave="isHovered = false"
        >
          <!-- 窗框 -->
          <div
            v-arrow="{ speed1: '10s', color: 'white' }"
            class="absolute inset-0 flex w-full"
          >
            <div
              v-for="i in 4"
              :key="i"
              class="flex-1 border-x-[48px] border-y-[40px] border-black/50"
            ></div>
          </div>

          <!-- 講者卡片 -->
          <div
            v-for="(speaker, index) in SPEAKERS"
            :key="speaker.name"
            :class="{
              'border-l-[0.5px]': index === 0,
            }"
            class="col-span-1 flex flex-col items-center justify-center border-r-[0.5px] px-12 py-10"
          >
            <HomeSpeakerCard
              :ref="(el) => (speakerCards[index] = el)"
              :speakers="SPEAKERS"
              :original-index="index"
              :is-parent-hovered="isHovered"
            />
          </div>
        </div>

        <!-- 輪播按鈕 -->
        <button
          v-cursor="{
            scale: 2,
            duration: 0.5,
            backgroundColor: 'rgba(0, 46, 255, 0.9)',
            text: '⭠',
          }"
          type="button"
          class="absolute left-0 top-0 h-full w-20"
          @click="handleNext"
        ></button>

        <button
          v-cursor="{
            scale: 2,
            duration: 0.5,
            backgroundColor: 'rgba(0, 46, 255, 0.9)',
            text: '⭢',
          }"
          type="button"
          class="absolute right-0 top-0 h-full w-20"
          @click="handlePrev"
        ></button>
      </div>
    </section>
  </div>
</template>
