// GET /api/home —— 首頁各區塊（hero / about / speaker / venue / faq / ticket /
// sponsor / code_of_conduct）的內容。
export default defineEventHandler(async () => {
  return await readData('home')
})
