<script setup>
const { default: history } = await import('~/constants/data/history.json')
const gallery = { ...history.gallery, photos: history.gallery.photos.map(photo => ({ ...photo, src: assetUrl(photo.src) })) }
const title = '歷屆回顧'
const description = '回顧 WebConf Taiwan 2025、2024、2023 與 2013 的精彩篇章，觀看活動回顧影片與歷年活動花絮。'
const fullTitle = `${title} | ${useSeoData().site.name}`
useSeoMeta({ title, description, ogTitle: fullTitle, ogDescription: description, twitterTitle: fullTitle, twitterDescription: description })
useSchemaOrg([defineWebPage({ name: fullTitle, description })])
</script>

<template>
  <div class="history-page overflow-x-clip bg-bg-mid text-pre-800">
    <HistoryHero
      standalone :plate="history.plate" title="HISTORY" subtitle="歷屆回顧"
      :corner-left="history.corner_left" :corner-right="history.corner_right" aria-label="歷屆回顧"
    />
    <HistoryChapters :data="history" />
    <HistoryRecap :data="history.recap" />
    <div class="history-gallery relative">
      <ClientOnly><CommonPlateField class="hidden lg:block" variant="gallery" media-only /></ClientOnly>
      <LazyHistoryPhotoWall :hydrate-on-visible="{ rootMargin: '400px' }" :data="gallery" heading-id="history-gallery-heading" />
    </div>
  </div>
</template>

<style scoped>
.history-gallery :deep(.photo-board) { min-height: 600px; }
/* Figma 的邊線是內描邊；保留 125px 寬度時不能再扣掉 CSS border 的 2px。 */
.history-gallery :deep(.photo-cta) { padding-left: 20px; width: 125px; border: 0; box-shadow: inset 0 0 0 1px theme('colors.accent.1'); font-size: 16px; line-height: 16px; font-weight: 500; white-space: nowrap; }
.history-gallery :deep(.photo-cta-label) { margin-right: -0.1em; }
.history-gallery :deep(.photo-heading h2) { letter-spacing: 0.02em; }
@media (max-width: 1023px) {
  .history-page :deep([data-plate-mobile-copy]) { top: 224px; height: 134px; }
  .history-page :deep([data-plate-mobile-copy] > .text-meta) { line-height: 14px; }
  .history-page :deep([data-plate-hero-mobile] h1 > span:last-child) {
    font-size: 16px;
    line-height: 19px;
    letter-spacing: 0.02em;
  }
  .history-gallery :deep(.photo-heading > p) { line-height: 26px; }
  .history-gallery :deep(.mobile-photo) { min-height: 204px; }
  /* 手機稿以彩色照片橫向瀏覽；黑白切換保留在桌機照片牆。 */
  .history-gallery :deep(.mobile-photo img) { filter: none; }
}
@media (min-width: 1024px) {
  .history-page :deep([data-plate-hero-desktop] .text-meta) { line-height: 14px; }
  .history-page :deep([data-plate-hero-desktop] .text-meta > span:not(:last-child)) { margin-right: -0.2em; }
  .history-page :deep([data-plate-hero-desktop] .text-en-caption) { font-weight: 700; line-height: 20px; }
  .history-gallery :deep(.photo-board) { height: 720px; }
  .history-gallery :deep(.photo-heading h2) { line-height: 77px; }
  .history-gallery :deep(.photo-heading > p) { line-height: 34px; }
}
</style>
