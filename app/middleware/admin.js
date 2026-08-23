// 只掛在後台頁面（除了登入頁本身）。SSR 跟 client-side 切換都會跑，
// 靠 /api/admin/me 問 backend session 還在不在，不在就導回登入頁。
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') return

  // 這裡一定要用 useRequestFetch()，不能用裸的 $fetch。原因是重新整理（SSR）時，
  // 裸 $fetch 打 /api/admin/me 不會帶到瀏覽器原本那顆 admin_session cookie
  // （它是全新一條 server-to-server 的請求，不是「轉發」使用者原本那個 request），
  // 後端永遠查不到人就當未登入，變成一重新整理就被踢回登入頁。
  // useRequestFetch() 在 server 端會拿目前這個 request 的 event.$fetch，自動帶 cookie；
  // client 端則等同原本的 $fetch，行為不變。
  const requestFetch = useRequestFetch()

  try {
    await requestFetch('/api/admin/me')
  } catch {
    return navigateTo('/admin/login')
  }
})
