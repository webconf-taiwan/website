<!--
  修改密碼（登入後）。跟 login.vue 不同的是這裡不用 vee-validate/zod schema——
  三個欄位、規則單純（強度 regex + 兩次密碼一致），手刻 ref + function 檢查
  比多引入一份 schema 定義更快看懂，login.vue 那套是給 email 格式這種
  之後很多頁都會重複用到的規則，這裡不算。

  成功後刻意不自動導頁，而是顯示訊息＋按鈕讓使用者自己按「回到 Dashboard」：
  API 成功後會撤銷其他裝置的 session，這件事使用者應該要「看到」再離開，
  自動跳轉容易讓人沒注意到這句提示。
-->
<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })

useSeoMeta({
  title: '修改密碼 · WebConf 後台',
  robots: 'noindex, nofollow'
})

const oldPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')

// 密碼強度：至少 8 碼、同時有大小寫字母、至少 1 個特殊符號。跟 backend
// backend/src/utils/password.ts 的 isStrongPassword 是同一套規則，前端這層
// 只是先擋一次讓使用者不用等 API 回來才知道哪裡不合格，backend 那邊還是會再驗一次。
const STRONG_PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/

const fieldErrors = reactive({ oldPassword: '', newPassword: '', newPasswordConfirm: '' })
const serverError = ref('')
const success = ref(false)
const submitting = ref(false)

function validate () {
  fieldErrors.oldPassword = ''
  fieldErrors.newPassword = ''
  fieldErrors.newPasswordConfirm = ''

  if (!oldPassword.value) {
    fieldErrors.oldPassword = '請輸入原密碼'
  }
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

  return !fieldErrors.oldPassword && !fieldErrors.newPassword && !fieldErrors.newPasswordConfirm
}

async function onSubmit () {
  serverError.value = ''
  success.value = false

  if (!validate()) return

  submitting.value = true
  try {
    await $fetch('/api/admin/change-password', {
      method: 'POST',
      body: {
        old_password: oldPassword.value,
        new_password: newPassword.value,
        new_password_confirm: newPasswordConfirm.value
      }
    })
    success.value = true
    oldPassword.value = ''
    newPassword.value = ''
    newPasswordConfirm.value = ''
  } catch (err) {
    serverError.value = err.data?.statusMessage || '修改密碼失敗，請稍後再試'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container max-w-md py-8">
    <header class="border-b border-gray-300 pb-6">
      <h1 class="text-h4 text-txt-dark">
        修改密碼
      </h1>
    </header>

    <form v-if="!success" class="mt-6 flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
      <label class="block">
        <span class="text-caption text-txt-light">原密碼</span>
        <input
          v-model="oldPassword"
          type="password"
          autocomplete="current-password"
          class="text-body-sm mt-1 block w-full border border-gray-300 px-3 py-2 text-txt-dark outline-none focus:border-brand"
        >
        <span v-if="fieldErrors.oldPassword" class="text-caption mt-1 block text-red-600">{{ fieldErrors.oldPassword }}</span>
      </label>

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

      <label class="block">
        <span class="text-caption text-txt-light">確認新密碼</span>
        <input
          v-model="newPasswordConfirm"
          type="password"
          autocomplete="new-password"
          class="text-body-sm mt-1 block w-full border border-gray-300 px-3 py-2 text-txt-dark outline-none focus:border-brand"
        >
        <span v-if="fieldErrors.newPasswordConfirm" class="text-caption mt-1 block text-red-600">{{ fieldErrors.newPasswordConfirm }}</span>
      </label>

      <p v-if="serverError" class="text-caption text-red-600">
        {{ serverError }}
      </p>

      <AtomButton
        type="submit"
        intent="primary"
        rounded="none"
        :disabled="submitting"
        :text="submitting ? '送出中…' : '修改密碼'"
        class="mt-2 w-full"
      />
    </form>

    <div v-else class="mt-6 border border-gray-300 bg-white p-6">
      <p class="text-body-sm text-txt-dark">
        密碼修改成功。
      </p>
      <p class="text-caption mt-2 text-txt-light">
        其他裝置已被登出，需要用新密碼重新登入。
      </p>
      <AtomButton
        href="/admin"
        intent="secondary"
        rounded="none"
        text="回到 Dashboard"
        class="mt-4"
      />
    </div>
  </div>
</template>
