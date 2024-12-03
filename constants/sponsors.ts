import type { Sponsor, SponsorType } from '~/types/sponsors'

export const sponsorsData: Record<SponsorType, Sponsor[]> = {
  sponsors: [
    {
      name: '瑞嘉軟體科技股份有限公司',
      introduction: 'ONElab (瑞嘉軟體) 是英國知名線上軟體設計集團ONEworks旗下的台灣研發中心。自2010年成立以來，迅速發展至擁有超過250名員工，辦公室位於台北內湖科技園區，並擴展至新竹和台中。ONElab專注於尖端軟體開發及維運，提供專業客製化服務，成功將平台推廣至亞洲及全球，客戶涵蓋歐、美、亞等地的重量級企業和跨國集團。我們深信員工是重要的夥伴，所以營造如家庭般的工作環境，並推行彈性上班制，福利比照歐美同業標準。以“好奇心、勇氣、客戶滿意、誠信、團隊合作”為核心價值，ONElab歡迎各路高手加入，共創美好未來。',
      logo: '/sponsors/sponsor_onelab.png',
      recruitmentUrl: 'https://www.104.com.tw/company/bjl4o88',
      socialLinks: [
        {
          type: 'website',
          url: ' https://www.onelab.tw/',
        },
        {
          type: 'facebook',
          url: 'https://www.facebook.com/ONElabTW',
        },
        {
          type: 'linkedin',
          url: 'https://www.linkedin.com/company/%E7%91%9E%E5%98%89%E8%BB%9F%E9%AB%94%E7%A7%91%E6%8A%80%E8%82%A1%E4%BB%BD%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8/?originalSubdomain=tw',
        },
        {
          type: 'instagram',
          url: 'https://www.instagram.com/onelab.tw/',
        },
      ],
    },
    {
      name: '新加坡商鈦坦科技',
      introduction: '鈦坦在台北、台中、高雄都有辦公室，而三地最大的共同點，就是舒適開放的大空間，以及擺放著各式酒類的吧台。我們相信員工都是「成年人」，只要能夠將事情做好做完，想喝酒、玩桌遊、打電動都是沒有問題的，只要你了解，要享受「自由」前，必須先「自律」！\n我們的工作模式，就事論事，對事不對人，學歷經歷都不重要，有貢獻就有回饋，我們擁抱改變，並隨機應變。',
      logo: '/sponsors/sponsor_titansoft.png',
      recruitmentUrl: 'https://gotica.io/hiring/Webconf',
      socialLinks: [
        {
          type: 'website',
          url: 'https://gotica.io/%E9%88%A6%E5%9D%A6%E5%A4%A7%E5%B0%8F%E4%BA%8B/WebConf',
        },
        {
          type: 'facebook',
          url: 'https://gotica.io/%E9%88%A6%E5%9D%A6%E7%B2%89%E5%B0%88/WebConf',
        },
        {
          type: 'instagram',
          url: 'https://gotica.io/Titaner/WebConf',
        },
        {
          type: 'youtube',
          url: 'https://gotica.io/%E9%88%A6%E5%9D%A6%E5%BD%B1%E9%99%A2/WebConf',
        },
        {
          type: 'linkedin',
          url: 'https://gotica.io/Career/WebConf',
        },
      ],
    },
    {
      name: '台北市電腦公會',
      introduction: '台北市電腦公會（簡稱 TCA）成立於 1974 年，由近 4,000 家 ICT 廠商組成，涵蓋上下游完整生態，是資訊產業具代表性的公會。TCA 是業者與政府的溝通橋樑，提供服務協助會員交流、掌握市場趨勢及拓展商機。\n在數位內容產業方面，TCA 推動在地產業的國際化與多元發展，涵蓋科技與數位內容等領域。透過舉辦台北國際電腦展（COMPUTEX）、台北國際電玩展（Taipei Game Show）等展會，提供開發者、製作商及用戶交流平台。並協助業者掌握市場趨勢與技術革新，促進國際合作，推動在地優秀團隊與作品進軍國際，強化全球競爭力。',
      logo: '/sponsors/sponsor_tca.png',
      socialLinks: [
        {
          type: 'website',
          url: 'https://edm.bnext.com.tw/2024terrace-2/',
        },
      ],
    },
  ],
  specialSponsors: [
    {
      name: 'JetBrains',
      introduction: 'JetBrains 是知名 IntelliJ IDEA、ReSharper、GoLand、PyCharm、WebStorm、PhpStorm…等 IDE 工具及 Kotlin 程式語言背後的公司。過去 20 年來，JetBrains 專注於生產能提升開發效率的工具，透過智能提示、快速修正，自動化地處理繁瑣且重複性高的任務，讓開發者有更多時間和精神專注在創新、設計、架構及更多美好的事物上。目前全球已有超過 1,140 萬使用者、225 多個國家信任 JetBrains 的相關產品。',
      logo: '/sponsors/sponsor_jetbrains.png',
      socialLinks: [
        {
          type: 'website',
          url: 'https://www.jetbrains.com/',
        },
      ],
    },
    {
      name: 'Zeabur',
      introduction: 'Zeabur 是一間致力於幫助開發者簡化雲端部署流程，加速團隊開發效率的台灣新創公司，目前已經幫助全球超過 30,000+ 位獨立開發者以及 20+ 間新創公司實現了專案的一鍵部署上雲。作為 Google Cloud Platform 官方認證的 PaaS 合作夥伴及 AWS Activate 新創加速計畫的成員，Zeabur 以最專業的角度為開發者提供最簡單快速的雲端部署服務。',
      logo: '/sponsors/sponsor_zeabur.png',
      socialLinks: [
        {
          type: 'website',
          url: 'https://zeabur.com/',
        },
      ],
    },
  ],
  organizers: [
    {
      name: '五倍學院',
      introduction: '五倍學院，由資深開發者高見龍創立，致力於提供具有專業度跟高品質的程式教育。我們提供多元且完整的技術課程，提升學習者在程式開發領域上的能力。無論您是初學者或進階學習者，都能在五倍學院找能為您提供到最合適資源，有效地提升您自己在職場上的競爭力。\n五倍學院同時也積極參與許多國內外企業及各領域的專案開發。以豐富的專業知識和技術能力，協助客戶訂定開發計畫，並確保按準時交付各種客製化的專案需求。此外，還為企業量身打造訓練課程，幫助員工有效提升技能，並能夠將所學應用於實際工作中。\n如果您是一家企業正在尋找可靠的合作夥伴，五倍學院將是您的理想選擇。',
      logo: '/sponsors/organizer_5xcampus.png',
      socialLinks: [
        {
          type: 'website',
          url: 'https://5xcampus.com/',
        },
      ],
    },
    {
      name: '六角學院',
      introduction: '六角學院是一所程式開發學習單位，目前已累積超過 30,000 名學員，我們的使命是讓更多人藉由程式學習，在職涯規劃上有更多的選擇。',
      logo: '/sponsors/organizer_hexschool.png',
      socialLinks: [
        {
          type: 'website',
          url: 'https://www.hexschool.com/',
        },
      ],
    },
    {
      name: '悠識學院',
      introduction: '悠識學院提供實戰型 UX 學習活動，課程主題聚焦使用者訪談、問卷調查、數據分析等專業 UX 方法，講座及實務研討關注 AI/UX、DesignOps 設計營運、數位職涯發展。我們也營運 IG、Threads、Podcasat「UX有差嗎？」等社群平台，邀請內部研究員、設計師及同業專家們，分享從事使用者體驗工作的第一線觀察。',
      logo: '/sponsors/organizer_userxper.png',
      socialLinks: [
        {
          type: 'website',
          url: 'https://edu.userxper.com/',
        },
      ],
    },
  ],
}
