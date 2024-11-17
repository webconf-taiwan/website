<script setup lang="ts">
import type { AgendaItem, AgendaLocation, TimeSlot } from '~/types/agendas'

const props = defineProps<{
  slotData: TimeSlot
}>()

const triggerAgenda = inject('triggerAgenda') as (agenda: AgendaItem) => void

const tagsStore = useTagsStore()

const slotDataMap = computed(() => {
  if (!props.slotData.agendas)
    return

  return Object.entries(props.slotData.agendas).map(([location, agenda]) => ({
    ...agenda,
    location: location as AgendaLocation,
  }))
})

const mainAgenda = computed(() => {
  if (!slotDataMap.value)
    return

  return slotDataMap.value.find(agenda => agenda.title !== '同步聯播')
})

const isAgendaDisabled = computed(() => {
  if (tagsStore.isSelectedTagsEmpty)
    return false

  if (!mainAgenda.value)
    return false

  return !tagsStore.selectedTags.some(tag => mainAgenda.value!.tags.includes(tag))
})
</script>

<template>
  <button
    type="button"
    class="group relative mx-2 grid gap-2 overflow-hidden overflow-x-clip border border-primary-green px-2 focus-visible:outline-none lg:mx-0 lg:max-h-[221px] lg:min-h-[200px] lg:grid-cols-3 lg:px-0"
    :class="[isAgendaDisabled ? 'border-primary-green/30' : 'border-primary-green']"
    @click="triggerAgenda(mainAgenda!)"
  >
    <div
      v-show="!isAgendaDisabled"
      class="absolute inset-0 z-0 scale-75 rounded-xl bg-primary-deep-green opacity-0 blur-sm transition ease-in lg:group-hover:scale-105 lg:group-hover:opacity-100"
    ></div>

    <div
      v-if="slotData.isBroadcast"
      class="absolute left-1/3 top-1/2 hidden h-[84%] w-[1px] -translate-y-1/2 bg-primary-green/30 lg:block"
    ></div>
    <div
      v-if="slotData.isBroadcast"
      class="absolute left-2/3 top-1/2 hidden h-[84%] w-[1px] -translate-y-1/2 bg-primary-green/30 lg:block"
    ></div>

    <div
      v-for="agenda in slotDataMap"
      :key="agenda.id"
      class="h-full"
    >
      <template v-if="agenda.title === '同步聯播'">
        <div class="relative flex h-full content-center items-center justify-between px-3 py-4 max-lg:border-t max-lg:border-t-primary-green/30 lg:justify-center">
          <p
            class="text-left text-base font-normal transition-colors lg:text-center lg:text-lg lg:font-medium"
            :class="[isAgendaDisabled ? 'text-primary-green/30' : 'text-primary-green']"
          >
            {{ agenda.title }}
          </p>
          <div class="flex shrink-0 items-center gap-x-1 text-[hsla(182,25%,74%,1)] lg:hidden">
            <Icon
              name="i-heroicons-map-pin"
              size="16"
            />
            <span>{{ agenda.location }} 棟</span>
          </div>
        </div>
      </template>
      <template v-else>
        <AgendaItem
          class="lg:max-w-[334px]"
          :agenda="agenda"
          :location="agenda.location"
          :is-agenda-disabled="isAgendaDisabled"
        />
      </template>
    </div>
  </button>
</template>
