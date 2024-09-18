<script lang="ts" setup>
const trafficInfos = [
  {
    title: '搭乘捷運',
    content: '捷運南港站 1A 出口，步行至連通道至台鐵/高鐵北門出站，經市民大道向西步行約 5 分鐘',
  },
  {
    title: '搭乘火車',
    content: '搭乘至南港火車站的北門出站，經市民大道向西步行約 5 分鐘',
  },
]
</script>

<template>
  <div class="full-bleed py-[60px]">
    <HomeSpaceInfoMarquee />

    <div class="my-3 justify-center px-5 lg:flex">
      <div class="w-full border border-primary-green/80 lg:flex lg:max-w-[1320px]">
        <NuxtImg
          src="/home/information/map-sm.svg"
          alt="space information"
          class="w-full lg:hidden"
        />
        <NuxtImg
          src="/home/information/map.svg"
          alt="space information"
          class="hidden w-full object-cover lg:block"
        />
        <div class="mt-8 px-3 pb-3 lg:mt-0 lg:flex lg:flex-col lg:justify-between lg:px-10 lg:py-6">
          <HomeSectionTitle>
            <template #title>
              SPACE
            </template>
            <template #subTitle>
              場域
            </template>
          </HomeSectionTitle>

          <div class="mt-8">
            <h3 class="text-h3 lg:text-md-h3">
              瓶蓋工廠台北製造所
            </h3>

            <ul class="mt-6 space-y-6">
              <li
                v-for="(info) in trafficInfos"
                :key="info.title"
              >
                <p class="text-lg font-bold text-primary-green lg:text-xl">
                  {{ info.title }}
                </p>
                <p class="mt-1 leading-7 lg:mt-2">
                  {{ info.content }}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <HomeSpaceInfoMarquee :reverse="true" />
  </div>
</template>
