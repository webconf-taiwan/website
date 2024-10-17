import type { AgendaTag } from '~/types/agendas'

export const useAgendasStore = defineStore('agendas', () => {
  const selectedTags = ref<AgendaTag['id'][]>([])

  const isShowAllAgendas = computed(() => selectedTags.value.length === 0)

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
    isShowAllAgendas,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAgendasStore, import.meta.hot))
