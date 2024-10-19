<script setup lang="ts">
import type { AgendaItem } from '~/types/agendas'

defineProps<{
  agenda: AgendaItem
}>()
</script>

<template>
  <div class="relative flex h-full flex-col px-5 py-4">
    <!-- Agenda title -->
    <h3 class="mb-2 line-clamp-2 text-start text-lg font-medium text-white">
      {{ agenda.title }}
    </h3>

    <!-- Agenda tags -->
    <div class="flex flex-wrap gap-2">
      <div
        v-for="tag in agenda.tags"
        :key="tag"
        class="rounded border border-primary-green/30 px-2 py-1 text-center text-sm text-primary-green"
      >
        #{{ tag }}
      </div>
    </div>

    <!-- Agenda speakers -->
    <div class="grow content-end text-start">
      [Speakers]
    </div>
  </div>
</template>

<style scoped></style>
