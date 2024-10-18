<script setup lang="ts">
import type { TimeSlot } from '~/types/agendas'

defineProps<{
  slotData: TimeSlot
}>()
</script>

<template>
  <div
    class="grid h-[200px] grid-cols-3 gap-x-2 overflow-x-clip"
    :class="[slotData.isBroadcast ? 'border border-primary-green' : '']"
  >
    <AgendaItemWrapper
      v-for="(agenda, location) in slotData.agendas"
      :key="agenda!.id"
      :agenda="agenda!"
      :location="location"
      :is-broadcast="slotData.isBroadcast"
    />
  </div>
</template>

<style scoped></style>
