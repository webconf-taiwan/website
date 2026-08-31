// 代理到 backend/ 的 POST /auth/change-password，修改自己的密碼。
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'admin_session')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登入' })
  }

  const body = await readBody(event)
  const config = useRuntimeConfig()

  try {
    return await $fetch(`${config.adminApiUrl}/auth/change-password`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body
    })
  } catch (err) {
    throw createError({
      statusCode: err.status || 500,
      statusMessage: err.data?.error || '修改密碼失敗，請稍後再試'
    })
  }
})
