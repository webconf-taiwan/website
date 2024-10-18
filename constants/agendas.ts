import type {
  AgendaTag,
  DaySchedule,
} from '~/types/agendas'

export const agendaTags: AgendaTag[] = [
  { id: 'frontend', text: 'FRONTEND' },
  { id: 'backend', text: 'BACKEND' },
  { id: 'uiux', text: 'UI / UX' },
  { id: 'agile', text: 'AGILE' },
  { id: 'devops', text: 'DEVOPS' },
  { id: 'security', text: 'SECURITY' },
  { id: 'ai', text: 'AI' },
  { id: 'team-management', text: '團隊管理' },
  { id: 'product-design', text: '產品設計' },
  { id: 'design-ops', text: 'DESIGNOPS' },
]

export const agendaData: DaySchedule = {
  '2024-12-27': [
    {
      startTime: '09:00',
      endTime: '09:45',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        M: {
          id: '1227-1-m',
          title: 'TBD',
          tags: [],
          speakerCodes: ['ihower'],
        },
        F: {
          id: '1227-1-f',
          title: 'TBD',
          tags: [],
          speakerCodes: [],
        },
        A2: {
          id: '1227-1-a2',
          title: '串連品牌從實體到數位的體驗',
          tags: ['uiux'],
          speakerCodes: ['weikan'],
        },
      },
    },
    {
      startTime: '10:05',
      endTime: '10:50',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        M: {
          id: '1227-2-m',
          title: '個人專案到產品：善用 AI 工具打造可盈利產品',
          tags: ['frontend', 'backend', 'agile', 'product-design'],
          speakerCodes: ['pjwang'],
        },
        F: {
          id: '1227-2-f',
          title: 'TBD',
          tags: ['devops'],
          speakerCodes: ['weithenn'],
        },
        A2: {
          id: '1227-2-a2',
          title: 'TBD',
          tags: ['uiux', 'team-management'],
          speakerCodes: ['samuel'],
        },
      },
    },
    {
      startTime: '11:00',
      endTime: '11:45',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        M: {
          id: '1227-3-m',
          title: 'TBD',
          tags: ['frontend'],
          speakerCodes: ['summer'],
        },
        F: {
          id: '1227-3-f',
          title: 'TBD',
          tags: [],
          speakerCodes: ['yourator'],
        },
        A2: {
          id: '1227-3-a2',
          title: '結合品牌策略與用戶需求，翻轉品牌印象，打造更具競爭力的產品體驗',
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['iris'],
        },
      },
    },
    {
      startTime: '11:55',
      endTime: '12:40',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        M: {
          id: '1227-4-m',
          title: '從技術專才到領導者: 1 到 100 人的管理之路',
          tags: ['team-management'],
          speakerCodes: ['singz'],
        },
        F: {
          id: '1227-4-f',
          title: 'TBD',
          tags: ['product-design', 'team-management'],
          speakerCodes: ['nic'],
        },
        A2: {
          id: '1227-4-a2',
          title: '設計很豐滿，開發很骨感 — 淺談設計交付',
          tags: ['frontend', 'uiux', 'product-design', 'team-management'],
          speakerCodes: ['rei'],
        },
      },
    },
    {
      startTime: '12:40',
      endTime: '13:30',
      type: 'break',
      breakTitle: '午餐時間',
      isBroadcast: false,
    },
    {
      startTime: '13:30',
      endTime: '14:15',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        M: {
          id: '1227-5-m',
          title: '有限狀態機與 RxJS',
          tags: ['frontend'],
          speakerCodes: ['milkmidi'],
        },
        F: {
          id: '1227-5-f',
          title: '出版一本賣得出去的程式技術書籍：內容構思、排版設計、行銷與影響力',
          tags: ['frontend'],
          speakerCodes: ['zet'],
        },
        A2: {
          id: '1227-5-a2',
          title: '從專注細節到全局掌控：工程師轉職產品經理的心態與轉變',
          tags: ['agile', 'product-design', 'team-management'],
          speakerCodes: ['lindsay'],
        },
      },
    },
    {
      startTime: '14:25',
      endTime: '15:10',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        M: {
          id: '1227-6-m',
          title: '《天下》如何思考數位敘事？從流程到技術大公開',
          tags: ['frontend', 'uiux', 'team-management'],
          speakerCodes: ['stevenyeo'],
        },
        F: {
          id: '1227-6-f',
          title: '在現有軟體服務中整合 Copilot 功能：Context 與 UI 的新挑戰',
          tags: ['frontend', 'backend', 'uiux'],
          speakerCodes: ['kewang'],
        },
        A2: {
          id: '1227-6-a2',
          title: '產品 AI 整合路徑：分階段為現有產品找到最佳 AI 整合方案',
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['wylin'],
        },
      },
    },
    {
      startTime: '15:20',
      endTime: '16:05',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        M: {
          id: '1227-7-m',
          title: 'TBD',
          tags: [],
          speakerCodes: ['tonyq'],
        },
        F: {
          id: '1227-7-f',
          title: 'AI、Data 與 Web，跨領域的資料科學工作者之路',
          tags: ['frontend', 'backend'],
          speakerCodes: ['dscareer'],
        },
        A2: {
          id: '1227-7-a2',
          title: '從商業策略出發的產品、服務體驗設計：以 USPACE 產品為例',
          tags: ['frontend', 'agile', 'uiux', 'product-design', 'team-management'],
          speakerCodes: ['doppler'],
        },
      },
    },
    {
      startTime: '16:15',
      endTime: '17:00',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        M: {
          id: '1227-8-m',
          title: 'AI+商業思維：軟體工程師如何擁抱趨勢，提升職場價值',
          tags: ['team-management'],
          speakerCodes: ['gipi'],
        },
        F: {
          id: '1227-8-f',
          title: 'Zeabur：雲端部署平台 PaaS 核心技術大揭秘',
          tags: ['frontend', 'backend', 'devops'],
          speakerCodes: ['yuanlin'],
        },
        A2: {
          id: '1227-8-a2',
          title: '覺察與共情：如何在一對一中激發團隊潛能',
          tags: ['uiux', 'team-management'],
          speakerCodes: ['ivanwei'],
        },
      },
    },
    {
      startTime: '17:00',
      endTime: '00:00',
      type: 'break',
      breakTitle: '明天見',
      isBroadcast: false,
    },
  ],
  '2024-12-28': [
    {
      startTime: '09:00',
      endTime: '09:45',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        M: {
          id: '1228-1-m',
          title: 'TBD',
          tags: ['frontend', 'backend', 'agile', 'devops'],
          speakerCodes: ['mosky'],
        },
        F: {
          id: '1228-1-f',
          title: '實戰！以 Web 3D 技術開發商品客製編輯器',
          tags: ['frontend', 'uiux'],
          speakerCodes: ['gugu'],
        },
        A2: {
          id: '1228-1-a2',
          title: '工作坊＋AI ：創意又高效的規劃執行',
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['djlee'],
        },
      },
    },
    {
      startTime: '09:55',
      endTime: '10:40',
      type: 'agenda',
      isBroadcast: true,
      agendas: {
        M: {
          id: '1228-2-m',
          title: '擁抱漸進式體驗—設計驅動企業改革動能',
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['lydia'],
        },
        F: {
          id: '1228-2-f',
          title: '同步聯播',
          tags: [],
          speakerCodes: [],
        },
        A2: {
          id: '1228-2-a2',
          title: '同步聯播',
          tags: [],
          speakerCodes: [],
        },
      },
    },
    {
      startTime: '10:50',
      endTime: '11:35',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        M: {
          id: '1228-3-m',
          title: 'ESLint One for All Made Easy',
          tags: ['frontend'],
          speakerCodes: ['antfu'],
        },
        F: {
          id: '1228-3-f',
          title: 'Woops，網站打不開了怎麼辦？來當一天系統管理員吧！',
          tags: ['frontend', 'backend', 'devops'],
          speakerCodes: ['lightda'],
        },
        A2: {
          id: '1228-3-a2',
          title: 'TBD',
          tags: [],
          speakerCodes: ['seal'],
        },
      },
    },
    {
      startTime: '11:45',
      endTime: '12:30',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        M: {
          id: '1228-4-m',
          title: 'TBD',
          tags: ['frontend', 'uiux'],
          speakerCodes: ['amos'],
        },
        F: {
          id: '1228-4-f',
          title: 'Woops，網站打不開了怎麼辦？來當一天系統管理員吧！',
          tags: ['frontend', 'backend', 'devops'],
          speakerCodes: ['lightda'],
        },
        A2: {
          id: '1228-4-a2',
          title: '當設計遇到資本主義 - 人月鬼話',
          tags: ['agile', 'uiux', 'team-management'],
          speakerCodes: ['stevenyeh'],
        },
      },
    },
    {
      startTime: '12:30',
      endTime: '13:30',
      type: 'break',
      breakTitle: '午餐時間',
      isBroadcast: false,
    },
    {
      startTime: '13:30',
      endTime: '14:15',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        M: {
          id: '1228-5-m',
          title: 'TBD',
          tags: [],
          speakerCodes: [],
        },
        F: {
          id: '1228-5-f',
          title: '用 AI 幫助開發 Apple Watch App 實戰分享',
          tags: ['frontend', 'product-design'],
          speakerCodes: ['leethi'],
        },
        A2: {
          id: '1228-5-a2',
          title: '從零到頂尖：無懈可擊的網頁設計',
          tags: ['frontend', 'uiux', 'product-design'],
          speakerCodes: ['maylogger'],
        },
      },
    },
    {
      startTime: '14:25',
      endTime: '15:10',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        M: {
          id: '1228-6-m',
          title: 'DevOps 與 GenAI：在人工智慧時代的未來之路',
          tags: ['devops'],
          speakerCodes: ['hungweichiu'],
        },
        F: {
          id: '1228-6-f',
          title: '這些年，你所不知道的 Angular',
          tags: ['frontend'],
          speakerCodes: ['leo'],
        },
        A2: {
          id: '1228-6-a2',
          title: '從生活啟程的網站設計體驗',
          tags: ['uiux'],
          speakerCodes: ['henrylin'],
        },
      },
    },
    {
      startTime: '15:20',
      endTime: '16:05',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        M: {
          id: '1228-7-m',
          title: '當 Vue 與 View 分手之後⋯',
          tags: ['frontend'],
          speakerCodes: ['kuro'],
        },
        F: {
          id: '1228-7-f',
          title: '接案失敗學：前端後端設計端，我還要具備什麼端才能出來江湖闖盪？談小白鼠闖入黑森林被XXX的淒慘故事',
          tags: ['frontend', 'backend', 'product-design'],
          speakerCodes: ['taiming'],
        },
        A2: {
          id: '1228-7-a2',
          title: '[暫] 遊戲化產品背後的遊戲化經營：如何在無形中建立數位產品的存在感',
          tags: ['product-design', 'team-management'],
          speakerCodes: ['chacha'],
        },
      },
    },
    {
      startTime: '16:15',
      endTime: '17:00',
      type: 'agenda',
      isBroadcast: true,
      agendas: {
        M: {
          id: '1228-8-m',
          title: '工程師成長之路：由時間管理到職涯規劃',
          tags: ['agile', 'team-management'],
          speakerCodes: ['ruddy'],
        },
        F: {
          id: '1228-8-f',
          title: '同步聯播',
          tags: [],
          speakerCodes: [],
        },
        A2: {
          id: '1228-8-a2',
          title: '同步聯播',
          tags: [],
          speakerCodes: [],
        },
      },
    },
    {
      startTime: '17:00',
      endTime: '00:00',
      type: 'break',
      breakTitle: '結束',
      isBroadcast: false,
    },
  ],
}
