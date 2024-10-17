import type { Speaker } from '~/types/speakers'

export interface AgendaTag {
  id: 'frontend' | 'backend' | 'uiux' | 'agile' | 'devops' | 'security' | 'ai' | 'team-management' | 'product-design' | 'design-ops'
  text: string
}

export interface AgendaItem {
  id: string
  title: string
  tags: AgendaTag['id'][]
  speakerCodes: Speaker['code'][]
}

export interface TimeSlot {
  startTime: string
  endTime: string
  type: 'agenda' | 'break'
  breakTitle?: string
  isBroadcast: boolean
  agendas?: {
    M?: AgendaItem
    F?: AgendaItem
    A2?: AgendaItem
  }
}

export interface DaySchedule {
  [date: string]: TimeSlot[]
}
