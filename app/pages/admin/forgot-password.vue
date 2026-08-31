<!--
  忘記密碼（未登入）。排版比照 login.vue 的置中卡片，因為使用情境一樣是
  「還沒登入、只有一張表單卡在畫面中間」。

  middleware 刻意不掛 'admin'——那支 middleware 會拿 /api/admin/me 檢查登入狀態，
  沒登入就導去 /admin/login，這頁本來就是給未登入的人用的，掛了會直接繞不進來。
  跟 login.vue 一樣不掛 middleware，只是 login.vue 本身沒寫 definePageMeta 的
  middleware 欄位（預設不掛任何 middleware），這裡沿用同樣的「不寫」做法。

  不管 /api/forgot-password 回應內容為何，畫面一律顯示同一句「不管有沒有這個帳號都
  已寄出」的話——這是刻意的安全設計（backend controller 也是同樣邏輯：帳號存在與否
  都回 200 ok），前端不能因為想「更精準」而把這句拆成兩種訊息，那樣就洩漏了帳號是否存在。
  因此這裡連 try/catch 的 catch 都顯示同一句話，不特別处理 400（email 未填由
  前端先擋，理論上打不到 400；就算打到了也不該讓使用者知道差異）。
-->
<script setup>
definePageMeta({ layout: 'admin' })

useSeoMeta({
  title: '忘記密碼 · WebConf 後台',
  robots: 'noindex, nofollow'
})

const email = ref('')
const emailError = ref('')
const submitting = ref(false)
const submitted = ref(false)

const NOTICE = '如果這個 email 有對應的帳號，重設密碼信已經寄出。'

async function onSubmit () {
  emailError.value = ''

  if (!email.value.trim()) {
    emailError.value = '請輸入電子郵件'
    return
  }

  submitting.value = true
  try {
    await $fetch('/api/forgot-password', { method: 'POST', body: { email: email.value.trim() } })
  } catch {
    // 刻意忽略錯誤內容，不管成功失敗都顯示同一句訊息（見上方註解）。
  } finally {
    submitting.value = false
    submitted.value = true
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <div class="w-full max-w-sm border border-gray-800 bg-white p-8">
      <h1 class="text-h4 text-txt-dark">
        忘記密碼
      </h1>
      <p class="text-body-sm mt-2 text-txt-light">
        輸入管理帳號的電子郵件，我們會寄送重設密碼的連結。
      </p>

      <form v-if="!submitted" class="mt-8" novalidate @submit.prevent="onSubmit">
        <label class="block">
          <span class="text-caption text-txt-light">電子郵件</span>
          <input
            v-model="email"
            type="email"
            autocomplete="username"
            class="text-body-sm mt-1 block w-full border border-gray-300 px-3 py-2 text-txt-dark outline-none focus:border-brand"
          >
          <span v-if="emailError" class="text-caption mt-1 block text-red-600">{{ emailError }}</span>
        </label>

        <AtomButton
          type="submit"
          intent="primary"
          rounded="none"
          :disabled="submitting"
          :text="submitting ? '送出中…' : '寄送重設連結'"
          class="mt-8 w-full"
        />
      </form>

      <div v-else class="mt-8">
        <p class="text-body-sm text-txt-dark">
          {{ NOTICE }}
        </p>
        <NuxtLink to="/admin/login" class="text-caption mt-4 block text-txt-light underline hover:text-brand">
          回到登入頁
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
