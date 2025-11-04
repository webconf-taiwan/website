import type { ContentCollectionItem, MinimarkNode } from '@nuxt/content'

function formatDateString(dateString: string) {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const weekday = weekdays[date.getDay()]

  return `${month}/${day} (${weekday}.)`
}

export function useSpeakerSections(
  speaker: Ref<ContentCollectionItem[]>,
  currentPageNumber: Ref<number>,
) {
  function toRenderableSection(section: MinimarkNode | undefined) {
    if (!section || !Array.isArray(section) || section.length === 0) {
      return {
        body: {
          type: 'minimark',
          value: [['p', {}, '暫無資料']],
        },
      }
    }

    return {
      body: {
        type: 'minimark',
        value: [section],
      },
    }
  }

  const meta = computed(
    () => speaker.value?.[currentPageNumber.value]?.meta || {},
  )

  const introSection = computed(() => {
    return speaker.value?.[currentPageNumber.value]?.body.value.find(
      node => node[0] === 'speaker-intro',
    )
  })

  const summarySection = () => {
    return speaker.value?.[0]?.body.value.find(
      node => node[0] === 'speaker-summary',
    )
  }

  const audienceSection = () => {
    return speaker.value?.[0]?.body.value.find(
      node => node[0] === 'speaker-audience',
    )
  }

  const earningsSection = () => {
    return speaker.value?.[0]?.body.value.find(
      node => node[0] === 'speaker-earnings',
    )
  }

  const renderableIntroSection = computed(() =>
    toRenderableSection(introSection.value),
  )

  const speakerInfo = computed(() => ({
    summarySection: toRenderableSection(summarySection()),
    speakerAudience: toRenderableSection(audienceSection()),
    earningsSection: toRenderableSection(earningsSection()),
  }))

  const formattedDate = computed(() => {
    const date = typeof meta.value.date === 'string'
      ? meta.value.date
      : new Date().toDateString()
    return formatDateString(date)
  })

  return {
    renderableIntroSection,
    speakerInfo,
    toRenderableSection,
    meta,
    formattedDate,
  }
}
