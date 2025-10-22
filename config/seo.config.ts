export const site = {
  url: 'https://webconf.tw/',
  title: 'WebConf Taiwan 2025', // 影響 ld+json 的 WebPage name 生成
  name: 'WebConf Taiwan 2025',
  description:
    'WebConf Taiwan 是一個聚集網頁技術愛好者和專家的年度盛會，讓大家一起探索網頁技術的演進和未來發展趨勢。過去幾年，網路世界變化迅速，我們將在這次研討會上回顧網頁技術的演變歷程，了解那些改變遊戲規則的關鍵時刻。除了回顧過去，WebConf Taiwan 更專注於未來。我們會討論如何利用人工智慧和機器學習來改善使用者體驗。還有最新的業界趨勢分享，幫助企業把握未來發展方向，保持競爭優勢。這將是一個充滿創意和靈感的活動，讓你與來自各地的網頁技術專業人士互動交流，共同探討未來的技術創新和可能性。',
  defaultLocale: 'zh-TW',
  twitter: '@webconftaiwan',
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

export const eventPerformers = [
  {
    '@type': 'Person',
    'name': '待公布講者',
    'url': 'https://webconf.tw/speakers',
  },
]

export const eventLocation = {
  '@type': 'Place',
  'name': '瓶蓋工廠台北製造所',
  'address': {
    '@type': 'PostalAddress',
    'streetAddress': '南港路二段13號',
    'addressLocality': '台北市',
    'addressRegion': '南港區',
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
