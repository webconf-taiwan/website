<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
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

const { $device } = useNuxtApp()

const locations: AgendaLocation[] = ['M', 'F', 'A2']

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')

const dataLenisPrevent = computed(() => {
  return isSmallerLg.value && $device.isMobileOrTablet
    ? { 'data-lenis-prevent': '' }
    : {}
})
</script>

<template>
  <div
    class="agenda-content mb-24 space-y-2 bg-black lg:p-2"
    v-bind="dataLenisPrevent"
  >
    <!-- Locations header -->
    <AgendaLocations
      class="hidden lg:grid"
      :locations="locations"
    />

    <!-- Time slots -->
    <div
      v-for="slot in agendaTimeSlots"
      :key="slot.startTime"
      class="grid grid-rows-[auto_1fr] gap-2 lg:grid-cols-[118px_6fr] lg:grid-rows-1"
    >
      <!-- Time -->
      <template v-if="slot.type === 'agenda'">
        <div class="sticky left-0 top-[calc(3rem+46px)] z-10 flex h-10 shrink-0 flex-row items-center justify-center gap-x-2 bg-primary-faint-green px-3 font-['Mina'] text-xl font-bold lg:h-auto lg:min-h-36 lg:flex-col lg:justify-between lg:gap-x-0 lg:gap-y-[10px] lg:bg-transparent lg:px-0 lg:py-5 lg:text-2xl">
          <div>{{ slot.startTime }}</div>
          <div class="h-[1px] w-auto grow bg-[hsla(183,24%,53%,1)] lg:h-auto lg:w-[1px] lg:bg-white"></div>
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
      class="sticky bottom-0 z-10 hidden transition duration-300 lg:block"
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

<style scoped>
/* 自定義滾動條樣式 */
.agenda-content {
  scrollbar-width: thin;
  scrollbar-color: var(--primary-green) black;
}

.agenda-content::-webkit-scrollbar {
  width: 4px;
}

.agenda-content::-webkit-scrollbar-thumb {
  border-radius: 6px;
  background-color: var(--primary-green);
}
</style>
