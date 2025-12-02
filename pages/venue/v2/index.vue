<script setup lang="ts">
import { EXTERNAL_LINKS } from '~/constants/externalLinks'

useSeoMeta({
  title: '場域介紹',
})

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
      '周邊備有兩個付費停車場，步行 3 分鐘即可抵達,車位數量有限,建議搭乘大眾運輸前往。',
      '• Times 南港車站前停車場',
      '• CITY PARKING 城市車旅停車場 全聯南港旗艦站',
    ],
  },
]

const MAP_INFO = [
  {
    id: 1,
    name: 'HQ｜大會報到處',
    display: 'HQ｜大會報到處',
    image: '/images/venue/HQ.svg',
    width: 918,
    height: 470,
    link: '/images/venue/HQ.png',
    isAvailable: true,
  },
  {
    id: 2,
    name: 'M 棟｜議程廳',
    display: 'M 棟｜議程廳',
    image: '/images/venue/M.svg',
    width: 509,
    height: 455,
    link: '/images/venue/M.png',
    isAvailable: true,
  },
  {
    id: 3,
    name: 'I 棟｜休息區',
    display: 'I 棟｜休息區',
    image: '/images/venue/I.svg',
    width: 1079,
    height: 219,
    link: '/images/venue/I.png',
    isAvailable: true,
  },
  {
    id: 4,
    name: 'F 棟｜議程廳',
    display: 'F 棟｜議程廳',
    image: '/images/venue/F.svg',
    width: 1077,
    height: 258,
    link: '/images/venue/F.png',
    isAvailable: true,
  },
  {
    id: 5,
    name: 'B 棟｜交流攤位',
    display: 'B 棟｜交流攤位',
    image: '/images/venue/B.svg',
    width: 858,
    height: 425,
    link: '/images/venue/B.png',
    isAvailable: true,
  },
  {
    id: 6,
    name: 'A1 棟｜工作坊',
    display: 'A1 棟｜工作坊（2F）',
    image: '/images/venue/A1.svg',
    width: 560,
    height: 320,
    link: '/images/venue/A1.png',
    isAvailable: true,
  },
  {
    id: 7,
    name: 'A2 棟｜議程廳',
    display: 'A2 棟｜議程廳',
    image: '/images/venue/A2.svg',
    width: 1049,
    height: 308,
    link: '/images/venue/A2.png',
    isAvailable: true,
  },
  {
    id: 8,
    name: 'G 棟｜未開放',
    display: 'G 棟｜未開放',
    width: 0,
    height: 0,
    image: '',
    link: '',
    isAvailable: false,
  },
]

const selectedVenueNum = ref(1)

const selectedVenue = computed(() =>
  MAP_INFO.find(venue => venue.id === selectedVenueNum.value),
)

function setVenue(num: number, isAvailable: boolean) {
  if (isAvailable && num !== selectedVenueNum.value) {
    selectedVenueNum.value = num
  }
}

const venueBgRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (!venueBgRef.value)
    return

  gsap.fromTo(
    venueBgRef.value,
    { backgroundPosition: 'center 0%' },
    {
      backgroundPosition: 'center 100%',
      ease: 'none',
      scrollTrigger: {
        trigger: venueBgRef.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8,
      },
    },
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
    <div
      ref="venueBgRef"
      class="venue-bg relative h-[400px] text-center lg:h-[500px]"
    >
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
        v-arrow="{ speed1: '10s', color: '#E6E6E6' }"
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
          :to="selectedVenue?.link || '#'"
          rel="noopener noreferrer"
          target="_blank"
          class="relative col-span-4 grid h-[234px] place-content-center pb-4 pt-[50px] lg:h-[550px] lg:border-l lg:py-0"
        >
          <p
            class="absolute inset-x-5 top-4 z-10 flex items-center justify-between lg:left-10 lg:top-8"
          >
            <span class="text-h5-20 text-webconf-gray lg:text-h4-24">{{
              selectedVenue?.display
            }}</span>
            <span class="visible text-btn-14 text-webconf-blue lg:invisible">點圖放大</span>
          </p>
          <div class="relative grid place-content-center">
            <NuxtImg
              v-for="venue in MAP_INFO.filter((v) => v.isAvailable)"
              :key="venue.id"
              :src="venue.image"
              :alt="`${venue.display}平面圖`"
              :width="venue.width"
              :height="venue.height"
              class="h-[143px] w-[264px] transition-opacity duration-500 lg:size-auto"
              loading="eager"
              :class="
                selectedVenueNum === venue.id
                  ? 'opacity-100'
                  : 'opacity-0 absolute inset-0 pointer-events-none invisible'
              "
            />
          </div>
        </NuxtLink>
        <button
          v-for="map in MAP_INFO"
          :key="map.id"
          type="button"
          class="venue-map relative col-span-2 border-t border-l-webconf-frame px-6 py-5 before:absolute before:inset-0 before:z-10 before:block before:size-0 before:bg-webconf-blue before:transition-all before:duration-300 before:content-[''] lg:col-span-1 lg:border-l-[0.5px] lg:py-8 lg:pl-10 lg:pr-6 lg:before:size-7"
          :class="[
            map.isAvailable ? 'hover:before:size-full' : '',
            selectedVenueNum === map.id && map.isAvailable
              ? 'before:size-full lg:before:size-full'
              : '',
          ]"
          :disabled="!map.isAvailable"
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
        class="sponsors-title-section sticky top-[47px] z-30 border-b py-3 pl-5 xs:top-[55px] sm:top-[57px] lg:top-[55px] lg:z-10 lg:border-b-0 lg:pl-12 lg:pr-[152px] lg:pt-10"
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
}

.venue-bg::after {
  content: "";
  position: absolute;
  background-image: url("/images/venue/venueBgMask.webp");
  background-size: cover;
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

  .venue-bg {
    background-size: cover;
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
