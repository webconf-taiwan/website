<script setup>
import staff from '~/constants/data/staff.json'

definePageMeta({ layout: false })
usePageSeo('/staff')

// 進場同講者頁：標題區錯開 0.1 秒，名單錯開 0.04 秒（每張卡片裡照片、名字、社群各算一個）
const introRef = ref(null)
const listRef = ref(null)
useFadeIn(introRef, { step: 0.1 })
useFadeIn(listRef, { step: 0.04 })
</script>

<template>
  <div class="staff-layout">
    <NuxtLayout name="default">
      <CommonPlatePage
        class="staff-page"
        :plate="staff.plate"
        title="STAFF"
        subtitle="主辦團隊"
        aria-label="主辦團隊"
        :corner-left="staff.corner_left"
        :corner-right="staff.corner_right"
        :hero-density="0.6"
      >
        <section class="staff-content" aria-labelledby="staff-heading">
          <div ref="introRef" class="staff-heading flex flex-col gap-2 lg:gap-4">
            <h2 id="staff-heading" data-fade="in" class="text-en-h1 italic">
              <span v-for="line in staff.heading_lines" :key="line" class="staff-heading-line">{{ line }}{{ ' ' }}</span>
            </h2>
            <p data-fade="in" class="text-zh-h4">{{ staff.subtitle }}</p>
          </div>

          <ul ref="listRef" class="staff-grid" aria-label="主辦團隊成員">
            <li v-for="member in staff.items" :key="member.id">
              <StaffProfile :data="member" />
            </li>
          </ul>
        </section>

        <div class="staff-mobile-deco" aria-hidden="true">
          <img src="/figma/staff/colonies.png" alt="" width="510" height="773" loading="lazy" decoding="async">
        </div>
      </CommonPlatePage>
    </NuxtLayout>
  </div>
</template>

<style scoped>
.staff-content { position: relative; z-index: 1; margin: 32px 20px 0; }
.staff-heading { margin-bottom: 24px; }
.staff-heading h2 { letter-spacing: 0.02em; }
.staff-grid { display: grid; grid-template-columns: minmax(0, 1fr); }
.staff-grid > li { min-width: 0; border-top: 1px dashed rgb(239 230 210 / 20%); }
.staff-grid > li:last-child { border-bottom: 1px dashed rgb(239 230 210 / 20%); }
.staff-mobile-deco { position: relative; height: 120px; overflow: hidden; pointer-events: none; }
.staff-mobile-deco img {
  position: absolute;
  top: 8px;
  right: -4px;
  width: 325px;
  max-width: none;
  height: auto;
  transform: translateY(-37.12%);
  opacity: 0.9;
}
.staff-page :deep(.plate-page-body-section) { padding-bottom: 0; }
.staff-page :deep(.plate-page-content) { min-width: 0; }

@media (max-width: 1023px) {
  .staff-heading > p { line-height: 26px; }
  .staff-grid > li { border-bottom: 1px dashed rgb(239 230 210 / 20%); }

  /* Footer 沿用共用內容，只在本頁還原 Figma 手機版的比例。 */
  .staff-layout :deep([data-footer-wordmark]) { align-items: flex-end; }
  .staff-layout :deep([data-footer-wordmark] img) { width: 140.35px; height: 40px; }
  .staff-layout :deep([data-footer-wordmark] p) {
    padding: 8px 0;
    line-height: 16px;
    letter-spacing: 0.04em;
    text-transform: none;
  }
  .staff-layout :deep([data-footer-copy]) { min-height: 156px; }
  .staff-layout :deep([data-footer-group] h2) { font-weight: 700; }
  .staff-layout :deep([data-footer-group="Connect"]) { grid-column: 1 / -1; }
  .staff-layout :deep([data-footer-group="Connect"] a) { font-family: "Inria Serif", "Noto Serif TC", serif; }
}

/* 中間尺寸維持橫向名片，留出足夠的姓名與社群圖示寬度。 */
@media (min-width: 768px) and (max-width: 1023px) {
  .staff-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 32px; }
  .staff-grid > li:nth-last-child(2) { border-bottom: 1px dashed rgb(239 230 210 / 20%); }
}

@media (min-width: 1024px) {
  .staff-page :deep([data-plate-body]) { position: relative; }
  .staff-page :deep([data-plate-body])::before {
    content: '';
    position: absolute;
    z-index: 2;
    top: 60px;
    left: 60px;
    right: 60px;
    border-top: 1px solid rgb(239 230 210 / 35%);
    pointer-events: none;
  }
  /* 同講者頁：名單區不鋪底色，後面的粒子場透出來 */
  .staff-content { margin: 0; padding-top: 32px; }
  .staff-heading { margin-bottom: 48px; }
  .staff-heading-line { display: block; }
  .staff-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 48px 24px; }
  .staff-grid > li, .staff-grid > li:last-child { border: 0; }
  .staff-mobile-deco { display: none; }
  .staff-page :deep([data-plate-body] > aside) { padding-top: 92px; }
  .staff-page :deep([data-plate-body] > aside > div[aria-hidden="true"]) { top: 60px; width: 445px; }

  /* 桌機頁尾依設計稿排成品牌與三組導覽，較窄桌機保留彈性欄寬。 */
  .staff-layout :deep(footer) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    column-gap: 48px;
    padding-top: 47px;
  }
  .staff-layout :deep(footer nav) { column-gap: clamp(24px, 3.8889vw, 56px); }
  .staff-layout :deep([data-footer-wordmark]) { align-items: flex-end; }
  .staff-layout :deep([data-footer-wordmark] img) { width: 140.35px; height: 40px; }
  .staff-layout :deep([data-footer-wordmark] p) {
    padding: 8px 0;
    line-height: 16px;
    letter-spacing: 0.04em;
    text-transform: none;
  }
  .staff-layout :deep([data-footer-copy]) { row-gap: 26px; line-height: 26px; }
  .staff-layout :deep([data-footer-group] h2) { margin-bottom: 24px; font-weight: 700; line-height: 26px; }
  .staff-layout :deep([data-footer-group="Programme"] h2) { font-weight: 400; }
  .staff-layout :deep([data-footer-group] a) { line-height: 26px; }
  .staff-layout :deep([data-footer-group="Connect"] a) { font-family: "Inria Serif", "Noto Serif TC", serif; }
}

@media (min-width: 1280px) {
  .staff-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .staff-layout :deep(header > div > nav) { gap: 8px; }
  .staff-layout :deep(header [data-nav-item]) { font-weight: 500; }
  .staff-layout :deep(header [data-logo] img) { width: 112.593px; height: 32px; }
  .staff-layout :deep(header [data-logo] > span) { text-transform: none; }
}

@media (min-width: 1400px) {
  .staff-page :deep([data-plate-body] > aside) { width: 484px; }
  .staff-heading h2 { font-size: 64px; line-height: 77px; }
  .staff-heading > p { line-height: 34px; }
  .staff-layout :deep(footer) {
    grid-template-columns: 384px minmax(0, 1fr);
    column-gap: 136px;
    padding-left: max(40px, calc((100vw - 1440px) / 2 + 40px));
    padding-right: max(80px, calc((100vw - 1440px) / 2 + 120px));
  }
}
</style>
