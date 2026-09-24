<script setup>
const agenda = await useAgendaData()

definePageMeta({
  layoutProps: {
    class: 'agenda-layout',
    mobileLogos: {
      footer: '/figma/agenda/logo-footer.svg',
    },
  },
})

const introRef = ref(null)
useFadeIn(introRef, { step: 0.1 })

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
</script>

<template>
  <!-- 主視覺、固定粒子場與兩欄外殼都在 CommonPlatePage；這頁只放右側內容 -->
  <CommonPlatePage
    :plate="plate"
    title="AGENDA"
    subtitle="議程資訊"
    aria-label="Agenda"
    :corner-left="agenda.corner_left"
    :corner-right="agenda.corner_right"
    :note-lines="agenda.note_lines"
  >
    <div class="mx-auto flex w-[calc(100%_-_40px)] flex-col pt-8 lg:mx-0 lg:w-full lg:max-w-none lg:gap-y-12 lg:pt-0">
      <div ref="introRef" class="mb-6 flex flex-col gap-y-2 lg:mb-0 lg:gap-y-4">
        <h2 data-fade="in" class="agenda-heading font-en-serif text-fs-en-h1-m font-normal italic text-pre-800 lg:text-fs-en-h1">
          <span class="lg:hidden">{{ agenda.mobile_heading }}</span>
          <span class="hidden lg:inline">
            <template v-for="(line, i) in agenda.heading_lines" :key="line">
              <br v-if="i > 0">{{ line }}
            </template>
          </span>
        </h2>
        <p data-fade="in" class="agenda-date font-en-serif text-fs-en-h4-m font-normal italic text-pre-800 lg:text-fs-en-h4">
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

      <p class="mt-[60px] text-center text-zh-h5 text-pre-800 lg:mt-[80px]">
        \ 更多精彩議程即將釋出 /
      </p>
    </div>
  </CommonPlatePage>
</template>

<style>
/* The layout class is supplied by this route, keeping shared pages unchanged. */
.agenda-layout [data-plate-hero-mobile],
.agenda-layout [data-plate-hero-desktop] { background: transparent; }
.agenda-layout [data-plate-hero-mobile] h1,
.agenda-layout [data-plate-hero-desktop] h1 { font-weight: 400; letter-spacing: 0.02em; }
.agenda-layout .text-en-caption { font-weight: 400; }
.agenda-layout [data-plate-body] .plate-page-content { background-color: #0a0a0c; }
.agenda-layout [data-plate-body] .plate-page-content::before { content: none; }

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
