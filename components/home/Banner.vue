<script lang="ts" setup>
</script>

<template>
  <!-- 電腦版 -->
  <section
    class="mt-[60px] hidden h-[calc(100dvh-72px)] w-full ring-1 lg:block"
  >
    <div class="flex items-end justify-between">
      <div
        id="logoContainer"
        class="h-[150px] w-[72%]"
      >
        <NuxtImg
          src="/logo.svg"
          alt="logo"
          class="h-auto w-full"
        />
      </div>

      <div class=" ml-10 flex w-[28%] flex-col items-start justify-end ring-1">
        <span class="font-bold tracking-[0.037em] md:text-xl">
          2024｜12.27 - 28
        </span>
        <span class=" text-h3 tracking-[0.07em]">
          瓶蓋工廠台北製造所
        </span>
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

  <!-- 手機版 -->
  <section
    class="mt-[53px] w-full lg:hidden"
  >
    <div class="flex flex-col">
      <div class="flex flex-col">
        <div
          id="logoSmContainer"
          class="w-full ring-1"
        >
          <NuxtImg
            src="/logo-sm.svg"
            alt="logo"
            class="size-full"
          />
        </div>

        <!-- TODO:等 Lottie 動畫 -->
        <div class="mt-14 w-full">
          <NuxtImg
            src="/home/banner/futurePlan-sm.svg"
            alt="bg"
            class="w-full"
          />
        </div>

        <div class="mt-[35px] flex flex-col items-center justify-center space-y-1 py-3">
          <span class="text-mina text-xl font-bold leading-8 tracking-[0.037em] md:text-xl">
            2024｜12.27 - 28
          </span>
          <span class="text-h3 tracking-[0.07em]">
            瓶蓋工廠台北製造所
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
