<script setup>
// 場域頁第一區「The place we gather.」：標題＋場館照片。
//
// 桌機有 WebGPU 時，照片後面那團粒子是 hero 那群粒子收攏過來的（同贊助頁照片牆的花形，
// AgendaParticleField 的 galleryMix）—— 所以這裡沿用照片牆的掛點：
//   [data-plate-gallery]  粒子場找這一區
//   .photo-board          花形的定位框
//   .photo-heading        花頂預設對齊標題（場域頁在 venue-particle.json 的 layout 另外指定）
// 沒有粒子時（窄視窗、沒有 WebGPU、減少動態）改放設計稿那張粒子截圖。
const props = defineProps({
  data: { type: Object, required: true },
  // CommonPlatePage 的 desktopMode：'pending' | 'gpu' | 'fallback'
  desktopMode: { type: String, default: 'pending' },
})

const { isDesktop, viewportReady } = useViewportMode()
const sectionRef = ref(null)
useFadeIn(sectionRef, { step: 0.12 })

// 桌機在粒子初始化期間不先放截圖（換頁時不會先閃一張再被粒子取代），確定走備援才放。
const showArt = computed(() => viewportReady.value && (!isDesktop.value || props.desktopMode === 'fallback'))

const artRef = ref(null)
const artInnerRef = ref(null)
const artParallaxRef = ref(null)
useDecoReveal({ root: artRef, inner: artInnerRef, parallaxEl: artParallaxRef }, { parallax: 0.04, start: 'top 75%' })
</script>

<template>
  <section ref="sectionRef" data-plate-gallery aria-labelledby="venue-gather-heading" class="venue-gather relative z-10 overflow-hidden">
    <div class="photo-board relative mx-auto max-w-[1440px]">
      <ClientOnly>
        <div v-if="showArt" ref="artRef" aria-hidden="true" class="gather-art pointer-events-none absolute">
          <div ref="artParallaxRef">
            <picture ref="artInnerRef" class="block">
              <source :srcset="assetUrl('/figma/venue/gather-particles.webp')" type="image/webp">
              <img
                :src="assetUrl('/figma/venue/gather-particles.png')" alt="" width="1171" height="556"
                decoding="async" loading="lazy" draggable="false" class="block h-auto w-full max-w-none select-none"
              >
            </picture>
          </div>
        </div>
      </ClientOnly>

      <div class="photo-heading relative z-10 flex flex-col gap-2 lg:absolute lg:inset-x-[60px] lg:top-[60px] lg:gap-4">
        <h2 id="venue-gather-heading" data-fade="in" class="text-en-h1 italic text-pre-800">{{ data.heading }}</h2>
        <p data-fade="in" class="text-zh-h4 text-pre-800">{{ data.subtitle }}</p>
      </div>

      <figure data-fade="in" class="gather-photo relative z-10 border border-pre-800/35 p-1 lg:absolute lg:p-2">
        <picture>
          <source :srcset="assetUrl(data.photo.src)" type="image/webp">
          <img
            :src="assetUrl(data.photo.fallback)" :alt="data.photo.alt"
            :width="data.photo.width" :height="data.photo.height"
            loading="lazy" decoding="async" class="block h-auto w-full"
          >
        </picture>
      </figure>
    </div>
  </section>
</template>

<style scoped>
/* 窄視窗：標題 → 照片 → 照片下緣接一段粒子（設計稿 360 寬：照片 320、粒子圖往左外推） */
.photo-board { padding: 32px 20px 160px; }
.photo-heading { pointer-events: none; }
.gather-photo { margin-top: 40px; }
.gather-art {
  left: -46%;
  bottom: 0;
  width: 180%;
  mix-blend-mode: lighten;
}

/* 桌機：Figma 1440 × 720 畫框。照片框 x 652–1340、y 282–680；粒子截圖 x 100、y 117、1171 寬。
   寬度一律換算成版心比例，窄一點的桌機一起縮。 */
@media (min-width: 1024px) {
  .photo-board { height: 720px; padding: 0; }
  .gather-photo {
    top: 282px;
    left: calc(652 / 1440 * 100%);
    width: calc(688 / 1440 * 100%);
    margin: 0;
  }
  .gather-art {
    top: 117px;
    bottom: auto;
    left: calc(100 / 1440 * 100%);
    width: calc(1171 / 1440 * 100%);
  }
}
</style>
