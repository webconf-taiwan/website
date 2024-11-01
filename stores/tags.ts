import { agendaData, agendaTags } from '~/constants/agendas'
import type { AgendaTag } from '~/types/agendas'

export const useTagsStore = defineStore('tags', () => {
  const selectedTags = ref<AgendaTag['id'][]>([])

  const IsSelectedTagsEmpty = computed(() => selectedTags.value.length === 0)

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

  function filterAgendaTags(tagIds?: AgendaTag['id'][]) {
    if (!tagIds || tagIds.length === 0)
      return []

    return agendaTags.filter(tag => tagIds.includes(tag.id))
  }

  return {
    selectedTags,
    IsSelectedTagsEmpty,
    allTags,
    toggleTag,
    resetTags,
    filterAgendaTags,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useTagsStore, import.meta.hot))
