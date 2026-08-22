<script setup>
definePageMeta({ layout: 'admin' })

// 後台頁面一律不給搜尋引擎收錄，跟 nuxt.config.ts 的 routeRules '/**': { ogImage: {} }
// 沒有衝突——og image 是給分享用的，跟 index/noindex 是兩件事，這裡另外蓋掉就好。
useSeoMeta({
  title: '後台登入 · WebConf',
  robots: 'noindex, nofollow'
})

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit () {
  error.value = ''
  loading.value = true

  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    await navigateTo('/admin')
  } catch (err) {
    error.value = err.data?.statusMessage || '登入失敗，請確認帳號密碼'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <form
      class="w-full max-w-sm border border-gray-800 bg-white p-8"
      @submit.prevent="handleSubmit"
    >
      <h1 class="text-h4 text-txt-dark">
        WebConf 後台
      </h1>
      <p class="text-body-sm mt-2 text-txt-light">
        僅限管理團隊使用
      </p>

      <label class="mt-8 block">
        <span class="text-caption text-txt-light">帳號</span>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="username"
          class="text-body-sm mt-1 block w-full border border-gray-300 px-3 py-2 text-txt-dark outline-none focus:border-brand"
        >
      </label>

      <label class="mt-4 block">
        <span class="text-caption text-txt-light">密碼</span>
        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="text-body-sm mt-1 block w-full border border-gray-300 px-3 py-2 text-txt-dark outline-none focus:border-brand"
        >
      </label>

      <p v-if="error" class="text-caption mt-4 text-red-600">
        {{ error }}
      </p>

      <AtomButton
        type="submit"
        intent="primary"
        rounded="none"
        :disabled="loading"
        :text="loading ? '登入中…' : '登入'"
        class="mt-8 w-full"
      />
    </form>
  </div>
</template>
