<script lang="ts" setup>
</script>

<template>
  <!-- 電腦版 -->
  <section
    class="py-24 hidden h-[calc(100dvh-72px)] w-full lg:block"
  >
    <div class="flex justify-between xl:items-end">
      <div
        id="logoContainer"
        class="w-[72%] xl:w-[52%]"
      >
        <NuxtImg
          src="/logo.svg"
          alt="logo"
          class="h-auto w-full"
        />
      </div>

      <div class="ml-10 w-[28%] space-y-3 xl:flex xl:w-[48%] xl:items-end xl:space-y-0">
        <div class="text-center xl:text-start">
          <p class="text-2xl font-bold tracking-[0.037em]">
            2024｜12.27 - 28
          </p>
          <p class="text-md-h3 tracking-[0.07em]">
            瓶蓋工廠台北製造所
          </p>
        </div>

        <Button
          variant="custom"
          size="custom"
          rounded="none"
          class="mx-auto mt-[35px] lg:max-w-none xl:mr-0 xl:max-w-[180px]"
        >
          <p class="text-xl">
            即將開賣
          </p>
        </Button>
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
          class="w-full"
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

        <Button
          variant="custom"
          size="custom"
          class="mx-auto mt-[35px]"
        >
          <p class="text-xl">
            即將開賣
          </p>
        </Button>
      </div>
    </div>
  </section>
</template>
