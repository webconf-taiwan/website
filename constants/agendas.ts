import type {
  AgendaOtherLinksMap,
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

export const agendaOtherLinksMap: AgendaOtherLinksMap[] = [
  { type: 'note', icon: 'i-heroicons:document-text', text: '共筆文件' },
  { type: 'slide', icon: 'i-heroicons:presentation-chart-line', text: '投影片' },
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
          id: 'day1-1-m',
          title: 'TBD',
          tags: [],
          speakerCodes: ['ihower'],
          otherLinks: [],
        },
        F: {
          id: 'day1-1-f',
          title: '靈能的挑戰：從碼農開始的通靈王之路',
          tags: ['backend', 'agile'],
          speakerCodes: ['kyocheng'],
          otherLinks: [],
        },
        A2: {
          id: 'day1-1-a2',
          title: '串連品牌從實體到數位的體驗',
          tags: ['uiux'],
          speakerCodes: ['weikan'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://www.google.com',
            },
            {
              type: 'slide',
              href: 'https://www.google.com',
            },
          ],
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
          id: 'day1-2-m',
          title: '個人專案到產品：善用 AI 工具打造可盈利產品',
          tags: ['frontend', 'backend', 'agile', 'product-design'],
          speakerCodes: ['pjwang'],
          otherLinks: [],
        },
        F: {
          id: 'day1-2-f',
          title: 'DevOps, GitOps, and AIOps',
          tags: ['devops'],
          speakerCodes: ['weithenn'],
          otherLinks: [],
        },
        A2: {
          id: 'day1-2-a2',
          title: '談組織內部的產品創業：由技術選型、優劣勢分析、階段性目標再到團隊設計',
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['samuel'],
          otherLinks: [],
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
          id: 'day1-3-m',
          title: '如何撰寫具彈性的測試程式',
          tags: ['frontend'],
          speakerCodes: ['summer'],
          otherLinks: [],
        },
        F: {
          id: 'day1-3-f',
          title: '來一場兼顧程式碼品質以及開發效率的 Code Review',
          tags: ['frontend', 'backend', 'team-management'],
          speakerCodes: ['fin'],
          otherLinks: [],
        },
        A2: {
          id: 'day1-3-a2',
          title: '結合品牌策略與用戶需求，翻轉品牌印象，打造更具競爭力的產品體驗',
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['iris'],
          otherLinks: [],
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
          id: 'day1-4-m',
          title: '從技術專才到領導者：1 到 100 人的管理之路',
          tags: ['team-management'],
          speakerCodes: ['singz'],
          otherLinks: [],
        },
        F: {
          id: 'day1-4-f',
          title: '從單體應用到微服務的監控演化淺談',
          tags: ['backend', 'team-management'],
          speakerCodes: ['nic'],
          otherLinks: [],
        },
        A2: {
          id: 'day1-4-a2',
          title: '設計很豐滿，開發很骨感 — 淺談設計交付',
          tags: ['frontend', 'uiux', 'product-design', 'team-management'],
          speakerCodes: ['rei'],
          otherLinks: [],
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
          id: 'day1-5-m',
          title: '有限狀態機與 RxJS',
          tags: ['frontend'],
          speakerCodes: ['milkmidi'],
          otherLinks: [],
        },
        F: {
          id: 'day1-5-f',
          title: '十年回首：React 的過去、現在與未來發展',
          tags: ['frontend'],
          speakerCodes: ['zet'],
          otherLinks: [],
        },
        A2: {
          id: 'day1-5-a2',
          title: '從專注細節到全局掌控：工程師轉職產品經理的心態與轉變',
          tags: ['agile', 'product-design', 'team-management'],
          speakerCodes: ['lindsay'],
          otherLinks: [],
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
          id: 'day1-6-m',
          title: '《天下》如何思考數位敘事？從流程到技術大公開',
          tags: ['frontend', 'uiux', 'agile', 'team-management'],
          speakerCodes: ['sylviauk', 'stevenyeo'],
          otherLinks: [],
        },
        F: {
          id: 'day1-6-f',
          title: '在現有軟體服務中整合 Copilot 功能：Context 與 UI 的新挑戰',
          tags: ['frontend', 'backend', 'uiux'],
          speakerCodes: ['kewang'],
          otherLinks: [],
        },
        A2: {
          id: 'day1-6-a2',
          title: '產品 AI 整合路徑：分階段為現有產品找到最佳 AI 整合方案',
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['wylin'],
          otherLinks: [],
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
          id: 'day1-7-m',
          title: '網站專案時程的挑戰跟威脅',
          tags: ['product-design', 'team-management'],
          speakerCodes: ['tonyq'],
          otherLinks: [],
        },
        F: {
          id: 'day1-7-f',
          title: 'AI、Data 與 Web，跨領域的資料科學工作者之路',
          tags: ['frontend', 'backend'],
          speakerCodes: ['dscareer'],
          otherLinks: [],
        },
        A2: {
          id: 'day1-7-a2',
          title: '從商業策略出發的產品、服務體驗設計：以 USPACE 產品為例',
          tags: ['frontend', 'agile', 'uiux', 'product-design', 'team-management'],
          speakerCodes: ['doppler'],
          otherLinks: [],
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
          id: 'day1-8-m',
          title: 'AI+商業思維：軟體工程師如何擁抱趨勢，提升職場價值',
          tags: ['team-management'],
          speakerCodes: ['gipi'],
          otherLinks: [],
        },
        F: {
          id: 'day1-8-f',
          title: 'Zeabur：雲端部署平台 PaaS 核心技術大揭秘',
          tags: ['frontend', 'backend', 'devops'],
          speakerCodes: ['yuanlin'],
          otherLinks: [],
        },
        A2: {
          id: 'day1-8-a2',
          title: '覺察與共情：如何在一對一中激發團隊潛能',
          tags: ['uiux', 'team-management'],
          speakerCodes: ['ivanwei'],
          otherLinks: [],
        },
      },
    },
    {
      startTime: '17:00',
      endTime: '00:00',
      type: 'break',
      breakTitle: '明天見 !',
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
          id: 'day2-1-m',
          title: '在 AI 時代如何成為資深工程師？',
          tags: ['frontend', 'backend', 'agile', 'devops'],
          speakerCodes: ['mosky'],
          otherLinks: [],
        },
        F: {
          id: 'day2-1-f',
          title: '實戰！以 Web 3D 技術開發商品客製編輯器',
          tags: ['frontend', 'uiux'],
          speakerCodes: ['gugu'],
          otherLinks: [],
        },
        A2: {
          id: 'day2-1-a2',
          title: '工作坊＋AI：創意又高效的規劃執行',
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['djlee'],
          otherLinks: [],
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
          id: 'day2-2-m',
          title: '擁抱漸進式體驗 — 設計驅動企業改革動能',
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['lydia'],
          otherLinks: [],
        },
        F: {
          id: 'day2-2-f',
          title: '同步聯播',
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['lydia'],
          otherLinks: [],
        },
        A2: {
          id: 'day2-2-a2',
          title: '同步聯播',
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['lydia'],
          otherLinks: [],
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
          id: 'day2-3-m',
          title: 'ESLint One for All Made Easy',
          tags: ['frontend'],
          speakerCodes: ['antfu'],
          otherLinks: [],
        },
        F: {
          id: 'day2-3-f',
          title: 'Woops，網站打不開了怎麼辦？來當一天系統管理員吧！',
          tags: ['frontend', 'backend', 'devops'],
          speakerCodes: ['lightda'],
          otherLinks: [],
        },
        A2: {
          id: 'day2-3-a2',
          title: '深入淺出 B2B 產品設計成功方程式 - 真有此式？',
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['seal'],
          otherLinks: [],
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
          id: 'day2-4-m',
          title: 'TBD',
          tags: ['frontend', 'uiux'],
          speakerCodes: ['amos'],
          otherLinks: [],
        },
        F: {
          id: 'day2-4-f',
          title: 'Woops，網站打不開了怎麼辦？來當一天系統管理員吧！',
          tags: ['frontend', 'backend', 'devops'],
          speakerCodes: ['lightda'],
          otherLinks: [],
        },
        A2: {
          id: 'day2-4-a2',
          title: '當設計遇到資本主義 - 人月鬼話',
          tags: ['agile', 'uiux', 'team-management'],
          speakerCodes: ['stevenyeh'],
          otherLinks: [],
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
          id: 'day2-5-m',
          title: '從零開始打造金融業的開發者平台',
          tags: ['devops'],
          speakerCodes: ['xiaofeng'],
          otherLinks: [],
        },
        F: {
          id: 'day2-5-f',
          title: '用 AI 幫助開發 Apple Watch App 實戰分享',
          tags: ['frontend', 'product-design'],
          speakerCodes: ['leethi'],
          otherLinks: [],
        },
        A2: {
          id: 'day2-5-a2',
          title: '從零到頂尖：無懈可擊的網頁設計',
          tags: ['frontend', 'uiux', 'product-design'],
          speakerCodes: ['maylogger'],
          otherLinks: [],
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
          id: 'day2-6-m',
          title: 'DevOps 與 GenAI：在人工智慧時代的未來之路',
          tags: ['devops'],
          speakerCodes: ['hungweichiu'],
          otherLinks: [],
        },
        F: {
          id: 'day2-6-f',
          title: '這些年，你所不知道的 Angular',
          tags: ['frontend'],
          speakerCodes: ['leo'],
          otherLinks: [],
        },
        A2: {
          id: 'day2-6-a2',
          title: '從生活啟程的網站設計體驗',
          tags: ['uiux'],
          speakerCodes: ['henrylin'],
          otherLinks: [],
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
          id: 'day2-7-m',
          title: '當 Vue 與 View 分手之後⋯',
          tags: ['frontend'],
          speakerCodes: ['kuro'],
          otherLinks: [],
        },
        F: {
          id: 'day2-7-f',
          title: '接案失敗學：前端後端設計端，我還要具備什麼端才能出來江湖闖盪？談小白鼠闖入黑森林被XXX的淒慘故事',
          tags: ['frontend', 'backend', 'product-design'],
          speakerCodes: ['taiming'],
          otherLinks: [],
        },
        A2: {
          id: 'day2-7-a2',
          title: '遊戲化產品背後的遊戲化經營：如何在無形中建立數位產品的存在感',
          tags: ['product-design', 'team-management'],
          speakerCodes: ['chacha'],
          otherLinks: [],
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
          id: 'day2-8-m',
          title: '工程師成長之路：由時間管理到職涯規劃',
          tags: ['agile', 'team-management'],
          speakerCodes: ['ruddy'],
          otherLinks: [],
        },
        F: {
          id: 'day2-8-f',
          title: '同步聯播',
          tags: ['agile', 'team-management'],
          speakerCodes: ['ruddy'],
          otherLinks: [],
        },
        A2: {
          id: 'day2-8-a2',
          title: '同步聯播',
          tags: ['agile', 'team-management'],
          speakerCodes: ['ruddy'],
          otherLinks: [],
        },
      },
    },
    {
      startTime: '17:00',
      endTime: '00:00',
      type: 'break',
      breakTitle: '下次見 !',
      isBroadcast: false,
    },
  ],
}

// export const agendaShareBaseUrl = 'https://webconf-phase2.hkg1.zeabur.app'
export const agendaShareBaseUrl = 'http://localhost:3000/agenda'
