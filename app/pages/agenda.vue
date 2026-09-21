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
        <h2 data-fade="in" class="agenda-heading font-serif text-[44px] font-bold italic leading-[1.08] text-pre-800 lg:text-h1">
          <span class="lg:hidden">{{ agenda.mobile_heading }}</span>
          <span class="hidden lg:inline">
            <template v-for="(line, i) in agenda.heading_lines" :key="line">
              <br v-if="i > 0">{{ line }}
            </template>
          </span>
        </h2>
        <p data-fade="in" class="agenda-date font-serif text-h5 font-bold italic leading-[1.3] text-pre-800/80 lg:text-h4">
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
  </CommonPlatePage>
</template>

<style scoped>
@media (max-width: 1023px) {
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
