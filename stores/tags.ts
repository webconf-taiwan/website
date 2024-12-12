import { agendaData } from '~/constants/agendas'
import type { AgendaTag } from '~/types/agendas'

export const useTagsStore = defineStore('tags', () => {
  const selectedTags = ref<AgendaTag['id'][]>([])

  const isSelectedTagsEmpty = computed(() => selectedTags.value.length === 0)

  const allTags = computed(() => {
    const tags = Object.values(agendaData).flatMap(daySlots =>
      daySlots
        .filter(slot => slot.type === 'agenda' && slot.agendas)
        .flatMap(slot => Object.values(slot.agendas || {}))
        .flatMap(agenda => agenda.tags)
        .filter(tag => tag.length > 0),
    )

    return [...new Set(tags)]
  })

  function toggleTag(tagId: AgendaTag['id']) {
    const index = selectedTags.value.indexOf(tagId)
    if (index === -1) {
      selectedTags.value.push(tagId)
    }
    else {
      selectedTags.value.splice(index, 1)
    }
  }

  function resetTags() {
    selectedTags.value = []
  }

  return {
    selectedTags,
    isSelectedTagsEmpty,
    allTags,
    toggleTag,
    resetTags,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useTagsStore, import.meta.hot))
