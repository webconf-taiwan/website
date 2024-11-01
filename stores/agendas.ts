import { speakers } from '~/constants/speakers'
import type { AgendaDrawerRenderData, AgendaItem, ParsedAgendaData } from '~/types/agendas'
import type { Speaker } from '~/types/speakers'

export const useAgendasStore = defineStore('agendas', () => {
  function findSpeakers(speakerCodes: string[]) {
    return speakerCodes
      .map(speakerCode => speakers.find(speaker => speaker.code === speakerCode) as Speaker || [])
  }

  const agendaDrawerContentTabsMap = reactive([
    ['agenda-info', '議程資訊'],
    ['speaker-intro', '講者介紹'],
  ])

  const defaultContentTab = computed(() => {
    return agendaDrawerContentTabsMap[0][0]
  })
  const currentContentTab = ref(defaultContentTab.value)

  const currentAgendaDrawerId = ref<string>('')
  const agendasMarkdownData = ref<ParsedAgendaData[] | null>(null)

  const currentAgendaMarkdownData = computed(() => {
    return agendasMarkdownData.value?.find(agenda => agenda._path?.split('/').pop() === currentAgendaDrawerId.value)
  })

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
    agendaDrawerContentTabsMap,
    currentContentTab,
    currentAgendaDrawerId,
    currentAgendaMarkdownData,
    agendasMarkdownData,
    agendaDrawerRenderData,
    findSpeakers,
    setAgendaDrawerRenderData,
    cleanDrawerRenderData,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAgendasStore, import.meta.hot))
