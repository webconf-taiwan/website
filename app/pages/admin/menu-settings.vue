<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })

useSeoMeta({
  title: '選單設定 · WebConf 後台',
  robots: 'noindex, nofollow'
})

// /api/global 是公開資料端點（Header / Footer 本身也是打這支），道理跟
// home-settings.vue 的 /api/home 一樣，不用特地換 useRequestFetch() 轉發 cookie。
const { data: globalData } = await useFetch('/api/global')

// Footer 連結的開啟方式，值只能是這兩種，用下拉選單鎖死，不讓人手打 _self / _blank
// 這種原始 value 字串進去（打錯字、打成別的值都不會報錯）。
const TARGET_OPTIONS = [
  { value: '_self', label: '同分頁開啟' },
  { value: '_blank', label: '開新分頁' }
]

// 深拷貝一份放到本地狀態編輯，不直接改 useFetch 回傳的 data——存檔前使用者
// 都還在編輯草稿，直接改 useFetch 的 data 會讓畫面看起來「已經存了」，實際上
// 按下儲存前都還沒送出去。
const form = reactive(structuredClone(toRaw(globalData.value)))

// nav_items / menu_groups 已經搬進 backend 的 D1（見 backend/src/routes/menu.ts），
// 存檔只送這兩包，不動 global.json 裡其他欄位（logo、tagline…那些還沒接、也不歸這頁管）。
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

async function onSave () {
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false

  try {
    await $fetch('/api/admin/menu', {
      method: 'PUT',
      body: {
        nav_items: form.header.nav_items,
        menu_groups: form.footer.menu_groups
      }
    })
    saveSuccess.value = true
  } catch (err) {
    saveError.value = err.data?.statusMessage || '儲存失敗，請稍後再試'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="container max-w-4xl py-8">
    <header class="border-b border-gray-300 pb-6">
      <h1 class="text-h4 text-txt-dark">
        選單設定
      </h1>
    </header>

    <form class="mt-6 flex flex-col gap-6" @submit.prevent>
      <!-- ============================== Header（一層選單） ============================== -->
      <AdminSection
        title="Header 選單"
        description="項目數量固定，不開放新增/刪除；只能改標題文字，連結網址與其他版面設定不開放編輯。"
      >
        <div>
          <p class="text-caption mb-2 font-medium text-txt-dark">
            選單項目（{{ form.header.nav_items.length }} 筆，固定）
          </p>
          <!-- allow-add / allow-remove 關掉：Header 選單項目數量固定，不給後台
               自己增減——增減選單項目會連動 Header.vue 的排版（左右分邊、手機版
               外露規則），不是單純換個文字這麼單純，所以連按鈕都不開放。 -->
          <AdminRepeatableList
            v-model="form.header.nav_items"
            :allow-add="false"
            :allow-remove="false"
          >
            <template #item="{ item }">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AdminField v-model="item.label" label="標題" />
                <AdminField v-model="item.href" label="連結網址" disabled />
              </div>
              <!-- id / target / side / is_highlight 同理不開放編輯：id 跟 Header.vue
                   裡手機版外露規則（EXPOSED_ON_MOBILE / EXPOSED_ON_MD）綁定、side 決定
                   排左邊還右邊、is_highlight 是 TICKET 那顆特殊樣式，這幾個都是版面規則。 -->
              <p class="text-caption text-txt-super-light">
                連結網址跟其他版面設定（位置、開啟方式、強調樣式）跟前台版面規則綁定，僅顯示不可修改。
              </p>
            </template>
          </AdminRepeatableList>
        </div>
      </AdminSection>

      <!-- ============================== Footer（兩層選單） ============================== -->
      <AdminSection
        title="Footer 選單"
        description="分組數量固定，不開放新增/刪除分組；每組底下的連結可以自由編輯、新增、刪除。"
      >
        <div>
          <p class="text-caption mb-2 font-medium text-txt-dark">
            選單分組（{{ form.footer.menu_groups.length }} 組，固定）
          </p>
          <!-- allow-add / allow-remove 關掉：分組（Programme / Codex / Connect）
               數量固定，不給後台自己增減，但巢狀在裡面的 links 那份 AdminRepeatableList
               維持預設（下面），組內連結還是可以自由編輯/新增/刪除。 -->
          <AdminRepeatableList
            v-model="form.footer.menu_groups"
            :allow-add="false"
            :allow-remove="false"
          >
            <template #item="{ item: group }">
              <AdminField v-model="group.title" label="分組標題" hint="例如 Programme / Codex / Connect" />

              <div>
                <p class="text-caption mb-2 text-txt-light">
                  這組的連結（{{ group.links.length }} 筆）
                </p>
                <AdminRepeatableList
                  v-model="group.links"
                  add-label="新增一個連結"
                  :new-item="() => ({ label: '', href: '', target: '_self' })"
                >
                  <template #item="{ item: link }">
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <AdminField v-model="link.label" label="文字" />
                      <AdminField v-model="link.href" label="連結網址" />
                      <AdminFieldSelect v-model="link.target" label="開啟方式" :options="TARGET_OPTIONS" />
                    </div>
                  </template>
                </AdminRepeatableList>
              </div>
            </template>
          </AdminRepeatableList>
        </div>
      </AdminSection>

      <div class="mt-2 flex items-center gap-4">
        <AtomButton
          intent="primary"
          rounded="none"
          :disabled="saving"
          :text="saving ? '儲存中…' : '儲存變更'"
          @click="onSave"
        />
        <p v-if="saveSuccess" class="text-caption text-green-600">
          已儲存，前台 Header/Footer 會立即套用新選單。
        </p>
        <p v-if="saveError" class="text-caption text-red-600">
          {{ saveError }}
        </p>
      </div>
    </form>
  </div>
</template>
