<script setup lang="ts">
import type { TimeSlot } from '~/types/agendas'

defineProps<{
  slotData: TimeSlot
}>()
</script>

<template>
  <div
    class="relative grid h-[216px] grid-cols-3 gap-x-2 overflow-x-clip"
    :class="[slotData.isBroadcast ? 'border border-primary-green' : '']"
  >
    <div
      v-if="slotData.isBroadcast"
      class="absolute left-1/3 top-1/2 h-[84%] w-[1px] -translate-y-1/2 bg-primary-green/30"
    ></div>
    <div
      v-if="slotData.isBroadcast"
      class="absolute left-2/3 top-1/2 h-[84%] w-[1px] -translate-y-1/2 bg-primary-green/30"
    ></div>

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
