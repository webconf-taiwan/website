import type { AgendaTag, DaySchedule } from '~/types/agendas'

export const useAgendasStore = defineStore('agendas', () => {
  const selectedTags = ref<AgendaTag['id'][]>([])
  const currentDay = ref<keyof DaySchedule>('2024-12-27')

  function toggleTag(tagId: AgendaTag['id']) {
    const index = selectedTags.value.indexOf(tagId)
    if (index === -1) {
      selectedTags.value.push(tagId)
    }
    else {
      selectedTags.value.splice(index, 1)
    }
  }

  return {
    selectedTags,
    toggleTag,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAgendasStore, import.meta.hot))
