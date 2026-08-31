<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })

useSeoMeta({
  title: '管理者詳情 · WebConf 後台',
  robots: 'noindex, nofollow'
})

const ROLE_LABELS = {
  super_admin: '最高管理者',
  lead: '總召組',
  design: '設計組',
  dev: '開發組',
  agenda: '議程組'
}

const route = useRoute()
const id = route.params.id

const requestFetch = useRequestFetch()
const { data, error } = await useAsyncData(`admin-${id}`, () => requestFetch(`/api/admin/admins/${id}`))

const deleteError = ref('')
const deleting = ref(false)

async function onDelete () {
  if (!confirm('確定要刪除這位管理者嗎？此動作無法復原。')) return
  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch('/api/admin/admins', { method: 'DELETE', body: { ids: [Number(id)] } })
    await navigateTo('/admin/admins')
  } catch (err) {
    deleteError.value = err.data?.statusMessage || '刪除失敗，請稍後再試'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="container max-w-2xl py-8">
    <header class="flex items-start justify-between gap-4 border-b border-gray-300 pb-6">
      <h1 class="text-h4 text-txt-dark">
        管理者詳情
      </h1>
      <div v-if="data?.admin" class="flex gap-3">
        <AtomButton
          intent="outline"
          size="sm"
          rounded="none"
          text="編輯"
          :href="`/admin/admins/${id}/edit`"
        />
        <AtomButton
          intent="outline"
          size="sm"
          rounded="none"
          :disabled="deleting"
          :text="deleting ? '刪除中…' : '刪除'"
          @click="onDelete"
        />
      </div>
    </header>

    <p v-if="error" class="text-body-sm mt-6 text-red-600">
      資料讀取失敗，請重新整理再試一次。
    </p>

    <dl v-else-if="data?.admin" class="mt-6 flex flex-col gap-4">
      <div>
        <dt class="text-caption text-txt-light">
          Email
        </dt>
        <dd class="text-body-sm mt-1 text-txt-dark">
          {{ data.admin.email }}
        </dd>
      </div>
      <div>
        <dt class="text-caption text-txt-light">
          密碼
        </dt>
        <dd class="text-body-sm mt-1 text-txt-dark">
          ••••••••
        </dd>
      </div>
      <div>
        <dt class="text-caption text-txt-light">
          姓名
        </dt>
        <dd class="text-body-sm mt-1 text-txt-dark">
          {{ data.admin.name || '—' }}
        </dd>
      </div>
      <div>
        <dt class="text-caption text-txt-light">
          角色
        </dt>
        <dd class="text-body-sm mt-1 text-txt-dark">
          {{ ROLE_LABELS[data.admin.role] || data.admin.role || '—' }}
        </dd>
      </div>
      <div>
        <dt class="text-caption text-txt-light">
          最後登入時間
        </dt>
        <dd class="text-body-sm mt-1 text-txt-dark">
          {{ data.admin.last_login_at || '尚未登入過' }}
        </dd>
      </div>
      <div>
        <dt class="text-caption text-txt-light">
          建立時間
        </dt>
        <dd class="text-body-sm mt-1 text-txt-dark">
          {{ data.admin.created_at }}
        </dd>
      </div>
    </dl>

    <p v-if="deleteError" class="text-caption mt-4 text-red-600">
      {{ deleteError }}
    </p>

    <AtomButton
      intent="link"
      size="sm"
      href="/admin/admins"
      text="← 回列表"
      class="mt-6"
    />
  </div>
</template>
