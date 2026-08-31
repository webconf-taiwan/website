<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })

useSeoMeta({
  title: '編輯管理者 · WebConf 後台',
  robots: 'noindex, nofollow'
})

const ROLE_LABELS = {
  super_admin: '最高管理者',
  lead: '總召組',
  design: '設計組',
  dev: '開發組',
  agenda: '議程組'
}
const ROLE_OPTIONS = [
  { value: 'super_admin', label: '最高管理者' },
  { value: 'lead', label: '總召組' },
  { value: 'design', label: '設計組' },
  { value: 'dev', label: '開發組' },
  { value: 'agenda', label: '議程組' }
]

const route = useRoute()
const id = route.params.id

const requestFetch = useRequestFetch()
const [{ data: adminData, error }, { data: meData }] = await Promise.all([
  useAsyncData(`admin-edit-${id}`, () => requestFetch(`/api/admin/admins/${id}`)),
  useAsyncData('admin-me-edit', () => requestFetch('/api/admin/me'))
])

// role 欄位只有 super_admin / lead 能改（跟新增管理者同一組規則，見
// backend adminsController.ts 的 ROLE_MANAGERS），沒權限就不給看起來能改，
// 避免使用者填了送出才被後端 403 打回來。
const canEditRole = computed(() => ['super_admin', 'lead'].includes(meData.value?.admin?.role))

// 定案：密碼欄位＋修改密碼入口在編輯任何管理者的頁面都顯示，不限於編輯自己的帳號。
// 注意：/api/admin/change-password 這支 API 目前永遠只會改「目前登入者自己」的密碼，
// 沒辦法指定要改哪個管理者，所以編輯別人的帳號時點這個鉛筆圖示，實際改的是操作者自己的密碼，
// 不是正在編輯的這個人的密碼——這點只是先照使用者指示把 UI 加上去，語意上的落差已經記錄，
// 之後可能需要再討論。

const form = reactive({ name: '', role: '' })
watchEffect(() => {
  if (adminData.value?.admin) {
    form.name = adminData.value.admin.name || ''
    form.role = adminData.value.admin.role || ''
  }
})

const saving = ref(false)
const saveError = ref('')

async function onSubmit () {
  saving.value = true
  saveError.value = ''
  try {
    const body = canEditRole.value ? { name: form.name, role: form.role } : { name: form.name }
    await $fetch(`/api/admin/admins/${id}`, { method: 'PUT', body })
    await navigateTo(`/admin/admins/${id}`)
  } catch (err) {
    saveError.value = err.data?.statusMessage || '更新失敗，請稍後再試'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="container max-w-2xl py-8">
    <header class="border-b border-gray-300 pb-6">
      <h1 class="text-h4 text-txt-dark">
        編輯管理者
      </h1>
    </header>

    <p v-if="error" class="text-body-sm mt-6 text-red-600">
      資料讀取失敗，請重新整理再試一次。
    </p>

    <form v-else-if="adminData?.admin" class="mt-6 flex flex-col gap-4" @submit.prevent="onSubmit">
      <p class="text-caption text-txt-super-light">
        Email：{{ adminData.admin.email }}（不可修改）
      </p>

      <AdminField v-model="form.name" label="姓名" />

      <div class="flex items-end gap-2">
        <AdminField model-value="••••••" label="密碼" disabled class="flex-1" />
        <NuxtLink
          to="/admin/change-password"
          class="text-txt-light hover:text-brand mb-2 shrink-0"
          title="修改密碼"
        >
          <AtomIcon name="pencil" class="size-4" />
        </NuxtLink>
      </div>

      <AdminFieldSelect v-if="canEditRole" v-model="form.role" label="角色" :options="ROLE_OPTIONS" />
      <div v-else class="block">
        <span class="text-caption text-txt-light">角色</span>
        <p class="text-body-sm mt-1 text-txt-dark">
          {{ ROLE_LABELS[form.role] || form.role || '—' }}
          <span class="text-caption ml-1 text-txt-super-light">（沒有權限調整，僅最高管理者／總召組可調整）</span>
        </p>
      </div>

      <div class="mt-2 flex items-center gap-4">
        <AtomButton
          intent="primary"
          rounded="none"
          type="submit"
          :disabled="saving"
          :text="saving ? '儲存中…' : '儲存變更'"
        />
        <AtomButton
          intent="outline"
          rounded="none"
          :href="`/admin/admins/${id}`"
          text="取消"
        />
        <p v-if="saveError" class="text-caption text-red-600">
          {{ saveError }}
        </p>
      </div>
    </form>
  </div>
</template>
