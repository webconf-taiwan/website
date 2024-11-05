<script setup lang="ts">
import type { TimeSlot } from '~/types/agendas'

defineProps<{
  slotData: TimeSlot
}>()
</script>

<template>
  <div
    class="relative grid gap-2 overflow-x-clip px-2 lg:max-h-[221px] lg:min-h-[200px] lg:grid-cols-3 lg:px-0"
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
