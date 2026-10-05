<script setup>
// 議程、贊助與 404／建置中共用；失敗狀態留在本區域。
const props = defineProps({
  variant: { type: String, default: 'hero' },
  density: { type: Number, default: 0.8 },
  galleryConfig: { type: Object, default: null },
  mediaOnly: { type: Boolean, default: false },
  posterOnly: { type: Boolean, default: false },
  plateStyle: { type: Boolean, default: false },
})
const emit = defineEmits(['backend'])
const { webgpu } = useWebGpuSupport()
const rootRef = ref(null)
const heroField = ref(null)
const failed = ref(false)
const reduced = ref(false)
const motionReady = ref(false)
const activated = ref(props.variant === 'hero')
const gpuReady = ref(false)
let media = null
let observer = null
let timeout = null
// 減少動態直接顯示共用 poster，避免初始化或換頁時先跑一段動畫。
const fallback = computed(() => props.mediaOnly || webgpu.value === false || failed.value || reduced.value)
const mode = computed(() => {
  if (!activated.value) return 'pending'
  if (!fallback.value && webgpu.value === true) return gpuReady.value ? 'webgpu' : 'initializing'
  if (!fallback.value) return 'pending'
  return props.variant === 'hero' ? (props.posterOnly || reduced.value ? 'poster' : 'video') : 'static'
})
function unavailable() {
  failed.value = true
  gpuReady.value = false
  clearTimeout(timeout)
}
function ready(backend) {
  if (backend !== 'webgpu') { unavailable(); return }
  gpuReady.value = backend === 'webgpu'
  clearTimeout(timeout)
  emit('backend', backend)
}
// 首頁原本已 expose backend；內頁讀這個介面，不修改首頁元件。
watch(() => heroField.value?.backend, backend => {
  if (backend) ready(backend)
}, { flush: 'post' })
function motionChanged() {
  reduced.value = media.matches
  if (props.variant !== 'hero') gpuReady.value = false
}
watch(mode, value => {
  if (value === 'video' || value === 'poster' || value === 'static') emit('backend', value)
})
watch([activated, webgpu, reduced], () => {
  clearTimeout(timeout)
  if (activated.value && !fallback.value && !gpuReady.value) timeout = setTimeout(unavailable, 10000)
}, { flush: 'post' })
onMounted(() => {
  media = matchMedia('(prefers-reduced-motion: reduce)')
  reduced.value = media.matches
  motionReady.value = true
  media.addEventListener('change', motionChanged)
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) activated.value = true
  }, { rootMargin: '160px' })
  observer.observe(rootRef.value)
  if (activated.value && !fallback.value) timeout = setTimeout(unavailable, 10000)
})
onBeforeUnmount(() => {
  clearTimeout(timeout)
  observer?.disconnect()
  media?.removeEventListener('change', motionChanged)
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="plate-field pointer-events-none absolute inset-0 z-0 overflow-hidden"
    :class="'plate-field--' + variant" :data-plate-field="variant" :data-backend="mode">
    <CommonPlateMobileField
      v-if="motionReady && activated && webgpu === true && !fallback && variant === 'hero'"
      ref="heroField"
      :plate-style="plateStyle"
    />
    <CommonPlateParticleCanvas
      v-if="motionReady && activated && webgpu === true && !fallback && variant !== 'hero'"
      :variant="variant" :density="density" :gallery-config="galleryConfig"
      @ready="ready" @unavailable="unavailable"
    />
    <!-- 使用首頁影片元件；與粒子及載入圖片共用內頁取景高度。 -->
    <HomeVideoField v-if="mode === 'video'" :intro="variant === 'hero'" />
    <img v-if="variant === 'hero' && ['pending', 'initializing', 'poster'].includes(mode)"
      :src="assetUrl('/videos/hero-field-biolum-poster.jpg')" alt="" class="plate-field-hero-poster absolute inset-0 w-full object-cover">
    <img v-if="variant === 'gallery' && mode === 'static'"
      :src="assetUrl('/figma/sponsors/mobile-orbit.png')" alt="" class="plate-field-flower absolute">
    <CommonPlateParticleCanvas v-if="variant === 'rail' && mode === 'static'" variant="rail" poster @ready="ready" />
    <CommonHeroShade v-if="variant === 'hero'" class="z-1" />
  </div>
</template>

<style scoped>
/* 只改內頁取景；首頁元件仍以原面積預算決定粒子數與裝置檔位。 */
.plate-field--hero :deep(canvas) {
  position: absolute;
  height: var(--plate-hero-field-height, 100vh);
}
.plate-field--hero :deep(video),
.plate-field-hero-poster { height: var(--plate-hero-field-height, 100vh); }
.plate-field--gallery {
  mix-blend-mode: lighten;
  /* 只避開左上標題，照片後方的下半部花瓣保留完整。 */
  mask:
    linear-gradient(to right, transparent 48%, #000 54%) 0 0 / 100% 284px no-repeat,
    linear-gradient(#000, #000) 0 284px / 100% calc(100% - 284px) no-repeat;
}
.plate-field--rail {
  mask-image: linear-gradient(to bottom, transparent 100px, #000 180px, #000 calc(100% - 90px), transparent calc(100% - 48px));
}
.plate-field-flower {
  /* Figma 1440px 畫板：原圖 x=348、y=0、1418×1001。 */
  width: calc(min(100vw, 1440px) * 0.9847222222);
  max-width: none;
  height: auto;
  left: calc(max(0px, 50vw - 720px) + min(100vw, 1440px) * 0.2416666667);
  top: 0;
  opacity: 0.72;
}
</style>
