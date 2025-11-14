import type { AgendaItem, AgendaTag, SpeakerInfo } from '~/types'

export const AGENDA_LIST: AgendaItem[] = [
  // 12/12 09:10 - 09:55
  {
    title: 'B2B 服務的 AI Agent 產品設計原則',
    speakerInfo: [
      {
        name: '李昆謀',
        avatarUrl: '/images/speakers/1_李昆謀.webp',
        JobTitle: '91APP / 產品長',
        speakerId: '1',
        order: 7,
      },
    ],
    tags: ['AI', '產品思維', '產業應用', '團隊管理'],
    day: '12',
    startTime: '09:10',
    endTime: '09:55',
    location: 'A2 棟',
  },
  {
    title: '同步聯播',
    day: '12',
    startTime: '09:10',
    endTime: '09:55',
    location: 'M 棟',
  },
  {
    title: '同步聯播',
    day: '12',
    startTime: '09:10',
    endTime: '09:55',
    location: 'F 棟',
  },
  // 12/12 10:05 - 10:50
  {
    title: 'AI 時代下， Product Sense 就是你的秘密武器',
    speakerInfo: [
      {
        name: '陳偉仁',
        avatarUrl: '/images/speakers/3_陳偉仁_Chris_Chen.webp',
        JobTitle: 'PicCollage 拼貼趣 / 資深產品設計經理',
        speakerId: '3',
        order: 8,
      },
      {
        name: '黃庭亞',
        avatarUrl: '/images/speakers/4_黃庭亞-Yaya.webp',
        JobTitle: 'PicCollage 拼貼趣 / 資深產品設計師',
        speakerId: '4',
        order: 9,
      },
    ],
    tags: ['AI', '產品思維', '設計實務'],
    day: '12',
    startTime: '10:05',
    endTime: '10:50',
    location: 'A2 棟',
  },
  {
    title: 'TBD',
    day: '12',
    startTime: '10:05',
    endTime: '10:50',
    location: 'M 棟',
  },
  {
    title: 'TBD',
    day: '12',
    startTime: '10:05',
    endTime: '10:50',
    location: 'F 棟',
  },
  // 12/12 11:00 - 11:45
  {
    title: 'AI時代下， 如何運用數據幫助產品發揮影響力',
    speakerInfo: [
      {
        name: '姜乃文',
        avatarUrl: '/images/speakers/5_姜乃文.webp',
        JobTitle: '天下雜誌集團 / 主任分析師',
        speakerId: '5',
        order: 26,
      },
    ],
    tags: ['AI', '產品思維', '產業應用', '團隊管理'],
    day: '12',
    startTime: '11:00',
    endTime: '11:45',
    location: 'A2 棟',
  },
  {
    title: 'AI 只懂 React？Vue.js 也能 Vibe Coding！',
    speakerInfo: [
      {
        name: 'Kuro Hsu',
        avatarUrl: '/images/speakers/38_KURO.webp',
        JobTitle: 'Vue.js Taiwan / Community Organizer',
        speakerId: '38',
        order: 6,
      },
    ],
    tags: ['Frontend', 'AI'],
    day: '12',
    startTime: '11:00',
    endTime: '11:45',
    location: 'M 棟',
  },
  {
    title: '走在同業前面：國泰的雲端轉型洞察與啟示',
    speakerInfo: [
      {
        name: '顏勝豪 Otto',
        avatarUrl: '/images/speakers/13_顏勝豪_Otto.webp',
        JobTitle: '國泰金控 / 協理',
        speakerId: '13',
        order: 13,
      },
    ],
    tags: ['AI', '產業應用'],
    day: '12',
    startTime: '11:00',
    endTime: '11:45',
    location: 'F 棟',
  },
  // 12/12 11:55 - 12:40
  {
    title: '產品 OKR 的訂立與 Roadmap 展開',
    speakerInfo: [
      {
        name: '曾友志',
        avatarUrl: '/images/speakers/6_曾友志.webp',
        JobTitle: '下午先生有限公司 / 資深產品顧問',
        speakerId: '6',
        order: 25,
      },
    ],
    tags: ['產品思維', '團隊管理'],
    day: '12',
    startTime: '11:55',
    endTime: '12:40',
    location: 'A2 棟',
  },
  {
    title: '零基礎打造 400 萬用戶，我們犯了哪些錯誤',
    speakerInfo: [
      {
        name: 'Max Chen',
        avatarUrl: '/images/speakers/10_Max_Chen.webp',
        JobTitle: '對稱資訊股份有限公司、面試趣 / CEO',
        speakerId: '10',
        order: 12,
      },
    ],
    tags: ['產品思維', '產業應用'],
    day: '12',
    startTime: '11:55',
    endTime: '12:40',
    location: 'M 棟',
  },
  {
    title: 'TBD',
    day: '12',
    startTime: '11:55',
    endTime: '12:40',
    location: 'F 棟',
  },
  // 12/12 13:30 - 14:15
  {
    title: '當 Product Mindset 走出產品設計：跨界的設計影響力',
    speakerInfo: [
      {
        name: '周明璇（小紫）',
        avatarUrl: '/images/speakers/7_周明璇(Zizi Chou，小紫).webp',
        JobTitle: '財團法人均一平台教育基金會 / 影響力評估設計師',
        speakerId: '7',
        order: 35,
      },
    ],
    tags: ['AI', '產品思維', '團隊管理'],
    day: '12',
    startTime: '13:30',
    endTime: '14:15',
    location: 'A2 棟',
  },
  {
    title: '深入淺出 Playwright Agent 代理人模式',
    speakerInfo: [
      {
        name: '保哥 Will',
        avatarUrl: '/images/speakers/2_Will_保哥.webp',
        JobTitle: '多奇數位創意 / 技術總監',
        speakerId: '2',
        order: 1,
      },
    ],
    tags: ['Frontend', 'AI'],
    day: '12',
    startTime: '13:30',
    endTime: '14:15',
    location: 'M 棟',
  },
  {
    title: '同步聯播',
    day: '12',
    startTime: '13:30',
    endTime: '14:15',
    location: 'F 棟',
  },
  // 12/12 14:25 - 15:10
  {
    title: '從研究到上線：全流程設計與 AI 協作專案實戰',
    speakerInfo: [
      {
        name: 'Niki Liu',
        avatarUrl: '/images/speakers/8_Niki_Liu.webp',
        JobTitle: '新加坡商鈦坦科技 / Senior Product Designer',
        speakerId: '8',
        order: 29,
      },
    ],
    tags: ['AI', '產品思維', '設計實務'],
    day: '12',
    startTime: '14:25',
    endTime: '15:10',
    location: 'A2 棟',
  },
  {
    title: 'TBD',
    day: '12',
    startTime: '14:25',
    endTime: '15:10',
    location: 'M 棟',
  },
  {
    title: '工程師和 AI 小隊，是合作、競爭、混亂？',
    speakerInfo: [
      {
        name: '蕭晊莛',
        avatarUrl: '/images/speakers/14_蕭晊莛.webp',
        JobTitle: 'Titansoft / Technical Manager',
        speakerId: '14',
        order: 34,
      },
    ],
    tags: ['Backend', 'DevOps', 'AI'],
    day: '12',
    startTime: '14:25',
    endTime: '15:10',
    location: 'F 棟',
  },
  // 12/12 15:20 - 16:05
  {
    title: '從設計到共識：悠識如何在每一次新專案裡，用溝通建立信任關係',
    speakerInfo: [
      {
        name: '林星妤',
        avatarUrl: '/images/speakers/33_林星妤.webp',
        JobTitle: '悠識數位 / Senior Experience Designer',
        speakerId: '33',
        order: 31,
      },
      {
        name: '黃明硯',
        avatarUrl: '/images/speakers/34_黃明硯.webp',
        JobTitle: '悠識數位 / Experience Designer',
        speakerId: '34',
        order: 32,
      },
    ],
    tags: ['產品思維', '設計實務'],
    day: '12',
    startTime: '15:20',
    endTime: '16:05',
    location: 'A2 棟',
  },
  {
    title: '從使用者到工程師：AI 在企業怎麼落地？',
    speakerInfo: [
      {
        name: '黃琇琳 Shirney Huang',
        avatarUrl: '/images/speakers/11_Shirney_Huang 黃琇琳.webp',
        JobTitle: 'Aiworks / CEO',
        speakerId: '11',
        order: 21,
      },
    ],
    tags: ['AI'],
    day: '12',
    startTime: '15:20',
    endTime: '16:05',
    location: 'M 棟',
  },
  {
    title: 'React 優化實戰分析 - 掌握 React 進階技術 x 底層思維',
    speakerInfo: [
      {
        name: 'ThisWeb (Kun)',
        avatarUrl: '/images/speakers/32_ThisWeb (Kun).webp',
        JobTitle: 'ThisWeb / 前端工程師',
        speakerId: '32',
        order: 16,
      },
    ],
    tags: ['Frontend'],
    day: '12',
    startTime: '15:20',
    endTime: '16:05',
    location: 'F 棟',
  },
  // 12/12 16:15 - 17:00
  {
    title: '敏捷環境中的產品經理生存之道：以產品思維實現價值與成果',
    speakerInfo: [
      {
        name: 'Jenson Lee',
        avatarUrl: '/images/speakers/9_Jenson_Lee.webp',
        JobTitle: '台灣敏捷協會 / 理事長',
        speakerId: '9',
        order: 30,
      },
    ],
    tags: ['Agile', '產品思維'],
    day: '12',
    startTime: '16:15',
    endTime: '17:00',
    location: 'A2 棟',
  },
  {
    title: '對微前端的美好想像',
    speakerInfo: [
      {
        name: 'Eric Lee',
        avatarUrl: '/images/speakers/12_Eric_Lee.webp',
        JobTitle: '前端輕鬆聊 / Senior Software Engineer',
        speakerId: '12',
        order: 18,
      },
    ],
    tags: ['Frontend', '軟體設計'],
    day: '12',
    startTime: '16:15',
    endTime: '17:00',
    location: 'M 棟',
  },
  {
    title: '寫了幾年 Code，然後呢？軟體工程師必須重新認識的 DevOps',
    speakerInfo: [
      {
        name: '陳正瑋（艦長）',
        avatarUrl: '/images/speakers/16_陳正瑋(艦長).webp',
        JobTitle: 'Athemaster 炬識科技 / Technical consultant',
        speakerId: '16',
        order: 19,
      },
    ],
    tags: ['DevOps', 'Agile', '產品思維', '軟體設計'],
    day: '12',
    startTime: '16:15',
    endTime: '17:00',
    location: 'F 棟',
  },
  // 12/13 09:00 - 09:45
  {
    title: '掌握田野中的「人」：真實場域研究的人際溝通與信任建立',
    speakerInfo: [
      {
        name: 'Joey',
        avatarUrl: '/images/speakers/19_Joey.webp',
        JobTitle: '引鹿創新體驗研究室 / UX總監',
        speakerId: '19',
        order: 22,
      },
    ],
    tags: ['團隊管理', '設計實務'],
    day: '13',
    startTime: '09:00',
    endTime: '09:45',
    location: 'A2 棟',
  },
  {
    title: '從冷知識到漏洞：你不懂的 Web，駭客懂',
    speakerInfo: [
      {
        name: 'Huli',
        avatarUrl: '/images/speakers/17_Huli.webp',
        JobTitle: '技術部落格 Huli\'s blog / 站長',
        speakerId: '17',
        order: 4,
      },
    ],
    tags: ['Frontend', 'Backend', 'Security'],
    day: '13',
    startTime: '09:00',
    endTime: '09:45',
    location: 'M 棟',
  },
  {
    title: '同步聯播',
    day: '13',
    startTime: '09:00',
    endTime: '09:45',
    location: 'F 棟',
  },
  // 12/13 10:00 - 10:45
  {
    title: '別再瞎忙了！讓 AI 幫產品團隊找到對的問題',
    speakerInfo: [
      {
        name: 'Peter Su',
        avatarUrl: '/images/speakers/20_Peter_Su.webp',
        JobTitle: '漸強實驗室 / Product Lead',
        speakerId: '20',
        order: 10,
      },
    ],
    tags: ['Agile', 'AI', '產品思維', '團隊管理'],
    day: '13',
    startTime: '10:00',
    endTime: '10:45',
    location: 'A2 棟',
  },
  {
    title: '讓 CSS 動畫提升你的網站使用者體驗',
    speakerInfo: [
      {
        name: '李建杭 Amos',
        avatarUrl: '/images/speakers/41_Amos李建杭.webp',
        JobTitle: '友達光電 / 工程經理',
        speakerId: '41',
        order: 36,
      },
    ],
    tags: ['Frontend', 'AI', '設計實務'],
    day: '13',
    startTime: '10:00',
    endTime: '10:45',
    location: 'M 棟',
  },
  {
    title: '如何做到真正有效的技術領導：實用技巧篇',
    speakerInfo: [
      {
        name: 'Jocelin Ho',
        avatarUrl: '/images/speakers/30_Jocelin_Ho.webp',
        JobTitle: 'PicCollage 拼貼趣 / Engineering Manager',
        speakerId: '30',
        order: 24,
      },
    ],
    tags: ['Agile', '團隊管理'],
    day: '13',
    startTime: '10:00',
    endTime: '10:45',
    location: 'F 棟',
  },
  // 12/13 10:55 - 11:40
  {
    title: '以打詐為例，服務設計如何讓公共數位服務有感',
    speakerInfo: [
      {
        name: '卓致遠',
        avatarUrl: '/images/speakers/21_卓致遠.webp',
        JobTitle: '致遠體驗設計 / 體驗總監',
        speakerId: '21',
        order: 20,
      },
    ],
    tags: ['產品思維', '設計實務'],
    day: '13',
    startTime: '10:55',
    endTime: '11:40',
    location: 'A2 棟',
  },
  {
    title: '鍵盤救國：解決社會性問題的工程師',
    speakerInfo: [
      {
        name: '吳展瑋',
        avatarUrl: '/images/speakers/26_吳展瑋 Howard.webp',
        JobTitle: '好想工作室 / 創辦人',
        speakerId: '26',
        order: 27,
      },
    ],
    tags: ['產品思維', '產業應用', '軟體設計'],
    day: '13',
    startTime: '10:55',
    endTime: '11:40',
    location: 'M 棟',
  },
  {
    title: '軟體開發邪教的救贖：AI 時代更應掌握的 TDD 技能',
    speakerInfo: [
      {
        name: 'Kuma Syu',
        avatarUrl: '/images/speakers/15_Kuma_Syu.webp',
        JobTitle: '緯雲有限公司 / R&D Manager',
        speakerId: '15',
        order: 11,
      },
    ],
    tags: ['AI', '產品思維', '軟體設計'],
    day: '13',
    startTime: '10:55',
    endTime: '11:40',
    location: 'F 棟',
  },
  // 12/13 11:50 - 12:35
  {
    title: '服務設計師的傳說：90% 的時間在讓設計發生',
    speakerInfo: [
      {
        name: '郭心喻',
        avatarUrl: '/images/speakers/22_郭心喻.webp',
        JobTitle: 'Government of Nova Scotia 加拿大新斯科舍省政府 / Senior Service Designer',
        speakerId: '22',
        order: 14,
      },
    ],
    tags: ['產品思維', '產業應用', '軟體設計', '設計實務'],
    day: '13',
    startTime: '11:50',
    endTime: '12:35',
    location: 'A2 棟',
  },
  {
    title: 'GenAI 時代下的測試三板斧',
    speakerInfo: [
      {
        name: '柯仁傑',
        avatarUrl: '/images/speakers/27_柯仁傑.webp',
        JobTitle: 'Odd-e / Technical Coach',
        speakerId: '27',
        order: 23,
      },
    ],
    tags: ['軟體設計'],
    day: '13',
    startTime: '11:50',
    endTime: '12:35',
    location: 'M 棟',
  },
  {
    title: '願 Web API 原力與你同在',
    speakerInfo: [
      {
        name: 'MUKI',
        avatarUrl: '/images/speakers/31_MUKI.webp',
        JobTitle: 'MUKI space* / 前端工程師',
        speakerId: '31',
        order: 33,
      },
    ],
    tags: ['Frontend', 'AI'],
    day: '13',
    startTime: '11:50',
    endTime: '12:35',
    location: 'F 棟',
  },
  // 12/13 13:30 - 14:15
  {
    title: '培養十倍速 PM：從工具到習慣',
    speakerInfo: [
      {
        name: '趙柏強',
        avatarUrl: '/images/speakers/23_趙柏強.webp',
        JobTitle: 'Stable Progress / Growth Companion',
        speakerId: '23',
        order: 28,
      },
    ],
    tags: ['Agile', 'AI', '產品思維', '團隊管理'],
    day: '13',
    startTime: '13:30',
    endTime: '14:15',
    location: 'A2 棟',
  },
  {
    title: '實戰 AI Agents 應用開發: 從 Web 後端到前端的整合',
    speakerInfo: [
      {
        name: '張文鈿 ihower',
        avatarUrl: '/images/speakers/42_張文鈿_ihower.webp',
        JobTitle: '愛好資訊科技有限公司 / 負責人',
        speakerId: '42',
        order: 37,
      },
    ],
    tags: ['AI'],
    day: '13',
    startTime: '13:30',
    endTime: '14:15',
    location: 'M 棟',
  },
  {
    title: '同步聯播',
    day: '13',
    startTime: '13:30',
    endTime: '14:15',
    location: 'F 棟',
  },
  // 12/13 14:25 - 15:10
  {
    title: '轉職 PM 之後，我獨自升級：為產品開發世界獻上美好洞察',
    speakerInfo: [
      {
        name: 'Kaba Su',
        avatarUrl: '/images/speakers/24_Kaba_Su.webp',
        JobTitle: '台灣互動設計協會 IxDA Taiwan / 前理事',
        speakerId: '24',
        order: 17,
      },
    ],
    tags: ['AI', '產品思維', '團隊管理', '設計實務'],
    day: '13',
    startTime: '14:25',
    endTime: '15:10',
    location: 'A2 棟',
  },
  {
    title: '程式碼與尿布：媽媽工程師的生存指南',
    speakerInfo: [
      {
        name: 'Hannah Lin',
        avatarUrl: '/images/speakers/28_hannah.webp',
        JobTitle: 'Remote / Frontend',
        speakerId: '28',
        order: 3,
      },
    ],
    tags: ['Frontend'],
    day: '13',
    startTime: '14:25',
    endTime: '15:10',
    location: 'M 棟',
  },
  {
    title: '從 Side Project 到開源生態：FinMind 的資料工程之路',
    speakerInfo: [
      {
        name: '林子軒 Sam',
        avatarUrl: '/images/speakers/35_林子軒_Sam.webp',
        JobTitle: '藝啟股份有限公司 / Data Engineer Manager',
        speakerId: '35',
        order: 38,
      },
    ],
    tags: ['軟體設計', '設計實務'],
    day: '13',
    startTime: '14:25',
    endTime: '15:10',
    location: 'F 棟',
  },
  // 12/13 15:20 - 16:05
  {
    title: '座談｜從設計到產品管理：AI 浪潮下的角色轉變與價值重構',
    speakerInfo: [
      {
        name: '蔡明哲',
        avatarUrl: '/images/speakers/25_Richard_Tsai_蔡明哲.webp',
        JobTitle: 'UX Coach 暨創辦人',
        speakerId: '00',
        order: 15,
      },
      {
        name: '趙柏強',
        avatarUrl: '/images/speakers/23_趙柏強.webp',
        JobTitle: 'Growth Companion',
        speakerId: '23',
        order: 28,
      },
      {
        name: 'Kaba Su',
        avatarUrl: '/images/speakers/24_Kaba_Su.webp',
        JobTitle: '台灣互動設計協會 IxDA Taiwan / 前理事',
        speakerId: '24',
        order: 17,
      },
    ],
    tags: ['AI', '設計實務', '產品思維', '團隊管理'],
    day: '13',
    startTime: '15:20',
    endTime: '16:05',
    location: 'A2 棟',
  },
  {
    title: '大 AI 時代，工程師的成長之路 - 從 Junior 到 Staff',
    speakerInfo: [
      {
        name: '奶綠茶',
        avatarUrl: '/images/speakers/29_奶綠.webp',
        JobTitle: 'PositiveGrid / Staff Frontend Engineer',
        speakerId: '29',
        order: 5,
      },
    ],
    tags: ['Frontend'],
    day: '13',
    startTime: '15:20',
    endTime: '16:05',
    location: 'M 棟',
  },
  {
    title: '初探 LLM 可觀測性：打造可持續擴展的 AI 系統',
    speakerInfo: [
      {
        name: 'Mike Hsu',
        avatarUrl: '/images/speakers/43_Mike_Hsu.webp',
        JobTitle: 'OpenNet / DevOps',
        speakerId: '43',
        order: 39,
      },
    ],
    tags: ['Backend', 'DevOps', 'AI'],
    day: '13',
    startTime: '15:20',
    endTime: '16:05',
    location: 'F 棟',
  },
  // 12/13 16:15 - 17:00
  {
    title: '活在科技工作者最好的年代，用商業思維優化你的人生選擇',
    speakerInfo: [
      {
        name: 'Gipi',
        avatarUrl: '/images/speakers/18_游舒帆_Gipi.webp',
        JobTitle: '商業思維學院 / 院長',
        speakerId: '18',
        order: 2,
      },
    ],
    tags: ['AI', '產品思維', '軟體設計'],
    day: '13',
    startTime: '16:15',
    endTime: '17:00',
    location: 'A2 棟',
  },
  {
    title: '同步聯播',
    day: '13',
    startTime: '16:15',
    endTime: '17:00',
    location: 'M 棟',
  },
  {
    title: '同步聯播',
    day: '13',
    startTime: '16:15',
    endTime: '17:00',
    location: 'F 棟',
  },
]

export const BACK_LINKS = {
  agendas:
   {
     title: '返回議程列表',
     link: '/agendas',
   },
  speakers:
  {
    title: '返回講者列表',
    link: '/speakers',
  },
} as const

export const SPEAKERS = AGENDA_LIST.reduce<Array<
  SpeakerInfo & {
    tags: AgendaTag[]
  }
>>((acc, agenda) => {
  if (agenda.speakerInfo && agenda.speakerInfo.length > 0) {
    const tags = agenda.tags || []

    agenda.speakerInfo.forEach((speaker) => {
      const existingSpeaker = acc.find(s => s.speakerId === speaker.speakerId)
      if (!existingSpeaker) {
        acc.push({
          name: speaker.name,
          avatarUrl: speaker.avatarUrl,
          JobTitle: speaker.JobTitle,
          speakerId: speaker.speakerId,
          order: speaker.order,
          tags,
        })
      }
    })
  }

  return acc
}, []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
