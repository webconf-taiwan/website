import type { SocialLinkType } from './common'

export type SponsorType = 'sponsors' | 'specialSponsors' | 'organizers'

export interface Sponsor {
  name: string
  logo: string
  introduction: string
  recruitmentUrl?: string
  socialLinks: {
    type: SocialLinkType
    url: string
  }[]
}
