<script setup lang="ts">
import type { AgendaItem, AgendaLocation } from '~/types/agendas'

defineProps<{
  agenda: AgendaItem
  location: AgendaLocation
  isBroadcast: boolean
}>()
</script>

<template>
  <button
    v-if="isBroadcast"
    type="button"
    class="group relative block max-w-[334px] overflow-hidden bg-black transition-colors"
  >
    <div class="absolute inset-0 z-0 scale-75 bg-primary-deep-green opacity-0 blur-sm transition ease-in lg:group-hover:scale-105 lg:group-hover:opacity-100"></div>

    <template v-if="agenda.title === '同步聯播'">
      <div class="relative h-full content-center">
        <p class="text-center text-lg font-medium text-primary-green">
          {{ agenda.title }}
        </p>
      </div>
    </template>
    <template v-else>
      <AgendaItem :agenda="agenda" />
    </template>
  </button>

  <button
    v-else
    type="button"
    class="group relative block max-w-[334px] overflow-hidden border border-primary-green bg-black"
  >
    <div class="absolute inset-0 z-0 scale-75 bg-primary-deep-green opacity-0 blur-sm transition ease-in lg:group-hover:scale-105 lg:group-hover:opacity-100"></div>
    <AgendaItem :agenda="agenda" />
  </button>
</template>

<style scoped></style>
