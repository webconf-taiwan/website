// 代理到 backend/ 的 POST /auth/reset-password。不需要登入。
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  try {
    return await $fetch(`${config.adminApiUrl}/auth/reset-password`, {
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
