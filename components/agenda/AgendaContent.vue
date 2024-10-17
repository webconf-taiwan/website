<script setup lang="ts">
import type { TimeSlot } from '~/types/agendas'

defineProps<{
  agendaTimeSlots: TimeSlot[]
}>()
</script>

<template>
  <div
    class="mb-24 min-h-[100dvh] bg-black"
  >
    <!-- <pre>
      {{ JSON.stringify(agendaTimeSlots, null, 2) }}
    </pre> -->
  </div>
</template>

<style scoped></style>
