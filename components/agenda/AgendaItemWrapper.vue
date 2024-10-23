<script setup lang="ts">
import type { AgendaItem, AgendaLocation } from '~/types/agendas'

const props = defineProps<{
  agenda: AgendaItem
  location: AgendaLocation
  isBroadcast: boolean
}>()

const agendasStore = useAgendasStore()
const { selectedTags, isShowAllAgendas } = storeToRefs(agendasStore)

const isAgendaVisible = computed(() => {
  if (isShowAllAgendas.value)
    return true
  return selectedTags.value.some(tag => props.agenda.tags.includes(tag))
})
</script>

<template>
  <button
    v-if="isBroadcast"
    v-show="isAgendaVisible"
    type="button"
    class="group relative block overflow-hidden bg-black transition-colors lg:max-w-[334px]"
  >
    <div class="absolute inset-0 z-0 scale-75 rounded-xl bg-primary-deep-green opacity-0 blur-sm transition ease-in lg:group-hover:scale-105 lg:group-hover:opacity-100"></div>

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
    v-show="isAgendaVisible"
    type="button"
    class="group relative block overflow-hidden border border-primary-green bg-black lg:max-w-[334px]"
  >
    <div class="absolute inset-0 z-0 scale-75 rounded-xl bg-primary-deep-green opacity-0 blur-sm transition ease-in lg:group-hover:scale-105 lg:group-hover:opacity-100"></div>
    <AgendaItem :agenda="agenda" />
  </button>
</template>

<style scoped></style>
