<!--
  重設密碼（未登入，帶 Token）。跟 forgot-password.vue 一樣不掛 admin middleware，
  理由相同：這頁本來就是給未登入的人（收到信、點連結進來）用的。

  Token 從網址查詢參數拿，沒有就直接不顯示表單、只顯示「連結無效」——不送出
  一個註定會被 backend 擋掉的請求，也讓使用者不用猜為什麼填完密碼卻一直失敗。
-->
<script setup>
definePageMeta({ layout: 'admin' })

useSeoMeta({
  title: '重設密碼 · WebConf 後台',
  robots: 'noindex, nofollow'
})

const route = useRoute()
const token = computed(() => route.query.token || '')

const newPassword = ref('')
const newPasswordConfirm = ref('')

const STRONG_PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/

const fieldErrors = reactive({ newPassword: '', newPasswordConfirm: '' })
const serverError = ref('')
const submitting = ref(false)
const success = ref(false)

function validate () {
  fieldErrors.newPassword = ''
  fieldErrors.newPasswordConfirm = ''

  if (!newPassword.value) {
    fieldErrors.newPassword = '請輸入新密碼'
  } else if (!STRONG_PASSWORD_RE.test(newPassword.value)) {
    fieldErrors.newPassword = '新密碼至少 8 碼，需同時包含大小寫字母與至少 1 個特殊符號'
  }
  if (!newPasswordConfirm.value) {
    fieldErrors.newPasswordConfirm = '請再輸入一次新密碼'
  } else if (newPassword.value && newPasswordConfirm.value !== newPassword.value) {
    fieldErrors.newPasswordConfirm = '新密碼與確認密碼不一致'
  }

  return !fieldErrors.newPassword && !fieldErrors.newPasswordConfirm
}

async function onSubmit () {
  serverError.value = ''

  if (!validate()) return

  submitting.value = true
  try {
    await $fetch('/api/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        new_password: newPassword.value,
        new_password_confirm: newPasswordConfirm.value
      }
    })
    success.value = true
  } catch (err) {
    serverError.value = err.data?.statusMessage || '重設密碼失敗，請稍後再試'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <div class="w-full max-w-sm border border-gray-800 bg-white p-8">
      <h1 class="text-h4 text-txt-dark">
        重設密碼
      </h1>

      <template v-if="!token">
        <p class="text-body-sm mt-4 text-red-600">
          連結無效，請重新申請忘記密碼。
        </p>
        <NuxtLink to="/admin/forgot-password" class="text-caption mt-4 block text-txt-light underline hover:text-brand">
          重新申請忘記密碼
        </NuxtLink>
      </template>

      <template v-else-if="success">
        <p class="text-body-sm mt-4 text-txt-dark">
          密碼重設成功，請用新密碼重新登入。
        </p>
        <NuxtLink to="/admin/login" class="text-caption mt-4 block text-txt-light underline hover:text-brand">
          前往登入頁
        </NuxtLink>
      </template>

      <form v-else class="mt-8" novalidate @submit.prevent="onSubmit">
        <label class="block">
          <span class="text-caption text-txt-light">新密碼</span>
          <input
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            class="text-body-sm mt-1 block w-full border border-gray-300 px-3 py-2 text-txt-dark outline-none focus:border-brand"
          >
          <span v-if="fieldErrors.newPassword" class="text-caption mt-1 block text-red-600">{{ fieldErrors.newPassword }}</span>
          <span v-else class="text-caption mt-1 block text-txt-super-light">至少 8 碼，需同時包含大小寫字母與至少 1 個特殊符號</span>
        </label>

        <label class="mt-4 block">
          <span class="text-caption text-txt-light">確認新密碼</span>
          <input
            v-model="newPasswordConfirm"
            type="password"
            autocomplete="new-password"
            class="text-body-sm mt-1 block w-full border border-gray-300 px-3 py-2 text-txt-dark outline-none focus:border-brand"
          >
          <span v-if="fieldErrors.newPasswordConfirm" class="text-caption mt-1 block text-red-600">{{ fieldErrors.newPasswordConfirm }}</span>
        </label>

        <p v-if="serverError" class="text-caption mt-4 text-red-600">
          {{ serverError }}
        </p>

        <AtomButton
          type="submit"
          intent="primary"
          rounded="none"
          :disabled="submitting"
          :text="submitting ? '送出中…' : '重設密碼'"
          class="mt-8 w-full"
        />
      </form>
    </div>
  </div>
</template>
