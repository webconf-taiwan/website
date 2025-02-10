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
  {
    type: 'slide',
    icon: 'i-heroicons:presentation-chart-line',
    text: '投影片',
  },
]

export const agendaData: DaySchedule = {
  '2024-12-27': [
    {
      startTime: '08:30',
      endTime: '09:00',
      type: 'break',
      title: '08:30 - 09:00 報到',
      isBroadcast: false,
    },
    {
      startTime: '09:00',
      endTime: '09:10',
      type: 'disseminate',
      title: '開幕引言',
      isBroadcast: false,
    },
    {
      startTime: '09:10',
      endTime: '09:55',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        F: {
          id: 'day1-1-f',
          title: '靈能的挑戰：從碼農開始的通靈王之路',
          isWorkshop: false,
          tags: ['backend', 'agile'],
          speakerCodes: ['kyocheng'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2F7dO26WhtRjua8ufeYu90Bw',
            },
            {
              type: 'slide',
              href: 'https://docs.google.com/presentation/d/1OkdFs2CjQHN5M_UJjqfd38BSuZNtCkhnOQFFgzdjJYs/edit#slide=id.g317e56981db_6_188',
            },
          ],
        },
        M: {
          id: 'day1-1-m',
          title: '有限狀態機與 RxJS',
          isWorkshop: false,
          tags: ['frontend'],
          speakerCodes: ['milkmidi'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FZ5mdWoHoTKuYqapQTeR2Gw',
            },
            {
              type: 'slide',
              href: 'https://docs.google.com/presentation/d/1Kx6PW46jWHGu29caEXbopMWTGXnJjFzsTyiUOFAgVCg/edit?usp=sharing',
            },
          ],
        },
        A: {
          id: 'day1-1-a',
          title: '串連品牌從實體到數位的體驗',
          isWorkshop: false,
          tags: ['uiux'],
          speakerCodes: ['weikan'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2Fb6IouZwAToaXTITL7hpo0w',
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
        F: {
          id: 'day1-2-f',
          title: 'DevOps, GitOps, and AIOps',
          isWorkshop: false,
          tags: ['devops'],
          speakerCodes: ['weithenn'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FBwR0nuGERCSfrCtY6BKbFw',
            },
            {
              type: 'slide',
              href: 'https://drive.google.com/drive/u/0/folders/1XdMag4FkHCRfR71rx9oD-xC7C7vRIkyB',
            },
          ],
        },
        M: {
          id: 'day1-2-m',
          title: '個人專案到產品：善用 AI 工具打造可盈利產品',
          isWorkshop: false,
          tags: ['frontend', 'backend', 'agile', 'product-design'],
          speakerCodes: ['pjwang'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2F0EiYKrCQQFKpuErgA1zIvQ',
            },

            {
              type: 'slide',
              href: 'https://drive.google.com/file/d/1lQqRUUjGMx2O18kX46rAUsXh7wZR6JFm/view',
            },
          ],
        },
        A: {
          id: 'day1-2-a',
          title: '工作坊＋AI：創意又高效的規劃執行',
          isWorkshop: false,
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['djlee'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FQA7D_pp3TOC41AjJWuxOCg',
            },
            {
              type: 'slide',
              href: 'https://drive.google.com/drive/u/0/folders/1BFfiM2J0bU0JoQPldut9nNNgsTYprk5U',
            },
          ],
        },
      },
    },
    {
      startTime: '11:00',
      endTime: '11:45',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        F: {
          id: 'day1-3-f',
          title: '來一場兼顧程式碼品質以及開發效率的 Code Review',
          isWorkshop: false,
          tags: ['frontend', 'backend', 'team-management'],
          speakerCodes: ['fin'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FTz9q-XSwQK-9SvmycxtXPA',
            },
            {
              type: 'slide',
              href: 'https://slides.com/finchen/code',
            },
          ],
        },
        M: {
          id: 'day1-3-m',
          title: '如何撰寫具彈性的測試程式',
          isWorkshop: false,
          tags: ['frontend'],
          speakerCodes: ['summer'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FmIdCScKdTgSQuwjNcyrXTg',
            },
            {
              type: 'slide',
              href: 'https://www.cythilya.tw/assets/frontend-testing-guide-strategies-and-practices/webconf2024/2024-12-27-webconf2024-ui-causes-testing-to-fail.pdf',
            },
          ],
        },
        A: {
          id: 'day1-3-a',
          title:
            '結合品牌策略與用戶需求，翻轉品牌印象，打造更具競爭力的產品體驗',
          isWorkshop: false,
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['iris'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FpHWTQ5SnSsGcJ0-xEWiROg',
            },
            {
              type: 'slide',
              href: 'https://drive.google.com/drive/u/0/folders/1VwjMB123yHPW0fR4l-CeGRIKkaMZozmr',
            },
          ],
        },
      },
    },
    {
      startTime: '11:55',
      endTime: '12:40',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        F: {
          id: 'day1-4-f',
          title: '從單體應用到微服務的監控演化淺談',
          isWorkshop: false,
          tags: ['backend', 'team-management'],
          speakerCodes: ['nic'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FNAoMFQ4YTGyjHdUiRc4T2g',
            },
          ],
        },
        M: {
          id: 'day1-4-m',
          title: '從技術專才到領導者：1 到 100 人的管理之路',
          isWorkshop: false,
          tags: ['team-management'],
          speakerCodes: ['singz'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FXotjX_3RSNeKD5o-FXpyhg',
            },
            {
              type: 'slide',
              href: 'https://docs.google.com/presentation/d/1zjH6iRPiT9wsvn3cVy6da3_W-rez17XQYw1kYD4TYpA/edit#slide=id.g320eaeda041_2_62',
            },
          ],
        },
        A: {
          id: 'day1-4-a',
          title: '設計很豐滿，開發很骨感 — 淺談設計交付',
          isWorkshop: false,
          tags: ['frontend', 'uiux', 'product-design', 'team-management'],
          speakerCodes: ['rei'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2F2AL3eh0PRHy_SytJ_L74rQ',
            },
          ],
        },
      },
    },
    {
      startTime: '12:40',
      endTime: '13:30',
      type: 'break',
      title: '午餐時間',
      isBroadcast: false,
    },
    {
      startTime: '13:30',
      endTime: '14:15',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        F: {
          id: 'day1-5-f',
          title: '十年回首：React 的過去、現在與未來發展',
          isWorkshop: false,
          tags: ['frontend'],
          speakerCodes: ['zet'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FIrITxP3rRpKxab5nDlkw6w',
            },
            {
              type: 'slide',
              href: 'https://slides.com/tz5514/react-webconf2024',
            },
          ],
        },
        M: {
          id: 'day1-5-m',
          title: '淺談 LLM-based AI Agents 應用開發',
          isWorkshop: false,
          tags: ['product-design'],
          speakerCodes: ['ihower'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2Fs9voMrBsQ2qH3yKFzAEzAQ',
            },
            {
              type: 'slide',
              href: 'https://ihower.tw/blog/archives/12586',
            },
          ],
        },
        A: {
          id: 'day1-5-a',
          title: '從專注細節到全局掌控：工程師轉職產品經理的心態與轉變',
          isWorkshop: false,
          tags: ['agile', 'product-design', 'team-management'],
          speakerCodes: ['lindsay'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2F-feHQuIeT5SzIU4cBnI7EQ',
            },
          ],
        },
      },
    },
    {
      startTime: '14:25',
      endTime: '15:10',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        F: {
          id: 'day1-6-f',
          title: '在現有軟體服務中整合 Copilot 功能：Context 與 UI 的新挑戰',
          isWorkshop: false,
          tags: ['frontend', 'backend', 'uiux'],
          speakerCodes: ['kewang'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FtQwdpxCkRfyeQp2uEE7KTw',
            },
          ],
        },
        M: {
          id: 'day1-6-m',
          title: '《天下》如何思考數位敘事？從流程到技術大公開',
          isWorkshop: false,
          tags: ['frontend', 'uiux', 'agile', 'team-management'],
          speakerCodes: ['sylviauk', 'stevenyeo'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2F8xw9A1UfS-muu8kL2_necQ',
            },
          ],
        },
        A: {
          id: 'day1-6-a',
          title: '產品 AI 整合路徑：分階段為現有產品找到最佳 AI 整合方案',
          isWorkshop: false,
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['wylin'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FZ0_clry4SeSj0GcZx5m2zg',
            },
            {
              type: 'slide',
              href: 'https://www.canva.com/design/DAGaTCdC-BI/Yd3jDHs70apGXK-IeXp2Hw/view',
            },
          ],
        },
      },
    },
    {
      startTime: '15:20',
      endTime: '16:05',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        F: {
          id: 'day1-7-f',
          title: 'AI、Data 與 Web，跨領域的資料科學工作者之路',
          isWorkshop: false,
          tags: ['frontend', 'backend'],
          speakerCodes: ['dscareer'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FXuOekBPwQg6rSV1_-7mgDg',
            },
            {
              type: 'slide',
              href: 'https://www.dropbox.com/scl/fi/ko5p74opkvhr3cthmd2ii/AI-Data-Web.pdf?rlkey=9s72gw9mgjdr46f1ujyqfebo9&e=1&dl=0',
            },
          ],
        },
        M: {
          id: 'day1-7-m',
          title: '網站專案時程的挑戰跟威脅',
          isWorkshop: false,
          tags: ['product-design', 'team-management'],
          speakerCodes: ['tonyq'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FZNxp16PySUCoKhzf8wRX7w',
            },
            {
              type: 'slide',
              href: 'https://drive.google.com/drive/u/0/folders/1FsSFUPh7KFx9vU_-fQELWoDGwkRgkHLV',
            },
          ],
        },
        A: {
          id: 'day1-7-a',
          title: '從商業策略出發的產品、服務體驗設計：以 USPACE 產品為例',
          isWorkshop: false,
          tags: [
            'frontend',
            'agile',
            'uiux',
            'product-design',
            'team-management',
          ],
          speakerCodes: ['doppler'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2F7MwziMGdSfCLzkrHCkI-AQ',
            },
          ],
        },
      },
    },
    {
      startTime: '16:15',
      endTime: '17:00',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        F: {
          id: 'day1-8-f',
          title: 'Zeabur：雲端部署平台 PaaS 核心技術大揭秘',
          isWorkshop: false,
          tags: ['frontend', 'backend', 'devops'],
          speakerCodes: ['yuanlin'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FLe2Yc5gySPWxBZE1EWYGAA',
            },
            {
              type: 'slide',
              href: 'https://cdn.zeabur.com/webconf.pdf',
            },
          ],
        },
        M: {
          id: 'day1-8-m',
          title: 'AI+商業思維：軟體工程師如何擁抱趨勢，提升職場價值',
          isWorkshop: false,
          tags: ['team-management'],
          speakerCodes: ['gipi'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FKkTRz5AqQ5WtksSdtm-dIA',
            },
            {
              type: 'slide',
              href: 'https://gipi.tw/webconf-2024-ai-and-business-thinking/',
            },
          ],
        },
        A: {
          id: 'day1-8-a',
          title: '覺察與共情：如何在一對一中激發團隊潛能',
          isWorkshop: false,
          tags: ['uiux', 'team-management'],
          speakerCodes: ['ivanwei'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FSODQ9UQOSkyrLQvCPESaPw',
            },
          ],
        },
      },
    },
    {
      startTime: '17:00',
      endTime: '00:00',
      type: 'break',
      title: '明天見 !',
      isBroadcast: false,
    },
  ],
  '2024-12-28': [
    {
      startTime: '08:30',
      endTime: '09:00',
      type: 'break',
      title: '08:30 - 09:00 報到',
      isBroadcast: false,
    },
    {
      startTime: '09:00',
      endTime: '09:45',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        F: {
          id: 'day2-1-f',
          title: '實戰！以 Web 3D 技術開發商品客製編輯器',
          isWorkshop: false,
          tags: ['frontend', 'uiux'],
          speakerCodes: ['gugu'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2F8UKsTuNmShylopzFwlh38A',
            },
          ],
        },
        M: {
          id: 'day2-1-m',
          title: '在 AI 時代如何成為資深工程師？',
          isWorkshop: false,
          tags: ['frontend', 'backend', 'agile', 'devops'],
          speakerCodes: ['mosky'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FNZLRM8oCRvi2voyfL68tIg',
            },
            {
              type: 'slide',
              href: 'https://speakerdeck.com/mosky/ai-shi-dai-ruan-ti-gong-cheng-shi-de-chi-xu-sheng-ji',
            },
          ],
        },
        A: {
          id: 'day2-1-a',
          title:
            '談組織內部的產品創業：由技術選型、優劣勢分析、階段性目標再到團隊設計',
          isWorkshop: false,
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['samuel'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2F7dA7rD0gQ82pvBBUugcGdw',
            },
          ],
        },
      },
    },
    {
      startTime: '10:00',
      endTime: '10:45',
      type: 'agenda',
      isBroadcast: true,
      agendas: {
        F: {
          id: 'day2-2-f',
          title: '同步聯播',
          isWorkshop: false,
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['lydia'],
          otherLinks: [],
        },
        M: {
          id: 'day2-2-m',
          title: '擁抱漸進式體驗 — 設計驅動企業改革動能',
          isWorkshop: false,
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['lydia'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FENkeFDshRMWYiV_gSyzAhw',
            },
            {
              type: 'slide',
              href: 'https://drive.google.com/file/d/1J7_IyvNGOjP9-inh8PBf0uHE5uUdiCde/view',
            },
          ],
        },
        A: {
          id: 'day2-2-a',
          title: '同步聯播',
          isWorkshop: false,
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['lydia'],
          otherLinks: [],
        },
      },
    },
    {
      startTime: '10:55',
      endTime: '11:40',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        F: {
          id: 'day2-3-f',
          title: 'Woops，網站打不開了怎麼辦？來當一天系統管理員吧！',
          isWorkshop: true,
          tags: ['frontend', 'backend', 'devops'],
          speakerCodes: ['lightda'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2Fp0uvB9gPRt6n9vFShm3lTw',
            },
            {
              type: 'slide',
              href: 'https://lightda-tw.notion.site/Troubleshooting-Lab-1612ceabc70c80c5bc5cc445c22487b4',
            },
          ],
        },
        M: {
          id: 'day2-3-m',
          title: 'ESLint One for All Made Easy',
          isWorkshop: false,
          tags: ['frontend'],
          speakerCodes: ['antfu'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FuUCLipjyTyCrzGDCRHV9BA',
            },
            {
              type: 'slide',
              href: 'https://drive.google.com/drive/u/0/folders/1FsSFUPh7KFx9vU_-fQELWoDGwkRgkHLV',
            },
          ],
        },
        A: {
          id: 'day2-3-a',
          title: '深入淺出 B2B 產品設計成功方程式 - 真有此式？',
          isWorkshop: false,
          tags: ['uiux', 'product-design', 'team-management'],
          speakerCodes: ['seal'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2F4YLxjTqvTyWncvdl2dwpew',
            },
          ],
        },
      },
    },
    {
      startTime: '11:50',
      endTime: '12:35',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        F: {
          id: 'day2-4-f',
          title: 'Woops，網站打不開了怎麼辦？來當一天系統管理員吧！',
          isWorkshop: true,
          tags: ['frontend', 'backend', 'devops'],
          speakerCodes: ['lightda'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2Fp0uvB9gPRt6n9vFShm3lTw',
            },
            {
              type: 'slide',
              href: 'https://lightda-tw.notion.site/Troubleshooting-Lab-1612ceabc70c80c5bc5cc445c22487b4',
            },
          ],
        },
        M: {
          id: 'day2-4-m',
          title: 'Flex out！ CSS Grid 玩起來！',
          isWorkshop: false,
          tags: ['frontend', 'uiux'],
          speakerCodes: ['amos'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FbfiLdEW-QLCiM8oO0qwNMw',
            },
          ],
        },
        A: {
          id: 'day2-4-a',
          title: '當設計遇到資本主義 - 人月鬼話',
          isWorkshop: false,
          tags: ['agile', 'uiux', 'team-management'],
          speakerCodes: ['stevenyeh'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2Fiyk7w2K9TLqX_VLlce1pPA',
            },
            {
              type: 'slide',
              href: 'https://www.figma.com/community/file/1454509755368502198',
            },
          ],
        },
      },
    },
    {
      startTime: '12:35',
      endTime: '13:30',
      type: 'break',
      title: '午餐時間',
      isBroadcast: false,
    },
    {
      startTime: '13:30',
      endTime: '14:15',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        F: {
          id: 'day2-5-f',
          title: '用 AI 幫助開發 Apple Watch App 實戰分享',
          isWorkshop: false,
          tags: ['frontend', 'product-design'],
          speakerCodes: ['leethi'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2Fv0_Ufs51S7GvfC01w8kmAg',
            },
            {
              type: 'slide',
              href: 'https://www.dropbox.com/scl/fi/zbi5us0mo6ncdtti86tib/20241228-WebConf-2024-AI-Apple-Watch-App.pdf?rlkey=gro2q2iss49gkfdiypztrjn9q&e=2',
            },
          ],
        },
        M: {
          id: 'day2-5-m',
          title: '從零開始打造金融業的開發者平台',
          isWorkshop: false,
          tags: ['devops'],
          speakerCodes: ['xiaofeng'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FFlZ2qOWARxGTsxaZCUCWIg',
            },
          ],
        },
        A: {
          id: 'day2-5-a',
          title: '從零到頂尖：無懈可擊的網頁設計',
          isWorkshop: false,
          tags: ['frontend', 'uiux', 'product-design'],
          speakerCodes: ['maylogger'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2F4SbzPuObTpC4fp8ytpLARg',
            },
            {
              type: 'slide',
              href: 'https://drive.google.com/drive/u/0/folders/1skmaa5XQR4VmpGAu0Y5hWgCU_jbDC-H_',
            },
          ],
        },
      },
    },
    {
      startTime: '14:25',
      endTime: '15:10',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        F: {
          id: 'day2-6-f',
          title: '這些年，你所不知道的 Angular',
          isWorkshop: false,
          tags: ['frontend'],
          speakerCodes: ['leo'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FoUduGHHmT66C7EUcyt_7Pw',
            },
            {
              type: 'slide',
              href: 'https://drive.google.com/drive/u/0/folders/1XPeF1rCAOh0Iv1XQKZ1usnKeXUas2kGY',
            },
          ],
        },
        M: {
          id: 'day2-6-m',
          title: 'DevOps 與 GenAI：在人工智慧時代的未來之路',
          isWorkshop: false,
          tags: ['devops'],
          speakerCodes: ['hungweichiu'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2Fa07Z0KkRR5eJC_D1pEckcQ',
            },
            {
              type: 'slide',
              href: 'https://drive.google.com/drive/u/0/folders/1M3VOwlI42uPFKtxz7McMbdEKWQFX7P7j',
            },
          ],
        },
        A: {
          id: 'day2-6-a',
          title: '從生活啟程的網站設計體驗',
          isWorkshop: false,
          tags: ['uiux'],
          speakerCodes: ['henrylin'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FB5Pobs06R9mL440Cx0kaPg',
            },
          ],
        },
      },
    },
    {
      startTime: '15:20',
      endTime: '16:05',
      type: 'agenda',
      isBroadcast: false,
      agendas: {
        F: {
          id: 'day2-7-f',
          title:
            '接案失敗學：前端後端設計端，我還要具備什麼端才能出來江湖闖盪？談小白鼠闖入黑森林被XXX的淒慘故事',
          isWorkshop: false,
          tags: ['frontend', 'backend', 'product-design'],
          speakerCodes: ['taiming'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FLaGp4Hb0SLSlkZRex_nhAw',
            },
            {
              type: 'slide',
              href: 'https://drive.google.com/file/d/1dlvC1OdQFfLC_SO2SJjI4Xy04yGJ2HxC/view',
            },
          ],
        },
        M: {
          id: 'day2-7-m',
          title: '當 Vue 與 View 分手之後⋯',
          isWorkshop: false,
          tags: ['frontend'],
          speakerCodes: ['kuro'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2F-xKP138XSgWlkBh1jIHdXA',
            },
          ],
        },
        A: {
          id: 'day2-7-a',
          title: '遊戲化產品背後的遊戲化經營：如何在無形中建立數位產品的存在感',
          isWorkshop: false,
          tags: ['product-design', 'team-management'],
          speakerCodes: ['chacha'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FwkU0FNV2QGG2Lj_YcujDsw',
            },
          ],
        },
      },
    },
    {
      startTime: '16:15',
      endTime: '17:00',
      type: 'agenda',
      isBroadcast: true,
      agendas: {
        F: {
          id: 'day2-8-f',
          title: '同步聯播',
          isWorkshop: false,
          tags: ['agile', 'team-management'],
          speakerCodes: ['ruddy'],
          otherLinks: [],
        },
        M: {
          id: 'day2-8-m',
          title: '工程師成長之路：由時間管理到職涯規劃',
          isWorkshop: false,
          tags: ['agile', 'team-management'],
          speakerCodes: ['ruddy'],
          otherLinks: [
            {
              type: 'note',
              href: 'https://hackmd.io/@webconf/BJ2N6ksMke/%2FT1FfJOxEQ3mLD-6lSltHgA',
            },
            {
              type: 'slide',
              href: 'https://docs.google.com/presentation/d/17AAYNZsoolbbRX7fdLkuyl0qykdI1yMl/edit#slide=id.p1',
            },
          ],
        },
        A: {
          id: 'day2-8-a',
          title: '同步聯播',
          isWorkshop: false,
          tags: ['agile', 'team-management'],
          speakerCodes: ['ruddy'],
          otherLinks: [],
        },
      },
    },
    {
      startTime: '17:00',
      endTime: '17:10',
      type: 'disseminate',
      title: '閉幕致詞',
      isBroadcast: false,
    },
    {
      startTime: '17:10',
      endTime: '00:00',
      type: 'break',
      title: '下次見 !',
      isBroadcast: false,
    },
  ],
}
