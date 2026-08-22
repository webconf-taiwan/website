// 通知 backend 撤銷 session（D1 裡刪掉那筆 session），再清掉這邊的 cookie。
// backend 呼叫失敗也繼續清 cookie——使用者體感上一定要能登出，
// D1 那筆孤兒 session 頂多留到 7 天自然過期，不影響安全性。
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'admin_session')
  const config = useRuntimeConfig()

  if (token) {
    await $fetch(`${config.adminApiUrl}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {})
  }

  deleteCookie(event, 'admin_session', { path: '/' })
  return { ok: true }
})
