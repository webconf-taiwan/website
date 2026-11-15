<script setup>
import galleryConfig from '~/constants/data/history-particle.json'
import { historyRibbonShape, historyFlowerShape } from '~/components/History/particleShapes'

const { default: history } = await import('~/constants/data/history.json')
const gallery = { ...history.gallery, photos: history.gallery.photos.map(photo => ({ ...photo, src: assetUrl(photo.src) })) }
const title = '歷屆回顧'
const description = '回顧 WebConf Taiwan 2025、2024、2023 與 2013 的精彩篇章，觀看活動回顧影片與歷年活動花絮。'
const fullTitle = `${title} | ${useSeoData().site.name}`
useSeoMeta({ title, description, ogTitle: fullTitle, ogDescription: description, twitterTitle: fullTitle, twitterDescription: description })
useSchemaOrg([defineWebPage({ name: fullTitle, description })])
</script>

<template>
  <!-- 粒子一路演化（桌機有 WebGPU）：
         hero 自由場 → 歷屆卡片那區收攏到卡片後方（同場域頁，history-particle.json）
         → 回顧影片那區拉成兩條橫帶（取代側欄菌落）→ 照片牆收成花形（取代散回自由場）。
       後兩區的形狀見 History/particleShapes.js；力場同自由場、握力與閃動同側欄菌落，所以形狀在、粒子也一直在流動。
       主視覺與固定粒子場都在 CommonPlatePage（:rail="false"：影片區照設計稿置中，不放左欄卷號）。 -->
  <CommonPlatePage
    class="history-page"
    :plate="history.plate"
    title="HISTORY"
    subtitle="歷屆回顧"
    aria-label="歷屆回顧"
    :corner-left="history.corner_left"
    :corner-right="history.corner_right"
    rail-start="body"
    :rail="false"
    :gallery-config="galleryConfig"
    :gallery-fallback="false"
    :rail-shape="historyRibbonShape"
    :outro-shape="historyFlowerShape"
  >
    <template #between="{ desktopMode }">
      <HistoryChapters :data="history" :desktop-mode="desktopMode" />
    </template>

    <template #default="{ desktopMode }">
      <HistoryRecap :data="history.recap" :desktop-mode="desktopMode" />
    </template>

    <template #after="{ desktopMode }">
      <div class="history-gallery relative">
        <ClientOnly>
          <CommonPlateField v-if="desktopMode === 'fallback'" variant="gallery" media-only />
        </ClientOnly>
        <LazyHistoryPhotoWall :hydrate-on-visible="{ rootMargin: '400px' }" :data="gallery" heading-id="history-gallery-heading" />
      </div>
    </template>
  </CommonPlatePage>
</template>

<style scoped>
.history-gallery :deep(.photo-board) { min-height: 600px; }
/* Figma 的邊線是內描邊；保留 125px 寬度時不能再扣掉 CSS border 的 2px。 */
.history-gallery :deep(.photo-cta) { padding-left: 20px; width: 125px; border: 0; box-shadow: inset 0 0 0 1px theme('colors.accent.1'); font-size: 16px; line-height: 16px; font-weight: 500; white-space: nowrap; }
.history-gallery :deep(.photo-cta-label) { margin-right: -0.1em; }
.history-gallery :deep(.photo-heading h2) { letter-spacing: 0.02em; }
@media (max-width: 1023px) {
  .history-gallery :deep(.photo-heading > p) { line-height: 26px; }
  .history-gallery :deep(.mobile-photo) { min-height: 204px; }
  /* 手機稿以彩色照片橫向瀏覽；黑白切換保留在桌機照片牆。 */
  .history-gallery :deep(.mobile-photo img) { filter: none; }
}
@media (min-width: 1024px) {
  .history-gallery :deep(.photo-board) { height: 720px; }
  .history-gallery :deep(.photo-heading h2) { line-height: 77px; }
  .history-gallery :deep(.photo-heading > p) { line-height: 34px; }
}
</style>
