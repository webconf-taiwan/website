<script setup lang="ts">
import type { AgendaItem, AgendaLocation } from '~/types/agendas'

defineProps<{
  agenda: AgendaItem
  location: AgendaLocation
  isBroadcast: boolean
}>()
</script>

<template>
  <div
    v-if="isBroadcast"
    class="max-w-[334px]"
  >
    <template v-if="agenda.title === '同步聯播'">
      <p class="h-full content-center text-center text-lg font-medium text-primary-green">
        {{ agenda.title }}
      </p>
    </template>
    <template v-else>
      <AgendaItem :agenda="agenda" />
    </template>
  </div>

  <div
    v-else
    class="max-w-[334px] border border-primary-green"
  >
    <AgendaItem :agenda="agenda" />
  </div>
</template>

<style scoped></style>
