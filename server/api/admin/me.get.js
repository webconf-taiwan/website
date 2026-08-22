// 用 cookie 裡的 session token 跟 backend 換目前登入的管理員資訊。
// app/middleware/admin.js 靠這支判斷要不要放行進後台頁面。
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'admin_session')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登入' })
  }

  const config = useRuntimeConfig()

  try {
    return await $fetch(`${config.adminApiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch {
    throw createError({ statusCode: 401, statusMessage: '登入已過期' })
  }
})
