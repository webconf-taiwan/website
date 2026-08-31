// GET /api/global —— header / footer 等每頁都要的資料。
// 這隻會被所有頁面呼叫。
//
// 選單本體（header.nav_items / footer.menu_groups）已經搬進 backend 的 D1
// （見 backend/src/routes/menu.ts），這裡打 GET /menu 換回來，蓋掉 JSON 檔裡
// 舊的選單欄位。logo / tagline / paragraphs 這些非選單欄位還留在 global.json，
// 兩邊合併回傳——Header.vue / Footer.vue 拿到的資料形狀完全不變，不用跟著改。
export default defineEventHandler(async () => {
  const globalJson = await readData('global')
  const config = useRuntimeConfig()

  try {
    const menu = await $fetch(`${config.adminApiUrl}/menu`)

    return {
      ...globalJson,
      header: { ...globalJson.header, nav_items: menu.nav_items },
      footer: { ...globalJson.footer, menu_groups: menu.menu_groups }
    }
  } catch (err) {
    // backend 打不到（本機沒開、或掛了）就退回 JSON 檔的舊選單資料，
    // 網站至少還能顯示，不會整頁掛掉。
    console.error('[api/global] 取得後端選單資料失敗，改用 JSON 檔的舊資料：', err)
    return globalJson
  }
})
