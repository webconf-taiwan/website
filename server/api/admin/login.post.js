// 代理到 backend/ 的 POST /auth/login。
// backend 回傳的 session token 只存在這支路由的 httpOnly cookie 裡，
// 瀏覽器端 JS 拿不到，也不會被 XSS 偷走。
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  try {
    const data = await $fetch(`${config.adminApiUrl}/auth/login`, {
      method: 'POST',
      body
    })

    setCookie(event, 'admin_session', data.token, {
      httpOnly: true,
      secure: !import.meta.dev,
      sameSite: 'lax',
      path: '/',
      // 跟 backend/src/routes/auth.ts 的 SESSION_TTL_MS 對齊，都是 7 天。
      maxAge: 60 * 60 * 24 * 7
    })

    return { admin: data.admin }
  } catch (err) {
    throw createError({
      statusCode: err.status || 500,
      statusMessage: err.data?.error || '登入失敗，請稍後再試'
    })
  }
})
