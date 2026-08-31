<!--
  後台專用 layout，不掛公版 LayoutPageHeader / Footer——後台不是給訪客看的，
  套公版導覽列只會讓人以為還在主站。維持同一套 design token（gray-800 / brand /
  txt-*、Tailwind 字級）讓視覺上還是「同一個 WebConf」，但殼是獨立的。

  左側 sidebar 是這次加「首頁設定」順便補的。後台只有一頁的時候不需要導覽，
  但之後報名/投稿/票券會陸續加頁面，先把選單骨架建起來，之後加頁面只要在
  NAV_ITEMS 加一筆，不用每個頁面自己刻導覽列。

  登入頁（/admin/login）也是套這個 layout，但它是置中的獨立卡片，不該有
  側邊導覽（而且使用者根本還沒登入，導覽也沒意義），所以用路徑判斷關掉 aside，
  而不是給登入頁另開一個 layout 檔，兩個 layout 幾乎一樣的東西沒必要拆兩份。

  帳號資訊 + 登出原本放在 dashboard 頁面自己的 header，搬到這裡固定在左下角，
  這樣不管在哪一頁（首頁設定、之後的報名/投稿/票券⋯）都能登出，不用先跳回
  Dashboard 才登得出去。/api/admin/me、登出的 mutation 也跟著搬過來，dashboard
  頁面不用再自己拉一次。
-->
<script setup>
import { useMutation, useQuery } from '@tanstack/vue-query'

const route = useRoute()

const isLoginPage = computed(() => route.path === '/admin/login')

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin' },
  { label: '首頁設定', to: '/admin/home-settings' },
  { label: '選單設定', to: '/admin/menu-settings' },
  { label: '管理者列表', to: '/admin/admins' }
]

function isActive (to) {
  return to === '/admin' ? route.path === '/admin' : route.path.startsWith(to)
}

// 登入頁不用查帳號，所以 enabled 關掉，不然還沒登入就先打一次 /api/admin/me 註定 401。
// 寫法跟 app/middleware/admin.js 同一個道理：SSR 時要用 useRequestFetch() 才會
// 帶到瀏覽器的 admin_session cookie，裸 $fetch 查不到人。
const requestFetch = useRequestFetch()
const { data: me, suspense } = useQuery({
  queryKey: ['admin', 'me'],
  queryFn: () => requestFetch('/api/admin/me'),
  enabled: computed(() => !isLoginPage.value)
})
if (import.meta.server && !isLoginPage.value) await suspense()

const { mutate: logout, isPending: loggingOut } = useMutation({
  mutationFn: () => $fetch('/api/admin/logout', { method: 'POST' }),
  // 不管 backend 撤銷 session 成不成功，前端都導回登入頁。
  // cookie 已經被 server/api/admin/logout 清掉了，使用者體感上一定要能登出。
  onSettled: () => navigateTo('/admin/login')
})
</script>

<template>
  <div class="flex min-h-screen bg-gray-100 text-txt">
    <aside v-if="!isLoginPage" class="flex w-56 shrink-0 flex-col border-r border-gray-300 bg-white">
      <div class="border-b border-gray-300 px-6 py-6">
        <p class="text-body-sm font-medium text-txt-dark">
          WebConf 後台
        </p>
      </div>

      <nav class="flex flex-1 flex-col py-2">
        <NuxtLink
          v-for="item in NAV_ITEMS"
          :key="item.to"
          :to="item.to"
          class="text-body-sm border-l-2 px-6 py-3 transition-colors"
          :class="isActive(item.to)
            ? 'border-brand bg-gray-100 text-txt-dark font-medium'
            : 'border-transparent text-txt-light hover:bg-gray-100 hover:text-txt-dark'"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- 固定在左下角，跟上面可捲動的導覽分開，之後 NAV_ITEMS 變多也不會
           把登出擠到螢幕外面。 -->
      <div class="border-t border-gray-300 px-6 py-4">
        <p class="text-caption truncate text-txt-light" :title="me?.admin?.email">
          {{ me?.admin?.email }}
        </p>
        <AtomButton
          intent="outline"
          size="sm"
          rounded="none"
          :disabled="loggingOut"
          text="登出"
          class="mt-2 w-full"
          @click="logout()"
        />
      </div>
    </aside>

    <main class="min-w-0 flex-1">
      <slot />
    </main>
  </div>
</template>
