<script setup>
import TemporaryParticleField from '~/components/Common/TemporaryParticleField.vue'

const props = defineProps({
  variant: {
    type: String,
    default: '404',
    validator: value => ['404', 'coming-soon'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  mobileCtaLabel: {
    type: String,
    default: '前往購票'
  },
  desktopCtaLabel: {
    type: String,
    default: '返回首頁'
  }
})

const emit = defineEmits(['mobile-action', 'desktop-action'])
const heroRef = ref(null)
const is404 = computed(() => props.variant === '404')

useFadeIn(heroRef, { y: 28, step: 0.12 })
</script>

<template>
  <main
    id="temporary-page"
    ref="heroRef"
    data-same-hero
    class="relative z-10 flex h-[550px] flex-col items-center justify-center overflow-hidden bg-black/30 text-center lg:h-[720px]"
  >
    <ClientOnly>
      <TemporaryParticleField />
    </ClientOnly>
    <!-- Figma 的黑底襯墊僅為設計示意，實際不使用。 -->
    <div class="relative z-1 flex w-[955.825px] shrink-0 flex-col items-center gap-y-8 pt-8 drop-shadow-[0_0_12.5px_rgba(0,0,0,0.86)]">
      <div class="flex flex-col items-center gap-y-4">
        <p
          data-fade="in"
          class="flex h-[14px] w-[162px] items-center gap-x-3 overflow-hidden font-mono text-meta leading-[14px] uppercase text-pre-800/80"
        >
          <span class="w-[94px] shrink-0 overflow-hidden text-left">WEBCONF.TW</span>
          <span class="w-2 shrink-0 overflow-hidden text-left text-accent-1" aria-hidden="true">·</span>
          <span class="w-9 shrink-0 overflow-hidden text-left">2026</span>
        </p>

        <div class="flex flex-col items-center gap-y-2 text-pre-800">
          <h1
            data-fade="in"
            class="font-en-serif text-en-hero-m italic leading-[77px] tracking-[0.02em] lg:text-en-hero lg:leading-[86px]"
            :class="is404 ? 'w-[252px] text-center lg:w-[121px]' : 'w-[252px] break-words lg:w-auto lg:whitespace-nowrap'"
          >
            {{ title }}
          </h1>

          <p
            data-fade="in"
            class="whitespace-nowrap font-zh-serif text-zh-h5-m font-bold leading-[22px] tracking-[0.02em] lg:text-zh-h5 lg:leading-[26px]"
            :class="is404 ? 'lg:w-[314px] lg:text-center' : ''"
          >
            {{ subtitle }}
          </p>
        </div>
      </div>

      <button
        type="button"
        data-fade="in"
        class="inline-flex h-10 items-center justify-center border border-accent-1 bg-[#0a0a0c] py-2 pl-5 pr-3 text-zh-btn text-pre-800 transition-colors hover:bg-accent-1/10 lg:hidden"
        :class="is404 ? 'w-[121px]' : 'w-[128px] gap-x-1'"
        @click="emit('mobile-action')"
      >
        <span class="whitespace-nowrap">{{ mobileCtaLabel }}</span>
        <img src="/figma/home-hero/arrow-icon.svg" alt="" class="size-6 shrink-0">
      </button>

      <button
        type="button"
        data-fade="in"
        class="hidden h-10 items-center justify-center border border-accent-1 bg-[#0a0a0c] py-2 pl-5 pr-3 text-zh-btn text-pre-800 transition-colors hover:bg-accent-1/10 lg:inline-flex"
        :class="is404 ? 'w-[125px]' : 'w-[132.4px] gap-x-1'"
        @click="emit('desktop-action')"
      >
        <span class="whitespace-nowrap">{{ desktopCtaLabel }}</span>
        <img src="/figma/home-hero/arrow-icon.svg" alt="" class="size-6 shrink-0">
      </button>
    </div>
  </main>
</template>
