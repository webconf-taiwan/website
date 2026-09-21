<script setup>
// 「標本頁」共用的主視覺：手機版與桌機版兩個 550px 區段、粒子場、置中標題、四角標籤。
// 從 agenda.vue 抽出來，文字全部走 props；議程頁與贊助頁共用同一份版型與動態。
//
// ⚠️ 兩個 section 上的 data-plate-hero-* 與 data-same-hero 不能拿掉：
//    CommonAgendaParticleField 用 [data-plate-hero-desktop] 算捲動進度與可見性。
const props = defineProps({
  // { code, number, label } —— hero 只用 code（左上角的 PL. II 那串）
  plate: { type: Object, default: () => ({}) },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  // { label, note }
  cornerLeft: { type: Object, default: () => ({}) },
  cornerRight: { type: Object, default: () => ({}) },
  // 執行期才知道的繪圖後端（webgpu / webgl2 / canvas2d），接在右下角 note 後面
  backend: { type: String, default: '' },
  // 手機版粒子場的取樣來源圖
  source: { type: String, default: '/figma/agenda/mobile-particle-source.png' },
  ariaLabel: { type: String, default: '' },
})

const { isDesktop, viewportReady } = useViewportMode()
const mobileHeroRef = ref(null)
const desktopHeroRef = ref(null)

useFadeIn(mobileHeroRef, { step: 0.1 })
useFadeIn(desktopHeroRef, { step: 0.1 })

const label = computed(() => props.ariaLabel || props.title)
</script>

<template>
  <section
    ref="mobileHeroRef"
    data-same-hero
    data-plate-hero-mobile
    class="relative z-10 h-[550px] overflow-hidden px-5 pt-[52px] lg:hidden"
    :aria-label="`${label} intro`"
  >
    <ClientOnly>
      <CommonAgendaMobileField v-if="viewportReady && !isDesktop" :source="source" />
    </ClientOnly>
    <!-- The design-only backing is omitted, as on the shared temporary Hero. -->
    <div class="absolute left-1/2 top-[222.5px] flex h-[137px] w-[252px] -translate-x-1/2 flex-col items-center gap-y-4 drop-shadow-[0_0_12.5px_rgba(0,0,0,0.86)]">
      <p data-fade="in" class="flex h-[14px] w-[250px] items-center gap-x-3 whitespace-nowrap font-mono text-fs-meta leading-[14px] text-pre-800/80">
        <span class="w-14 shrink-0">{{ plate.code }}</span>
        <span class="w-2 shrink-0 text-accent-1" aria-hidden="true">·</span>
        <span class="w-[94px] shrink-0">WEBCONF.TW</span>
        <span class="w-2 shrink-0 text-accent-1" aria-hidden="true">·</span>
        <span class="w-9 shrink-0">2026</span>
      </p>

      <div class="flex h-[107px] w-full flex-col items-center gap-y-2">
        <h1 data-fade="in" class="w-full text-center font-en-serif text-fs-en-hero-m font-bold italic leading-[77px] text-pre-800">
          {{ title }}
        </h1>
        <p data-fade="in" class="font-zh-serif text-fs-zh-h5-m font-bold leading-[22px] text-pre-800">
          {{ subtitle }}
        </p>
        <slot />
      </div>
    </div>

    <div data-plate-mobile-corner class="absolute bottom-5 left-5 flex h-[38px] flex-col gap-1">
      <p data-fade="in" class="font-mono text-fs-meta leading-[14px] text-pre-800/80">{{ cornerLeft?.label }}</p>
      <p data-fade="in" class="text-en-caption italic leading-5 text-pre-800">{{ cornerLeft?.note }}</p>
    </div>
  </section>

  <section
    ref="desktopHeroRef"
    data-plate-hero-desktop
    data-same-hero
    class="relative z-10 hidden h-[550px] overflow-hidden lg:flex"
    :aria-label="`${label} hero`"
  >
    <div class="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center pt-8 text-center drop-shadow-[0_0_12.5px_rgba(0,0,0,0.86)]">
      <p data-fade="in" class="flex h-[14px] w-[250px] items-center gap-x-3 whitespace-nowrap font-mono text-[12px] leading-[14px] tracking-normal text-pre-800/80">
        <span class="w-14 shrink-0">{{ plate.code }}</span>
        <span aria-hidden="true" class="w-2 shrink-0 text-accent-1">&middot;</span>
        <span class="w-[94px] shrink-0">WEBCONF.TW</span>
        <span aria-hidden="true" class="w-2 shrink-0 text-accent-1">&middot;</span>
        <span class="w-9 shrink-0">2026</span>
      </p>

      <h1 data-fade="in" class="mt-4 font-en-serif text-[72px] font-bold italic leading-[86px] tracking-normal text-pre-800">
        {{ title }}
      </h1>
      <p data-fade="in" class="mt-2 font-zh-serif text-[22px] font-bold leading-[26px] tracking-normal text-pre-800">
        {{ subtitle }}
      </p>
      <slot />
    </div>

    <!-- 四角的「標本標籤」：跟首頁 Hero 同一套科學紀錄語彙，座標讀自 Figma
         （left/right 40px、bottom 30px、兩行間 gap 4px），不是沿用首頁的抓法。 -->
    <div class="pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto hidden w-full max-w-[1440px] justify-between px-10 pb-[30px] lg:flex">
      <div class="flex flex-col gap-1 text-left">
        <p data-fade="in" class="font-mono text-fs-meta uppercase text-pre-800/80">
          {{ cornerLeft?.label }}
        </p>
        <p data-fade="in" class="text-en-caption italic text-pre-800">
          {{ cornerLeft?.note }}
        </p>
      </div>
      <div class="flex flex-col gap-1 text-right">
        <p data-fade="in" class="font-mono text-fs-meta uppercase text-pre-800/80">
          {{ cornerRight?.label }}
        </p>
        <!-- note 後面接的是執行期才知道的繪圖後端，不是資料（同 Home/Hero.vue 慣例） -->
        <p data-fade="in" class="text-en-caption italic text-pre-800">
          {{ cornerRight?.note }}{{ backend ? ` · ${backend}` : '' }}
        </p>
      </div>
    </div>
  </section>
</template>
