// GET /api/global —— header / footer 等每頁都要的資料。
// 這隻會被所有頁面呼叫，之後接後端時記得把快取一起考慮進去。
export default defineEventHandler(async () => {
  return await readData('global')
})
