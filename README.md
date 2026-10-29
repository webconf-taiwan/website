# WebConf Taiwan 2024

- Website : https://2024.webconf.tw
- Facebook : https://www.facebook.com/WebConfTaiwan

## Features

- [Nuxt 3](https://nuxt.com/)
- [Pinia](https://pinia.vuejs.org/)
- [Nuxt Content](https://content.nuxt.com/)
- [VueUse](https://vueuse.org/)
- [ESLint](https://eslint.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn-vue](https://www.shadcn-vue.com/)
- [GSAP](https://gsap.com/)
- [AOS](https://michalsnik.github.io/aos/)
- [lenis](https://lenis.darkroom.engineering/)
- [Embla Carousel](https://www.embla-carousel.com/)

## Prerequistes

- Node.js >= v20.0.0
- pnpm >= v9.11.0

## ESLint Configuration

This project uses [@antfu/eslint-config](https://github.com/antfu/eslint-config).

## Development

Copy `.env.example` to `.env.local` and fill in the necessary values.

```bash
pnpm dev
```

## Production

Copy `.env.example` to `.env.production` and fill in the necessary values.

```bash
pnpm build
```

## Cloudflare Workers

The Nuxt site is generated ahead of time and deployed as Worker static assets.
Its pages, agenda detail routes, optimized images, and sitemap are generated
into `.output/public`.

```bash
pnpm install --frozen-lockfile
pnpm deploy
```

`pnpm deploy` regenerates the site before uploading it to the `webconf-2024`
Worker. `NUXT_SITE_URL` defaults to `https://2024.webconf.tw` so generated
canonical URLs and the sitemap use the archive domain. The custom domain is
declared in `wrangler.jsonc` and is already bound to the Worker.

推送 `2024` 分支後，GitHub Actions 會安裝套件、執行 `pnpm generate`，再部署 Worker。首次使用前，請在 GitHub repository 的 Actions secrets 設定 `CLOUDFLARE_ACCOUNT_ID` 與 `CLOUDFLARE_API_TOKEN`。API token 需有目標 Cloudflare 帳戶的 Workers 編輯權限。

## Developers

- 哲樺｜Frank [Instgram](https://www.instagram.com/frank_270297/) / [GitHub](GitHub：https://github.com/roceil)
- Tim [LinkedIn](https://www.linkedin.com/in/timemo/) / [GitHub](https://github.com/tingminitime)

## Designers

- 豪萱 | Birte [Facebook](https://www.facebook.com/zyi870213/) / [Instagram](https://www.instagram.com/zyi870213/)
- EG [Facebook](https://www.facebook.com/eg.pan/) / [Instagram](https://www.instagram.com/pantomimeg.jpeg)
- Scott [Facebook](https://www.facebook.com/scottyang0011) / [Instagram](https://www.instagram.com/helloscott23050000)
- 彥宇 | Karas [Instagram](https://www.instagram.com/karasnov3)
- 尹俞 | Nina [Facebook](https://www.facebook.com/yinshu.huang/)
