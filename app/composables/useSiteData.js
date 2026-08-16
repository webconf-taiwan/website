/**
 * 前端取資料的唯一入口。
 *
 * 前端一律打自家的 Nuxt server API（/api/*），不直接打外部後端 —— 之後真的接了後端，
 * 只要改 server/utils/dataSource.js，這一層跟所有元件都不用動。
 *
 * ⚠️ API 回傳的欄位是底線命名（snake_case），這裡刻意不轉成小駝峰：
 * 多一層轉換就多一份要同步維護的對照表，欄位一改兩邊就會對不起來。
 * 元件裡直接用 data.code_of_conduct 這種寫法就是正確的。
 */

// 資料還沒到（SSR 失敗、API 掛掉）時的骨架，讓元件不用到處寫 ?. 判斷
const GLOBAL_FALLBACK = {
  header: { logo: {}, nav_items: [] },
  footer: { logo: {}, paragraphs: [], menu_groups: [] }
}

const HOME_FALLBACK = {
  hero: {},
  about: {},
  speaker: { items: [] },
  venue: {},
  faq: { items: [] },
  ticket: { items: [] },
  sponsor: { items: [] },
  code_of_conduct: {}
}

/**
 * header / footer 資料。每頁都會用到。
 *
 * ⚠️ key 要固定成 'global'：Header 與 Footer 各呼叫一次，useAsyncData 會依 key
 * 去重，實際只會發一次請求，且 SSR 的結果會直接帶到瀏覽器端，不會再打第二次。
 */
export const useGlobalData = async () => {
  const { data, error } = await useAsyncData(
    'global',
    // customApiUrl：打自家的 Nuxt server API，不要接 APP_API
    () => fetchFn({ apiPath: '/api/global', customApiUrl: true }),
    { default: () => ({}) }
  )

  if (error.value) {
    console.error('[useGlobalData] 取得 global 資料失敗：', error.value)
  }

  return computed(() => ({ ...GLOBAL_FALLBACK, ...(data.value || {}) }))
}

/**
 * 首頁各區塊資料。
 */
export const useHomeData = async () => {
  const { data, error } = await useAsyncData(
    'home',
    () => fetchFn({ apiPath: '/api/home', customApiUrl: true }),
    { default: () => ({}) }
  )

  if (error.value) {
    console.error('[useHomeData] 取得 home 資料失敗：', error.value)
  }

  return computed(() => ({ ...HOME_FALLBACK, ...(data.value || {}) }))
}
