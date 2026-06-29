/**
 * 判斷 HTTP status 是否為成功（2xx）
 */
const isSuccessStatus = (status) => status >= 200 && status < 300

/**
 * 從 ofetch 錯誤物件取出 status code
 */
const getErrorStatus = (error) => {
  return error?.statusCode ?? error?.response?.status ?? error?.status ?? 0
}

/**
 * 命令式 API 請求工具（基於 $fetch / ofetch）
 *
 * 與原版差異：
 * - 用 $fetch 取代 useFetch：可在任何地方呼叫，不受 setup context 限制
 * - 修正未定義的 token：改由參數傳入
 * - SSR 走私有 APP_API，瀏覽器端走 public.APP_API
 * - 依 HTTP status code 判斷成功與否，統一回傳 { success, statusCode, data, error }
 *
 * @param {object} options
 * @param {string} options.apiPath        相對路徑，例如 '/posts'
 * @param {string} [options.method]       HTTP method，預設 GET
 * @param {object} [options.query]        query string 物件
 * @param {*}      [options.body]         request body（非 GET 時送出）
 * @param {string} [options.token]        Bearer token，有值才帶 Authorization
 * @param {object} [options.headers]      額外 headers
 * @param {string} [options.baseUrl]      自訂完整 base URL，會略過 runtimeConfig
 * @param {number[]} [options.acceptedStatusCodes] 額外視為成功的 status（預設僅 2xx）
 * @param {object} [options.fetchOptions] 其餘原生 $fetch 設定（如 timeout、retry）
 */
export const fetchFn = async ({
  apiPath,
  method = 'GET',
  query = {},
  body,
  token = '',
  headers = {},
  baseUrl,
  acceptedStatusCodes = [],
  fetchOptions = {}
} = {}) => {
  const config = useRuntimeConfig()
  const base = baseUrl ?? (import.meta.server ? config.APP_API : config.public.APP_API)

  const route = useRoute()
  const mergedQuery = { ...query }
  if (route?.query?.preview_id) {
    mergedQuery.preview_id = route.query.preview_id
  }

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers
  }
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  const isAcceptedStatus = (status) => {
    return isSuccessStatus(status) || acceptedStatusCodes.includes(status)
  }

  try {
    const response = await $fetch.raw(apiPath, {
      baseURL: base,
      method,
      headers: requestHeaders,
      query: mergedQuery,
      body: method !== 'GET' ? body : undefined,
      ignoreResponseError: true,
      ...fetchOptions
    })

    const statusCode = response.status
    const data = response._data

    if (!isAcceptedStatus(statusCode)) {
      const error = {
        statusCode,
        message: `HTTP ${statusCode}`,
        data
      }

      if (import.meta.dev) {
        console.error(`[fetchFn] ${method} ${apiPath} 非成功狀態：`, error)
      }

      return {
        success: false,
        statusCode,
        data,
        error
      }
    }

    return {
      success: true,
      statusCode,
      data,
      error: null
    }
  } catch (error) {
    const statusCode = getErrorStatus(error)

    if (import.meta.dev) {
      console.error(`[fetchFn] ${method} ${apiPath} 失敗 (${statusCode})：`, error)
    }

    return {
      success: false,
      statusCode,
      data: error?.data ?? null,
      error
    }
  }
}

/**
 * 組合靜態資源完整網址
 *
 * @param {string} targetUrl 資源相對路徑
 * @returns {string} 完整網址
 */
export const fetchPublic = (targetUrl = '') => {
  const config = useRuntimeConfig()
  const base = config.public.APP_URL ?? ''

  return `${base}${targetUrl}`
}
