import type { Sponsor, SponsorType } from '~/types/sponsors'

export const sponsorsData: Record<SponsorType, Sponsor[]> = {
  sponsors: [
    {
      name: '瑞嘉軟體科技股份有限公司',
      introduction: '新加坡商鈦坦科技是一間軟體開發公司，提供線上軟體平台客製開發與維護，以及代理 Atlassian 旗下產品 Jira Software & Confluence、線上視覺化白板 Miro ，以自身實際使用經驗提供一站式導入服務。身處快速變動的軟體產業，我們採用敏捷開發，同時將敏捷思維注入公司文化，目的是快速、靈活地應對客戶和市場需求的變化，在多年導入及迭代的經驗下，我們也開始提供企業客製化敏捷課程及顧問諮詢服務。用經驗提供一站式導入服務。身處快速變動的軟體產業，我們採用敏捷開發，同時將敏捷思維。',
      logo: '/sponsors/sponsor_onelab.png',
      recruitmentUrl: 'https://www.onelab.tw/',
      socialLinks: [
        {
          type: 'facebook',
          url: 'https://www.facebook.com/ONElabTW',
        },
        {
          type: 'instagram',
          url: 'https://www.instagram.com/onelab.tw/',
        },
        {
          type: 'youtube',
          url: 'https://www.youtube.com/channel/UCcnxKVR9nDauQ32y6ZH6Ndw/featured',
        },
      ],
    },
    {
      name: '新加坡商鈦坦科技',
      introduction: '新加坡商鈦坦科技是一間軟體開發公司，提供線上軟體平台客製開發與維護，以及代理 Atlassian 旗下產品 Jira Software & Confluence、線上視覺化白板 Miro ，以自身實際使用經驗提供一站式導入服務。身處快速變動的軟體產業，我們採用敏捷開發，同時將敏捷思維注入公司文化，目的是快速、靈活地應對客戶和市場需求的變化，在多年導入及迭代的經驗下，我們也開始提供企業客製化敏捷課程及顧問諮詢服務。際使用經驗提供一站式導入服務。身處快速變動的軟體產業，我們採用敏捷開發，同時將敏捷思維注入公司文化，目的是快速、靈活地應對客戶和市場需求的變化，在多年導入及迭代的經驗下，我們也開始提。',
      logo: '/sponsors/sponsor_titansoft.png',
      socialLinks: [],
    },
  ],
  specialSponsors: [
    {
      name: 'JETBRAINS',
      introduction: '新加坡商鈦坦科技是一間軟體開發公司，提供線上軟體平台客製開發與維護，以及代理 Atlassian 旗下產品 Jira Software & Confluence、線上視覺化白板 Miro ，以自身實際使用經驗提供一站式導入服務。身處快速變動的軟體產業，我們採用敏捷開發，同時將敏捷思維注入公司文化，目的是快速、靈活地應對客戶和市場需求的變化，在多年導入及迭代的經驗下，我們也開始提供企業客製化敏捷課程及顧問諮詢服務。',
      logo: '/sponsors/sponsor_jetbrains.png',
      socialLinks: [],
    },
    {
      name: 'zeabur',
      introduction: '新加坡商鈦坦科技是一間軟體開發公司，提供線上軟體平台客製開發與維護，以及代理 Atlassian 旗下產品 Jira Software & Confluence、線上視覺化白板 Miro ，以自身實際使用經驗提供一站式導入服務。身處快速變動的軟體產業，我們採用敏捷開發，同時將敏捷思維注入公司文化，目的是快速、靈活地應對客戶和市場需求的變化，在多年導入及迭代的經驗下，我們也開始提供企業客製化敏捷課程及顧問諮詢服務。',
      logo: '/sponsors/sponsor_zeabur.png',
    },
  ],
  organizers: [
    {
      name: '五倍學院',
      introduction: '五倍學院，由資深開發者高見龍創立，致力於提供具有專業度跟高品質的程式教育。我們提供多元且完整的技術課程，提升學習者在程式開發領域上的能力。無論您是初學者或進階學習者，都能在五倍學院找能為您提供到最合適資源，有效地提升您自己在職場上的競爭力。\n五倍學院同時也積極參與許多國內外企業及各領域的專案開發。以豐富的專業知識和技術能力，協助客戶訂定開發計畫，並確保按準時交付各種客製化的專案需求。此外，還為企業量身打造訓練課程，幫助員工有效提升技能，並能夠將所學應用於實際工作中。\n如果您是一家企業正在尋找可靠的合作夥伴，五倍學院將是您的理想選擇。',
      logo: '/sponsors/organizer_5xcampus.png',
      socialLinks: [],
    },
    {
      name: '六角學院',
      introduction: '六角學院是一所程式開發學習單位，目前已累積超過 30,000 名學員，我們的使命是讓更多人藉由程式學習，在職涯規劃上有更多的選擇。',
      logo: '/sponsors/organizer_hexschool.png',
      socialLinks: [],
    },
    {
      name: '悠識學院',
      introduction: '悠識學院提供實戰型 UX 學習活動，課程主題聚焦使用者訪談、問卷調查、數據分析等專業 UX 方法，講座及實務研討關注 AI/UX、DesignOps 設計營運、數位職涯發展。我們也營運 IG、Threads、Podcasat「UX有差嗎？」等社群平台，邀請內部研究員、設計師及同業專家們，分享從事使用者體驗工作的第一線觀察。',
      logo: 'public/sponsors/organizer_userxper.png',
      socialLinks: [],
    },
  ],
}
