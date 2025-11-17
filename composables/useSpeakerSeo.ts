import type { ContentCollectionItem } from '@nuxt/content'
import { eventLocation, eventOrganizer, site } from '~/config/seo.config'
import { BACK_LINKS } from '~/constants/agenda'

export function useSpeakerSeo(
  speaker: ContentCollectionItem[],
  speakerIds: string[] = [],
  type: 'agenda' | 'speakers' = 'agenda',
) {
  const firstSpeaker = speaker[0]
  const meta = firstSpeaker?.meta || {}

  // 頁面標題
  const title = (() => {
    if (speaker.length > 1) {
      return meta.topic || site.title
    }

    if (meta.name && meta.topic) {
      return `${meta.name} | ${meta.topic}`
    }

    return site.title
  })()

  // 描述
  const description = firstSpeaker?.seo?.description || site.description

  const speakerIdsFormat = speakerIds.join('/')

  // OG URL
  const ogUrl = (() => {
    const baseUrl = `https://webconf.tw${BACK_LINKS[type].link}`
    return `${baseUrl}/${speakerIdsFormat}`
  })()

  // 作者
  const author = (() => {
    if (speaker.length > 1) {
      return speaker.map(s => s.meta.name).join(', ')
    }

    if (typeof meta.name === 'string') {
      return meta.name
    }

    return site.name
  })()

  // 關鍵字
  const keywords = Array.isArray(meta.tags) ? meta.tags.join(', ') : ''

  // SEO Meta
  const seoData = {
    title,
    description,
    ogUrl,
    author,
    keywords,
  }

  const speakersInfo = speaker.map((s) => {
    const socialsTags = ['fb', 'x', 'other_link', 'ig', 'threads', 'youtube', 'linkedin']

    const socialsLinks = socialsTags
      .map(tag => s.meta?.[tag])
      .filter(link => typeof link === 'string' && link.length > 0) as string[]

    return {
      '@id': `https://webconf.tw/#person/${s.meta.speakerId}`,
      '@type': 'Person',
      'name': String(s.meta.name),
      'url': `https://webconf.tw/speakers/${s.meta.speakerId}`,
      'jobTitle': s.meta.job_title,
      'worksFor': {
        '@type': 'Organization',
        'name': s.meta.company,
      },
      'description': typeof s.meta?.speakerInfo === 'string' ? s.meta.speakerInfo : site.description,
      'image': `https://webconf.tw${s.meta.image}`,
      'sameAs': socialsLinks,
    }
  })

  if (type === 'agenda') {
    const date = meta.date
    const [startTime, endTime] = (meta.time as string).split('~')
    const agendaEventSchema = {
      '@id': `https://webconf.tw/#event/${speakerIdsFormat}#event`,
      '@type': 'Event',
      'name': title,
      description,
      'startDate': `${date}T${startTime}:00+08:00`,
      'endDate': `${date}T${endTime}:00+08:00`,
      'eventStatus': 'https://schema.org/EventScheduled',
      'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
      'inLanguage': 'zh-TW',
      'location': {
        '@id': 'https://webconf.tw/#location',
      },
      'organizer': {
        '@id': 'https://webconf.tw/#organization',
      },
      'performer': speaker.length > 1
        ? speaker.map(s => ({
            '@id': `https://webconf.tw/#person/${s.meta.speakerId}`,
          }))
        : {
            '@id': `https://webconf.tw/#person/${speakerIdsFormat}`,
          },
      'url': ogUrl,
      'superEvent': {
        '@type': 'Event',
        '@id': 'https://webconf.tw/#main-event',
        'name': 'WebConf Taiwan 2025',
        'url': 'https://webconf.tw/',
      },
    }
    useSchemaOrg([...speakersInfo, eventOrganizer, eventLocation, agendaEventSchema])
  }
  else {
    useSchemaOrg(speakersInfo)
  }

  useSeoMeta(seoData)

  return seoData
}
