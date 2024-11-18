import type { SocialLinkType } from '~/types/common'

export const appName = '2024 WebConf Taiwan 技術研討會'
export const appDescription = '本屆榮幸邀請到各領域專業講者，包含網站開發、前端設計、UIUX 以及團隊管理、軟性主題等各方面相關議題分享。希望能讓所有對 Web 開發、設計有熱情的人，共同創造一個充滿回憶與影響力的盛會！'

export const ogImageUrl = '/og-image.webp'

// Header－導航列連結
export const navLinks = [
  {
    name: '議程',
    engName: 'AGENDA',
    href: '/agenda',
  },
  {
    name: '講者',
    engName: 'SPEAKERS',
    href: '/speakers',
  },
  {
    name: '主辦',
    engName: 'STAFF',
    href: '/staff',
  },
  // {
  //   name: '場域',
  //   engName: 'VENUE',
  //   href: '#',
  // },
  {
    name: '贊助',
    engName: 'SPONSOR',
    href: '/sponsors',
  },
  // {
  //   name: '徵才',
  //   engName: 'RECRUIT',
  //   href: '#',
  // },

  {
    name: '歷屆',
    engName: 'HISTORY',
    href: '#',
  },
]

// Footer－聯絡資訊
export const contactInfos = [
  {
    trapezoidClass: 'trapezoid-top-left',
    iconName: 'heroicons:envelope',
    content: 'hi@webconf.tw',
    href: 'mailto:hi@webconf.tw',
  },
  {
    trapezoidClass: 'trapezoid-top-right',
    iconName: 'iconoir:facebook',
    content: 'WebConf Taiwan',
    href: 'https://www.facebook.com/WebConfTaiwan/?locale=zh_TW',
  },
]

// 社群連結 Map
export const socialIconMap: Record<SocialLinkType, string> = {
  website: 'heroicons:globe-alt',
  facebook: 'iconoir:facebook',
  x: 'iconoir:x',
  instagram: 'iconoir:instagram',
  thread: 'i-iconoir:threads',
  youtube: 'i-iconoir:youtube',
  medium: 'i-uil:medium-m',
  linkedin: 'i-uil:linkedin',
}

// 歷屆連結
export const historyLinks = [
  {
    name: '2013',
    href: 'https://2013.webconf.tw/',
  },
  {
    name: '2023',
    href: 'https://2023.webconf.tw/',
  },
]

// 場地 Google Map 連結
export const venueGoogleMapLink = 'https://maps.app.goo.gl/MbsHihMJY9Wkg1eF7'

// Accupass 連結
export const accupassLink = 'https://www.accupass.com/event/2409191151131735941095'
