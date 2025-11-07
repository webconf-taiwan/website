<script setup lang="ts">
import { BACK_LINKS } from '~/constants/agendas'

defineProps<{
  type: 'agendas' | 'speakers'
}>()

const emit = defineEmits<(_event: 'close') => void>()
</script>

<template>
  <div
    class="speaker-detail-header sticky inset-0 z-20 h-[72px] border-b border-webconf-gray lg:relative lg:h-[76px]"
  >
    <div
      class="absolute right-5 top-[14px] flex items-center justify-center bg-webconf-gray pl-4 pr-3 lg:right-6 lg:top-4"
      @click="emit('close')"
    >
      <span class="inline-block py-[14px] text-btn-16">{{
        BACK_LINKS[type].title
      }}</span>
      <NuxtImg
        class="ml-3"
        src="/images/icon/arrow-right.svg"
        width="24"
        height="24"
        alt="close"
      />
    </div>
  </div>
</template>

<style scoped>
.speaker-detail-header {
  background-image: url("/images/speakerPopoverBg.webp");
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: auto 76px;
}

@media (min-width: 1440px) {
  .speaker-detail-header {
    background-size: 100% 76px;
  }
}
</style>
