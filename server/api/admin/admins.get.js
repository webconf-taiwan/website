// 用 cookie 裡的 session token 跟 backend 要「所有管理者」列表。
// 跟 me.get.js 同一套代理模式：瀏覽器不直接碰 backend，token 只在這一層轉發。
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'admin_session')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登入' })
  }

  const config = useRuntimeConfig()

  try {
    return await $fetch(`${config.adminApiUrl}/admins`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch {
    throw createError({ statusCode: 401, statusMessage: '登入已過期' })
  }
})
