<script setup lang="ts">
import type { AgendaLocation } from '~/types/agendas'

defineProps<{
  locations: AgendaLocation[]
}>()
</script>

<template>
  <div class="mb-2 grid grid-cols-[118px_2fr_2fr_2fr] gap-x-2">
    <slot>
      <div></div>
    </slot>
    <div
      v-for="location in locations"
      :key="location"
      class="bg-[hsla(186,36%,40%,1)] py-3 text-center text-xl"
    >
      {{ location }}&nbsp;棟
    </div>
  </div>
</template>

<style scoped></style>
