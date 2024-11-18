import type { SocialLinkType } from './common'

export interface Staff {
  name: string
  jobTitle?: string
  avatar: string
  socialLinks: {
    type: SocialLinkType
    url: string
  }[]
}
