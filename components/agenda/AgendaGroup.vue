<script setup lang="ts">
import type { TimeSlot } from '~/types/agendas'

const props = defineProps<{
  slotData: TimeSlot
}>()

const tagsStore = useTagsStore()
const { selectedTags, IsSelectedTagsEmpty } = storeToRefs(tagsStore)

const agendaGroupTagsCollection = computed(() => {
  if (!props.slotData.agendas)
    return []

  const allAgendaGroupTags = [...new Set(
    Object.values(props.slotData.agendas).flatMap(agenda => agenda.tags),
  )]

  return allAgendaGroupTags
})

const isAgendaGroupDisabled = computed(() => {
  if (IsSelectedTagsEmpty.value)
    return false
  return !agendaGroupTagsCollection.value.some(tag => selectedTags.value.includes(tag))
})
</script>

<template>
  <div
    class="relative grid gap-2 overflow-x-clip px-2 lg:max-h-[221px] lg:min-h-[200px] lg:grid-cols-3 lg:px-0"
    :class="[
      slotData.isBroadcast
        ? isAgendaGroupDisabled
          ? 'mx-2 outline outline-1 outline-primary-green/30 lg:mx-0'
          : 'mx-2 outline outline-1 outline-primary-green lg:mx-0'
        : '',
    ]"
  >
    <div
      v-if="slotData.isBroadcast"
      class="absolute left-1/3 top-1/2 hidden h-[84%] w-[1px] -translate-y-1/2 bg-primary-green/30 lg:block"
    ></div>
    <div
      v-if="slotData.isBroadcast"
      class="absolute left-2/3 top-1/2 hidden h-[84%] w-[1px] -translate-y-1/2 bg-primary-green/30 lg:block"
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
