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
  <section class="full-bleed py-[60px]">
    <HomeSpaceInfoMarquee />

    <div class="my-3 justify-center px-5 lg:flex">
      <div class="group w-full border border-primary-green/80 lg:flex lg:max-w-[1320px]">
        <div class="w-full lg:flex-[3]">
          <NuxtImg
            src="/home/information/map-sm.svg"
            alt="space information"
            class="w-full lg:hidden"
          />
          <NuxtImg
            src="/home/information/map.svg"
            alt="space information"
            class="hidden size-full object-cover lg:block"
          />
        </div>
        <div class="mt-8 px-3 pb-3 lg:mt-0 lg:flex lg:flex-[1] lg:flex-col lg:justify-between lg:px-10 lg:py-6">
          <HomeSectionTitle>
            <template #title>
              SPACE
            </template>
            <template #subTitle>
              場域
            </template>
          </HomeSectionTitle>

          <div class="mt-8">
            <NuxtLink
              to="https://www.google.com/maps/dir//%E7%93%B6%E8%93%8B%E5%B7%A5%E5%BB%A0%E5%8F%B0%E5%8C%97%E8%A3%BD%E9%80%A0%E6%89%80"
              target="_blank"
              class="text-h3 transition lg:text-md-h3 lg:underline-offset-4 lg:hover:underline lg:group-hover:text-primary-green"
            >
              瓶蓋工廠台北製造所
              <Icon
                name="ph:map-trifold"
                class="size-6 text-primary-green  lg:text-white lg:group-hover:text-primary-green"
              />
            </NuxtLink>

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
  </section>
</template>
