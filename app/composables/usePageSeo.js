/**
 * 各頁的 SEO 設定。資料全部在 app/constants/data/seo.json —— 要改標題、描述、
 * 哪些頁不給收錄、活動日期地點，都只改那一份。
 *
 * ⚠️ noindex 不在這裡處理：nuxt.config 讀同一份 seo.json 產生 routeRules，
 * 只有 route rule 會同時被 robots.txt／robots meta 與 sitemap 讀到
 * （頁面裡寫 useSeoMeta robots 的話 sitemap 仍然會收錄，實測過）。
 */
import seo from '~/constants/data/seo.json'

export const useSeoData = () => seo

/**
 * @param {string} path  seo.json 的 pages 鍵，就是路由路徑（'/about'）
 * @returns {object|undefined} 那一頁的設定
 */
export function usePageSeo (path) {
  const page = seo.pages[path]
  if (!page) {
    if (import.meta.dev) console.warn(`[usePageSeo] seo.json 沒有 ${path} 這一頁`)
    return
  }

  const description = page.description || seo.site.description
  // title_template: false → 標題本身已經帶品牌（首頁），不要再被接一次 "| 站名"
  const fullTitle = page.title_template === false ? page.title : `${page.title} | ${seo.site.name}`
  if (page.title_template === false) useHead({ titleTemplate: '%s' })

  useSeoMeta({
    title: page.title,
    description,
    ogTitle: fullTitle,
    ogDescription: description,
    twitterTitle: fullTitle,
    twitterDescription: description
  })

  // 與畫面及 meta 共用同一份描述，避免子頁的 WebPage 沿用全站摘要。
  useSchemaOrg([defineWebPage({ name: fullTitle, description })])

  // 分享圖全站共用 public/og.jpg，寫在 nuxt.config 的 app.head，這裡不另外設定。

  return page
}
