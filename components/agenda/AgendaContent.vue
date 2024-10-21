<script setup lang="ts">
import type { AgendaLocation, TimeSlot } from '~/types/agendas'

defineProps<{
  agendaTimeSlots: TimeSlot[]
  tabsTop: number
  agendaContentFooterDates: string[]
  currentAgendaDate: string
}>()

defineEmits<{
  'update:current-agenda-date': [value: string]
}>()

const locations: AgendaLocation[] = ['M', 'F', 'A2']
</script>

<template>
  <div
    class="mb-24 space-y-2 bg-black p-2"
  >
    <!-- Locations header -->
    <AgendaLocations :locations="locations" />

    <!-- Time slots -->
    <div
      v-for="slot in agendaTimeSlots"
      :key="slot.startTime"
      class="grid grid-cols-[118px_6fr] gap-x-2"
    >
      <!-- Time -->
      <template v-if="slot.type === 'agenda'">
        <div class="flex shrink-0 flex-col items-center justify-between gap-y-[10px] py-5 font-['Mina'] text-2xl font-bold">
          <div>{{ slot.startTime }}</div>
          <div class="w-[1px] grow bg-white"></div>
          <div>{{ slot.endTime }}</div>
        </div>
      </template>
      <template v-else-if="slot.type === 'break'">
        <div></div>
        <div class="h-[60px] content-center text-center text-lg font-medium text-[hsla(182,25%,74%,1)]">
          {{ slot.breakTitle }}
        </div>
      </template>

      <!-- Agenda items -->
      <template v-if="slot.agendas && Object.keys(slot.agendas).length > 0">
        <AgendaGroup :slot-data="slot" />
      </template>
    </div>

    <!-- Footer -->
    <div
      class="sticky bottom-0 transition duration-300"
      :class="[tabsTop < 60 ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0']"
    >
      <AgendaLocations :locations="locations">
        <div class="flex">
          <button
            v-for="date in agendaContentFooterDates"
            :key="date"
            type="button"
            class="block w-full font-['Mina'] text-sm"
            :class="[date === currentAgendaDate ? 'bg-primary-green font-semibold text-black' : 'bg-primary-deep-green font-normal text-white']"
            @click="() => $emit('update:current-agenda-date', date)"
          >
            <span>{{ useDateFormat(date, 'MM/DD') }}</span>
          </button>
        </div>
      </AgendaLocations>
    </div>
  </div>
</template>

<style scoped></style>
