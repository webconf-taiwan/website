<script lang="ts" setup>
</script>

<template>
  <section
    class="mt-[53px] h-[950px] w-full lg:mt-[60px] lg:px-[60px] "
  >
    <div class="flex flex-col ring-1 lg:flex-row lg:items-end lg:justify-between">
      <div class="flex flex-col ring-1 lg:mt-[60px] lg:flex-row lg:space-x-10 ">
        <div class="w-full lg:h-[150px] lg:w-[72%]">
          <NuxtImg
            src="/logo.svg"
            alt="logo"
            class="hidden size-full lg:block"
          />
          <NuxtImg
            src="/logo-full.svg"
            alt="logo"
            class="size-full lg:hidden"
          />
        </div>

        <!-- TODO:等 Lottie 動畫 -->
        <!-- 手機版主視覺 -->
        <div class="mt-[35px] w-full lg:hidden">
          <NuxtImg
            src="/home/banner/futurePlan-sm.svg"
            alt="bg"
            class="w-full"
          />
        </div>

        <div class="mt-[35px] flex flex-col items-center justify-center space-y-1 py-3 lg:hidden">
          <span class="text-mina text-xl font-bold leading-8 tracking-[0.037em] md:text-xl">
            2024｜12.27 - 28
          </span>
          <span class="text-h3 tracking-[0.07em]">
            瓶蓋工廠台北製造所
          </span>
        </div>

        <div class="mb-2 hidden w-[28%] flex-col items-start justify-end ring-1 lg:flex">
          <span class="font-bold tracking-[0.037em] md:text-xl">
            2024｜12.27 - 28
          </span>
          <span class=" text-h3 tracking-[0.07em]">
            瓶蓋工廠台北製造所
          </span>
        </div>
      </div>

      <!-- TODO:等 shadcn 建置按鈕元件 -->
      <div class=" hidden h-[60px] w-[155px] items-center justify-center lg:flex">
        即將開賣
      </div>
    </div>

    <!-- TODO:等 Lottie 動畫 -->
    <div class="mt-[60px] hidden h-[281px] w-full lg:block">
      <NuxtImg
        src="/home/banner/futurePlan.svg"
        alt="bg"
        sizes="100vw"
      />
    </div>
  </section>
</template>
