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

  const agendaDrawerRenderData = ref<AgendaDrawerRenderData[]>([
    {
      speakerName: '',
      speakerAvatar: '',
      agendaTitle: '',
      jobTitle: '',
      socialLinks: [],
      agendaDescription: '',
      agendaPaperLinks: [],
      agendaTags: [],
    },
  ])

  function setAgendaDrawerRenderData(agenda: AgendaItem) {
    const filteredSpeaker = findSpeakers(agenda.speakerCodes)
    
    // 根據講者數量重置 agendaDrawerRenderData
    agendaDrawerRenderData.value = filteredSpeaker.map(speaker => ({
      speakerName: speaker.displayName,
      agendaTitle: agenda.title,
      speakerAvatar: speaker.avatar,
      socialLinks: speaker.socialLinks || [],
      jobTitle: speaker.jobTitle || '',
      agendaDescription: 'null',
      agendaPaperLinks: agenda.paperLinks || [],
      agendaTags: agenda.tags,
    }))
  }

  function cleanDrawerRenderData() {
    // 重置為單一空白資料
    agendaDrawerRenderData.value = [{
      speakerName: '',
      speakerAvatar: '',
      agendaTitle: '',
      jobTitle: '',
      socialLinks: [],
      agendaDescription: '',
      agendaPaperLinks: [],
      agendaTags: [],
    }]
  }

  return {
    selectedTags,
    isShowAllAgendas,
    allTags,
    agendaDrawerContentTabsMap,
    currentContentTab,
    currentAgendaDrawerId,
    currentAgendaMarkdownData,
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
