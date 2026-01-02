# WebConf Taiwan 2025

[![Website](https://img.shields.io/badge/Website-webconf.tw-blue)](https://webconf.tw)
[![Facebook](https://img.shields.io/badge/Facebook-WebConfTaiwan-1877F2)](https://www.facebook.com/WebConfTaiwan)
[![Instagram](https://img.shields.io/badge/Instagram-webconftw-E4405F)](https://www.instagram.com/webconftw/)
[![Threads](https://img.shields.io/badge/Threads-@webconftw-black)](https://www.threads.com/@webconftw)

WebConf Taiwan 是一個聚集網頁技術愛好者和專家的年度盛會,讓大家一起探索網頁技術的演進和未來發展趨勢。過去幾年,網路世界變化迅速,我們將在這次研討會上回顧網頁技術的演變歷程,了解那些改變遊戲規則的關鍵時刻。除了回顧過去,WebConf Taiwan 更專注於未來。我們會討論如何利用人工智慧和機器學習來改善使用者體驗。還有最新的業界趨勢分享,幫助企業把握未來發展方向,保持競爭優勢。這將是一個充滿創意和靈感的活動,讓你與來自各地的網頁技術專業人士互動交流,共同探討未來的技術創新和可能性。

- **官方網站**: [webconf.tw](https://webconf.tw)
- **聯絡信箱**: [hi@webconf.tw](mailto:hi@webconf.tw)
- **大會共筆**: [HackMD](https://hackmd.io/@webconf/HJiwwqnxZe/%2F9SP9NyHoSiSZEOYHsaeYeg)

---

## Tech Stack

### Core Frameworks

- [Nuxt 3](https://nuxt.com/) & [Vue 3](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind v3](https://tailwindcss.com/)

### Nuxt Ecosystem & SEO

- [Nuxt Content](https://content.nuxt.com/)
- [Nuxt SEO](https://nuxtseo.com/)
- [Nuxt Image](https://image.nuxt.com/)
- [Nuxt Scripts](https://scripts.nuxt.com/)
- [Nuxt Fonts](https://fonts.nuxt.com/)
- [Nuxt Icon](https://nuxt.com/modules/icon)
- [Nuxt Device](https://nuxt.com/modules/device)
- [Nuxt Typed Router](https://nuxt.com/modules/typed-router)

### Animations & Creative Coding

- [GSAP](https://gsap.com/)
- [Lenis](https://lenis.darkroom.engineering/)
- [p5.js](https://p5js.org/)
- [VueUse](https://vueuse.org/)

### Engineering & Tools

- [Storybook](https://storybook.js.org/)
- [ESLint](https://github.com/antfu/eslint-config)
- [Commitizen](https://commitizen-tools.github.io/commitizen/)
- [Husky](https://typicode.github.io/husky/)

---

## Prerequisites

- Node.js `>= v20.0.0`
- pnpm `>= v8.15.9`

---

## Project Structure

```
website/
├── .storybook/          # Storybook 配置檔案
├── assets/              # 靜態資源（CSS、字型等）
├── components/          # Vue 元件
│   ├── home/           # 首頁相關元件
│   ├── share/          # 共用元件
│   └── ui/             # UI 元件庫
├── composables/         # Vue Composables
├── config/              # 配置檔案（SEO、網站設定等）
├── constants/           # 常數定義
├── content/             # Nuxt Content 內容檔案
├── layouts/             # 頁面佈局
├── lib/                 # 工具函式庫
├── pages/               # 頁面路由（檔案式路由）
├── plugins/             # Nuxt 插件
├── public/              # 公開靜態檔案
│   └── images/         # 圖片資源
├── scripts/             # 建置與工具腳本
├── server/              # 伺服器端程式碼與 API 路由
├── types/               # TypeScript 型別定義
├── eslint.config.js     # ESLint 配置
├── nuxt.config.ts       # Nuxt 配置檔案
├── package.json         # 專案相依套件
├── tailwind.config.ts   # Tailwind CSS 配置
└── tsconfig.json        # TypeScript 配置
```

---

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

開發伺服器將啟動於 `http://localhost:3000`

### Available Scripts

```bash
# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Commit with Commitizen
pnpm commit

# Start Storybook
pnpm storybook

# Build Storybook
pnpm build-storybook
```

---

## Production

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

---

## Code Style

本專案使用以下工具維護程式碼品質：

- [@antfu/eslint-config](https://github.com/antfu/eslint-config) - ESLint 配置
- [eslint-plugin-tailwindcss](https://github.com/francoismassart/eslint-plugin-tailwindcss) - Tailwind CSS linting
- [Prettier](https://prettier.io/) - 程式碼格式化
- [Commitizen](https://commitizen-tools.github.io/commitizen/) - 規範化 commit 訊息
- [Husky](https://typicode.github.io/husky/) - Git hooks
- [Lint-staged](https://github.com/okonet/lint-staged) - Pre-commit linting

詳細配置請參考 [eslint.config.js](eslint.config.js)

---

## Team

### Organizer

- **高見龍** - [Facebook](https://www.facebook.com/eddiekao) / [Instagram](https://www.instagram.com/kaochenlong/) / [Twitter](https://twitter.com/eddiekao)
- **廖洧杰** - [Facebook](https://www.facebook.com/sfismy)
- **理查哥** - [Facebook](https://www.facebook.com/uxrichard)
- **Sabrina**
- **Melissa**

### Developers

- **Antonio** - [Facebook](https://www.facebook.com/ling.jun.hao.839468) / [Instagram](https://www.instagram.com/qd513020/) / [LinkedIn](https://www.linkedin.com/in/antonio-222984258/) / [Blog](https://ling-jun-hao.github.io/Blog/)
- **Shin** - [Instagram](https://www.instagram.com/penspulse/) / [LinkedIn](https://www.linkedin.com/in/vincent-chen-237986152/) / [Website](https://penspulse326.github.io/)

### Designers

- **薛羽婷** - [Facebook](https://www.facebook.com/yutingsyuesha/)
- **陳彥宇 | Karas** - [Instagram](https://www.instagram.com/luminova.tw) / [LINE](https://lin.ee/aE077lU) / [Website](https://luminova.tw/)
- **EG** - [Facebook](https://www.facebook.com/eg.pan) / [Behance](https://www.behance.net/egpan) / [Website](https://pantomimeg.com/)
- **豪萱 | Birte** - [Facebook](https://www.facebook.com/zyi870213)
- **尹俞 | Nina** - [Facebook](https://www.facebook.com/yinshu.huang/)
- **楊正弘 | Scott** - [Facebook](https://www.facebook.com/scottyang0011) / [Instagram](https://www.instagram.com/scott23050000/)

---

## License

Copyright © 2025 WebConf Taiwan. All rights reserved.
