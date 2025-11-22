<script setup lang="ts">
import { EXTERNAL_LINKS } from '~/constants/externalLinks'

const { gsap } = useGsap()

const TRANSPORT_INFO = [
  {
    id: 1,
    name: '搭乘高鐵、台鐵',
    description: ['南港火車站的北門出站，經市民大道向西步行約 5 分鐘。'],
  },
  {
    id: 2,
    name: '搭乘公車',
    description: [
      '鄰近台肥新村站，或行經市民大道八段站、南港行政中心站之車輛。',
    ],
  },
  {
    id: 3,
    name: '搭乘捷運',
    description: [
      '捷運南港站 1A 出口，步行至連通道至台鐵 / 高鐵北門出站，經市民大道向西步行約 5 分鐘。',
    ],
  },
  {
    id: 4,
    name: '自行開車',
    description: [
      '周邊備有兩個付費停車場，步行 3 分鐘即可抵達，車位數量有限，建議搭乘大眾運輸前往。',
      '• Times 南港車站前停車場',
      '• CITY PARKING 城市車旅停車場 全聯南港旗艦站',
    ],
  },
]

const MAP_INFO = [
  {
    id: 1,
    name: 'HQ｜大會報到處',
    image: '/images/home/venue/map.svg',
    isAvailable: true,
  },
  {
    id: 2,
    name: 'M 棟｜議程廳',
    image: '/images/home/venue/map.svg',
    isAvailable: true,
  },
  {
    id: 3,
    name: 'I 棟｜休息區',
    image: '/images/home/venue/map.svg',
    isAvailable: true,
  },
  {
    id: 4,
    name: 'F 棟｜議程廳',
    image: '/images/home/venue/map.svg',
    isAvailable: true,
  },
  {
    id: 5,
    name: 'B 棟｜交流攤位',
    image: '/images/home/venue/map.svg',
    isAvailable: true,
  },
  {
    id: 6,
    name: 'A1 棟｜工作坊',
    image: '/images/home/venue/map.svg',
    isAvailable: true,
  },
  {
    id: 7,
    name: 'A2 棟｜議程廳',
    image: '/images/home/venue/map.svg',
    isAvailable: true,
  },
  {
    id: 8,
    name: 'G 棟｜未開放',
    image: '/images/home/venue/map.svg',
    isAvailable: false,
  },
]

const selectedVenueNum = ref(1)

const selectedVenue = computed(() =>
  MAP_INFO.find(venue => venue.id === selectedVenueNum.value),
)

function setVenue(num: number, isAvailable: boolean) {
  if (isAvailable) {
    selectedVenueNum.value = num
  }
}

const venueNameRef = ref<HTMLSpanElement | null>(null)

watch(selectedVenueNum, () => {
  if (!venueNameRef.value)
    return

  gsap.fromTo(
    venueNameRef.value,
    { opacity: 0 },
    { opacity: 1, duration: 0.5, ease: 'power2.out' },
  )
})
</script>

<template>
  <section class="flex-1">
    <ShareBanner
      title="VENUE"
      sub-title="場域介紹"
    />
    <!-- 場地背景圖 -->
    <div class="venue-bg relative h-[400px] text-center lg:h-[500px]">
      <div class="absolute top-[141px] z-10 w-full text-center">
        <h2 class="pb-4 text-h2-60 text-white">
          瓶蓋工廠台北製造所
        </h2>
        <p class="mb-12 text-h4-24 text-webconf-gray">
          115 台北市南港區南港路二段 13 號
        </p>
        <ShareLinkButton
          :to="EXTERNAL_LINKS.CONF_GOOGLE_MAP_URL"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google map
        </ShareLinkButton>
      </div>
    </div>

    <!-- 場域地圖 -->
    <div
      class="relative flex flex-col border-y border-webconf-gray bg-black text-white lg:flex-row"
    >
      <div
        v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
        class="absolute z-40 w-full"
      ></div>
      <div
        class="sponsors-title-section sticky top-[47px] z-30 border-b py-3 pl-5 xs:top-[55px] sm:top-[57px] lg:top-[55px] lg:border-b-0 lg:pl-12 lg:pr-[152px] lg:pt-10"
      >
        <h2
          class="inline-block text-h4-24 text-webconf-gray lg:text-[60px] lg:leading-[1.2] lg:tracking-[0.2em] lg:[writing-mode:vertical-rl]"
        >
          場面平面圖
        </h2>
      </div>

      <div class="grid w-full grid-cols-4">
        <NuxtLink
          :to="selectedVenue?.image || '#'"
          rel="noopener noreferrer"
          target="_blank"
          class="relative col-span-4 grid place-content-center pb-4 pt-[50px] lg:border-l lg:py-10"
        >
          <span
            ref="venueNameRef"
            class="absolute left-5 top-4 text-h5-20 text-webconf-gray lg:left-10 lg:top-8 lg:text-h4-24"
          >{{ selectedVenue?.name }}</span>
          <NuxtImg
            :src="selectedVenue?.image"
            width="866"
            height="470"
          />
        </NuxtLink>
        <button
          v-for="map in MAP_INFO"
          :key="map.id"
          v-cursor="{
            scale: 0.5,
            duration: 0.5,
          }"
          type="button"
          class="venue-map relative col-span-2 border-t border-l-webconf-frame px-6 py-5 before:absolute before:inset-0 before:z-10 before:block before:size-0 before:bg-webconf-blue before:transition-all before:duration-300 before:content-[''] lg:col-span-1 lg:border-l-[0.5px] lg:py-8 lg:pl-10 lg:pr-6 lg:before:size-7"
          :class="[
            map.isAvailable
              ? 'cursor-pointer hover:before:size-full'
              : 'cursor-not-allowed',
            selectedVenueNum === map.id && map.isAvailable
              ? 'before:size-full lg:before:size-full'
              : '',
          ]"
          @click="setVenue(map.id, map.isAvailable)"
        >
          <h3
            class="relative z-20 text-btn-16 lg:text-h4-24"
            :class="map.isAvailable ? 'text-webconf-gray' : 'text-[#555555]'"
          >
            {{ map.name }}
          </h3>
        </button>
      </div>
    </div>

    <!-- 交通方式 -->
    <div
      class="relative flex flex-col border-y border-webconf-gray bg-black text-white lg:mt-[141px] lg:flex-row"
    >
      <div
        v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
        class="absolute z-40 w-full"
      ></div>
      <div
        class="sponsors-title-section sticky top-[47px] z-30 border-b py-3 pl-5 xs:top-[55px] sm:top-[57px] lg:top-[55px] lg:border-b-0 lg:pl-12 lg:pr-[152px] lg:pt-10"
      >
        <h2
          class="inline-block text-h4-24 text-webconf-gray lg:text-[60px] lg:leading-[1.2] lg:tracking-[0.2em] lg:[writing-mode:vertical-rl]"
        >
          交通方式
        </h2>
      </div>

      <div class="flex flex-wrap">
        <div
          v-for="transport in TRANSPORT_INFO"
          :key="transport.id"
          class="venue-content relative w-full px-10 py-8 before:absolute before:inset-0 before:z-10 before:block before:size-5 before:bg-webconf-blue before:transition-all before:duration-300 before:content-[''] hover:before:size-full lg:w-1/2 lg:border-l lg:p-10 lg:pb-[60px] lg:before:size-7"
        >
          <h3 class="relative z-20 mb-4 text-h3-40 text-webconf-gray lg:mb-6">
            {{ transport.name }}
          </h3>

          <p class="relative z-20 text-body-18 text-white">
            <span
              v-for="(paragraph, index) in transport.description"
              :key="index"
              class="inline-block"
            >
              {{ paragraph }}
            </span>
          </p>
        </div>
      </div>

      <NuxtImg
        class="absolute right-[14.3906px] top-[-409.219px] -z-10 hidden lg:block"
        src="/images/sponsors/sponsors-line.svg"
        width="908"
        height="749"
      />
    </div>
  </section>
</template>

<style scoped>
.venue-bg {
  position: relative;
  background-image: url("/images/venue/venueBg.webp");
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
}

.venue-bg::after {
  content: "";
  position: absolute;
  background-image: url("/images/venue/venueBgMask.webp");
  display: block;
  width: 100%;
  height: 100%;
}

.sponsors-title-section {
  background-image: url("/images/sponsors/sponsorsBg-mobile.webp");
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: 100% 121px;
}

@media (min-width: 1024px) {
  .sponsors-title-section {
    background-image: url("/images/sponsors/sponsorsBg.webp");
    background-size: 100% 215px;
  }
}

.venue-content:nth-of-type(even) {
  border-left-color: rgba(230, 230, 230, 0.5);
}

.venue-content + .venue-content {
  border-top: 1px solid #e6e6e6;
}

.venue-map:nth-of-type(even) {
  border-left: 1px solid rgba(230, 230, 230, 0.5);
}

@media (min-width: 1024px) {
  .venue-map:nth-of-type(1),
  .venue-map:nth-of-type(5) {
    border-left: 1px solid #e6e6e6;
  }
}
</style>
