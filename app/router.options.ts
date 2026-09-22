import type { RouterConfig } from '@nuxt/schema'

// Nuxt 內建的 scrollBehavior 會在換路由／換 hash 時自己原生瞬跳到目標
// （vue-router 的 el.scrollIntoView），跟 lenis.client.js 裡 lenis 驅動的
// 平滑捲動搶著跑 —— 兩邊都想決定最終捲動位置，疊在一起會先跳到接近終點
// 再被 lenis 修正一小段，變成「先瞬移、再微調」而不是一路平滑捲過去。
// 所以這裡全部交回 false，捲動完全交給 lenis（見 lenis.client.js 的
// page:finish / scrollToHash）。
export default <RouterConfig>{
  scrollBehavior () {
    return false
  }
}
