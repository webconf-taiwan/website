import type { AgendaItem } from '~/types'
import { eventLocation, eventOrganizer, site } from '~/config/seo.config'
import { AGENDA_LIST } from '~/constants/agenda'

/**
 * 生成議程頁面的 Schema.org 結構化資料
 * 包含完整的兩天議程，確保 SEO 可以擷取所有議程內容
 */
export function useAgendaSeo() {
  // 將議程項目轉換為 Schema.org Event 格式
  function convertAgendaToEvent(agenda: AgendaItem, index: number) {
    const date = agenda.day === '12' ? '2025-12-12' : '2025-12-13'
    const startDateTime = `${date}T${agenda.startTime}:00+08:00`
    const endDateTime = `${date}T${agenda.endTime}:00+08:00`

    // 生成講者資訊
    const performers = agenda.speakerInfo?.map((speaker) => {
      return {
        '@type': 'Person',
        'name': speaker.name,
        'jobTitle': speaker.JobTitle,
        'url': `https://webconf.tw/speakers/${speaker.speakerId}`,
      }
    }) || []

    return {
      '@type': 'Event',
      '@id': `https://webconf.tw/#agenda-${index}`,
      'name': agenda.title,
      'description': agenda.title,
      'startDate': startDateTime,
      'endDate': endDateTime,
      'eventStatus': 'https://schema.org/EventScheduled',
      'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
      'location': {
        '@type': 'Place',
        'name': `${eventLocation.name} - ${agenda.location}`,
        'address': eventLocation.address,
      },
      'organizer': {
        '@id': eventOrganizer['@id'],
      },
      'performer': performers,
      'superEvent': {
        '@id': 'https://webconf.tw/#main-event',
      },
      'inLanguage': 'zh-TW',
      ...(agenda.tags && {
        keywords: agenda.tags.join(', '),
      }),
    }
  }

  // 生成主活動的結構化資料
  const mainEvent = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': 'https://webconf.tw/#main-event',
    'name': site.name,
    'description': site.description,
    'image': 'https://webconf.tw/images/seo/ogImage.png',
    'startDate': '2025-12-12T09:00:00+08:00',
    'endDate': '2025-12-13T17:25:00+08:00',
    'eventStatus': 'https://schema.org/EventScheduled',
    'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
    'location': eventLocation,
    'organizer': eventOrganizer,
    'url': site.url,
    'inLanguage': 'zh-TW',
    // 子活動：包含所有議程
    'subEvent': AGENDA_LIST
      // 過濾掉重複的聯播議程（保留第一個）
      .filter((agenda, index, self) => {
        if (!agenda.isCoStream)
          return true
        // 對於聯播議程，只保留第一個（M 棟）
        const firstIndex = self.findIndex(
          a => a.title === agenda.title
            && a.startTime === agenda.startTime
            && a.day === agenda.day,
        )
        return firstIndex === index
      })
      .map((agenda, index) => convertAgendaToEvent(agenda, index)),
  }

  // 分別生成兩天的議程結構化資料（用於更細緻的 SEO）
  const day1Event = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': 'https://webconf.tw/#day1-event',
    'name': `${site.name} - 第一天`,
    'description': 'WebConf Taiwan 2025 第一天議程，12 月 12 日精彩內容',
    'image': 'https://webconf.tw/images/seo/ogImage.png',
    'startDate': '2025-12-12T09:00:00+08:00',
    'endDate': '2025-12-12T18:00:00+08:00',
    'eventStatus': 'https://schema.org/EventScheduled',
    'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
    'location': eventLocation,
    'organizer': eventOrganizer,
    'url': 'https://webconf.tw/agenda',
    'inLanguage': 'zh-TW',
    'superEvent': {
      '@id': 'https://webconf.tw/#main-event',
    },
  }

  const day2Event = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': 'https://webconf.tw/#day2-event',
    'name': `${site.name} - 第二天`,
    'description': 'WebConf Taiwan 2025 第二天議程，12 月 13 日精彩內容',
    'image': 'https://webconf.tw/images/seo/ogImage.png',
    'startDate': '2025-12-13T09:00:00+08:00',
    'endDate': '2025-12-13T17:25:00+08:00',
    'eventStatus': 'https://schema.org/EventScheduled',
    'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
    'location': eventLocation,
    'organizer': eventOrganizer,
    'url': 'https://webconf.tw/agenda',
    'inLanguage': 'zh-TW',
    'superEvent': {
      '@id': 'https://webconf.tw/#main-event',
    },
  }

  return {
    mainEvent,
    day1Event,
    day2Event,
  }
}
