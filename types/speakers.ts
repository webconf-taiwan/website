import type { SocialLinkType } from './common'

export interface Speaker {
  id: string
  code: string
  displayName: string
  avatar: string
  jobTitle?: string
  socialLinks?: {
    type: SocialLinkType
    url: string
  }[]
}
