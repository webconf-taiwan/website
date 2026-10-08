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
    class="temporary-hero relative z-10 flex h-[550px] shrink-0 grow flex-col items-center justify-center overflow-hidden bg-[#0a0a0c] text-center lg:h-[720px]"
  >
    <ClientOnly>
      <TemporaryParticleField />
    </ClientOnly>
    <!-- Figma 的黑底襯墊僅為設計示意，實際不使用。 -->
    <!-- 寬度一律跟著內容／視窗走，不寫死 px：標題在窄螢幕靠空白自然折行，放得下就維持一行。 -->
    <div class="container relative z-1 flex flex-col items-center gap-y-8 pt-8 drop-shadow-[0_0_12.5px_rgba(0,0,0,0.86)]">
      <div class="flex flex-col items-center gap-y-4">
        <p
          data-fade="in"
          class="flex items-center gap-x-3 whitespace-nowrap font-mono text-meta leading-[14px] uppercase text-pre-800/80"
        >
          <span>WEBCONF.TW</span>
          <span class="text-accent-1" aria-hidden="true">·</span>
          <span>2026</span>
        </p>

        <div class="flex max-w-full flex-col items-center gap-y-2 text-pre-800">
          <h1
            data-fade="in"
            class="max-w-full text-balance text-en-hero leading-[77px] lg:leading-[86px]"
          >
            {{ title }}
          </h1>

          <p
            data-fade="in"
            class="max-w-full text-balance text-zh-h5 leading-[22px] lg:leading-[26px]"
          >
            {{ subtitle }}
          </p>
        </div>
      </div>

      <AtomButton
        data-fade="in"
        :text="mobileCtaLabel"
        size="sm"
        rounded="none"
        icon="arrow-right-thin"
        icon-position="end"
        class="temporary-cta h-10 lg:hidden"
        :class="is404 ? '' : 'gap-x-1'"
        @click="emit('mobile-action')"
      />

      <AtomButton
        data-fade="in"
        :text="desktopCtaLabel"
        size="sm"
        rounded="none"
        icon="arrow-right-thin"
        icon-position="end"
        class="temporary-cta hidden h-10 lg:flex"
        :class="is404 ? '' : 'gap-x-1'"
        @click="emit('desktop-action')"
      />
    </div>
  </main>
</template>

<style scoped>
.temporary-hero { --plate-hero-field-height: 640px; }
@media (min-width: 1024px) {
  .temporary-hero { --plate-hero-field-height: 720px; }
}
.temporary-cta { padding-left: 20px; padding-right: 12px; white-space: nowrap; }
</style>
