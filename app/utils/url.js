/**
 * 把 API 回傳的「站台根目錄相對路徑」（例如 /logo-webconf.svg）接上 app.baseURL。
 *
 * ⚠️ baseURL 結尾一定有斜線，直接字串相加會變成 '//logo.svg' —— 那是
 * protocol-relative URL，瀏覽器會當成 https://logo.svg 這個主機去抓。
 * 所以最後要把重複的斜線收掉。
 *
 * @param {string} path 資源路徑，例如 '/sponsors/wubei.svg'
 * @returns {string} 可直接放進 src 的網址
 */
export const assetUrl = (path = '') => {
  const { app } = useRuntimeConfig()

  return `${app.baseURL}/${path}`.replace(/\/{2,}/g, '/')
}

/**
 * target="_blank" 一定要配 rel，否則新分頁能透過 window.opener 操作原頁。
 *
 * @param {string} target 連結的 target，資料由 API 給
 * @returns {string|undefined} rel 屬性值
 */
export const linkRel = (target = '') => {
  return target === '_blank' ? 'noopener noreferrer' : undefined
}
