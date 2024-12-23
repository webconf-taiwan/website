<script lang="ts" setup>
import { venueGoogleMapLink } from '~/constants'
</script>

<template>
  <section class="mb-10 flex flex-col justify-center lg:mb-[100px] lg:flex-row lg:justify-between">
    <NuxtImg
      src="/venue/location.svg"
      alt="場域外觀"
      class="w-full lg:hidden"
      :placeholder="[32, 32, 80, 5]"
      draggable="false"
    />

    <NuxtImg
      src="/venue/location-lg.svg"
      alt="場域外觀"
      class="hidden w-[66%] lg:block "
      :placeholder="[32, 32, 80, 5]"
      draggable="false"
    />

    <NuxtLink
      class="group relative mt-5 p-5 lg:mt-auto xl:px-7"
      :to="venueGoogleMapLink"
      target="_blank"
      external
    >
      <!-- 四邊定位的正方形 -->
      <div class="absolute inset-0 size-[10px] border-l border-t border-primary-green duration-300 ease-in-out lg:group-hover:left-1 lg:group-hover:top-1"></div>
      <div class="absolute bottom-0 right-0 size-[10px] border-b border-r border-primary-green duration-300 ease-in-out lg:group-hover:bottom-1 lg:group-hover:right-1"></div>
      <div class="absolute bottom-0 left-0 size-[10px] border-b border-l border-primary-green duration-300 ease-in-out lg:group-hover:bottom-1 lg:group-hover:left-1"></div>
      <div class="absolute right-0 top-0 size-[10px] border-r border-t border-primary-green duration-300 ease-in-out lg:group-hover:right-1 lg:group-hover:top-1"></div>

      <div class="group flex items-center space-x-3">
        <div
          class="text-h3 transition lg:text-md-h3 lg:underline-offset-4 lg:group-hover:text-primary-green lg:group-hover:underline"
        >
          瓶蓋工廠台北製造所
          <Icon
            name="heroicons:arrow-top-right-on-square"
            class="size-6 text-primary-green"
          />
        </div>
      </div>

      <p class="mt-4">
        115 台北市南港區南港路二段 13 號
      </p>
    </NuxtLink>
  </section>
</template>
