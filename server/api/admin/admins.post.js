// 代理到 backend/ 的 POST /admins，新增管理者。
// 跟 menu.put.js 同一套代理模式：session token 從 cookie 轉發成 Authorization header，
// backend 回什麼錯誤（400/401/403/409）就照樣轉給前端，不是全部壓成同一種。
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'admin_session')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登入' })
  }

  const body = await readBody(event)
  const config = useRuntimeConfig()

  try {
    return await $fetch(`${config.adminApiUrl}/admins`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body
    })
  } catch (err) {
    throw createError({
      statusCode: err.status || 500,
      statusMessage: err.data?.error || '新增失敗，請稍後再試'
    })
  }
})
