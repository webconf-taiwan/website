import { speakers } from '~/constants/speakers'
import type { AgendaTag } from '~/types/agendas'
import type { Speaker } from '~/types/speakers'

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

  function findSpeakers(speakerCodes: string[]) {
    return speakerCodes
      .map(speakerCode => speakers.find(speaker => speaker.code === speakerCode) as Speaker || [])
  }

  return {
    selectedTags,
    toggleTag,
    isShowAllAgendas,
    findSpeakers,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAgendasStore, import.meta.hot))
