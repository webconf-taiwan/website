<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })

useSeoMeta({
  title: 'Dashboard · WebConf 後台',
  robots: 'noindex, nofollow'
})

// middleware 已經驗過 session 才會放行到這頁，這裡再拿一次是為了顯示帳號資訊，
// 不是重複驗證——SSR 只打一次，跟 middleware 那次共用同一顆 cookie。
const { data } = await useFetch('/api/admin/me')

const loggingOut = ref(false)

async function handleLogout () {
  loggingOut.value = true
  await $fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="container py-8">
    <header class="flex items-center justify-between border-b border-gray-300 pb-6">
      <div>
        <h1 class="text-h4 text-txt-dark">
          Dashboard
        </h1>
        <p class="text-body-sm mt-1 text-txt-light">
          {{ data?.admin?.email }}
        </p>
      </div>
      <AtomButton
        intent="outline"
        size="sm"
        rounded="none"
        :disabled="loggingOut"
        text="登出"
        @click="handleLogout"
      />
    </header>

    <section class="mt-8">
      <p class="text-body-sm text-txt-light">
        後台骨架先到這裡——實際要管理的內容（報名、投稿、票券⋯）之後再加。
      </p>
    </section>
  </div>
</template>
