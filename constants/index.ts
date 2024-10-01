import type { Speaker } from '~/types/speakers'

export const appName = '2024 WebConf Taiwan 技術研討會'
export const appDescription = '本屆榮幸邀請到各領域專業講者，包含網站開發、前端設計、UIUX 以及團隊管理、軟性主題等各方面相關議題分享。希望能讓所有對 Web 開發、設計有熱情的人，共同創造一個充滿回憶與影響力的盛會！'

// Header－導航列連結
export const navLinks = [
  // {
  //   name: '議程',
  //   engName: 'AGENDA',
  //   href: '#',
  // },
  // {
  //   name: '講者',
  //   engName: 'SPEAKERS',
  //   href: '#',
  // },
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
  // {
  //   name: '籌備',
  //   engName: 'STAFF',
  //   href: '#',
  // },
  {
    name: '歷屆',
    engName: 'HISTORY',
    href: '#',
  },
]

export const speakers: Speaker[] = [
  {
    id: 'speaker_1',
    displayName: 'Mosky',
    avatar: '/speakers/avatar_mosky.png',
  },
  {
    id: 'speaker_2',
    displayName: '郭藺瑩 Lydia',
    avatar: '/speakers/avatar_lydia.png',
  },
  {
    id: 'speaker_3',
    displayName: '張文鈿 iHower',
    avatar: '/speakers/avatar_ihower.png',
  },
  {
    id: 'speaker_4',
    displayName: 'PJwang',
    avatar: '/speakers/avatar_pjwang.png',
  },
  {
    id: 'speaker_5',
    displayName: 'Kuro',
    avatar: '/speakers/avatar_kuro.png',
  },
  {
    id: 'speaker_6',
    displayName: '李德俊 (紅豆)',
    avatar: '/speakers/avatar_djlee.png',
  },
  {
    id: 'speaker_7',
    displayName: '高玉璁 Samuel',
    avatar: '/speakers/avatar_samuel.png',
  },
  {
    id: 'speaker_8',
    displayName: '林沅霖 Yuanlin Lin',
    avatar: '/speakers/avatar_yuanlin.png',
  },
  {
    id: 'speaker_9',
    displayName: 'Summer',
    avatar: '/speakers/avatar_summer.png',
  },
]

export const venueGoogleMapLink = 'https://maps.app.goo.gl/MbsHihMJY9Wkg1eF7'

export const accupassLink = 'https://www.accupass.com/event/2409191151131735941095'
