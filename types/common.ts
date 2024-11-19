export type SocialLinkType = 'facebook' | 'x' | 'instagram' | 'website' | 'youtube' | 'thread' | 'medium' | 'linkedin'

export interface SocialLinks {
  type: SocialLinkType
  url: string
}
