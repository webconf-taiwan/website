export const site = {
  url: 'https://webconf.tw',
  name: '2025 WebConf Taiwan 技術研討會',
  description:
    '本屆榮幸邀請到各領域專業講者，包含網站開發、前端設計、UIUX 以及團隊管理、軟性主題等各方面相關議題分享。希望能讓所有對 Web 開發、設計有熱情的人，共同創造一個充滿回憶與影響力的盛會！',
  defaultLocale: 'zh-TW',
  ogImage: {
    url: 'https://webconf.tw/og.jpg',
  },
  twitter: '@webconftaiwan',
}

// 如果沒有給 og:image 會由標題組成 ogImage，這是文字預設字型
export const ogImage = {
  fonts: ['Noto+Sans+TC:700', 'Mina:700'],
}
