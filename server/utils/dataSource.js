/**
 * 資料來源（唯一入口）
 *
 * 目前的資料是 server/assets/data/*.json，透過 nitro 的 server assets 讀取。
 * ⚠️ 不要改用 node:fs 讀檔 —— 這個專案的 nitro preset 是 cloudflare_module，
 * Workers 執行期沒有檔案系統。server assets 會在 build 時被打包進 bundle，
 * 所以本機 dev 與 CF 上行為一致。
 *
 * 之後接真正的後端時，只需要改這一支：把 storage.getItem 換成打後端的 $fetch，
 * 並在這裡把後端的外層信封（envelope）拆掉，讓回傳的資料結構維持不變。
 * server/api/* 與前端都不用動。
 *
 * const { APP_API } = useRuntimeConfig()
 * const res = await $fetch(`${APP_API}/${name}`)
 * return res.data
 *
 * @param {string} name 資料名稱，對應 server/assets/data/<name>.json
 * @returns {Promise<object>} 已解析的資料物件
 */
export async function readData (name) {
  const data = await useStorage('assets:server').getItem(`data/${name}.json`)

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: `Data source not found: ${name}`
    })
  }

  return data
}
