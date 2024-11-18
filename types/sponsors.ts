import type { SocialLinkType } from './common'

export type SponsorType = 'sponsor' | 'specialSponsor' | 'organizer'

export interface Sponsor {
  name: string
  logo: string
  introduction: string
  recruitmentUrl?: string
  socialLinks?: {
    type: SocialLinkType
    url: string
  }[]
}
