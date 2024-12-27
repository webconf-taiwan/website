import type { AgendaDrawerRenderData, AgendaItem, ParsedAgendaData } from '~/types/agendas'
import type { Speaker } from '~/types/speakers'
import { agendaData } from '~/constants/agendas'
import { speakers } from '~/constants/speakers'

export const useAgendasStore = defineStore('agendas', () => {
  function findSpeakers(speakerCodes: string[]) {
    return speakerCodes
      .map(speakerCode => speakers.find(speaker => speaker.code === speakerCode) as Speaker || [])
  }

  function findAgendaById(id: string) {
    if (!id)
      throw new Error('Agenda ID is required')

    const flatAgendaData = Object.values(agendaData).flat()

    const agenda = flatAgendaData
      .filter(slot => slot.type === 'agenda')
      .flatMap(slot => Object.values(slot.agendas || {}))
      .find(agenda => agenda.id === id)

    if (!agenda)
      return null

    return agenda
  }

  const agendaDrawerContentTabsMap = reactive([
    ['agenda-info', '議程資訊'],
    ['speaker-intro', '講者介紹'],
  ])

  const defaultContentTab = computed(() => {
    return agendaDrawerContentTabsMap[0][0]
  })
  const currentContentTab = ref(defaultContentTab.value)

  function resetContentTab() {
    currentContentTab.value = defaultContentTab.value
  }

  const currentAgendaDrawerId = ref<string>('')
  const agendasMarkdownData = ref<ParsedAgendaData[] | null>(null)
  const singleAgendaMarkdownData = ref<ParsedAgendaData | null>(null)

  const currentAgendaMarkdownData = computed(() => {
    console.log("觸發 currentAgendaMarkdownData Computed")
    if (singleAgendaMarkdownData.value) {
      console.log("markdownData 一樣，直接回傳")
      return singleAgendaMarkdownData.value
    }

    console.log("markdownData 不一樣，開始找新的 markdownData")
    return agendasMarkdownData.value?.find(agenda => agenda._path?.split('/').pop() === currentAgendaDrawerId.value)
  })

  const agendaDrawerRenderData = ref<AgendaDrawerRenderData[]>([
    {
      speakerName: '',
      speakerAvatar: '',
      agendaTitle: '',
      jobTitle: '',
      socialLinks: [],
      agendaOtherLinks: [],
      agendaTags: [],
    },
  ])

  function setAgendaDrawerRenderData(agenda: AgendaItem) {
    const filteredSpeakers = findSpeakers(agenda.speakerCodes)

    agendaDrawerRenderData.value = filteredSpeakers.map(speaker => ({
      speakerName: speaker.displayName,
      agendaTitle: agenda.title,
      speakerAvatar: speaker.avatar,
      socialLinks: speaker.socialLinks || [],
      jobTitle: speaker.jobTitle || '',
      agendaOtherLinks: agenda.otherLinks || [],
      agendaTags: agenda.tags,
    }))
  }

  function cleanDrawerRenderData() {
    agendaDrawerRenderData.value = [{
      speakerName: '',
      speakerAvatar: '',
      agendaTitle: '',
      jobTitle: '',
      socialLinks: [],
      agendaOtherLinks: [],
      agendaTags: [],
    }]
  }

  return {
    agendaDrawerContentTabsMap,
    currentContentTab,
    currentAgendaDrawerId,
    agendasMarkdownData,
    singleAgendaMarkdownData,
    currentAgendaMarkdownData,
    agendaDrawerRenderData,
    findSpeakers,
    findAgendaById,
    resetContentTab,
    setAgendaDrawerRenderData,
    cleanDrawerRenderData,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAgendasStore, import.meta.hot))
