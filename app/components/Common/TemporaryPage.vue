<script setup>
defineProps({
  variant: {
    type: String,
    default: '404'
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
const { isDesktop, viewportReady } = useViewportMode()
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-black text-pre-800">
    <LayoutPageHeader />

    <ClientOnly>
      <template v-if="viewportReady">
        <HomeField v-if="isDesktop" />
        <HomeMobileField v-else />
      </template>
    </ClientOnly>

    <CommonTemporaryHero
      :variant="variant"
      :title="title"
      :subtitle="subtitle"
      :mobile-cta-label="mobileCtaLabel"
      :desktop-cta-label="desktopCtaLabel"
      @mobile-action="emit('mobile-action')"
      @desktop-action="emit('desktop-action')"
    />

    <LayoutPageFooter class="z-20" />
  </div>
</template>
