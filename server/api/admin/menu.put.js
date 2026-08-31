// 代理到 backend/ 的 PUT /menu，儲存 Header/Footer 選單。
// 跟 admins.get.js / login.post.js 同一套代理模式：瀏覽器不直接碰 backend，
// session token 只在這一層從 cookie 轉發成 Authorization header。
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'admin_session')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登入' })
  }

  const body = await readBody(event)
  const config = useRuntimeConfig()

  try {
    return await $fetch(`${config.adminApiUrl}/menu`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body
    })
  } catch (err) {
    throw createError({
      statusCode: err.status || 500,
      statusMessage: err.data?.error || '儲存失敗，請稍後再試'
    })
  }
})
