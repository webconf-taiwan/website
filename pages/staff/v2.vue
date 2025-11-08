<script setup lang="ts">
import { SPEAKERS } from '~/constants/agendas'

useSeoMeta({
  title: '主辦團隊',
})
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
        class="sticky top-[54px] z-10 w-full shrink-0 flex-col items-start self-start border-b border-webconf-gray bg-black lg:h-[calc(100dvh-54px)] lg:w-[px] lg:border-r lg:p-4 2xl:w-[260px] 2xl:pl-12"
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
        class="relative z-0 grid w-full grid-cols-1 lg:grid-cols-3 xl:grid-cols-4"
      >
        <ShareGridCard
          v-for="(speaker, index) in SPEAKERS"
          :key="`${speaker.name}-${index}`"
          :data="speaker"
          :index="index"
          :is-selected="
            speaker.tags?.some((tag) => selectedTags.includes(tag))
              || selectedTags.length === 0
          "
          :link="`/speakers/v2?speakerId=${speaker.speakerId}`"
          :show-square="false"
        >
          <div class="flex gap-3 p-5 lg:flex-col lg:p-7 xl:p-9">
            <div class="relative shrink-0">
              <NuxtImg
                :src="speaker.avatarUrl"
                :alt="speaker.name"
                width="220"
                height="314"
                class="aspect-speaker-img-full h-[144px] w-[100px] object-cover grayscale duration-300 group-hover:grayscale-0 lg:size-full"
              />

              <ShareGradientMask class="group-hover:opacity-0" />
              <ShareNoiseMask class="group-hover:opacity-0" />
            </div>

            <div>
              <h3 class="text-h4-24 leading-[1.4]">
                {{ speaker.name }}
              </h3>
              <p
                class="text-xs leading-[1.4] text-gray-500 group-hover:text-white"
              >
                {{ speaker.JobTitle }}
              </p>

              <ul class="relative mt-3 flex grow flex-wrap items-start gap-2">
                <li
                  v-for="tag in speaker.tags"
                  :key="`${speaker.name}-${tag}`"
                  class="relative border border-webconf-blue px-4 py-[6px] text-xs leading-[1.4] tracking-[0.02em] transition-colors duration-300 group-hover:border-webconf-gray"
                >
                  {{ tag }}
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
