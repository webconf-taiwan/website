import { agendaData } from '~/constants/agendas'
import { speakers } from '~/constants/speakers'
import type { AgendaTag } from '~/types/agendas'
import type { Speaker } from '~/types/speakers'

export const useAgendasStore = defineStore('agendas', () => {
  const selectedTags = ref<AgendaTag['id'][]>([])

  const isShowAllAgendas = computed(() => selectedTags.value.length === 0)

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

  function findSpeakers(speakerCodes: string[]) {
    return speakerCodes
      .map(speakerCode => speakers.find(speaker => speaker.code === speakerCode) as Speaker || [])
  }

  return {
    selectedTags,
    isShowAllAgendas,
    allTags,
    toggleTag,
    findSpeakers,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAgendasStore, import.meta.hot))
