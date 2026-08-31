// 代理到 backend/ 的 POST /auth/forgot-password。不需要登入，所以不掛在 server/api/admin/ 底下
// （見 Todolist0831.md 第 13 節「忘記密碼兩支不需要登入，走一般 server/api/」）。
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  try {
    return await $fetch(`${config.adminApiUrl}/auth/forgot-password`, {
      method: 'POST',
      body
    })
  } catch (err) {
    throw createError({
      statusCode: err.status || 500,
      statusMessage: err.data?.error || '請求失敗，請稍後再試'
    })
  }
})
