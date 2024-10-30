import { agendaData } from '~/constants/agendas'
import { speakers } from '~/constants/speakers'
import type { AgendaDrawerRenderData, AgendaItem, AgendaTag, ParsedAgendaData } from '~/types/agendas'
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

  const agendasMarkdownData = ref<ParsedAgendaData[] | null>(null)

  const initAgendaDrawerData: AgendaDrawerRenderData = {
    speakerName: '',
    speakerAvatar: '',
    agendaTitle: '',
    jobTitle: '',
    socialLinks: [],
    agendaDescription: '',
    agendaPaperLinks: [],
    agendaTags: [],
  }

  const agendaDrawerRenderData = ref<AgendaDrawerRenderData>({ ...initAgendaDrawerData })

  function cleanDrawerRenderData() {
    agendaDrawerRenderData.value = { ...initAgendaDrawerData }
  }

  function setAgendaDrawerRenderData(agenda: AgendaItem) {
    const filteredSpeaker = findSpeakers(agenda.speakerCodes)
    agendaDrawerRenderData.value.speakerName = filteredSpeaker[0].displayName
    agendaDrawerRenderData.value.speakerAvatar = filteredSpeaker[0].avatar
    agendaDrawerRenderData.value.agendaTitle = agenda.title
    agendaDrawerRenderData.value.jobTitle = filteredSpeaker[0].jobTitle || ''
    agendaDrawerRenderData.value.socialLinks = filteredSpeaker[0].socialLinks || []
    agendaDrawerRenderData.value.agendaDescription = 'null'
    agendaDrawerRenderData.value.agendaPaperLinks = agenda.paperLinks || []
    agendaDrawerRenderData.value.agendaTags = agenda.tags
  }

  return {
    selectedTags,
    isShowAllAgendas,
    allTags,
    agendasMarkdownData,
    agendaDrawerRenderData,
    toggleTag,
    findSpeakers,
    setAgendaDrawerRenderData,
    cleanDrawerRenderData,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAgendasStore, import.meta.hot))
