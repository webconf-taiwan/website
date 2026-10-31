export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const settledPath = useSettledRoutePath()
  const targetPath = useTargetRoutePath()

  // 點下連結就記下要去哪；導覽被取消或失敗時退回目前的頁面
  router.beforeEach((to) => {
    targetPath.value = to.path
  })

  router.afterEach((to, from, failure) => {
    if (failure) {
      targetPath.value = router.currentRoute.value.path
      return
    }

    // 同一個頂層頁面內切換子路由（例如開關講者彈窗）不會播換頁轉場，直接更新
    if (to.matched[0]?.path === from.matched[0]?.path)
      settledPath.value = to.path
  })

  // 換頁時等舊頁淡出結束、新頁開始進場才更新
  let fallbackTimer: ReturnType<typeof setTimeout> | undefined
  const settle = () => {
    clearTimeout(fallbackTimer)
    settledPath.value = router.currentRoute.value.path
  }
  nuxtApp.hook('page:transition:finish', settle)

  // 新頁準備好後舊頁約 0.4 秒離場；若這次沒播轉場（例如新頁還沒準備好又點了別頁），
  // page:transition:finish 不會觸發，1 秒後直接以目前頁面為準，避免停在舊值
  nuxtApp.hook('page:finish', () => {
    clearTimeout(fallbackTimer)
    fallbackTimer = setTimeout(settle, 1000)
  })
})
