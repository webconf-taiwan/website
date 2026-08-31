<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })

useSeoMeta({
  title: '新增管理者 · WebConf 後台',
  robots: 'noindex, nofollow'
})

const ROLE_OPTIONS = [
  { value: 'super_admin', label: '最高管理者' },
  { value: 'lead', label: '總召組' },
  { value: 'design', label: '設計組' },
  { value: 'dev', label: '開發組' },
  { value: 'agenda', label: '議程組' }
]

// 新增管理者只有 super_admin / lead 能成功呼叫（見 backend adminsController.ts
// 的 ROLE_MANAGERS），先打 /api/admin/me 判斷目前登入者，沒權限就不給填表單——
// 體驗上先擋掉比等送出被 403 打回來好。
const requestFetch = useRequestFetch()
const { data: meData, pending: mePending } = await useAsyncData('admin-me-new', () => requestFetch('/api/admin/me'))
const canCreate = computed(() => ['super_admin', 'lead'].includes(meData.value?.admin?.role))

const form = reactive({
  email: '',
  password: '',
  name: '',
  role: ROLE_OPTIONS[0].value
})

const saving = ref(false)
const saveError = ref('')

async function onSubmit () {
  saving.value = true
  saveError.value = ''
  try {
    const res = await $fetch('/api/admin/admins', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password,
        name: form.name,
        role: form.role
      }
    })
    await navigateTo(`/admin/admins/${res.admin.id}`)
  } catch (err) {
    saveError.value = err.data?.statusMessage || '新增失敗，請稍後再試'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="container max-w-2xl py-8">
    <header class="border-b border-gray-300 pb-6">
      <h1 class="text-h4 text-txt-dark">
        新增管理者
      </h1>
    </header>

    <p v-if="mePending" class="text-body-sm mt-6 text-txt-light">
      讀取權限中…
    </p>

    <p v-else-if="!canCreate" class="text-body-sm mt-6 text-red-600">
      沒有權限新增管理者，只有「最高管理者」或「總召組」可以新增。
    </p>

    <form v-else class="mt-6 flex flex-col gap-4" @submit.prevent="onSubmit">
      <AdminField v-model="form.email" label="Email" type="email" />
      <AdminField v-model="form.password" label="密碼（初始密碼）" type="password" />
      <AdminField v-model="form.name" label="姓名" />
      <AdminFieldSelect v-model="form.role" label="角色" :options="ROLE_OPTIONS" />

      <div class="mt-2 flex items-center gap-4">
        <AtomButton
          intent="primary"
          rounded="none"
          type="submit"
          :disabled="saving"
          :text="saving ? '新增中…' : '新增管理者'"
        />
        <AtomButton
          intent="outline"
          rounded="none"
          href="/admin/admins"
          text="取消"
        />
        <p v-if="saveError" class="text-caption text-red-600">
          {{ saveError }}
        </p>
      </div>
    </form>
  </div>
</template>
