export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const settledPath = useSettledRoutePath()

  // 同一個頂層頁面內切換子路由（例如開關講者彈窗）不會播換頁轉場，直接更新
  router.afterEach((to, from) => {
    if (to.matched[0]?.path === from.matched[0]?.path)
      settledPath.value = to.path
  })

  // 換頁時等舊頁淡出結束、新頁開始進場才更新
  nuxtApp.hook('page:transition:finish', () => {
    settledPath.value = router.currentRoute.value.path
  })
})
