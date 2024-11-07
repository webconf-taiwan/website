import type { AgendaOtherLink, AgendaTag } from '~/types/agendas'
import { agendaData, agendaOtherLinksMap, agendaTags } from '../constants/agendas'

export function filterAgendaTags(tagIds?: AgendaTag['id'][]) {
  if (!tagIds || tagIds.length === 0)
    return []

  return agendaTags.filter(tag => tagIds.includes(tag.id))
}

export function findAgendaOtherLinkByType(type: AgendaOtherLink['type']) {
  return agendaOtherLinksMap.find(link => link.type === type)
}

export function getAllAgendaIds() {
  const flatAgendaData = Object.values(agendaData).flat()

  return flatAgendaData
    .filter(slot => slot.type === 'agenda')
    .flatMap(slot => Object.values(slot.agendas || {}))
    .filter(agenda => agenda.title !== '同步聯播')
    .map(agenda => agenda.id)
}
