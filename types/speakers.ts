import type { SocialLink } from './common'

export interface Speaker {
  id: string
  code: string
  displayName: string
  avatar: string
  jobTitle?: string
  socialLinks?: SocialLink[]
}
