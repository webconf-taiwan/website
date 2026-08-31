// 代理到 backend/ 的 DELETE /admins，批次刪除管理者。
// 列表批次刪除、內頁單筆刪除都打這支，單筆刪除時 ids 傳一筆即可（見 Todolist0831.md 第 5 節）。
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'admin_session')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登入' })
  }

  const body = await readBody(event)
  const config = useRuntimeConfig()

  try {
    return await $fetch(`${config.adminApiUrl}/admins`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      body
    })
  } catch (err) {
    throw createError({
      statusCode: err.status || 500,
      statusMessage: err.data?.error || '刪除失敗，請稍後再試'
    })
  }
})
