<script setup>
import { useQuery } from '@tanstack/vue-query'

definePageMeta({ layout: 'admin', middleware: 'admin' })

useSeoMeta({
  title: '管理者列表 · WebConf 後台',
  robots: 'noindex, nofollow'
})

// 角色代碼對照中文顯示，跟 new.vue / [id]/index.vue / [id]/edit.vue 共用同一份表。
const ROLE_LABELS = {
  super_admin: '最高管理者',
  lead: '總召組',
  design: '設計組',
  dev: '開發組',
  agenda: '議程組'
}

// 跟 dashboard 同一個理由：SSR 打自家 /api 要用 useRequestFetch() 轉發 cookie，
// 不然裸 $fetch 在伺服器端查不到人，一律 401。
const requestFetch = useRequestFetch()
const { data, suspense, error, refetch } = useQuery({
  queryKey: ['admin', 'admins'],
  queryFn: () => requestFetch('/api/admin/admins')
})
if (import.meta.server) await suspense()

// 勾選狀態用一個 id 的 Set 維護，不用「每筆資料上掛一個 selected 欄位」，
// 是因為 data 是 useQuery 回傳的（重新整理就整包换新的），selected 狀態獨立在
// 元件本地存活比較單純，也不會在 refetch 後被意外保留污染的狀態。
const selectedIds = ref(new Set())

const allChecked = computed(() => {
  const list = data.value?.admins ?? []
  return list.length > 0 && list.every(a => selectedIds.value.has(a.id))
})

function toggleAll (event) {
  const list = data.value?.admins ?? []
  selectedIds.value = event.target.checked ? new Set(list.map(a => a.id)) : new Set()
}

function toggleOne (id, event) {
  const next = new Set(selectedIds.value)
  if (event.target.checked) next.add(id)
  else next.delete(id)
  selectedIds.value = next
}

const deleting = ref(false)
const deleteError = ref('')

async function onDeleteSelected () {
  const ids = [...selectedIds.value]
  if (ids.length === 0) return
  if (!confirm(`確定要刪除選取的 ${ids.length} 位管理者嗎？此動作無法復原。`)) return

  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch('/api/admin/admins', { method: 'DELETE', body: { ids } })
    selectedIds.value = new Set()
    await refetch()
  } catch (err) {
    deleteError.value = err.data?.statusMessage || '刪除失敗，請稍後再試'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="container py-8">
    <header class="flex items-start justify-between gap-4 border-b border-gray-300 pb-6">
      <div>
        <h1 class="text-h4 text-txt-dark">
          管理者列表
        </h1>
        <p class="text-body-sm mt-1 text-txt-light">
          目前有 {{ data?.admins?.length ?? 0 }} 個後台帳號。
        </p>
      </div>
      <AtomButton
        intent="outline"
        size="sm"
        rounded="none"
        text="＋ 新增管理者"
        href="/admin/admins/new"
      />
    </header>

    <section class="mt-8">
      <p v-if="error" class="text-body-sm text-red-600">
        資料讀取失敗，請重新整理再試一次。
      </p>

      <template v-else>
        <div class="mb-3 flex items-center gap-4">
          <AtomButton
            intent="outline"
            size="sm"
            rounded="none"
            :disabled="selectedIds.size === 0 || deleting"
            :text="deleting ? '刪除中…' : `刪除選取（${selectedIds.size}）`"
            @click="onDeleteSelected"
          />
          <p v-if="deleteError" class="text-caption text-red-600">
            {{ deleteError }}
          </p>
        </div>

        <table class="w-full border-collapse border border-gray-300 bg-white text-left">
          <thead>
            <tr class="border-b border-gray-300 bg-gray-50">
              <th class="w-10 px-4 py-3">
                <input type="checkbox" :checked="allChecked" @change="toggleAll">
              </th>
              <th class="text-caption px-4 py-3 font-medium text-txt-light">
                Email
              </th>
              <th class="text-caption px-4 py-3 font-medium text-txt-light">
                姓名
              </th>
              <th class="text-caption px-4 py-3 font-medium text-txt-light">
                角色
              </th>
              <th class="text-caption px-4 py-3 font-medium text-txt-light">
                最後登入時間（UTC）
              </th>
              <th class="text-caption px-4 py-3 font-medium text-txt-light">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="admin in data?.admins" :key="admin.id" class="border-b border-gray-200 last:border-b-0">
              <td class="px-4 py-3">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(admin.id)"
                  @change="toggleOne(admin.id, $event)"
                >
              </td>
              <td class="text-body-sm px-4 py-3 text-txt-dark">
                {{ admin.email }}
              </td>
              <td class="text-body-sm px-4 py-3 text-txt-dark">
                {{ admin.name || '—' }}
              </td>
              <td class="text-body-sm px-4 py-3 text-txt-dark">
                {{ ROLE_LABELS[admin.role] || admin.role || '—' }}
              </td>
              <td class="text-body-sm px-4 py-3 text-txt-light">
                {{ admin.last_login_at || '尚未登入過' }}
              </td>
              <td class="text-body-sm px-4 py-3">
                <div class="flex gap-3">
                  <NuxtLink :to="`/admin/admins/${admin.id}`" class="text-txt-dark underline hover:text-brand">
                    查看
                  </NuxtLink>
                  <NuxtLink :to="`/admin/admins/${admin.id}/edit`" class="text-txt-dark underline hover:text-brand">
                    編輯
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </section>
  </div>
</template>
