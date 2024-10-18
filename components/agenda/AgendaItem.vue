<script setup lang="ts">
import type { AgendaItem } from '~/types/agendas'

defineProps<{
  agenda: AgendaItem
}>()
</script>

<template>
  <div class="px-5 py-4">
    <h3 class="text-lg font-medium text-white">
      {{ agenda.title }}
    </h3>
  </div>
</template>

<style scoped></style>
