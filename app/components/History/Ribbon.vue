<script setup>
defineProps({ variant: { type: String, default: 'chapters' } })
</script>

<template>
  <div aria-hidden="true" class="history-ribbon pointer-events-none absolute overflow-hidden" :class="`history-ribbon--${variant}`"
    :style="{ '--ribbon-image': `url(${assetUrl('/figma/history/ribbon.webp')})`, '--ribbon-mobile-image': `url(${assetUrl('/figma/history/ribbon-mobile.webp')})`, '--ribbon-mask': `url(${assetUrl('/figma/history/ribbon-mask.svg')})`, '--video-mask': `url(${assetUrl('/figma/history/video-mask.svg')})`, '--mobile-mask': `url(${assetUrl('/figma/history/mobile-mask.svg')})` }">
    <div class="ribbon-texture" />
  </div>
</template>

<style scoped>
.history-ribbon { width: max(412.63px, 100vw); height: 98px; container-type: inline-size; }
.ribbon-texture { position: absolute; left: -1.26cqw; top: -44.55px; width: 103.8cqw; height: 266.46px; background: var(--ribbon-image) 0 16.52px / 100% 85.28% no-repeat; mask: var(--mobile-mask) -2.56cqw 44.41px / 108.13cqw 98.14px no-repeat; }
@media (max-width: 599px) {
  .ribbon-texture { background-image: var(--ribbon-mobile-image); }
}
@media (min-width: 1024px) {
  .history-ribbon { width: max(1440px, 100vw); height: 342px; }
  .ribbon-texture { left: -1.461cqw; top: -155.47px; width: 95.667cqw; height: 929.88px; background-position: 0 57.65px; mask: var(--ribbon-mask) -2.358cqw 154.98px / 99.653cqw 342.49px no-repeat; }
  .history-ribbon--video .ribbon-texture { left: -1.26cqw; width: 103.8cqw; mask: var(--video-mask) -2.559cqw 154.98px / 108.125cqw 342.49px no-repeat; }
}
</style>
