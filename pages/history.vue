<script setup lang="ts">
import { EXTERNAL_LINKS } from '~/constants/externalLinks'

useSeoMeta({
  title: '歷屆回顧',
})

const { gsap } = useGsap()

const WEBSITES = [
  {
    year: 2024,
    desc: '本屆科技年會將探討 UI/UX 設計的最新趨勢，包括使用者界面設計、使用者體驗優化、人機互動設計等議題，以深入探討如何打造出引人入勝的用戶體驗，提升產品的價值和競爭力。',
    link: 'https://2024.webconf.tw',
    img: '/images/history/webconf-2024.webp',
  },
  {
    year: 2023,
    desc: '重啟十年前的 WebConf 研討會中，帶領與會者穿越時間，探索網路的過去、現在和未來。過去十年間，網路發生了巨大的變化，我們將重新審視網路的起源以及它在這些年裡的演進。',
    link: 'https://2023.webconf.tw',
    img: '/images/history/webconf-2023.webp',
  },
  {
    year: 2013,
    desc: '聚焦於網站開發的全方位議題，從前端設計、介面體驗，到後端架構、資料安全與法律規範，全面探索網站建置與經營的多重面向。透過業界講師的實務分享，深入剖析技術與設計的整合應用，帶領與會者掌握 Web 開發的最新趨勢與實踐方法，打造兼具創意與效能的網頁體驗。',
    link: 'https://2013.webconf.tw',
    img: '/images/history/webconf-2013.webp',
  },
]

const hoveredImageIndex = ref(-1)

const historyBgRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (!historyBgRef.value)
    return

  gsap.fromTo(
    historyBgRef.value,
    { backgroundPosition: 'center 50%' },
    {
      backgroundPosition: 'center 90%',
      ease: 'none',
      scrollTrigger: {
        trigger: historyBgRef.value,
        start: 'top center',
        end: 'bottom top',
        scrub: 0.5,
      },
    },
  )
})
</script>

<template>
  <div>
    <section class="flex-1">
      <ShareBanner
        title="HiSTORY"
        sub-title="歷史回顧"
      />
    </section>

    <main class="lg:mb-40 lg:mt-[100px]">
      <ul class="flex w-full flex-col lg:gap-[100px] lg:px-[calc(100%/9)]">
        <li
          v-for="(item, index) in WEBSITES"
          :key="item.year"
          :class="{
            'lg:self-end': index % 2 === 1,
          }"
          class="hover:blue-shadow group relative border-b border-webconf-gray/50 bg-black text-white duration-300 lg:w-[calc(100dvw/2)]"
          @mousemove="hoveredImageIndex = index"
          @mouseleave="hoveredImageIndex = -1"
        >
          <div class="size-full">
            <NuxtImg
              :src="item.img"
              :alt="`${item.year} WebConf 網站封面`"
              class="size-full object-cover"
            />
            <div
              class="gap-5 px-5 pb-12 pt-5 duration-300 lg:flex group-hover:lg:bg-webconf-blue 2xl:gap-[68px] 2xl:px-6 2xl:pb-10 2xl:pt-6"
            >
              <h2 class="text-h4-60">
                {{ item.year }}
              </h2>

              <p class="mt-3 text-body-18 lg:mt-0">
                {{ item.desc }}
              </p>

              <NuxtLink
                :to="item.link"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-6 inline-block bg-webconf-blue px-6 py-2 lg:hidden"
              >
                前往頁面
              </NuxtLink>

              <a
                v-cursor="{
                  scale: 5,
                  duration: 0.5,
                  backgroundColor: 'rgba(0, 46, 255, 0.9)',
                  text: 'VIEW',
                }"
                :href="item.link"
                target="_blank"
                rel="noopener noreferrer"
                class="absolute left-0 top-0 mt-6 hidden size-full bg-webconf-blue px-6 py-2 lg:block lg:bg-transparent"
              >
              </a>
            </div>
          </div>
        </li>
      </ul>
    </main>

    <NuxtImg
      v-for="(item, index) in WEBSITES"
      :key="item.year"
      :src="item.img"
      :alt="`${item.year} WebConf 網站封面`"
      :class="{
        'opacity-60': hoveredImageIndex === index,
      }"
      class="pointer-events-none fixed left-0 top-0 z-[-1] hidden h-[100dvh] w-screen object-cover opacity-0 blur-[8px] duration-500 ease-in-out group-hover:opacity-60 lg:block"
    />

    <section
      ref="historyBgRef"
      class="z-10 flex h-[500px] flex-col items-center justify-center border-y border-webconf-gray bg-[url('/images/home/CTA/CTABg.webp')] bg-center bg-no-repeat"
    >
      <h3 class="text-h4-60 text-webconf-gray">
        歷屆活動花絮
      </h3>

      <ShareLinkButton
        :to="EXTERNAL_LINKS.WEBCONF_GALLERY_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-10"
      >
        前往回顧
      </ShareLinkButton>
    </section>
  </div>
</template>
