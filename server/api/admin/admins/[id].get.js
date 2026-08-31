// 代理到 backend/ 的 GET /admins/:id，查看單筆管理者。
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'admin_session')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登入' })
  }

  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig()

  try {
    return await $fetch(`${config.adminApiUrl}/admins/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) {
    throw createError({
      statusCode: err.status || 500,
      statusMessage: err.data?.error || '讀取失敗，請稍後再試'
    })
  }
})
