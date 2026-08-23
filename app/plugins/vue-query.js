import { VueQueryPlugin, QueryClient, hydrate, dehydrate } from '@tanstack/vue-query'

// 後台用 vue-query 管「跟 backend 要來的資料」（session、之後的報名/投稿/票券列表），
// 跟 Pinia 分工：Pinia 管畫面自己的狀態，vue-query 專管 server 資料的抓取/快取/重新驗證。
//
// SSR 需要手動把 server 端抓到的 query 結果「脫水」進 payload，client 接手時再「回水」，
// 不然 client 掛載後會整包重打一次 API。概念跟 Nuxt 的 useState 在 SSR/CSR 間共用資料一樣，
// 只是 vue-query 官方沒有內建 Nuxt 整合，得自己接這段 hydrate/dehydrate。
export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState('vue-query')

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // 後台資料不需要 react-query 預設那種「一直背景重打」，5 秒內視為新鮮就好，
        // 真的要拿最新資料時（例如 mutation 後）用 invalidateQueries 主動打就好。
        staleTime: 5000
      }
    }
  })

  nuxt.vueApp.use(VueQueryPlugin, { queryClient })

  if (import.meta.server) {
    nuxt.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }

  if (import.meta.client) {
    nuxt.hooks.hook('app:created', () => {
      hydrate(queryClient, vueQueryState.value)
    })
  }
})
