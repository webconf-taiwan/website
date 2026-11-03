<script setup>
defineProps({ data: { type: Object, required: true } })
const rootRef = ref(null)
const trackRef = ref(null)
const progress = ref(0)
const thumbSize = ref(60)
useFadeIn(rootRef)
let observer
let gesture
let moved = false

function imageSources(src) {
  return `${assetUrl(src.replace(/\.webp$/, '-800.webp'))} 800w, ${assetUrl(src)} 1200w`
}

function updateProgress() {
  const track = trackRef.value
  if (!track) return
  const max = track.scrollWidth - track.clientWidth
  progress.value = max > 0 ? track.scrollLeft / max * 100 : 0
  thumbSize.value = Math.min(100, track.clientWidth / track.scrollWidth * 100)
}
function seek(event) {
  const track = trackRef.value
  track.scrollLeft = (track.scrollWidth - track.clientWidth) * Number(event.target.value) / 100
}
function onKey(event) {
  if (event.target !== trackRef.value) return
  const track = trackRef.value
  const step = (track.firstElementChild?.offsetWidth || 600) + 40
  const targets = { ArrowRight: track.scrollLeft + step, ArrowLeft: track.scrollLeft - step, Home: 0, End: track.scrollWidth }
  if (!(event.key in targets)) return
  event.preventDefault()
  track.scrollTo({ left: targets[event.key], behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}
function startDrag(event) {
  if (event.button !== 0 || event.pointerType !== 'mouse' || trackRef.value.scrollWidth <= trackRef.value.clientWidth) return
  moved = false
  gesture = { x: event.clientX, left: trackRef.value.scrollLeft, id: event.pointerId }
}
function drag(event) {
  if (!gesture) return
  const delta = event.clientX - gesture.x
  if (!moved && Math.abs(delta) < 6) return
  moved = true
  trackRef.value.setPointerCapture(event.pointerId)
  trackRef.value.scrollLeft = gesture.left - delta
}
function endDrag(event) {
  gesture = null
  if (trackRef.value.hasPointerCapture(event.pointerId)) trackRef.value.releasePointerCapture(event.pointerId)
}
function onClick(event) {
  if (moved) { event.preventDefault(); moved = false }
}
onMounted(() => {
  observer = new ResizeObserver(updateProgress)
  observer.observe(trackRef.value)
  updateProgress()
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section ref="rootRef" class="history-chapters relative mx-auto max-w-[1440px]" aria-labelledby="history-chapters-heading">
    <HistoryRibbon class="chapter-ribbon" />
    <div class="chapter-header relative">
      <CommonPlate :data="data.plate" class="history-plate" />
      <div class="chapter-heading relative text-center">
        <h2 id="history-chapters-heading" data-fade="in" class="text-en-h1 italic">
          <span class="block">{{ data.heading_lines[0] }}</span>
          <span class="block">{{ data.heading_lines[1] }}</span>
        </h2>
        <p data-fade="in" class="mt-2 text-zh-h4 lg:mt-4">{{ data.subtitle }}</p>
      </div>
    </div>
    <div
      ref="trackRef" class="history-track relative" tabindex="0" role="region"
      aria-label="歷屆 WebConf；桌機可左右拖曳或使用方向鍵瀏覽" data-lenis-prevent-horizontal
      @scroll.passive="updateProgress" @keydown="onKey"
      @pointerdown="startDrag" @pointermove="drag" @pointerup="endDrag" @pointercancel="endDrag"
      @lostpointercapture="gesture = null" @click.capture="onClick" @dragstart.prevent
    >
      <article v-for="item in data.items" :key="item.year" class="history-card" :aria-labelledby="`history-${item.year}`">
        <p class="history-label flex items-center gap-2">
          <span class="text-en-caption italic">{{ item.volume }}</span>
          <span class="text-meta text-accent-1" aria-hidden="true">·</span>
          <span class="text-meta">{{ item.year }}</span>
        </p>
        <a :href="item.href" target="_blank" rel="noopener noreferrer" class="history-image block" :aria-label="`前往 WebConf ${item.year} 官方網站（另開分頁）`">
          <img :src="assetUrl(item.image)" :srcset="imageSources(item.image)"
            sizes="(min-width: 1024px) 582px, (min-width: 680px) 590px, (min-width: 480px) calc(80vw + 46px), calc(100vw - 50px)"
            :alt="`WebConf ${item.year} 活動主視覺`" width="600" height="337" loading="lazy" decoding="async" draggable="false">
        </a>
        <div class="history-copy">
          <h3 :id="`history-${item.year}`" class="history-year text-en-h2 italic">{{ item.year }}</h3>
          <p class="text-zh-body-md text-pre-800/[62%]">{{ item.description }}</p>
        </div>
      </article>
    </div>
    <div class="history-scrollbar relative mx-auto hidden lg:block" :style="{ '--thumb-size': `${thumbSize}%`, '--thumb-left': `${progress / 100 * (100 - thumbSize)}%` }">
      <span class="scrollbar-line" aria-hidden="true"><span /></span>
      <input type="range" min="0" max="100" step="0.1" :value="progress" aria-label="歷屆回顧橫向捲動位置" @input="seek">
    </div>
  </section>
</template>

<style scoped>
.history-chapters { padding: 0 20px 80px; }
/* Figma 的細線疊在框內，不額外占用 1px 的高度。 */
.history-plate { padding-bottom: 0; border-top: 0; box-shadow: inset 0 1px rgb(239 230 210 / 35%); }
.history-plate :deep(.text-meta) { line-height: 14px; }
.chapter-heading { margin-top: 32px; }
.chapter-heading h2 { letter-spacing: 0.02em; }
.history-track { display: flex; flex-direction: column; gap: 40px; margin-top: 40px; }
.history-card { min-width: 0; }
.history-label { height: 14px; padding: 0 4px; margin-bottom: 8px; }
.history-image { padding: 4px; border: 1px solid rgb(239 230 210 / 35%); background: rgb(10 10 12 / 70%); }
.history-image img { display: block; width: 100%; height: auto; aspect-ratio: 2880 / 1616; object-fit: cover; }
.history-copy { display: flex; flex-direction: column; gap: 8px; padding: 0 8px; margin-top: 8px; }
.history-year { font-size: 36px; line-height: 1.2; letter-spacing: 0.02em; }
.history-image:focus-visible, .history-track:focus-visible { outline: 2px solid theme('colors.accent.1'); outline-offset: 4px; }
.chapter-ribbon { bottom: -50px; left: 50%; transform: translateX(-50%); }
@media (max-width: 1023px) {
  .history-plate :deep(> div) { align-items: flex-end; }
  .history-plate :deep(.text-meta) { margin-right: -0.2em; }
  .chapter-heading > p { line-height: 26px; }
  .history-year { line-height: 43px; }
  .history-label .text-en-caption { font-weight: 700; }
  .chapter-ribbon { margin-left: -9.69px; }
}
@media (min-width: 480px) and (max-width: 1023px) {
  /* 480～680px 的左右留白逐漸增加，避免視窗變寬時卡片突然縮窄。 */
  .history-chapters { padding-inline: clamp(20px, calc(10vw - 28px), 40px); }
  .history-card { width: 100%; max-width: 600px; margin-inline: auto; }
}
@media (min-width: 1024px) {
  .history-chapters { padding: 60px; }
  .history-plate { position: absolute; inset: 0 0 auto; padding-block: 32px; }
  .chapter-heading { margin: 0; padding-top: 32px; }
  .chapter-heading h2 { line-height: 77px; }
  .chapter-heading > p { line-height: 34px; }
  /* 下一張卡片延伸到視窗邊緣，末張仍保留與標題一致的右側留白。 */
  .history-track { flex-direction: row; align-items: flex-start; overflow-x: auto; gap: 40px; margin-top: 48px; margin-right: -60px; padding-right: 60px; scrollbar-width: none; overscroll-behavior-x: contain; cursor: grab; }
  .history-track:active { cursor: grabbing; }
  .history-track::-webkit-scrollbar { display: none; }
  .history-card { flex: 0 0 600px; }
  .history-label { padding-inline: 8px; margin-bottom: 12px; }
  .history-label .text-en-caption { font-weight: 700; line-height: 20px; }
  .history-label .text-meta { line-height: 14px; }
  .history-image { padding: 8px; }
  .history-copy { flex-direction: row; align-items: flex-start; gap: 40px; margin-top: 12px; }
  .history-year { font-size: 48px; line-height: 58px; flex-shrink: 0; }
  .history-copy > p { padding-block: 8px; line-height: 26px; }
  .history-scrollbar { width: 400px; height: 24px; margin-top: 13px; margin-bottom: -11px; }
  .scrollbar-line { position: absolute; inset: 11px 0; background: rgb(239 230 210 / 20%); }
  .scrollbar-line > span { display: block; position: absolute; left: var(--thumb-left); width: var(--thumb-size); height: 2px; background: theme('colors.pre.800'); }
  .history-scrollbar input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: ew-resize; }
  .history-scrollbar:focus-within { outline: 2px solid theme('colors.accent.1'); outline-offset: 4px; }
  .chapter-ribbon { top: 360px; bottom: auto; left: 50%; transform: translateX(-50%); }
}
</style>
