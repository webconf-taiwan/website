<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import type { DaySchedule } from '~/types/agendas'
import type { Speaker } from '~/types/speakers'

const { speaker } = defineProps<{
  speaker: Speaker & { tags: string[] }
  agendaData: DaySchedule
}>()

const breakpoints = useBreakpoints(breakpointsTailwind)

const isSmaller = {
  sm: breakpoints.smaller('md'), // 0-767px
  md: breakpoints.between('md', 'lg'), // 768-1023px
  lg: breakpoints.greater('lg'), // >= 1024px
}

const maskClipPath = computed(() => {
  if (isSmaller.sm.value) {
    return 'M135,0 H288 V288 H0 V35 L90,35 Z' // 手機
  }

  if (isSmaller.md.value) {
    return 'M85,0 H197 V197 H0 V25 L60,25 Z' // 平板
  }

  return 'M110,0 H260 V260 H0 V30 L70,30 Z' // 電腦
})

const svgViewBox = computed(() => {
  if (isSmaller.sm.value) {
    return '0 0 288 288'
  }

  if (isSmaller.md.value) {
    return '0 0 197 197'
  }

  return '0 0 260 260'
})
</script>

<template>
  <!-- 裝飾線條 -->
  <div
    class="absolute left-2 top-2 size-[10px] border-l border-t border-primary-green opacity-0 duration-200 lg:group-hover:opacity-100"
  ></div>
  <div
    class="absolute right-2 top-2 size-[10px] border-r border-t border-primary-green opacity-0 duration-200 lg:group-hover:opacity-100"
  ></div>
  <div
    class="absolute bottom-2 right-2 size-[10px] border-b border-r border-primary-green opacity-0 duration-200 lg:group-hover:opacity-100"
  ></div>
  <div
    class="absolute bottom-2 left-2 size-[10px] border-b border-l border-primary-green opacity-0 duration-200 lg:group-hover:opacity-100"
  ></div>

  <!-- Avatar -->
  <ClientOnly>
    <div class="relative mx-auto size-[288px] md:size-[197px] lg:size-[260px]">
      <NuxtImg
        :src="speaker.avatar"
        :alt="speaker.displayName"
        class="size-full object-cover"
        format="webp"
        :placeholder="[32, 32, 80, 5]"
        draggable="false"
        style="clip-path: url(#square-with-corner-cut);"
      />
      <svg
        class="absolute"
        width="0"
        height="0"
      >
        <defs>
          <clipPath id="square-with-corner-cut">
            <path :d="maskClipPath" />
          </clipPath>
        </defs>
      </svg>
      <svg
        class="pointer-events-none absolute left-0 top-0 size-full"
        :view-box="svgViewBox"
      >
        <path
          :d="maskClipPath"
          fill="none"
          stroke="var(--primary-green)"
          stroke-width="3"
        />
      </svg>

      <div class="absolute inset-x-0 bottom-0 z-10 h-1.5 bg-primary-green"></div>
      <div class="absolute top-[3px] z-10 h-[1px] w-[100px] bg-primary-green md:w-[65px] lg:w-[88px]"></div>
      <div class="absolute top-[15px] z-10 h-[1px] w-[70px] bg-primary-green md:top-[13px] md:w-[50px] lg:top-[15px] lg:w-[60px]"></div>
    </div>
  </ClientOnly>

  <!-- 姓名、標籤 -->
  <div class="flex size-full max-w-[288px] flex-col justify-between md:max-w-[197px] lg:max-w-[288px]">
    <div class="mt-2 w-full">
      <p>
        {{ speaker.jobTitle }}
      </p>
      <p class="mt-1 text-xl">
        {{ speaker.displayName }}
      </p>
    </div>

    <ul class="mt-4 flex w-full max-w-[288px] flex-wrap gap-2 md:max-w-[197px] lg:max-w-[288px]">
      <li
        v-for="tag in speaker.tags"
        :key="tag"
        class="flex items-center justify-center border border-primary-green bg-gradient-to-t from-[#00A987] to-[#025966] px-3 py-[5px]"
      >
        <p class="text-mina text-sm tracking-wider">
          {{ tag }}
        </p>
      </li>
    </ul>
  </div>
</template>
