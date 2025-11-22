<script setup lang="ts">
const porps = defineProps<{
  title: string
  subTitle: string
}>()
</script>

<template>
  <div class="banner-section relative h-80 text-webconf-gray lg:h-400">
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
      viewBox="0 0 640 320"
      preserveAspectRatio="xMidYMid slice"
    >
      <!-- 右側斜線 -->
      <g>
        <!-- 靜態軌道 -->
        <line
          x1="330"
          y1="0"
          x2="650"
          y2="320"
          stroke="#E6E6E6"
          stroke-width="0.5"
        />
      </g>
    </svg>

    <div
      class="absolute left-[50%] top-[45%] flex w-full -translate-x-1/2 flex-col items-center justify-center gap-6 px-5 sm:top-[38%] sm:px-6 lg:top-[50%] lg:flex-row lg:items-end"
    >
      <h1 class="text-h1-96 text-white">
        {{ porps.title }}
      </h1>
      <div class="flex w-full flex-col gap-3 lg:w-fit">
        <span
          class="inline-block px-0 text-center text-h4-24 lg:pl-[285px] lg:pr-10"
        >{{ porps.subTitle }}</span>
        <div class="order-[-1] flex items-center lg:order-1">
          <span class="size-3 bg-webconf-gray"></span>
          <span class="h-[1px] flex-1 bg-webconf-gray"></span>
          <span class="size-3 bg-webconf-gray"></span>
        </div>
      </div>
    </div>

    <div
      v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
      class="absolute bottom-0 left-0 z-20 h-[1px] w-full bg-webconf-gray"
    ></div>
  </div>
</template>

<style scoped>
.banner-section {
  background-image: url("/images/sponsorsBanner.webp");
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
}

@media (min-width: 640px) {
  .banner-section {
    background-position: center;
  }
}
</style>
