<script setup>
import galleryConfig from '~/constants/data/venue-particle.json'

const venue = await useVenueData()
const seo = useSeoData()

usePageSeo('/venue')

// 場地的結構化資料：地址與活動共用 seo.json 的 event.venue，跟首頁 Event 的 location 同一份。
// 給 @id 並設成這一頁的 mainEntity，搜尋引擎才知道這頁「講的就是這個地點」。
const { venue: place } = seo.event
const siteUrl = useSiteConfig().url.replace(/\/+$/, '')
const placeId = `${siteUrl}/venue#place`
useSchemaOrg([
  // ⚠️ 要再帶一次 description：這裡的 defineWebPage 會跟 usePageSeo 那筆合併，沒給的話會被全站預設描述蓋掉
  defineWebPage({ description: seo.pages['/venue'].description, mainEntity: { '@id': placeId } }),
  {
    '@type': 'Place',
    '@id': placeId,
    url: `${siteUrl}/venue`,
    name: place.name,
    image: `${siteUrl}${venue.gather.photo.fallback}`,
    hasMap: venue.map_link.href,
    address: {
      '@type': 'PostalAddress',
      streetAddress: place.street_address,
      addressLocality: place.locality,
      addressRegion: place.region,
      postalCode: place.postal_code,
      addressCountry: place.country,
    },
  },
])
</script>

<template>
  <!-- 粒子一路演化（桌機有 WebGPU）：
         hero 自由場 → 第一區收攏到照片後方（同贊助頁照片牆，形狀每次隨機，venue-particle.json）
         → 第二區跑到左側欄變菌落（同講者／議程頁）→ 平面圖那區散回自由場（同首頁票券區）。
       主視覺、固定粒子場與兩欄外殼都在 CommonPlatePage。 -->
  <CommonPlatePage
    class="venue-page"
    :plate="venue.plate"
    title="VENUE"
    subtitle="場域介紹"
    aria-label="Venue"
    :corner-left="venue.corner_left"
    :corner-right="venue.corner_right"
    rail-start="body"
    :gallery-config="galleryConfig"
    :gallery-fallback="false"
  >
    <template #hero-actions>
      <AtomButton
        data-fade="in"
        class="venue-map-link mt-6 h-10 lg:mt-8"
        :href="venue.map_link.href"
        :target="venue.map_link.target"
        :rel="linkRel(venue.map_link.target)"
        :text="venue.map_link.label"
        size="sm"
        rounded="none"
        icon="arrow-right-thin"
        icon-position="end"
      />
    </template>

    <template #between="{ desktopMode }">
      <VenueGather :data="venue.gather" :desktop-mode="desktopMode" />
    </template>

    <VenueAccess :data="venue.access" />

    <template #after="{ desktopMode }">
      <VenueFloorMap :data="venue.floor" :desktop-mode="desktopMode" />
    </template>
  </CommonPlatePage>
</template>

<style scoped>
.venue-page :deep(.text-en-caption) { font-weight: 400; }
.venue-map-link { padding-left: 20px; }

/* 手機 hero：標題區是固定高度（PlateHero 的 137px），多了一顆按鈕要往上讓位 */
@media (max-width: 1023px) {
  .venue-page :deep([data-plate-hero-mobile] > div.absolute.items-center) { top: 190px; }
}

/* 同講者／議程頁：頂端那條線（距上一區 60px）與內容起點（線下 40px）；第二區比較短，底部不另外收線（下一區自己有頂線） */
@media (min-width: 1024px) {
  .venue-page :deep([data-plate-body]) { position: relative; }
  .venue-page :deep([data-plate-body])::before {
    content: '';
    position: absolute;
    top: 60px;
    left: 60px;
    right: 60px;
    border-top: 1px solid rgb(239 230 210 / 35%);
    pointer-events: none;
  }
  .venue-page :deep([data-plate-body] > aside),
  .venue-page :deep([data-plate-body] > .plate-page-content) { padding-top: 100px; }
  /* 交通方式到下一區（平面圖）固定 92px（設計稿）。左欄預設是一個視窗高（sticky 用），
     這區內容比視窗短，高度會被左欄撐開、視窗越高空越多 —— 改成跟著右欄內容走。 */
  .venue-page :deep([data-plate-body] > aside) { height: auto; }
  .venue-page :deep([data-plate-body] > .plate-page-content) { padding-bottom: 92px; }
}
</style>
