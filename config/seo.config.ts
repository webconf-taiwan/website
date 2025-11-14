export const site = {
  url: 'https://webconf.tw/',
  title: 'WebConf Taiwan 2025', // 影響 ld+json 的 WebPage name 生成
  name: 'WebConf Taiwan 2025',
  description:
    'WebConf Taiwan 是一個聚集網頁技術愛好者和專家的年度盛會，讓大家一起探索網頁技術的演進和未來發展趨勢。過去幾年，網路世界變化迅速，我們將在這次研討會上回顧網頁技術的演變歷程，了解那些改變遊戲規則的關鍵時刻。除了回顧過去，WebConf Taiwan 更專注於未來。我們會討論如何利用人工智慧和機器學習來改善使用者體驗。還有最新的業界趨勢分享，幫助企業把握未來發展方向，保持競爭優勢。這將是一個充滿創意和靈感的活動，讓你與來自各地的網頁技術專業人士互動交流，共同探討未來的技術創新和可能性。',
  defaultLocale: 'zh-TW',
  twitter: '@webconftaiwan',
  ogImage: 'https://webconf.tw/images/seo/ogImage.png',
}

export const sitemap = {
  defaults: {
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
  },
  xslColumns: [
    { label: 'URL', width: '25%' },
    { label: 'Last Modified', select: 'sitemap:lastmod', width: '25%' },
    { label: 'Change Frequency', select: 'sitemap:changefreq', width: '25%' },
    { label: 'Priority', select: 'sitemap:priority', width: '12.5%' },
    { label: 'Hreflangs', select: 'count(xhtml:link)', width: '12.5%' },
  ],
  urls: [
    { loc: '/', priority: 1.0 },
    { loc: '/agenda', priority: 0.9 },
    { loc: '/sponsors', priority: 0.8 },
    { loc: '/coming-soon', priority: 0.5 },
  ],
}

// SchemaOrg Event JSON-LD Data
export const eventBasic = {
  '@type': 'Event',
  'name': site.name,
  'description': site.description,
  'image': 'https://webconf.tw/images/seo/ogImage.png',
  'startDate': '2025-12-12T09:00:00+08:00',
  'endDate': '2025-12-13T18:00:00+08:00',
  'eventStatus': 'https://schema.org/EventScheduled',
  'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
  'url': site.url,
}

// keynote speaker
export const eventPerformers = [
  {
    '@type': 'Person',
    'name': '李昆謀',
    'url': 'https://webconf.tw/speakers/1',
    'jobTitle': '產品長',
    'worksFor': {
      '@type': 'Organization',
      'name': '91APP',
    },
    'description': '91APP 產品長，零售的科學的站長，多年連續創業家，也經營自媒體，有電子報、Podcast、以及 Youtube 頻道，時常分享被社群大量轉發的零售、產品經理、以及科技與個人成長的特殊觀點與看法。',
    'image': 'https://webconf.tw/images/speakers/1_%E6%9D%8E%E6%98%86%E8%AC%80.webp',
    'sameAs': [
      'https://www.facebook.com/91app.happylee',
      'https://www.instagram.com/happylee.tw',
      'https://happylee.blog',
    ],
  },
  {
    '@type': 'Person',
    'name': 'Will 保哥',
    'url': 'https://webconf.tw/speakers/2',
    'jobTitle': '技術總監',
    'worksFor': {
      '@type': 'Organization',
      'name': '多奇數位創意有限公司',
    },
    'description': '現任「多奇數位創意有限公司」技術總監。2024 年榮獲 GenAI 方向的 Google Developer Expert (GDE) 開發專家。2019 獲選微軟技術社群區域總監 (Microsoft Regional Director)。2018 年榮獲 Angular 方向的 Google Developer Expert (GDE) 開發專家。連續 18 度當選微軟最有價值專家(MVP)。熟悉 Generative AI、Angular、JavaScript、.NET、C#、Java、Go、Docker、Kubernetes 相關技術。擅長 DevOps 與組織文化建立、軟體團隊建構與管理。熱愛分享知識。',
    'image': 'https://webconf.tw/images/speakers/2_Will_%E4%BF%9D%E5%93%A5.webp',
    'sameAs': [
      'https://www.facebook.com/will.fans',
      'https://x.com/Will_Huang',
      'https://blog.miniasp.com',
    ],
  },
  {
    '@type': 'Person',
    'name': 'Huli',
    'url': 'https://webconf.tw/speakers/17',
    'jobTitle': '站長',
    'worksFor': {
      '@type': 'Organization',
      'name': '技術部落格 Huli\'s blog',
    },
    'description': '前端是工作，資安是興趣，有時兩者會互換。 喜歡寫 code，喜歡寫部落格，有些人的興趣是旅遊、露營、看電影，而寫部落格就是我的興趣。不為了什麼特殊目的而寫，單純只是寫了會快樂（雖然近幾年寫作頻率明顯下降就是了）。',
    'image': 'https://webconf.tw/images/speakers/17_Huli.webp',
    'sameAs': [
      'https://www.facebook.com/huli.blog',
    ],
  },
  {
    '@type': 'Person',
    'name': '游舒帆',
    'url': 'https://webconf.tw/speakers/18',
    'jobTitle': '院長',
    'worksFor': {
      '@type': 'Organization',
      'name': '商業思維學院',
    },
    'description': '技術背景出身，後投身商業世界，相信科技與商業是改變世界的兩大力量。',
    'image': 'https://webconf.tw/images/speakers/18_%E6%B8%B8%E8%88%92%E5%B8%86_Gipi.webp',
    'sameAs': [
      'https://www.facebook.com/gipi.net',
      'https://gipi.tw',
    ],
  },
  {
    '@type': 'Person',
    'name': '張文鈿 ihower',
    'url': 'https://webconf.tw/speakers/42',
    'jobTitle': '負責人',
    'worksFor': {
      '@type': 'Organization',
      'name': '愛好資訊科技有限公司',
    },
    'description': 'AI 工程獨立顧問、軟體工程師、開課講師。2002年開始從事 Web App 軟體開發工作，曾任新創公司技術長、多年程式教育講師。 目前自行開業愛好資訊科技有限公司，經營愛好 AI Engineer 電子報，近期積極參與 OpenAI Agents SDK 原始碼貢獻。 部落格: https://ihower.tw/blog/。',
    'image': 'https://webconf.tw/images/speakers/42_%E5%BC%B5%E6%96%87%E9%88%BF_ihower.webp',
    'sameAs': [
      'https://www.facebook.com/ihower',
      'https://x.com/ihower',
      'https://ihower.tw/blog/',
    ],
  },
]

export const eventLocation = {
  '@type': 'Place',
  'name': '瓶蓋工廠台北製造所',
  'address': {
    '@type': 'PostalAddress',
    'streetAddress': '南港路二段13號',
    'addressLocality': '南港區',
    'addressRegion': '台北市',
    'postalCode': '115',
    'addressCountry': 'TW',
  },
}

export const eventOrganizer = {
  '@type': 'Organization',
  'name': 'WebConf Taiwan',
  'url': site.url,
  'logo': 'https://webconf.tw/images/seo/ogImage.png',
  'email': 'hi@webconf.tw',
  'sameAs': [
    'https://www.facebook.com/WebConfTaiwan/?locale=zh_TW',
    'https://www.instagram.com/webconftw/',
    'https://www.threads.com/@webconftw',
  ],
}

export const eventOffers = [
  {
    '@type': 'Offer',
    'name': '一般票',
    'url': 'https://ezbundle.cc/p/webconf-tw-2025',
    'price': '4480',
    'priceCurrency': 'TWD',
    'availability': 'https://schema.org/InStock',
    'validFrom': '2025-10-21T00:00:00+08:00',
    'validThrough': '2025-12-05T12:30:00+08:00',
  },
  {
    '@type': 'Offer',
    'name': '早鳥票',
    'url': 'https://ezbundle.cc/p/webconf-tw-2025',
    'price': '4280',
    'priceCurrency': 'TWD',
    'availability': 'https://schema.org/SoldOut',
    'validFrom': '2025-10-15T00:00:00+08:00',
    'validThrough': '2025-10-21T23:59:00+08:00',
  },
  {
    '@type': 'Offer',
    'name': '鐵粉票',
    'url': 'https://ezbundle.cc/p/webconf-tw-2025',
    'price': '3980',
    'priceCurrency': 'TWD',
    'availability': 'https://schema.org/SoldOut',
    'validFrom': '2025-10-10T00:00:00+08:00',
    'validThrough': '2025-10-15T23:59:00+08:00',
  },
  {
    '@type': 'Offer',
    'name': '企業支持票',
    'url': 'https://ezbundle.cc/p/webconf-tw-2025',
    'price': '4480',
    'priceCurrency': 'TWD',
    'availability': 'https://schema.org/LimitedAvailability',
    'validFrom': '2025-10-21T00:00:00+08:00',
    'validThrough': '2025-12-05T12:30:00+08:00',
    'description': '如有大量購票需求，請至 WebConf Taiwan 粉絲專頁與我們聯繫。',
  },
]
