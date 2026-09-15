<script setup>
import AgendaMobileField from '~/components/Common/AgendaMobileField.vue'

const agenda = await useAgendaData()
const { isDesktop, viewportReady } = useViewportMode()

definePageMeta({
  layoutProps: {
    class: 'agenda-layout',
    mobileLogos: {
      footer: '/figma/agenda/logo-footer.svg',
    },
  },
})

const fieldRef = ref(null)
// 桌機 hero 右下角要接在角落標籤 note 後面的繪圖後端（webgpu / webgl2 / canvas2d）
const backend = computed(() => fieldRef.value?.backend || '')

useSeoMeta({
  title: '議程 · WebConf',
  description: 'WebConf Taiwan 2026 兩日議程資訊。',
  ogTitle: '議程 · WebConf',
  ogDescription: 'WebConf Taiwan 2026 兩日議程資訊。',
  twitterTitle: '議程 · WebConf',
  twitterDescription: 'WebConf Taiwan 2026 兩日議程資訊。'
})

defineOgImage('Default', { title: '議程 · WebConf', description: 'WebConf Taiwan 2026 兩日議程資訊。' })

const plate = computed(() => agenda.plate || {})
const items = computed(() => agenda.items || [])
const heroInfo = computed(() => [
  plate.value.code,
  'WEBCONF TW',
  '2026',
].filter(Boolean))
</script>

<template>
  <div data-agenda-page class="relative overflow-x-clip bg-[#0a0a0c] text-pre-800">
    <ClientOnly>
      <template v-if="viewportReady">
        <CommonAgendaParticleField v-if="isDesktop" ref="fieldRef" fixed />
      </template>
    </ClientOnly>

    <section
      data-same-hero
      data-agenda-hero-mobile
      class="relative z-10 h-[550px] overflow-hidden px-5 pt-[52px] lg:hidden"
      aria-label="Agenda intro"
    >
      <ClientOnly>
        <AgendaMobileField v-if="viewportReady && !isDesktop" />
      </ClientOnly>
      <!-- The design-only backing is omitted, as on the shared temporary Hero. -->
      <div class="absolute left-1/2 top-[222.5px] flex h-[137px] w-[252px] -translate-x-1/2 flex-col items-center gap-y-4 drop-shadow-[0_0_12.5px_rgba(0,0,0,0.86)]">
        <p class="flex h-[14px] w-[250px] items-center gap-x-3 whitespace-nowrap font-mono text-fs-meta leading-[14px] text-pre-800/80">
          <span class="w-14 shrink-0">{{ plate.code }}</span>
          <span class="w-2 shrink-0 text-accent-1" aria-hidden="true">·</span>
          <span class="w-[94px] shrink-0">WEBCONF.TW</span>
          <span class="w-2 shrink-0 text-accent-1" aria-hidden="true">·</span>
          <span class="w-9 shrink-0">2026</span>
        </p>

        <div class="flex h-[107px] w-full flex-col items-center gap-y-2">
          <h1 class="w-full text-center font-en-serif text-fs-en-hero-m font-bold italic leading-[77px] text-pre-800">
            AGENDA
          </h1>
          <p class="font-zh-serif text-fs-zh-h5-m font-bold leading-[22px] text-pre-800">
            議程資訊
          </p>
        </div>
      </div>

      <div data-agenda-mobile-corner class="absolute bottom-5 left-5 flex h-[38px] flex-col gap-1">
        <p class="font-mono text-fs-meta leading-[14px] text-pre-800/80">{{ agenda.corner_left?.label }}</p>
        <p class="text-en-caption italic leading-5 text-pre-800">{{ agenda.corner_left?.note }}</p>
      </div>
    </section>

    <section
      data-agenda-hero-desktop
      data-same-hero
      class="relative z-10 hidden h-[720px] overflow-hidden border-b border-pre-800/35 bg-black/35 lg:flex"
      aria-label="Agenda hero"
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,10,12,0.08),rgba(10,10,12,0.34)_58%,rgba(10,10,12,0.62)_100%)]"
      />
      <div class="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center px-[60px] pt-[60px] text-center">
        <p class="flex items-center justify-center gap-x-4 font-mono text-[14px] leading-none tracking-[0.18em] text-pre-800/80">
          <template v-for="(part, i) in heroInfo" :key="part">
            <span>{{ part }}</span>
            <span v-if="i < heroInfo.length - 1" aria-hidden="true" class="size-1.5 rounded-full bg-pre-800/60" />
          </template>
        </p>

        <h1 class="mt-10 font-serif text-[180px] font-bold italic leading-[0.9] text-pre-800 xl:text-[220px]">
          AGENDA
        </h1>
        <p class="mt-8 font-zh text-[32px] font-bold leading-none text-pre-800/85">
          議程資訊
        </p>
      </div>

      <!-- 四角的「標本標籤」：跟首頁 Hero 同一套科學紀錄語彙，座標讀自 Figma
           （left/right 40px、bottom 30px、兩行間 gap 4px），不是沿用首頁的抓法。 -->
      <div class="pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto hidden w-full max-w-[1440px] justify-between px-10 pb-[30px] lg:flex">
        <div class="flex flex-col gap-1 text-left">
          <p class="font-mono text-fs-meta uppercase text-pre-800/80">
            {{ agenda.corner_left?.label }}
          </p>
          <p class="text-en-caption italic text-pre-800">
            {{ agenda.corner_left?.note }}
          </p>
        </div>
        <div class="flex flex-col gap-1 text-right">
          <p class="font-mono text-fs-meta uppercase text-pre-800/80">
            {{ agenda.corner_right?.label }}
          </p>
          <!-- note 後面接的是執行期才知道的繪圖後端，不是資料（同 Home/Hero.vue 慣例） -->
          <p class="text-en-caption italic text-pre-800">
            {{ agenda.corner_right?.note }}{{ backend ? ` · ${backend}` : '' }}
          </p>
        </div>
      </div>
    </section>

    <section class="relative z-10 bg-[#0a0a0c] pb-[120px] lg:bg-transparent lg:pb-0">
      <div aria-hidden="true" class="absolute inset-x-0 bottom-16 border-t border-pre-800/35 lg:hidden" />
      <div data-agenda-body class="mx-auto flex max-w-[1440px] flex-col lg:flex-row lg:justify-center">
        <aside class="relative mx-auto w-[calc(100%_-_40px)] pt-8 lg:sticky lg:top-[60px] lg:mx-0 lg:h-[calc(100dvh_-_60px)] lg:w-[484px] lg:max-w-none lg:shrink-0 lg:overflow-hidden lg:px-0 lg:pb-7 lg:pl-[60px] lg:pt-8">
          <div class="relative z-10 flex h-14 flex-col justify-start [text-shadow:0_0_12px_#0a0a0c] lg:h-full lg:min-h-0 lg:justify-between">
            <CommonPlate
              :data="plate"
              :divider="false"
              class="agenda-plate !flex-row !items-baseline !gap-x-4 !py-0 lg:!flex-col lg:!gap-x-0"
            />

            <div data-agenda-rail-note class="hidden shrink-0 flex-col gap-1 lg:flex">
              <p class="font-mono text-fs-meta leading-[14px] text-pre-800/80">{{ agenda.note_lines?.[0] }}</p>
              <p class="text-en-caption italic text-pre-800">{{ agenda.note_lines?.[1] }}</p>
            </div>
          </div>
        </aside>

        <div class="agenda-content flex-1 px-0 pb-0 lg:px-0 lg:py-[60px] lg:pr-[60px]">
          <div class="mx-auto flex w-[calc(100%_-_40px)] flex-col pt-8 lg:mx-0 lg:w-full lg:max-w-none lg:gap-y-12 lg:pt-0">
            <div class="mb-6 flex flex-col gap-y-2 lg:mb-0 lg:gap-y-4">
              <h2 class="agenda-heading font-serif text-[44px] font-bold italic leading-[1.08] text-pre-800 lg:text-fs-h1">
                <span class="lg:hidden">{{ agenda.mobile_heading }}</span>
                <span class="hidden lg:inline">
                  <template v-for="(line, i) in agenda.heading_lines" :key="line">
                    <br v-if="i > 0">{{ line }}
                  </template>
                </span>
              </h2>
              <p class="agenda-date font-serif text-fs-h5 font-bold italic leading-[1.3] text-pre-800/80 lg:text-fs-h4">
                {{ agenda.date }}
              </p>
            </div>

            <div class="flex flex-col lg:gap-y-4">
              <CommonAgendaItem
                v-for="item in items"
                :key="item.id"
                :data="item"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@media (min-width: 1024px) {
  .agenda-content {
    position: relative;
    isolation: isolate;
  }

  /* Feather only the backdrop, leaving text and pointer targets unaffected. */
  .agenda-content::before {
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
  .agenda-plate {
    height: 56px;
    align-items: flex-end !important;
    padding-top: 24px !important;
    box-shadow: inset 0 1px rgb(239 230 210 / 35%);
  }

  .agenda-plate :deep(.text-meta) { line-height: 14px; }

  .agenda-heading {
    @apply font-en-serif;
    font-size: 40px;
    line-height: 48px;
    letter-spacing: 0;
  }

  .agenda-date {
    @apply font-en-serif text-pre-800;
    font-size: 22px;
    line-height: 26px;
    letter-spacing: 0;
  }
}
</style>

<style>
/* The layout class is supplied by this route, keeping shared pages unchanged. */
@media (max-width: 1023px) {
  .agenda-layout footer { border: 0; box-shadow: inset 0 1px rgb(239 230 210 / 35%); }
  .agenda-layout [data-footer-wordmark] { align-items: flex-end; }
  .agenda-layout [data-footer-wordmark] img { width: 140.351px; height: 40px; }
  .agenda-layout [data-footer-wordmark] > p {
    padding-bottom: 8px;
    font-family: theme('fontFamily.mono');
    font-size: 12px;
    line-height: 14px;
    letter-spacing: 0;
  }
  .agenda-layout [data-footer-copy] { min-height: 156px; line-height: 24px; letter-spacing: 0; }
  .agenda-layout footer nav h2 {
    font-family: theme('fontFamily.en-serif');
    font-size: 18px;
    font-weight: 700;
    line-height: 22px;
    letter-spacing: 0;
  }
  .agenda-layout footer nav a {
    font-family: theme('fontFamily.zh-sans');
    font-size: 15px;
    line-height: 24px;
    letter-spacing: 0;
  }
  .agenda-layout [data-footer-group='Connect'] a {
    font-family: theme('fontFamily.en-serif');
    font-weight: 700;
  }
}
</style>
