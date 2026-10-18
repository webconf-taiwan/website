<script setup>
const speakers = await useSpeakersData()

usePageSeo('/speakers')

useSchemaOrg([
  {
    '@type': 'ItemList',
    name: 'WebConf Taiwan 2026 講者陣容',
    itemListElement: (speakers.items || []).map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Person',
        name: item.name,
        jobTitle: item.role,
        worksFor: item.org ? { '@type': 'Organization', name: item.org } : undefined,
        image: item.portrait,
      }
    }))
  }
])

// SPEC.01 照完整名單編號，篩選時每位講者的編號不變
const items = computed(() => (speakers.items || []).map((item, i) => ({
  item,
  spec: `SPEC.${String(i + 1).padStart(2, '0')}`,
})))

const selected = ref([])
const visible = computed(() => selected.value.length
  ? items.value.filter(({ item }) => item.skills?.some(skill => selected.value.includes(skill)))
  : items.value)

// 窄視窗才分頁（設計稿：一頁 8 位）。用 CSS 藏掉別頁的，不從 DOM 拿掉 ——
// SSR 時還不知道視窗寬度，整份名單都要輸出，桌機與爬蟲才拿得到全部。
const perPage = speakers.mobile_per_page || 8
const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(visible.value.length / perPage)))
const onPage = i => Math.floor(i / perPage) + 1 === page.value

const introRef = ref(null)
const listRef = ref(null)
useFadeIn(introRef, { step: 0.1 })
const { fadeInNow } = useFadeIn(listRef, { step: 0.04 })

// 篩選後名單高度變了：補播一次進場（還沒捲到、仍是 opacity 0 的卡片才不會卡住），
// 並讓 ScrollTrigger 重新量測（側欄粒子場與後面的進場都靠它）
async function replayList () {
  await nextTick()
  fadeInNow(listRef.value, { step: 0.04 })
  useNuxtApp().$ScrollTrigger?.refresh()
}
watch(selected, () => {
  page.value = 1
  replayList()
})

// 換頁：捲回名單頂端（Lenis 接管了捲動，不能直接 scrollIntoView，見 ChapterNav）
const lenis = useLenis()
watch(page, () => {
  const el = listRef.value
  if (el) {
    if (lenis) lenis.scrollTo(el, { offset: -96 })
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' })
  }
  replayList()
})
</script>

<template>
  <!-- 主視覺、固定粒子場與兩欄外殼都在 CommonPlatePage；這頁只放篩選與右側名單 -->
  <CommonPlatePage
    class="speakers-page"
    :plate="speakers.plate"
    title="SPEAKERS"
    subtitle="講者陣容"
    aria-label="Speakers"
    :corner-left="speakers.corner_left"
    :corner-right="speakers.corner_right"
  >
    <template #rail>
      <SpeakersSkillFilter
        v-model="selected"
        :label="speakers.filter_label"
        :all-label="speakers.filter_all"
        :options="speakers.filter_skills"
      />
    </template>

    <div class="mx-5 flex flex-col pt-8 lg:mx-0 lg:pt-0">
      <div ref="introRef" class="flex flex-col gap-2 lg:gap-4">
        <h2 data-fade="in" class="text-en-h1 italic text-pre-800">
          <template v-for="(line, i) in speakers.heading_lines" :key="line">
            <br v-if="i > 0" class="hidden lg:inline">{{ i > 0 ? ' ' : '' }}{{ line }}
          </template>
        </h2>
        <p data-fade="in" class="text-zh-h4 text-pre-800">{{ speakers.subheading }}</p>
      </div>

      <SpeakersSkillFilter
        v-model="selected"
        class="mt-6 lg:hidden"
        :label="speakers.filter_label"
        :all-label="speakers.filter_all"
        :options="speakers.filter_skills"
        :default-open="false"
      />

      <ul ref="listRef" class="mt-6 flex flex-col lg:mt-12 lg:grid lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
        <li
          v-for="({ item, spec }, i) in visible"
          :key="item.id"
          class="speaker-row"
          :class="{ 'max-lg:hidden': !onPage(i) }"
        >
          <SpeakersProfile :data="item" :spec="spec" />
        </li>
      </ul>

      <div class="mt-10 lg:hidden">
        <CommonControlPagination v-model:page="page" :total="totalPages" />
      </div>
    </div>
  </CommonPlatePage>
</template>

<style scoped>
/* 窄視窗的名單是橫列：每列底下一條虛線，當頁第一列頂端再補一條 */
@media (max-width: 1023px) {
  .speaker-row { border-bottom: 1px dashed rgb(239 230 210 / 20%); }
  .speaker-row:not(.max-lg\:hidden):first-child,
  .speaker-row.max-lg\:hidden + .speaker-row:not(.max-lg\:hidden) { border-top: 1px dashed rgb(239 230 210 / 20%); }
}

/* 同議程／贊助頁：右欄頂端那條線與 92px 的起點、底部收尾線 */
@media (min-width: 1024px) {
  .speakers-page :deep([data-plate-body]) { position: relative; }
  .speakers-page :deep([data-plate-body])::before,
  .speakers-page :deep([data-plate-body])::after {
    content: '';
    position: absolute;
    border-top: 1px solid rgb(239 230 210 / 35%);
    pointer-events: none;
  }
  .speakers-page :deep([data-plate-body])::before {
    top: 60px;
    left: 60px;
    right: 60px;
  }
  .speakers-page :deep([data-plate-body])::after {
    bottom: 0;
    left: 0;
    right: 0;
  }
  .speakers-page :deep([data-plate-body] > aside),
  .speakers-page :deep([data-plate-body] > .plate-page-content) { padding-top: 92px; }
}
</style>
