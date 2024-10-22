export interface AgendaTag {
  id: 'frontend' | 'backend' | 'uiux' | 'agile' | 'devops' | 'security' | 'ai' | 'team-management' | 'product-design' | 'design-ops'
  text: string
}

export interface AgendaItem {
  id: string
  title: string
  tags: AgendaTag['id'][]
  speakerCodes: string[]
}

export type AgendaLocation = 'M' | 'F' | 'A2'

export interface TimeSlot {
  startTime: string
  endTime: string
  type: 'agenda' | 'break'
  breakTitle?: string
  isBroadcast: boolean
  agendas?: Partial<Record<AgendaLocation, AgendaItem>>
}

export interface DaySchedule {
  [date: string]: TimeSlot[]
}
