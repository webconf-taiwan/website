<script setup lang="ts">
import type { AgendaItem, AgendaLocation } from '~/types/agendas'

const props = defineProps<{
  agenda: AgendaItem
  location: AgendaLocation
  isBroadcast: boolean
}>()

const triggerAgenda = inject('triggerAgenda') as (agenda: AgendaItem) => void

const tagsStore = useTagsStore()

const isAgendaDisabled = computed(() => {
  if (tagsStore.isSelectedTagsEmpty)
    return false
  return !tagsStore.selectedTags.some(tag => props.agenda.tags.includes(tag))
})
</script>

<template>
  <button
    type="button"
    class="group relative block overflow-hidden border bg-black transition-colors focus-visible:outline-none lg:max-w-[334px]"
    :class="[isAgendaDisabled ? 'border-primary-green/30' : 'border-primary-green']"
    @click="triggerAgenda(agenda)"
  >
    <div
      v-show="!isAgendaDisabled"
      class="absolute inset-0 z-0 scale-75 rounded-xl bg-primary-deep-green opacity-0 blur-sm transition ease-in lg:group-hover:scale-105 lg:group-hover:opacity-100"
    ></div>

    <AgendaItem
      :agenda="agenda"
      :location="location"
      :is-agenda-disabled="isAgendaDisabled"
    />
  </button>
</template>
