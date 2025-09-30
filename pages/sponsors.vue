<template>
  <section class="flex-1">
    <div
      class="sponsors-section relative h-80 border-b border-webconf-gray text-webconf-gray lg:h-400"
    >
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
            stroke-width="1"
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
            stroke-width="1"
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
            stroke-width="1"
          />
        </g>
      </svg>
      <div
        class="absolute left-[50%] top-[45%] flex w-fit -translate-x-1/2 flex-col items-center justify-center gap-6 px-6 sm:top-[38%] lg:top-[50%] lg:w-full lg:flex-row lg:items-end"
      >
        <h1 class="text-h1-96 text-white">
          SPONSORS
        </h1>
        <div class="flex w-full flex-col gap-3 lg:w-fit">
          <span
            class="inline-block px-0 text-center text-h4-24 lg:pl-[150px] lg:pr-10"
          >贊助廠商</span>
          <div class="order-[-1] flex items-center lg:order-1">
            <span class="size-3 bg-white"></span>
            <span class="h-[1px] flex-1 bg-white"></span>
            <span class="size-3 bg-white"></span>
          </div>
        </div>
      </div>
    </div>
    <div class="h-1200"></div>
  </section>
</template>

<style scoped>
.sponsors-section {
  background-image: url("/images/sponsorsBanner.webp");
  background-repeat: no-repeat;
  background-position: center top;
  background-size: auto 400px;
}

@media (min-width: 640px) {
  .sponsors-section {
    background-position: center;
    background-size: cover;
  }
}
</style>
