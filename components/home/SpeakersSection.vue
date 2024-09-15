<script setup lang="ts">
import { speakers } from '~/constants'
</script>

<template>
  <section class="mx-auto w-[min(100%,1096px)] border-white/20">
    <div class="mb-20 flex items-center justify-between">
      <HomeSectionTitle>
        <template #title>
          SPEAKERS
        </template>
        <template #subTitle>
          講者
        </template>
      </HomeSectionTitle>

      <button
        type="button"
        class="flex items-center justify-center gap-x-2 border border-primary-green bg-gradient-to-b from-primary-green/10 to-primary-green/50 px-9 py-4 text-xl"
      >
        <span>查看講者</span>
        <Icon
          name="i-heroicons-arrow-right"
          size="24"
        />
      </button>
    </div>

    <div class="flex gap-8 lg:gap-6">
      <svg
        width="0"
        height="0"
      >
        <defs>
          <clipPath id="square-with-corner-cut">
            <path d="M180,0 H424 V424 H0 V40 L132,40 Z" />
          </clipPath>
        </defs>
      </svg>

      <Carousel
        orientation="vertical"
        class="relative max-w-[424px]"
        style="clip-path: url(#square-with-corner-cut);"
        :opts="{
          align: 'start',
        }"
      >
        <CarouselContent class="size-[424px]">
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
              d="M180,1 H423 V423 H1 V41 L133,41 Z"
              fill="none"
              stroke="var(--primary-green)"
              stroke-width="3"
            />
          </svg>
        </template>
      </Carousel>

      <div class="grid-speakers">
        <div class="grid-speakers-separator-line"></div>
        <div class="grid-speakers-separator-line"></div>
        <div class="grid-speakers-separator-line"></div>

        <div
          v-for="speaker in speakers"
          :key="speaker.id"
          class="flex items-center pl-4 pr-2"
        >
          <span>{{ speaker.name }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scope>
.grid-speakers {
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(9, minmax(0, 1fr));
  grid-auto-flow: column;
}

.grid-speakers .grid-speakers-separator-line {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background-image: linear-gradient(to bottom, var(--primary-green), var(--primary-green) 4px, transparent 4px, transparent 8px);
  background-repeat: repeat;
  background-size: 100% 8px;
}

.grid-speakers .grid-speakers-separator-line:nth-child(1) {
  left: 0;
}

.grid-speakers .grid-speakers-separator-line:nth-child(2) {
  left: 33.33%;
}

.grid-speakers .grid-speakers-separator-line:nth-child(3) {
  left: 66.67%;
}
</style>
