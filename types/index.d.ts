export type AgendaTag
  = | 'AI'
    | 'Frontend'
    | 'Backend'
    | 'Security'
    | '軟體設計'
    | '設計實務'
    | '產品思維'
    | '產業應用'
    | '團隊管理'
    | 'Agile'

export interface SpeakerInfo {
  name: string
  avatarUrl: string
}

export interface AgendaItem {
  title: string
  speakerInfo?: {
    name: string
    avatarUrl: string
  }[]
  tags?: AgendaTag[]
  day: '12' | '13'
  startTime: string
}
