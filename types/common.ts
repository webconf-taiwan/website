export type SocialLinkType = 'facebook' | 'x' | 'instagram' | 'website' | 'youtube' | 'thread' | 'medium' | 'linkedin'

export interface SocialLink {
  type: SocialLinkType
  url: string
}
