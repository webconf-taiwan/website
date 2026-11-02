<script setup>
const [agenda, speakers] = await Promise.all([useAgendaData(), useSpeakersData()])

definePageMeta({
  layoutProps: {
    class: 'agenda-layout',
    mobileLogos: {
      footer: '/figma/agenda/logo-footer.svg',
    },
  },
})

usePageSeo('/agenda')

// 議程清單的結構化資料，讓 AI 摘要能回答「WebConf 有哪些議程、誰講什麼」。
// ⚠️ 用 ItemList 而不是 Event.subEvent：時段還在排（agenda.json 的 days 有些格子是 null、
// 有些時段沒有結束時間），subEvent 缺時間會被 Google 判成無效的活動。排定之後可以改成 subEvent。
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
        author: item.speakers.map(p => ({ '@type': 'Person', name: p.name, jobTitle: p.title || undefined }))
      }
    }))
  }
])

// 議程表：rooms 是欄、days[].slots 是列。
// slot.sessions 以場館 id 對到場次 id；"simulcast" = 同步聯播、null = 還沒排。
// { type: 'break' } 是午休那種橫跨三欄的一列。
const sessions = new Map((agenda.items || []).map(item => [item.id, item]))
const rooms = agenda.rooms || []

function cellOf (slot, room) {
  const value = slot.sessions?.[room.id]
  if (value === 'simulcast') return { room, type: 'simulcast' }
  const session = value && sessions.get(value)
  return session ? { room, type: 'session', session } : { room, type: 'tba' }
}
// "09:05" → "9:05"；沒有結束時間就只印開始
const timeText = slot => [slot.start, slot.end].filter(Boolean).map(t => t.replace(/^0(\d)/, '$1')).join(' - ')

// 三棟排的是同一場（開幕／閉幕致詞）：整列合併成一格、標題置中，不拆成三格
function mergedOf (slot) {
  const ids = rooms.map(room => slot.sessions?.[room.id])
  const same = ids.length > 1 && ids.every(id => id && id !== 'simulcast' && id === ids[0])
  return (same && sessions.get(ids[0])) || null
}

const days = (agenda.days || []).map(d => ({
  ...d,
  slots: (d.slots || []).map(slot => slot.type === 'break'
    ? slot
    : { ...slot, time: timeText(slot), cells: rooms.map(room => cellOf(slot, room)), merged: mergedOf(slot) }),
}))

const day = ref(days[0]?.id || '')
// 活動當天（台灣時間）直接開在那一天。放 onMounted：頁面是預先產生的，
// SSR 一律輸出第一天，換天要等到瀏覽器端才知道今天幾號，不然會 hydration 對不上。
onMounted(() => {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date()) // YYYY-MM-DD
  const current = days.find(d => d.date === today)
  if (current) day.value = current.id
})
// 點場次開講者抽屜（同講者頁，?speaker=<id>）：開那場的第一位講者，
// 對談的其他講者在抽屜裡 ← 1/2 → 切換。開幕／閉幕這種沒有講者的不能點。
const {
  current: currentSpeaker,
  linkTo: speakerLink,
  markOpened: openSpeaker,
  close: closeSpeaker,
  select: selectSpeaker,
} = useSpeakerDrawerRoute(speakers.items || [])
const speakerIds = new Set((speakers.items || []).map(p => p.id))
const speakerOf = session => session.speakers.find(p => speakerIds.has(p.id))?.id || ''

const selected = ref([])
// 篩選不藏場次：沒選中的變淡（同講者頁），表格不會因此缺格
const matches = session => !selected.value.length || session.skills?.some(skill => selected.value.includes(skill))
// 篩選一改就捲到當天第一個符合的場次。
// 窄視窗是單欄長表，捲到那一格（若是該時段第一格就捲到時段標題，連時間一起看到）；
// 桌機一列三格並排，捲到整列。上方要扣掉 header 與手機版黏住的切換列
// （面板開著時連面板一起扣，不然捲到的格子會被面板蓋住）。
const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches
// immediate：換天時用。內容整個換掉了，從舊位置慢慢捲過去沒意義，
// 而且進場動畫要等定位後才知道哪些格子在畫面內。
function scrollToFirstMatch ({ immediate = false } = {}) {
  if (!selected.value.length) return
  const active = days.find(d => d.id === day.value)
  const first = active?.slots.flatMap(slot => slot.cells || []).find(cell => cell.type === 'session' && matches(cell.session))
  const cellEl = first && scheduleRef.value?.querySelector(`[data-session-id="${first.session.id}"]`)
  if (!cellEl) return
  const section = cellEl.closest('section')
  const target = isDesktop() || cellEl === section.querySelector('[data-cell]') ? section : cellEl

  let offset = document.querySelector('header')?.getBoundingClientRect().height || 0
  if (!isDesktop() && controlsRef.value) {
    // 黏住之後的位置：sticky top + 切換列高度（面板浮在列下方，-mt-1）
    offset = parseFloat(getComputedStyle(controlsRef.value).top) + controlsRef.value.offsetHeight
    if (filterOpen.value && filterPanelRef.value) offset += filterPanelRef.value.offsetHeight - 4
  }
  offset += isDesktop() ? 32 : 16 // 留一點呼吸空間（桌機時段標籤壓在列頂線上方 10px）

  const lenis = useNuxtApp().$lenis
  const reduced = immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const distance = Math.abs(target.getBoundingClientRect().top - offset)
  const duration = Math.min(1.6, Math.max(0.5, distance / 1400))
  if (lenis) lenis.scrollTo(target, { offset: -offset, duration, immediate: reduced })
  else window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - offset, behavior: reduced ? 'instant' : 'smooth' })
}
watch(selected, () => scrollToFirstMatch())

const filterOpen = ref(false)
const filterButtonRef = ref(null)
const filterPanelRef = ref(null)
// 篩選面板浮在議程上：點面板以外的地方或按 Esc 就收起來
function closeFilterOutside (e) {
  if (e.type === 'keydown' ? e.key !== 'Escape' : filterPanelRef.value?.contains(e.target) || filterButtonRef.value?.contains(e.target)) return
  filterOpen.value = false
}
watch(filterOpen, (open) => {
  const method = open ? 'addEventListener' : 'removeEventListener'
  document[method]('pointerdown', closeFilterOutside)
  document[method]('keydown', closeFilterOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeFilterOutside)
  document.removeEventListener('keydown', closeFilterOutside)
})

const introRef = ref(null)
const controlsRef = ref(null)
const scheduleRef = ref(null)
useFadeIn(introRef, { step: 0.1 })
useFadeIn(controlsRef)
const { fadeInNow } = useFadeIn(scheduleRef, { step: 0.06 })
const { drawNow } = useDrawIn(scheduleRef)

// 換天：另一天原本是 display:none，補播一次進場並讓 ScrollTrigger 重新量測
watch(day, async () => {
  await nextTick()
  // 有篩選時先跳到這天第一個符合的場次，再播畫面內的進場
  scrollToFirstMatch({ immediate: true })
  // 只播畫面內的：手機版是單欄長表，捲到中段時若照 DOM 順序錯開，畫面上的格子要等好幾秒
  fadeInNow(scheduleRef.value, { step: 0.06, onlyInView: true })
  drawNow(scheduleRef.value, { onlyInView: true })
  useNuxtApp().$ScrollTrigger?.refresh()
})
</script>

<template>
  <!-- 主視覺、固定粒子場與兩欄外殼都在 CommonPlatePage；這頁只放切換、篩選與右側議程表 -->
  <CommonPlatePage
    :plate="agenda.plate"
    title="AGENDA"
    subtitle="議程資訊"
    aria-label="Agenda"
    :corner-left="agenda.corner_left"
    :corner-right="agenda.corner_right"
  >
    <template #rail>
      <div class="flex w-[300px] flex-col gap-4">
        <AgendaDayTabs v-model="day" data-fade="in" :days="days" />
        <CommonSkillFilter
          v-model="selected"
          data-fade="in"
          :label="agenda.filter_label"
          :all-label="agenda.filter_all"
          :options="agenda.filter_skills"
        />
      </div>
    </template>

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

      <!-- 窄視窗：天數切換＋篩選鈕，往下捲時黏在 header（52px）下方。
           篩選面板浮在議程上面、不推動內容；按鈕換成 ✕。
           底色鋪滿整個視窗寬（-mx-5 px-5），議程捲過去時才不會從兩側露出來。
           z-5：要蓋過議程內容（最高 z-1），但得低於 header 的手機選單（z-25），
           同層級時它在 DOM 後面會反過來壓在選單上。 -->
      <div ref="controlsRef" class="sticky top-[52px] z-5 -mx-5 bg-bg-mid/70 px-5 py-2 backdrop-blur-[8px] lg:hidden">
        <div data-fade="in" class="flex gap-2">
          <AgendaDayTabs v-model="day" :days="days" class="flex-1" />
          <button
            ref="filterButtonRef"
            type="button"
            class="relative flex size-[42px] shrink-0 items-center justify-center border text-pre-800 transition-colors duration-300"
            :class="filterOpen ? 'border-pre-800/80 bg-pre-800/20' : selected.length ? 'border-pre-800/80' : 'border-pre-800/35'"
            :aria-label="agenda.filter_label"
            :aria-expanded="filterOpen"
            aria-controls="agenda-mobile-filter"
            @click="filterOpen = !filterOpen"
          >
            <!-- 篩選圖示轉 90° 交叉淡入成 ✕（同標籤篩選的加減號） -->
            <AtomIcon name="sliders" class="absolute size-5 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none" :class="filterOpen ? 'rotate-90 opacity-0' : 'opacity-100'" />
            <AtomIcon name="x" class="absolute size-6 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none" :class="filterOpen ? 'opacity-100' : '-rotate-90 opacity-0'" />
          </button>
        </div>

        <div
          id="agenda-mobile-filter"
          ref="filterPanelRef"
          class="absolute inset-x-5 top-full -mt-1 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none"
          :class="filterOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'"
          :inert="!filterOpen"
        >
          <CommonSkillFilter
            v-model="selected"
            :collapsible="false"
            :label="agenda.filter_label"
            :all-label="agenda.filter_all"
            :options="agenda.filter_skills"
          />
        </div>
      </div>

      <!-- 兩天都輸出（另一天 display:none），爬蟲與 SSR 拿得到完整議程。
           框線都是獨立的 span（data-draw），進場時畫出來（useDrawIn）；
           x = 橫線由左往右、y = 直線由上往下。 -->
      <div ref="scheduleRef" class="mt-6 lg:mt-0">
        <div v-for="d in days" v-show="d.id === day" :key="d.id">
          <template v-if="d.slots.length">
            <!-- 表頭：場館（桌機才有；窄視窗每格自己標場館） -->
            <div class="relative hidden grid-cols-3 lg:grid">
              <span data-draw="x" aria-hidden="true" class="absolute inset-x-0 top-0 h-px bg-pre-800/35" />
              <div v-for="(room, r) in rooms" :key="room.id" class="relative">
                <p data-fade="in" class="py-6 text-center text-zh-body-md text-pre-800">{{ room.label }}</p>
                <span v-if="r < rooms.length - 1" data-draw="y" aria-hidden="true" class="absolute inset-y-0 right-0 border-r border-dashed border-pre-800/35" />
              </div>
              <span data-draw="x" aria-hidden="true" class="absolute inset-x-0 bottom-0 h-px bg-pre-800/35" />
            </div>

            <div class="relative">
              <template v-for="(slot, i) in d.slots" :key="i">
                <div v-if="slot.type === 'break'" class="relative">
                  <span data-draw="x" aria-hidden="true" class="absolute inset-x-0 top-0 h-px bg-pre-800/35 lg:hidden" />
                  <p data-fade="in" class="py-6 text-center text-zh-h5 text-pre-800">{{ slot.label }}</p>
                  <span data-draw="x" aria-hidden="true" class="absolute inset-x-0 bottom-0 hidden h-px bg-pre-800/35 lg:block" />
                </div>

                <section v-else class="relative">
                  <!-- 時段：桌機壓在上一列的底線上（底色蓋掉線），窄視窗自成一列、後面拉一條線 -->
                  <h3 class="flex items-center gap-2 lg:absolute lg:-top-[10px] lg:left-0 lg:z-1 lg:bg-bg-mid lg:px-2">
                    <span data-fade="in" class="whitespace-nowrap text-body-sm text-accent-1">{{ d.label }} · {{ slot.time }}</span>
                    <span data-draw="x" aria-hidden="true" class="h-px flex-1 bg-pre-800/35 lg:hidden" />
                  </h3>

                  <!-- 合併列：整列一格、標題置中，字樣同「同步聯播」那格；有講者的話一樣可以點開抽屜 -->
                  <div v-if="slot.merged" class="relative" data-cell :data-session-id="slot.merged.id">
                    <NuxtLink
                      v-if="speakerOf(slot.merged)"
                      :to="speakerLink(speakerOf(slot.merged))"
                      class="block focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-accent-1"
                      @click="openSpeaker"
                    >
                      <p data-fade="in" class="px-6 py-10 text-center text-zh-h5 text-pre-800 lg:py-16">{{ slot.merged.title }}</p>
                    </NuxtLink>
                    <p v-else data-fade="in" class="px-6 py-10 text-center text-zh-h5 text-pre-800 lg:py-16">{{ slot.merged.title }}</p>
                  </div>

                  <div v-else class="grid lg:grid-cols-3">
                    <div
                      v-for="(cell, c) in slot.cells"
                      :key="cell.room.id"
                      class="relative"
                      data-cell
                      :data-session-id="cell.type === 'session' ? cell.session.id : undefined"
                    >
                      <NuxtLink
                        v-if="cell.type === 'session' && speakerOf(cell.session)"
                        :to="speakerLink(speakerOf(cell.session))"
                        class="block h-full focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-accent-1"
                        @click="openSpeaker"
                      >
                        <AgendaSession
                          data-fade="in"
                          :data="cell.session"
                          :room="cell.room.label"
                          :dimmed="!matches(cell.session)"
                          :highlight="selected"
                        />
                      </NuxtLink>
                      <AgendaSession
                        v-else-if="cell.type === 'session'"
                        data-fade="in"
                        :data="cell.session"
                        :room="cell.room.label"
                        :dimmed="!matches(cell.session)"
                        :highlight="selected"
                        class="agenda-session--static"
                      />
                      <p
                        v-else
                        data-fade="in"
                        class="flex h-full items-center justify-center px-6 py-6 text-center text-zh-h5 lg:py-10"
                        :class="cell.type === 'tba' ? 'text-pre-800/[62%]' : 'text-pre-800'"
                      >
                        <span class="sr-only">{{ cell.room.label }}：</span>{{ cell.type === 'simulcast' ? agenda.simulcast_label : agenda.tba_label }}
                      </p>

                      <!-- 線放在內容後面，hover 的漸層才不會蓋過去。
                           窄視窗：同一時段的場次之間一條虛線；桌機：欄與欄之間一條直虛線 -->
                      <span v-if="c > 0" data-draw="x" aria-hidden="true" class="absolute inset-x-0 top-0 border-t border-dashed border-pre-800/35 lg:hidden" />
                      <span v-if="c < slot.cells.length - 1" data-draw="y" aria-hidden="true" class="absolute inset-y-0 right-0 hidden border-r border-dashed border-pre-800/35 lg:block" />
                    </div>
                  </div>

                  <span data-draw="x" aria-hidden="true" class="absolute inset-x-0 bottom-0 hidden h-px bg-pre-800/35 lg:block" />
                </section>
              </template>

              <span data-draw="x" aria-hidden="true" class="absolute inset-x-0 bottom-0 h-px bg-pre-800/35 lg:hidden" />
            </div>
          </template>

          <p v-else data-fade="in" class="py-[84px] text-center text-zh-h5 text-pre-800 lg:py-[112px]">
            {{ agenda.coming_soon_label }}
          </p>
        </div>
      </div>

      <!-- 同講者頁：?speaker 只有瀏覽器端看得到（頁面是預先產生的），抽屜只在 client 畫 -->
      <ClientOnly>
        <SpeakersDrawer :items="speakers.items" :current="currentSpeaker" @close="closeSpeaker" @select="selectSpeaker" />
      </ClientOnly>
    </div>
  </CommonPlatePage>
</template>

<style>
/* The layout class is supplied by this route, keeping shared pages unchanged. */
.agenda-layout [data-plate-hero-mobile],
.agenda-layout [data-plate-hero-desktop] { background: transparent; }
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
