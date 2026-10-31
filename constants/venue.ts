/**
 * 場域頁的平面圖分頁；首頁也會用來預熱預設那張。
 * image 是頁面上顯示的版本；link 是「點圖放大」開的原尺寸圖，用無損 WebP，跟原本的 PNG 逐像素相同、檔案小很多
 */
export const MAP_INFO = [
  {
    id: 1,
    name: 'HQ｜大會報到處',
    display: 'HQ｜大會報到處',
    image: '/images/venue/HQ.webp',
    link: '/images/venue/HQ-full.webp',
    isAvailable: true,
  },
  {
    id: 2,
    name: 'M 棟｜議程廳',
    display: 'M 棟｜議程廳',
    image: '/images/venue/M.webp',
    link: '/images/venue/M-full.webp',
    isAvailable: true,
  },
  {
    id: 3,
    name: 'I 棟｜休息區',
    display: 'I 棟｜休息區',
    image: '/images/venue/I.webp',
    link: '/images/venue/I-full.webp',
    isAvailable: true,
  },
  {
    id: 4,
    name: 'F 棟｜議程廳',
    display: 'F 棟｜議程廳',
    image: '/images/venue/F.webp',
    link: '/images/venue/F-full.webp',
    isAvailable: true,
  },
  {
    id: 5,
    name: 'B 棟｜交流攤位',
    display: 'B 棟｜交流攤位',
    image: '/images/venue/B.webp',
    link: '/images/venue/B-full.webp',
    isAvailable: true,
  },
  {
    id: 6,
    name: 'A1 棟｜工作坊',
    display: 'A1 棟｜工作坊（2F）',
    image: '/images/venue/A1.webp',
    link: '/images/venue/A1-full.webp',
    isAvailable: true,
  },
  {
    id: 7,
    name: 'A2 棟｜議程廳',
    display: 'A2 棟｜議程廳',
    image: '/images/venue/A2.webp',
    link: '/images/venue/A2-full.webp',
    isAvailable: true,
  },
  {
    id: 8,
    name: 'G 棟｜未開放',
    display: 'G 棟｜未開放',
    width: 0,
    height: 0,
    image: '',
    link: '',
    isAvailable: false,
  },
]
