<script setup>
const agenda = await useAgendaData()
const { isDesktop, viewportReady } = useViewportMode()

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
        <CommonAgendaParticleField v-if="isDesktop" fixed />
        <HomeMobileField v-if="!isDesktop" />
      </template>
    </ClientOnly>

    <section
      data-same-hero
      class="relative z-10 h-[550px] overflow-hidden bg-black/30 px-5 pt-[52px] lg:hidden"
      aria-label="Agenda intro"
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute left-[25px] top-[162px] h-[185px] w-[294px] opacity-55 [background:radial-gradient(ellipse_at_30%_50%,rgba(30,162,211,0.18),transparent_58%),linear-gradient(112deg,transparent_12%,rgba(239,230,210,0.18)_12.5%,transparent_13.2%,transparent_30%,rgba(239,230,210,0.12)_30.5%,transparent_31.2%,transparent_55%,rgba(30,162,211,0.14)_55.4%,transparent_56.2%)] [clip-path:polygon(2%_22%,78%_0,100%_72%,29%_100%)]"
      />

      <div class="absolute left-1/2 top-[244px] flex h-[137px] w-[252px] -translate-x-1/2 flex-col items-center gap-y-4">
        <p class="flex h-[14px] w-[250px] items-center justify-center gap-x-2 overflow-hidden whitespace-nowrap font-mono text-[10px] leading-none tracking-[0.16em] text-pre-800/80">
          <template v-for="(part, i) in heroInfo" :key="part">
            <span>{{ part }}</span>
            <span v-if="i < heroInfo.length - 1" aria-hidden="true" class="size-1 rounded-full bg-pre-800/60" />
          </template>
        </p>

        <div class="flex h-[107px] w-full flex-col items-center justify-center">
          <h1 class="font-serif text-[64px] font-bold italic leading-none text-pre-800">
            AGENDA
          </h1>
          <p class="mt-3 font-zh text-[22px] font-bold leading-none text-pre-800/85">
            議程資訊
          </p>
        </div>
      </div>

      <p class="absolute left-5 top-[492px] h-[38px] w-[142px] font-mono text-[12px] leading-[1.55] text-pre-800/80">
        <template v-for="(line, i) in agenda.note_lines" :key="line">
          <br v-if="i > 0">{{ line }}
        </template>
      </p>
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
    </section>

    <section class="relative z-10 bg-[#0a0a0c] lg:bg-transparent">
      <div data-agenda-body class="mx-auto flex max-w-[1440px] flex-col lg:flex-row lg:justify-center">
        <aside class="relative mx-auto w-[calc(100%_-_40px)] max-w-[320px] pt-6 lg:sticky lg:top-[60px] lg:mx-0 lg:h-[calc(100vh_-_60px)] lg:w-[484px] lg:max-w-none lg:shrink-0 lg:overflow-hidden lg:px-0 lg:pb-[60px] lg:pl-[60px] lg:pt-[60px]">
          <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-y-0 left-0 hidden w-full bg-gradient-to-r from-[#0a0a0c]/20 via-[#0a0a0c]/55 to-[#0a0a0c] lg:block"
          />
          <div class="relative z-10 flex h-14 flex-col justify-start lg:h-[664px] lg:justify-between">
            <CommonPlate
              :data="plate"
              :divider="false"
              class="!flex-row !items-baseline !gap-x-4 !py-0 lg:!flex-col lg:!gap-x-0"
            />

            <p class="hidden font-mono text-fs-body-sm leading-[1.5] text-pre-800/80 lg:block">
              <template v-for="(line, i) in agenda.note_lines" :key="line">
                <br v-if="i > 0">{{ line }}
              </template>
            </p>
          </div>
        </aside>

        <div class="flex-1 bg-[rgba(10,10,12,0.7)] px-0 pb-0 lg:px-0 lg:py-[60px] lg:pr-[60px]">
          <div class="mx-auto flex w-[calc(100%_-_40px)] max-w-[320px] flex-col pt-10 lg:mx-0 lg:w-full lg:max-w-none lg:gap-y-12 lg:pt-0">
            <div class="mb-8 flex flex-col gap-y-4 lg:mb-0">
              <h2 class="font-serif text-[44px] font-bold italic leading-[1.08] text-pre-800 lg:text-fs-h1">
                <template v-for="(line, i) in agenda.heading_lines" :key="line">
                  <br v-if="i > 0">{{ line }}
                </template>
              </h2>
              <p class="font-serif text-fs-h5 font-bold italic leading-[1.3] text-pre-800/80 lg:text-fs-h4">
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
