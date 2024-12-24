<script setup lang="ts">
const transportMethods = [
  {
    title: '搭乘高鐵、台鐵',
    description: '南港火車站的北門出站，經市民大道向西步行約 5 分鐘。',
  },
  {
    title: '搭乘捷運',
    description: '捷運南港站 1A 出口，步行至連通道至台鐵 / 高鐵北門出站，經市民大道向西步行約 5 分鐘。',
  },
  {
    title: '搭乘公車',
    description: '鄰近台肥新村站，或行經市民大道八段站、南港行政中心站之車輛。',
  },
  {
    title: '自行開車',
    description: '周邊備有兩個付費停車場，步行 3 分鐘即可抵達，車位數量有限，建議搭乘大眾運輸前往。',
    details: [
      'Times 南港車站前停車場',
      'CITY PARKING 城市車旅停車場 全聯南港旗艦站',
    ],
  },
]
</script>

<template>
  <section class="mb-20">
    <VenueTitle class="max-lg:sticky max-lg:left-0 max-lg:top-12">
      <template #title>
        TRAFFIC
      </template>
      <template #subTitle>
        交通
      </template>
    </VenueTitle>

    <div class="mt-9 w-full lg:mt-[67px]">
      <div class="mb-8 flex w-fit space-x-3 lg:mb-10">
        <h3 class="text-xl font-bold lg:text-[32px]">
          HOW TO GET THERE
        </h3>
        <span class="font-bold lg:text-2xl">如何前往</span>
      </div>

      <ul class="flex flex-col gap-8 lg:flex-row lg:flex-wrap lg:gap-y-10 lg:gap-x-0">
        <li
          v-for="(method, index) in transportMethods"
          :key="index"
          class="w-fit lg:w-1/2"
        >
          <p class="text-2xl font-bold text-primary-green lg:text-[32px]">
            {{ method.title }}
          </p>

          <div class="mt-1 border-l-4 border-primary-green py-1 pl-5 lg:mt-4 lg:pl-6">
            <p class="leading-[26px]">
              {{ method.description }}
            </p>
            <ul
              v-if="method.details"
              class="mt-1 flex list-disc flex-col gap-2 pl-5"
            >
              <li
                v-for="(detail, dIndex) in method.details"
                :key="dIndex"
              >
                {{ detail }}
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
