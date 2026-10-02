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
const moreRef = ref(null)
useFadeIn(introRef, { step: 0.1 })
useFadeIn(moreRef)

usePageSeo('/agenda')

// 議程清單的結構化資料，讓 AI 摘要能回答「WebConf 有哪些議程、誰講什麼」。
// ⚠️ 用 ItemList 而不是 Event.subEvent：場次時間還沒排（agenda.json 沒有時段），
// subEvent 缺 startDate 會被 Google 判成無效的活動。排好之後可以改成 subEvent。
useSchemaOrg([
  {
    '@type': 'ItemList',
    name: 'WebConf Taiwan 2026 議程',
    itemListElement: (agenda.items || []).map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'CreativeWork',
        name: item.title,
        keywords: (item.skills || []).join(', '),
        author: { '@type': 'Person', name: item.speaker_name, jobTitle: item.speaker_title }
      }
    }))
  }
])

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
    <div class="mx-auto flex w-[calc(100%_-_40px)] flex-col pt-8 lg:mx-0 lg:w-full lg:max-w-none lg:pt-0">
      <div ref="introRef" class="mb-6 flex flex-col gap-y-2 lg:mb-12 lg:gap-y-4">
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

      <div class="flex flex-col">
        <CommonAgendaItem
          v-for="item in items"
          :key="item.id"
          :data="item"
        />
      </div>

      <div ref="moreRef" class="mt-[60px] lg:mb-[60px] lg:mt-[112px]">
        <p data-agenda-more data-fade="in" class="text-center text-zh-h5 text-pre-800">
          \ 更多精彩議程即將釋出 /
        </p>
      </div>
    </div>
  </CommonPlatePage>
</template>

<style>
/* The layout class is supplied by this route, keeping shared pages unchanged. */
.agenda-layout [data-plate-hero-mobile],
.agenda-layout [data-plate-hero-desktop] { background: transparent; }
.agenda-layout [data-plate-hero-mobile] h1,
.agenda-layout [data-plate-hero-desktop] [data-plate-title] { font-weight: 400; letter-spacing: 0.02em; }
.agenda-layout .text-en-caption { font-weight: 400; }
.agenda-layout [data-plate-body] .plate-page-content::before { content: none; }

@media (min-width: 1024px) {
  .agenda-layout [data-plate-body] { position: relative; }
  .agenda-layout [data-plate-body]::before {
    content: '';
    position: absolute;
    top: 60px;
    left: 60px;
    right: 60px;
    border-top: 1px solid rgb(239 230 210 / 35%);
  }
  .agenda-layout [data-plate-body] > aside,
  .agenda-layout [data-plate-body] > .plate-page-content { padding-top: 92px; }
}

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
