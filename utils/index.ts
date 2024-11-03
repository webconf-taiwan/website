import { agendaOtherLinksMap, agendaTags } from '~/constants/agendas'
import type { AgendaOtherLink, AgendaTag } from '~/types/agendas'

export function filterAgendaTags(tagIds?: AgendaTag['id'][]) {
  if (!tagIds || tagIds.length === 0)
    return []

  return agendaTags.filter(tag => tagIds.includes(tag.id))
}

export function findAgendaOtherLinkByType(type: AgendaOtherLink['type']) {
  return agendaOtherLinksMap.find(link => link.type === type)
}
