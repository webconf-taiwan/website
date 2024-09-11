<script lang="ts" setup>
</script>

<template>
  <section
    class="mt-[60px] h-[700px] w-full px-[60px] "
  >
    <div class="flex items-end justify-between">
      <div class="mt-[60px] flex space-x-10">
        <div class="h-[123px] w-[714px] ">
          <NuxtImg
            src="/logo.svg"
            alt="logo"
            class="size-full"
          />
        </div>

        <div class="mb-2 flex flex-col items-start justify-end">
          <span class="my-mina text-2xl font-bold tracking-[0.037em]">
            2024｜12.27 - 28
          </span>
          <span class="my-noto text-h3 tracking-[0.07em]">
            瓶蓋工廠台北製造所
          </span>
        </div>
      </div>

      <!-- TODO:等 shadcn 建置按鈕元件 -->
      <div class="flex h-[60px] w-[155px] items-center justify-center ">
        即將開賣
      </div>
    </div>

    <!-- TODO:等 Lottie 動畫 -->
    <div class="mt-[60px] h-[281px] w-full ">
      <NuxtImg
        src="/home/banner/futurePlan.svg"
        alt="bg"
        sizes="100vw"
      />
    </div>
  </section>
</template>
