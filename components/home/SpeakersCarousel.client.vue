<script setup lang="ts">
import type { Speaker } from '~/types/speakers'

defineProps<{
  speakers: Speaker[]
  maskClipPath: string
}>()
</script>

<template>
  <div class="relative mb-8 mr-0 before:absolute before:left-0 before:top-1 before:h-[1px] before:w-[100px] before:bg-primary-green after:absolute after:left-0 after:top-[14px] after:h-[1px] after:w-[76px] after:bg-primary-green sm:before:top-1.5 sm:before:h-[2px] sm:before:w-[132px] sm:after:top-5 sm:after:h-[2px] sm:after:w-[100px] lg:mb-0 lg:mr-6">
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
    <Carousel
      orientation="vertical"
      class="max-w-[424px]"
      style="clip-path: url(#square-with-corner-cut);"
      :opts="{
        align: 'start',
      }"
    >
      <CarouselContent class="size-80 sm:size-[424px]">
        <CarouselItem
          v-for="speaker in speakers"
          :key="speaker.id"
          class="w-full bg-slate-400"
        >
          <div class="relative aspect-[1/1] w-full">
            <NuxtImg
              :src="speaker.avatar"
              :alt="speaker.name"
              class="h-auto w-full object-cover"
              format="webp"
              :placeholder="[32, 32, 80, 5]"
            />
          </div>
        </CarouselItem>
      </CarouselContent>
      <template #frame-border>
        <svg
          class="pointer-events-none absolute left-0 top-0 size-full"
          viewBox="0 0 424 424"
        >
          <path
            d="M192,1 H423 V423 H1 V41 L133,41 Z"
            fill="none"
            stroke="var(--primary-green)"
            stroke-width="3"
          />
        </svg>
      </template>
    </Carousel>
  </div>
</template>

<style scope></style>
