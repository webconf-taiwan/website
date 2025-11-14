import type { ContentCollectionItem } from '@nuxt/content'
import { site } from '~/config/seo.config'
import { BACK_LINKS } from '~/constants/agenda'

export function useSpeakerSeo(
  speaker: ContentCollectionItem[],
  speakerIds: string[] = [],
  type: 'agendas' | 'speakers' = 'agendas',
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

  const schemaOrg = speaker.map((s) => {
    const socialsTags = ['fb', 'x', 'other_link', 'ig', 'threads', 'youtube', 'linkedin']
    const socialsLinks = []

    for (const tag of socialsTags) {
      if (s.meta?.[tag]) {
        socialsLinks.push(s.meta?.[tag])
      }
    }

    return {
      '@type': 'Person',
      'name': s.meta.name,
      'url': `https://webconf.tw/speakers/${s.meta.speakerId}`,
      'jobTitle': s.meta.job_title,
      'worksFor': {
        '@type': 'Organization',
        'name': s.meta.company,
      },
      'description': s.meta?.speakerInfo || site.description,
      'image': `https://webconf.tw${s.meta.image}`,
      'sameAs': socialsLinks,
    }
  })

  useSeoMeta(seoData)
  useSchemaOrg(schemaOrg)

  return seoData
}
