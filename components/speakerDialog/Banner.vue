<script setup lang="ts">
import { BACK_LINKS } from '~/constants/agenda'

defineProps<{
  type: 'agenda' | 'speakers'
}>()

const emit = defineEmits<(_event: 'close') => void>()
</script>

<template>
  <div
    class="speaker-detail-header sticky inset-0 z-20 h-[72px] border-b border-webconf-gray lg:relative lg:h-[76px]"
  >
    <button
      v-cursor="{
        scale: 0.5,
        duration: 0.5,
      }"
      type="button"
      class="absolute right-5 top-[14px] flex items-center justify-center bg-webconf-gray pl-4 pr-3 transition-colors duration-500 hover:bg-webconf-blue hover:text-white lg:right-6 lg:top-4"
      @click="emit('close')"
    >
      <span class="inline-block py-[14px] text-btn-16">{{
        BACK_LINKS[type].title
      }}</span>
      <Icon
        name="custom-icon:arrow-right"
        class="ml-3 size-6"
      />
    </button>
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
