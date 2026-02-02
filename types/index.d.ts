export type AgendaTag
  = | 'Frontend'
    | 'Backend'
    | 'DevOps'
    | 'Security'
    | 'Agile'
    | 'AI'
    | '產品思維'
    | '產業應用'
    | '團隊管理'
    | '軟體設計'
    | '設計實務'
    | '工作坊'

export interface SpeakerInfo {
  name: string
  avatarUrl: string
  JobTitle: string
  speakerId: string
  order?: number
}

export type Speaker = SpeakerInfo & {
  tags?: AgendaTag[]
}

export interface Staff {
  name: string
  title: string
  avatarUrl: string
  links: readonly string[]
}

export interface AgendaItem {
  title: string
  speakerInfo?: SpeakerInfo[]
  tags?: AgendaTag[]
  day: '12' | '13'
  startTime: string
  endTime: string
  location: string
  space?: 1 | 2 | 3
  isCoStream?: boolean
}
