<script setup>
// 僅供議程與贊助頁使用。失敗狀態留在本區域，不改首頁共用的 webgpu ref。
const props = defineProps({
  variant: { type: String, default: 'hero' },
  density: { type: Number, default: 0.8 },
  galleryConfig: { type: Object, default: null },
  mediaOnly: { type: Boolean, default: false },
  posterOnly: { type: Boolean, default: false },
})
const emit = defineEmits(['backend'])
const { webgpu } = useWebGpuSupport()
const rootRef = ref(null)
const heroField = ref(null)
const failed = ref(false)
const reduced = ref(false)
const activated = ref(props.variant === 'hero')
const gpuReady = ref(false)
let media = null
let observer = null
let timeout = null
// Hero 的減少動態行為由首頁元件處理，避免內頁另選一張不同取景的 poster。
const fallback = computed(() => props.mediaOnly || webgpu.value === false || failed.value || (reduced.value && props.variant !== 'hero'))
const mode = computed(() => {
  if (!activated.value) return 'pending'
  if (!fallback.value && webgpu.value === true) return gpuReady.value ? 'webgpu' : 'initializing'
  if (!fallback.value) return 'pending'
  return props.variant === 'hero' ? (props.posterOnly ? 'poster' : 'video') : 'static'
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
    <HomeMobileField
      v-if="activated && webgpu === true && !fallback && variant === 'hero'"
      ref="heroField"
    />
    <CommonPlateParticleCanvas
      v-if="activated && webgpu === true && !fallback && variant !== 'hero'"
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
.plate-field--gallery { mix-blend-mode: lighten; }
.plate-field--rail {
  mask-image: linear-gradient(to bottom, transparent 100px, #000 180px, #000 calc(100% - 90px), transparent calc(100% - 48px));
}
.plate-field-flower {
  width: min(100%, 1080px);
  max-width: none;
  height: 100%;
  object-fit: contain;
  left: 40%;
  top: 0;
  opacity: 0.65;
}
</style>
