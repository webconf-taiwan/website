<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({ layout: 'admin' })

// 後台頁面一律不給搜尋引擎收錄，跟 nuxt.config.ts 的 routeRules '/**': { ogImage: {} }
// 沒有衝突——og image 是給分享用的，跟 index/noindex 是兩件事，這裡另外蓋掉就好。
useSeoMeta({
  title: '後台登入 · WebConf',
  robots: 'noindex, nofollow'
})

// 欄位格式（email 長怎樣、密碼不能空白）交給 zod schema 描述，vee-validate 負責在
// blur/submit 時跑驗證、收集每個欄位各自的錯誤訊息，不用再手刻一堆 ref + if/else。
// 這支 schema 之後投稿/票券的表單也能照抄同一個寫法。
const schema = toTypedSchema(z.object({
  email: z.string().min(1, '請輸入電子郵件').email('電子郵件格式不正確'),
  password: z.string().min(1, '請輸入密碼')
}))

const { defineField, errors, handleSubmit, isSubmitting } = useForm({
  validationSchema: schema,
  // 沒給 initialValues 的話欄位預設是 undefined，一送出 zod 會先被型別檢查擋下來，
  // 跳出 zod 內建的英文 "Required"，輪不到我們自己寫的中文訊息（那個只在「是字串但是空字串」
  // 時才會生效）。給空字串當初始值，讓「沒填」跟「填了空字串」是同一種情況。
  initialValues: { email: '', password: '' }
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

// serverError 跟 errors（vee-validate 的欄位驗證錯誤）分開放：前者是「帳密都合法格式，
// 但 backend 說不對」，後者是「格式本身就不對」，兩種錯誤的處理時機不一樣，混在一起
// 會變成 submit 一次兩種錯誤同時洗掉/同時留著，使用者搞不清楚是哪一種。
const serverError = ref('')

const onSubmit = handleSubmit(async (values) => {
  serverError.value = ''

  try {
    await $fetch('/api/admin/login', { method: 'POST', body: values })
    await navigateTo('/admin')
  } catch (err) {
    serverError.value = err.data?.statusMessage || '登入失敗，請確認帳號密碼'
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <form
      class="w-full max-w-sm border border-gray-800 bg-white p-8"
      novalidate
      @submit.prevent="onSubmit"
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
          autocomplete="username"
          v-bind="emailAttrs"
          class="text-body-sm mt-1 block w-full border border-gray-300 px-3 py-2 text-txt-dark outline-none focus:border-brand"
        >
        <span v-if="errors.email" class="text-caption mt-1 block text-red-600">{{ errors.email }}</span>
      </label>

      <label class="mt-4 block">
        <span class="text-caption text-txt-light">密碼</span>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          v-bind="passwordAttrs"
          class="text-body-sm mt-1 block w-full border border-gray-300 px-3 py-2 text-txt-dark outline-none focus:border-brand"
        >
        <span v-if="errors.password" class="text-caption mt-1 block text-red-600">{{ errors.password }}</span>
      </label>

      <p v-if="serverError" class="text-caption mt-4 text-red-600">
        {{ serverError }}
      </p>

      <AtomButton
        type="submit"
        intent="primary"
        rounded="none"
        :disabled="isSubmitting"
        :text="isSubmitting ? '登入中…' : '登入'"
        class="mt-8 w-full"
      />
    </form>
  </div>
</template>
