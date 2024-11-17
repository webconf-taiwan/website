import type { MarkdownParsedContent } from '@nuxt/content'
import type { SocialLinkType } from '~/types/speakers'

export interface AgendaTag {
  id: 'frontend' | 'backend' | 'uiux' | 'agile' | 'devops' | 'security' | 'ai' | 'team-management' | 'product-design' | 'design-ops'
  text: string
}

export interface AgendaOtherLinksMap {
  type: 'note' | 'slide'
  icon: string
  text: string
}

export interface AgendaOtherLink {
  type: AgendaOtherLinksMap['type']
  href: string
}

export interface AgendaItem {
  id: string
  title: string
  tags: AgendaTag['id'][]
  isWorkshop?: boolean
  speakerCodes: string[]
  otherLinks?: {
    type: 'note' | 'slide'
    href: string
  }[]
}

export type AgendaLocation = 'M' | 'F' | 'A2'

export interface TimeSlot {
  startTime: string
  endTime: string
  type: 'agenda' | 'break' | 'disseminate'
  title?: string
  isBroadcast: boolean
  agendas?: Partial<Record<AgendaLocation, AgendaItem>>
}

export interface DaySchedule {
  [date: string]: TimeSlot[]
}

export interface AgendaDrawerRenderData {
  speakerName: string
  speakerAvatar: string
  agendaTitle: string
  jobTitle: string
  socialLinks: { type: SocialLinkType, url: string }[] | []
  agendaOtherLinks: AgendaOtherLink[]
  agendaTags: AgendaTag['id'][]
}

export interface ParsedAgendaData extends MarkdownParsedContent {
  title: string
  date: string
  startTime: string
  endTime: string
  location: AgendaLocation
  isWorkshop?: boolean
  tags: AgendaTag['id'][]
  speakerCodes: string[]
}
