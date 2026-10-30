/**
 * 畫面上實際顯示的是哪一頁的路徑。
 * 點下連結時網址馬上就變，但舊頁還要淡出、新頁還沒出現；
 * 跟著頁面顯示或隱藏的元素若直接看網址，會比新頁先出現或比舊頁先消失。
 * 由 plugins/settled-route.ts 在舊頁離場後（或同頁切換子路由時）更新
 */
export function useSettledRoutePath() {
  const route = useRoute()
  return useState<string>('settledRoutePath', () => route.path)
}
