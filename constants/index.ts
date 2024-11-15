import type { SocialLinkType } from '~/types/speakers'

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
  // {
  //   name: '贊助',
  //   engName: 'SPONSOR',
  //   href: '#',
  // },
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

// 主辦團隊
export const staffData = [
  {
    name: '高見龍',
    jobTitle: '掃地兼敲鐘',
    avatar: 'https://picsum.photos/200/200',
    socialLinks: [],
  },
  {
    name: '廖洧杰',
    jobTitle: '專業推坑王',
    avatar: 'https://picsum.photos/200/200',
    socialLinks: [
      {
        type: 'facebook',
        url: 'https://www.facebook.com/sfismy',
      },
    ],
  },
  {
    name: '理查哥',
    jobTitle: 'UX 土地公',
    avatar: '/staff/Richard.jpg',
    socialLinks: [],
  },
  {
    name: '陳彥宇',
    jobTitle: '年度視覺擔當',
    avatar: 'https://picsum.photos/200/200',
    socialLinks: [],
  },
  {
    name: '豪萱',
    jobTitle: '設計小夥伴',
    avatar: '/staff/豪萱.jpg',
    socialLinks: [
      {
        type: 'facebook',
        url: 'https://www.facebook.com/zyi870213',
      },
    ],
  },
  {
    name: 'EG',
    jobTitle: '設計小夥伴',
    avatar: 'https://picsum.photos/200/200',
    socialLinks: [
      {
        type: 'facebook',
        url: 'https://www.facebook.com/eg.pan',
      },
    ],
  },
  {
    name: 'Nina',
    jobTitle: '設計小夥伴',
    avatar: '/staff/Nina.jpg',
    socialLinks: [],
  },
  {
    name: '楊正弘',
    jobTitle: '設計小夥伴',
    avatar: 'https://picsum.photos/200/200',
    socialLinks: [
      {
        type: 'instagram',
        url: 'https://www.instagram.com/helloscott23050000/',
      },
    ],
  },

  {
    name: '哲樺｜Frank',
    jobTitle: '開發小農夫',
    avatar: '/staff/Frank.jpg',
    socialLinks: [
      {
        type: 'linkedin',
        url: 'https://www.linkedin.com/in/%E5%93%B2%E6%A8%BA-frank/',
      },
      {
        type: 'instagram',
        url: 'https://www.instagram.com/chu_chehua/',
      },
      {
        type: 'website',
        url: 'https://frank-code-world.com.tw/',
      },
    ],
  },
  {
    name: 'Tim',
    jobTitle: '開發小農夫',
    avatar: 'https://picsum.photos/200/200',
    socialLinks: [],
  },
  {
    name: '薛羽婷',
    jobTitle: '設計軌講者獵人',
    avatar: '/staff/羽婷.jpg',
    socialLinks: [],
  },
  {
    name: 'Sabrina',
    jobTitle: '活動工頭',
    avatar: 'https://picsum.photos/200/200',
    socialLinks: [],
  },

  {
    name: 'Melissa',
    jobTitle: '錢錢擔當',
    avatar: 'https://picsum.photos/200/200',
    socialLinks: [],
  },
]
