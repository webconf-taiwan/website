<script setup>
// 「標本頁」的頁面外殼：共用首頁風格的主視覺與原有左欄粒子場 + 兩欄 body。
// 議程頁與贊助頁共用；頁面只負責塞內容。
//
// Slots
//   hero-actions —— 主視覺副標下方（例如贊助頁的「成為夥伴 →」CTA）
//   between      —— 主視覺與兩欄 body 之間的區塊（贊助頁的照片牆）
//   default      —— 右側內容
//
const props = defineProps({
  // { code, number, label } —— 給左欄 CommonPlate 與 hero 的 code
  plate: { type: Object, default: () => ({}) },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  cornerLeft: { type: Object, default: () => ({}) },
  cornerRight: { type: Object, default: () => ({}) },
  // 左欄底部兩行註記（桌機才顯示）
  noteLines: { type: Array, default: () => [] },
  heroDensity: { type: Number, default: 0.8 },
  railStart: { type: String, default: 'hero' },
  ariaLabel: { type: String, default: '' },
  galleryConfig: { type: Object, default: null },
})

const { isDesktop, viewportReady } = useViewportMode()
const { webgpu } = useWebGpuSupport()
const railRef = ref(null)
const desktopReady = ref(false)
const desktopLook = shallowRef(null)
const desktopFailed = ref(false)
const reduced = ref(false)
const desktopFallback = computed(() => webgpu.value === false || desktopFailed.value || reduced.value)
const desktopMode = computed(() => desktopFallback.value ? 'fallback' : desktopReady.value ? 'gpu' : 'pending')
let motionMedia = null
let initTimeout = null

function motionChanged() {
  reduced.value = motionMedia.matches
}
function fieldReady() {
  desktopReady.value = true
}
watch(desktopReady, ready => {
  if (ready) clearTimeout(initTimeout)
})
watch(isDesktop, value => {
  if (value && !desktopLook.value) desktopLook.value = fieldLookFromLocation().look
}, { immediate: true })
watch([isDesktop, webgpu, reduced, desktopFailed], () => {
  clearTimeout(initTimeout)
  desktopReady.value = false
  if (isDesktop.value && !desktopFallback.value) {
    initTimeout = setTimeout(() => { desktopFailed.value = true }, 10000)
  }
}, { flush: 'post' })
onMounted(() => {
  motionMedia = matchMedia('(prefers-reduced-motion: reduce)')
  motionChanged()
  motionMedia.addEventListener('change', motionChanged)
  if (isDesktop.value && !desktopFallback.value && !desktopReady.value) {
    initTimeout = setTimeout(() => { desktopFailed.value = true }, 10000)
  }
})
onBeforeUnmount(() => {
  clearTimeout(initTimeout)
  motionMedia?.removeEventListener('change', motionChanged)
})

useFadeIn(railRef, { step: 0.08 })

const decoRef = ref(null)
const decoInnerRef = ref(null)
const decoParallaxRef = ref(null)
// 側欄 sticky 之後圖片自己不再經過畫面，視差改跟著整段 body 的捲動走；
// 範圍比首頁那一區長很多，位移量給大一點才看得出在動。
useDecoReveal({ root: decoRef, inner: decoInnerRef, parallaxEl: decoParallaxRef }, {
  parallax: 0.1,
  scrubTrigger: () => railRef.value?.parentElement,
})
</script>

<template>
  <div data-plate-page class="relative overflow-x-clip bg-bg-mid text-pre-800">
    <ClientOnly>
      <CommonAgendaParticleField
        v-if="viewportReady && isDesktop && desktopLook && webgpu === true && !desktopFallback"
        fixed :rail-start="railStart" :gallery-config="galleryConfig" :density="heroDensity"
        :field-look="desktopLook"
        @ready="fieldReady" @unavailable="desktopFailed = true"
      />
    </ClientOnly>
    <CommonPlateHero
      :plate="plate"
      :title="title"
      :subtitle="subtitle"
      :corner-left="cornerLeft"
      :corner-right="cornerRight"
      :density="heroDensity"
      :desktop-mode="desktopMode"
      :aria-label="ariaLabel"
    >
      <slot name="hero-actions" />
    </CommonPlateHero>

    <div v-if="$slots.between" class="relative">
      <ClientOnly>
        <CommonPlateField v-if="viewportReady && isDesktop && desktopFallback && galleryConfig" variant="gallery" media-only />
      </ClientOnly>
      <slot name="between" />
    </div>

    <section class="plate-page-body-section relative z-10 pb-[120px] lg:pb-0">
      <div data-plate-body class="mx-auto flex max-w-[1440px] flex-col lg:flex-row lg:justify-center">
        <aside ref="railRef" class="relative mx-auto w-[calc(100%_-_40px)] pt-8 lg:sticky lg:top-[60px] lg:mx-0 lg:h-[calc(100dvh_-_60px)] lg:w-[484px] lg:max-w-none lg:shrink-0 lg:overflow-hidden lg:px-0 lg:pb-7 lg:pl-[60px] lg:pt-8">
          <!-- 沒有 WebGPU（或減少動態、引擎失敗）時的側欄：跟首頁 PL.IV 同一張菌落圖、
               同樣的寬度與位置（見 Home/VenueFaq.vue 的 HomeSideDeco）。貼齊左緣，圖檔左邊本來就切掉半顆。
               進場與視差同首頁（useDecoReveal）；側欄是 sticky，視差的捲動範圍改看整段 body。 -->
          <ClientOnly>
            <div v-if="viewportReady && isDesktop && desktopFallback" ref="decoRef" aria-hidden="true" class="pointer-events-none absolute left-0 top-[56px] z-0 w-[420px]">
              <div ref="decoParallaxRef">
                <picture ref="decoInnerRef" class="block">
                  <source srcset="/home-deco/home-no-webgpu-deco-3.webp" type="image/webp">
                  <img
                    src="/home-deco/home-no-webgpu-deco-3.png" alt="" width="884" height="1340"
                    decoding="async" draggable="false" class="block h-auto w-full max-w-none select-none"
                  >
                </picture>
              </div>
            </div>
          </ClientOnly>
          <div class="relative z-10 flex h-14 flex-col justify-start [text-shadow:0_0_12px_#0a0a0c] lg:h-full lg:min-h-0 lg:justify-between">
            <CommonPlate
              data-fade="in"
              :data="plate"
              :divider="false"
              class="plate-page-plate !flex-row !items-baseline !gap-x-4 !py-0 lg:!flex-col lg:!gap-x-0"
            />

            <div data-plate-rail-note class="hidden shrink-0 flex-col gap-1 lg:flex">
              <p data-fade="in" class="font-mono text-meta leading-[14px] text-pre-800/80">{{ noteLines[0] }}</p>
              <p data-fade="in" class="text-en-caption italic text-pre-800">{{ noteLines[1] }}</p>
            </div>
          </div>
        </aside>

        <div class="plate-page-content flex-1 px-0 pb-0 lg:px-0 lg:py-[60px] lg:pr-[60px]">
          <slot />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@media (max-width: 1023px) {
  .plate-page-plate {
    height: 56px;
    align-items: flex-end !important;
    padding-top: 24px !important;
    box-shadow: inset 0 1px rgb(239 230 210 / 35%);
  }

  .plate-page-plate :deep(.text-meta) { line-height: 14px; }
}
</style>
