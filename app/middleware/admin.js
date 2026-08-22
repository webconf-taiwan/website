// 只掛在後台頁面（除了登入頁本身）。SSR 跟 client-side 切換都會跑，
// 靠 /api/admin/me 問 backend session 還在不在，不在就導回登入頁。
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') return

  try {
    await $fetch('/api/admin/me')
  } catch {
    return navigateTo('/admin/login')
  }
})
