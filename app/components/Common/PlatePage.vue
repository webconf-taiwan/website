<script setup>
// 「標本頁」的頁面外殼：固定滿版粒子場 + 主視覺 + 兩欄 body（sticky 左欄標籤、右側內容）。
// 議程頁與贊助頁共用；頁面只負責塞內容。
//
// Slots
//   hero-actions —— 主視覺副標下方（例如贊助頁的「成為夥伴 →」CTA）
//   between      —— 主視覺與兩欄 body 之間的區塊（贊助頁的照片牆）
//   default      —— 右側內容
//
// ⚠️ 粒子場靠這幾個掛鉤運作，改結構時要一起改 AgendaParticleField.vue：
//    [data-plate-page]（可見性）、[data-plate-hero-desktop]（捲動進度，在 PlateHero 裡）、
//    [data-plate-body] > aside（左欄聚落跟隨 sticky 側欄釋放）。
const props = defineProps({
  // { code, number, label } —— 給左欄 CommonPlate 與 hero 的 code
  plate: { type: Object, default: () => ({}) },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  cornerLeft: { type: Object, default: () => ({}) },
  cornerRight: { type: Object, default: () => ({}) },
  // 左欄底部兩行註記（桌機才顯示）
  noteLines: { type: Array, default: () => [] },
  // 粒子取樣來源圖（桌機與手機共用）
  source: { type: String, default: '/figma/agenda/mobile-particle-source.webp' },
  ariaLabel: { type: String, default: '' },
  // A between slot can delay the rail until its content reaches the hero boundary.
  railStart: { type: String, default: 'hero' },
})

const { isDesktop, viewportReady } = useViewportMode()
const fieldRef = ref(null)
const railRef = ref(null)

useFadeIn(railRef, { step: 0.08 })

// 桌機 hero 右下角要接在角落標籤 note 後面的繪圖後端（webgpu / webgl2 / canvas2d）
const backend = computed(() => fieldRef.value?.backend || '')
</script>

<template>
  <div data-plate-page class="relative overflow-x-clip bg-[#0a0a0c] text-pre-800">
    <ClientOnly>
      <template v-if="viewportReady">
        <CommonAgendaParticleField v-if="isDesktop" ref="fieldRef" fixed :source="source" :rail-start="railStart" />
      </template>
    </ClientOnly>

    <CommonPlateHero
      :plate="plate"
      :title="title"
      :subtitle="subtitle"
      :corner-left="cornerLeft"
      :corner-right="cornerRight"
      :backend="backend"
      :source="source"
      :aria-label="ariaLabel"
    >
      <slot name="hero-actions" />
    </CommonPlateHero>

    <slot name="between" />

    <section class="relative z-10 bg-[#0a0a0c] pb-[120px] lg:bg-transparent lg:pb-0">
      <div aria-hidden="true" class="absolute inset-x-0 bottom-16 border-t border-pre-800/35 lg:hidden" />
      <div data-plate-body class="mx-auto flex max-w-[1440px] flex-col lg:flex-row lg:justify-center">
        <aside ref="railRef" class="relative mx-auto w-[calc(100%_-_40px)] pt-8 lg:sticky lg:top-[60px] lg:mx-0 lg:h-[calc(100dvh_-_60px)] lg:w-[484px] lg:max-w-none lg:shrink-0 lg:overflow-hidden lg:px-0 lg:pb-7 lg:pl-[60px] lg:pt-8">
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
@media (min-width: 1024px) {
  .plate-page-content {
    position: relative;
    isolation: isolate;
  }

  /* Feather only the backdrop, leaving text and pointer targets unaffected. */
  .plate-page-content::before {
    content: '';
    position: absolute;
    inset: 0 0 0 -120px;
    z-index: -1;
    pointer-events: none;
    background: linear-gradient(
      to right,
      rgb(10 10 12 / 0),
      rgb(10 10 12 / 7%) 32px,
      rgb(10 10 12 / 25%) 64px,
      rgb(10 10 12 / 45%) 96px,
      rgb(10 10 12 / 63%) 128px,
      rgb(10 10 12 / 70%) 160px
    );
  }
}

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
