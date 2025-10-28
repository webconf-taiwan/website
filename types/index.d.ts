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

export interface SpeakerInfo {
  name: string
  avatarUrl: string
}

export interface AgendaItem {
  title: string | '同步聯播'
  speakerInfo?: {
    name: string
    avatarUrl: string
  }[]
  tags?: AgendaTag[]
  day: '12' | '13'
  startTime: string
  endTime: string
  location: string
}
