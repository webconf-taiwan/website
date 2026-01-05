# WebConf Taiwan 2025

<a href="https://webconf.tw" target="_blank" rel="noopener noreferrer">
  <img src="https://img.shields.io/badge/Website-webconf.tw-blue" alt="Website">
</a>
<a href="https://www.facebook.com/WebConfTaiwan" target="_blank" rel="noopener noreferrer">
  <img src="https://img.shields.io/badge/Facebook-WebConfTaiwan-1877F2" alt="Facebook">
</a>
<a href="https://www.instagram.com/webconftw/" target="_blank" rel="noopener noreferrer">
  <img src="https://img.shields.io/badge/Instagram-webconftw-E4405F" alt="Instagram">
</a>
<a href="https://www.threads.com/@webconftw" target="_blank" rel="noopener noreferrer">
  <img src="https://img.shields.io/badge/Threads-@webconftw-black" alt="Threads">
</a>

WebConf Taiwan 是一個聚集網頁技術愛好者和專家的年度盛會，讓大家一起探索網頁技術的演進和未來發展趨勢。過去幾年，網路世界變化迅速，我們將在這次研討會上回顧網頁技術的演變歷程，了解那些改變遊戲規則的關鍵時刻。除了回顧過去，WebConf Taiwan 更專注於未來。我們會討論如何利用人工智慧和機器學習來改善使用者體驗。還有最新的業界趨勢分享，幫助企業把握未來發展方向，保持競爭優勢。這將是一個充滿創意和靈感的活動，讓你與來自各地的網頁技術專業人士互動交流，共同探討未來的技術創新和可能性。

- **官方網站**: <a href="https://webconf.tw" target="_blank" rel="noopener noreferrer">webconf.tw</a>
- **活動花絮**: <a href="https://gallery.webconf.tw/" target="_blank" rel="noopener noreferrer">gallery.webconf.tw</a>
- **聯絡信箱**: <a href="mailto:hi@webconf.tw" target="_blank" rel="noopener noreferrer">hi@webconf.tw</a>
- **大會共筆**: <a href="https://hackmd.io/@webconf/HJiwwqnxZe/%2F9SP9NyHoSiSZEOYHsaeYeg" target="_blank" rel="noopener noreferrer">HackMD</a>

---

## Tech Stack

### Core Frameworks

- <a href="https://nuxt.com/" target="_blank" rel="noopener noreferrer">Nuxt 3</a> & <a href="https://vuejs.org/" target="_blank" rel="noopener noreferrer">Vue 3</a>
- <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">TypeScript</a>
- <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer">Tailwind v3</a>

### Nuxt Ecosystem & SEO

- <a href="https://content.nuxt.com/" target="_blank" rel="noopener noreferrer">Nuxt Content</a>
- <a href="https://nuxtseo.com/" target="_blank" rel="noopener noreferrer">Nuxt SEO</a>
- <a href="https://image.nuxt.com/" target="_blank" rel="noopener noreferrer">Nuxt Image</a>
- <a href="https://scripts.nuxt.com/" target="_blank" rel="noopener noreferrer">Nuxt Scripts</a>
- <a href="https://fonts.nuxt.com/" target="_blank" rel="noopener noreferrer">Nuxt Fonts</a>
- <a href="https://nuxt.com/modules/icon" target="_blank" rel="noopener noreferrer">Nuxt Icon</a>
- <a href="https://nuxt.com/modules/device" target="_blank" rel="noopener noreferrer">Nuxt Device</a>
- <a href="https://nuxt.com/modules/typed-router" target="_blank" rel="noopener noreferrer">Nuxt Typed Router</a>

### Animations & Creative Coding

- <a href="https://gsap.com/" target="_blank" rel="noopener noreferrer">GSAP</a>
- <a href="https://lenis.darkroom.engineering/" target="_blank" rel="noopener noreferrer">Lenis</a>
- <a href="https://p5js.org/" target="_blank" rel="noopener noreferrer">p5.js</a>
- <a href="https://vueuse.org/" target="_blank" rel="noopener noreferrer">VueUse</a>

### Engineering & Tools

- <a href="https://storybook.js.org/" target="_blank" rel="noopener noreferrer">Storybook</a>
- <a href="https://github.com/antfu/eslint-config" target="_blank" rel="noopener noreferrer">ESLint</a>
- <a href="https://commitizen-tools.github.io/commitizen/" target="_blank" rel="noopener noreferrer">Commitizen</a>
- <a href="https://typicode.github.io/husky/" target="_blank" rel="noopener noreferrer">Husky</a>

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

- <a href="https://github.com/antfu/eslint-config" target="_blank" rel="noopener noreferrer">@antfu/eslint-config</a> - ESLint 配置
- <a href="https://github.com/francoismassart/eslint-plugin-tailwindcss" target="_blank" rel="noopener noreferrer">eslint-plugin-tailwindcss</a> - Tailwind CSS linting
- <a href="https://prettier.io/" target="_blank" rel="noopener noreferrer">Prettier</a> - 程式碼格式化
- <a href="https://commitizen-tools.github.io/commitizen/" target="_blank" rel="noopener noreferrer">Commitizen</a> - 規範化 commit 訊息
- <a href="https://typicode.github.io/husky/" target="_blank" rel="noopener noreferrer">Husky</a> - Git hooks
- <a href="https://github.com/okonet/lint-staged" target="_blank" rel="noopener noreferrer">Lint-staged</a> - Pre-commit linting

詳細配置請參考 <a href="eslint.config.js" target="_blank" rel="noopener noreferrer">eslint.config.js</a>

---

## Team

### Organizer

- **高見龍** - <a href="https://www.facebook.com/eddiekao" target="_blank" rel="noopener noreferrer">Facebook</a> / <a href="https://www.instagram.com/kaochenlong/" target="_blank" rel="noopener noreferrer">Instagram</a> / <a href="https://twitter.com/eddiekao" target="_blank" rel="noopener noreferrer">Twitter</a>
- **廖洧杰** - <a href="https://www.facebook.com/sfismy" target="_blank" rel="noopener noreferrer">Facebook</a>
- **理查哥** - <a href="https://www.facebook.com/uxrichard" target="_blank" rel="noopener noreferrer">Facebook</a>
- **Sabrina**
- **Melissa**

### Developers

- **Antonio** - <a href="https://www.facebook.com/ling.jun.hao.839468" target="_blank" rel="noopener noreferrer">Facebook</a> / <a href="https://www.instagram.com/qd513020/" target="_blank" rel="noopener noreferrer">Instagram</a> / <a href="https://www.linkedin.com/in/antonio-222984258/" target="_blank" rel="noopener noreferrer">LinkedIn</a> / <a href="https://ling-jun-hao.github.io/Blog/" target="_blank" rel="noopener noreferrer">Blog</a>
- **Shin** - <a href="https://www.instagram.com/penspulse/" target="_blank" rel="noopener noreferrer">Instagram</a> / <a href="https://www.linkedin.com/in/vincent-chen-237986152/" target="_blank" rel="noopener noreferrer">LinkedIn</a> / <a href="https://penspulse326.github.io/" target="_blank" rel="noopener noreferrer">Website</a>

### Designers

- **薛羽婷** - <a href="https://www.facebook.com/yutingsyuesha/" target="_blank" rel="noopener noreferrer">Facebook</a>
- **陳彥宇 | Karas** - <a href="https://www.instagram.com/luminova.tw" target="_blank" rel="noopener noreferrer">Instagram</a> / <a href="https://lin.ee/aE077lU" target="_blank" rel="noopener noreferrer">LINE</a> / <a href="https://luminova.tw/" target="_blank" rel="noopener noreferrer">Website</a>
- **EG** - <a href="https://www.facebook.com/eg.pan" target="_blank" rel="noopener noreferrer">Facebook</a> / <a href="https://www.behance.net/egpan" target="_blank" rel="noopener noreferrer">Behance</a> / <a href="https://pantomimeg.com/" target="_blank" rel="noopener noreferrer">Website</a>
- **豪萱 | Birte** - <a href="https://www.facebook.com/zyi870213" target="_blank" rel="noopener noreferrer">Facebook</a>
- **尹俞 | Nina** - <a href="https://www.facebook.com/yinshu.huang/" target="_blank" rel="noopener noreferrer">Facebook</a>
- **楊正弘 | Scott** - <a href="https://www.facebook.com/scottyang0011" target="_blank" rel="noopener noreferrer">Facebook</a> / <a href="https://www.instagram.com/scott23050000/" target="_blank" rel="noopener noreferrer">Instagram</a>

---

## License

Copyright © 2025 WebConf Taiwan. All rights reserved.
