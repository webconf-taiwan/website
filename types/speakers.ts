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

export type SocialLinkType = 'facebook' | 'x' | 'website' | 'instagram'
