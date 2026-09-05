/**
 * API 請求工具
 *
 * ⚠️ 全站資料改成靜態 json 之後（見 useSiteData），這支目前沒有任何呼叫者。
 * 留著是給之後真的接後端時用的入口，確定不接的話可以整支刪掉。
 *
 * @param {object}  options
 * @param {string}  options.apiPath      相對路徑，例如 '/api/global'
 * @param {string}  [options.method]     HTTP method，預設 GET
 * @param {boolean} [options.auth]       是否帶 Authorization
 * @param {string}  [options.token]      Bearer token，auth 為 true 時才會帶
 * @param {object}  [options.query]      query string
 * @param {*}       [options.body]       request body（非 GET 時送出）
 * @param {boolean} [options.client]     true 走 public.APP_API，false 走私有 APP_API
 * @param {boolean} [options.customApiUrl] true 則不接 APP_API，apiPath 直接當網址用
 *                                        （打自家 Nuxt server API /api/* 就是這個）
 */
const fetchFn = async ({
  apiPath,
  method = 'GET',
  auth = false,
  token,
  query = {},
  body,
  client = true,
  customApiUrl = false
}) => {
  const config = useRuntimeConfig()
  let APP_API = ''

  if (!customApiUrl) {
    APP_API = client ? config.public.APP_API : config.APP_API
  }

  // SPA + --host：client 不要打死 localhost，改跟目前頁面同源（走 Nitro proxy）
  // SSR 仍用 .env 的絕對網址，相對路徑在 server 會被 Vue Router 誤判成頁面路徑
  if (import.meta.client && APP_API) {
    APP_API = APP_API.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/,
      window.location.origin
    )
  }

  const apiUrl = `${APP_API}${apiPath}`

  const headers = {
    'Content-Type': 'application/json'
  }

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await $fetch(apiUrl, {
    method,
    headers,
    body: body && method !== 'GET' ? body : undefined,
    query
  })

  return response?.data ?? response
}

/**
 * 組合靜態資源完整網址
 *
 * @param {string} targetUrl 資源相對路徑
 * @returns {string} 完整網址
 */
const fetchPublic = (targetUrl = '') => {
  const config = useRuntimeConfig()

  // 這個專案只有 public.APP_URL（沒有另一支私有的 CDN 網域），
  // 所以 server / client 走同一個值。
  return `${config.public.APP_URL ?? ''}${targetUrl}`
}

export { fetchFn, fetchPublic }
