<script setup>
import { useQuery } from '@tanstack/vue-query'

definePageMeta({ layout: 'admin', middleware: 'admin' })

useSeoMeta({
  title: '管理者列表 · WebConf 後台',
  robots: 'noindex, nofollow'
})

// 跟 dashboard 同一個理由：SSR 打自家 /api 要用 useRequestFetch() 轉發 cookie，
// 不然裸 $fetch 在伺服器端查不到人，一律 401。
const requestFetch = useRequestFetch()
const { data, suspense, error } = useQuery({
  queryKey: ['admin', 'admins'],
  queryFn: () => requestFetch('/api/admin/admins')
})
if (import.meta.server) await suspense()
</script>

<template>
  <div class="container py-8">
    <header class="flex items-start justify-between gap-4 border-b border-gray-300 pb-6">
      <div>
        <h1 class="text-h4 text-txt-dark">
          管理者列表
        </h1>
        <p class="text-body-sm mt-1 text-txt-light">
          目前有 {{ data?.admins?.length ?? 0 }} 個後台帳號。新增/編輯管理者的功能之後再加，這裡先看得到就好。
        </p>
      </div>
      <!-- 按鈕先留著卡位，還沒接任何功能，新增要怎麼做（資料模型、欄位）再討論。 -->
      <AtomButton
        intent="outline"
        size="sm"
        rounded="none"
        text="＋ 新增管理者"
      />
    </header>

    <section class="mt-8">
      <p v-if="error" class="text-body-sm text-red-600">
        資料讀取失敗，請重新整理再試一次。
      </p>

      <table v-else class="w-full border-collapse border border-gray-300 bg-white text-left">
        <thead>
          <tr class="border-b border-gray-300 bg-gray-50">
            <th class="text-caption px-4 py-3 font-medium text-txt-light">
              Email
            </th>
            <th class="text-caption px-4 py-3 font-medium text-txt-light">
              建立時間（UTC）
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="admin in data?.admins" :key="admin.id" class="border-b border-gray-200 last:border-b-0">
            <td class="text-body-sm px-4 py-3 text-txt-dark">
              {{ admin.email }}
            </td>
            <td class="text-body-sm px-4 py-3 text-txt-light">
              {{ admin.created_at }}
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
