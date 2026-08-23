<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })

useSeoMeta({
  title: '首頁設定 · WebConf 後台',
  robots: 'noindex, nofollow'
})

// /api/home 是公開資料端點（首頁本身也是打這支），不是使用者專屬資料，
// 不用像 dashboard 那樣特地換 useRequestFetch() 轉發 cookie。
const { data: homeData } = await useFetch('/api/home')

// 深拷貝一份放到本地狀態編輯，不直接改 useFetch 回傳的 data。
// 這頁目前只是欄位預覽（見下方 Save 按鈕的說明），還沒有真的送出去，
// 拿 useFetch 的 data 直接改，重新整理後又會被原始資料蓋回去，會誤導人以為改壞了。
const form = reactive(structuredClone(toRaw(homeData.value)))

// 給「一行一筆」的字串陣列欄位用（skills、heading_lines 這種），
// 不用 AdminRepeatableList 是因為這些欄位不需要每筆各自的刪除按鈕，
// 用多行文字框編輯，一行對一筆更快。
function joinLines (arr) {
  return (arr || []).join('\n')
}
function splitLines (text) {
  return text.split('\n').map(s => s.trim()).filter(Boolean)
}

// 8 個區塊全部攤開太長，改用 tab 一次只看一個。用 v-show（不是 v-if）切換：
// 欄位資料本來就掛在 form 這個 reactive 物件上，跟 AdminSection 元件本身有沒有
// 掛載無關，用 v-show 純粹是切換分頁時不用重新渲染那一大包欄位，比較順。
const TABS = [
  { key: 'hero', label: 'Hero 首屏' },
  { key: 'about', label: 'About 關於' },
  { key: 'speaker', label: 'Speaker 講者' },
  { key: 'venue', label: 'Venue 場地' },
  { key: 'faq', label: 'FAQ' },
  { key: 'ticket', label: 'Ticket 票券' },
  { key: 'sponsor', label: 'Sponsor 贊助商' },
  { key: 'code_of_conduct', label: 'Code of Conduct' }
]
const activeTab = ref(TABS[0].key)
</script>

<template>
  <div class="container max-w-4xl py-8">
    <header class="border-b border-gray-300 pb-6">
      <h1 class="text-h4 text-txt-dark">
        首頁設定
      </h1>
      <p class="text-body-sm mt-1 text-txt-light">
        對應首頁（/）的 8 個區塊，資料目前來自 <code class="text-caption">server/assets/data/home.json</code>。
      </p>
    </header>

    <!-- tab 列：overflow-x-auto 是保底，正常寬度 8 個 tab 一行放得下，
         視窗窄的時候（例如筆電縮小視窗）還是能橫向滑動，不會互相擠壓文字。 -->
    <div class="mt-6 flex gap-1 overflow-x-auto border-b border-gray-300">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        type="button"
        class="text-body-sm shrink-0 whitespace-nowrap border-b-2 px-4 py-3 transition-colors"
        :class="activeTab === tab.key
          ? 'border-brand font-medium text-txt-dark'
          : 'border-transparent text-txt-light hover:text-txt-dark'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <form class="mt-4 flex flex-col gap-4" @submit.prevent>
      <!-- ============================== Hero ============================== -->
      <AdminSection v-show="activeTab === 'hero'" code="PL. I" title="Hero（首屏）">
        <AdminField v-model="form.hero.plate_label" label="標籤文字" hint="plate_label" />
        <AdminField v-model="form.hero.title" label="主標題" hint="title" />
        <AdminField v-model="form.hero.subtitle" label="副標題" hint="subtitle" />
        <AdminField v-model="form.hero.keywords" label="關鍵字" hint="keywords" />

        <p class="text-caption font-medium text-txt-dark">
          按鈕（CTA）
        </p>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminField v-model="form.hero.cta.label" label="按鈕文字" />
          <AdminField v-model="form.hero.cta.href" label="連結網址" />
          <AdminField v-model="form.hero.cta.target" label="開啟方式" hint="_self 或 _blank" />
        </div>

        <p class="text-caption font-medium text-txt-dark">
          左下角標籤
        </p>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminField v-model="form.hero.corner_left.label" label="標籤" />
          <AdminField v-model="form.hero.corner_left.note" label="註記" />
        </div>

        <p class="text-caption font-medium text-txt-dark">
          右下角標籤
        </p>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminField v-model="form.hero.corner_right.label" label="標籤" />
          <AdminField v-model="form.hero.corner_right.note" label="註記" hint="後面會自動接執行期的繪圖後端名稱，這裡不用打" />
        </div>
      </AdminSection>

      <!-- ============================== About ============================== -->
      <AdminSection v-show="activeTab === 'about'" code="PL. II" title="About（關於）">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminField v-model="form.about.plate.code" label="卷號代碼" hint="plate.code" />
          <AdminField v-model="form.about.plate.number" label="卷號數字" hint="plate.number" />
          <AdminField v-model="form.about.plate.label" label="卷號標籤" hint="plate.label" />
        </div>

        <AdminField v-model="form.about.skills_box_label" label="Skills 框標題" />
        <AdminField
          :model-value="joinLines(form.about.skills)"
          label="Skills 清單"
          hint="一行一個"
          multiline
          @update:model-value="v => form.about.skills = splitLines(v)"
        />

        <AdminField v-model="form.about.heading" label="大標題" hint="heading" />

        <div>
          <p class="text-caption font-medium text-txt-dark">
            正文片段（lede_runs）
          </p>
          <p class="text-caption mb-2 text-txt-super-light">
            首頁那句斜體文案是切成一段一段組出來的，勾選「反白」的片段在首頁會變成品牌藍色。
          </p>
          <AdminRepeatableList v-model="form.about.lede_runs" :new-item="() => ({ text: '', is_accent: false })" add-label="新增一段文字">
            <template #item="{ item }">
              <AdminField v-model="item.text" label="文字" />
              <AdminFieldCheckbox v-model="item.is_accent" label="反白（品牌色）" />
            </template>
          </AdminRepeatableList>
        </div>

        <AdminField v-model="form.about.body_zh" label="中文內文" multiline />

        <p class="text-caption font-medium text-txt-dark">
          按鈕（CTA）
        </p>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminField v-model="form.about.cta.label" label="按鈕文字" />
          <AdminField v-model="form.about.cta.href" label="連結網址" />
          <AdminField v-model="form.about.cta.target" label="開啟方式" />
        </div>
      </AdminSection>

      <!-- ============================== Speaker ============================== -->
      <AdminSection v-show="activeTab === 'speaker'" code="PL. III" title="Speaker（講者）">
        <p class="text-caption font-medium text-txt-dark">
          「更多講者」連結
        </p>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminField v-model="form.speaker.more_link.label" label="文字" />
          <AdminField v-model="form.speaker.more_link.href" label="連結網址" />
          <AdminField v-model="form.speaker.more_link.target" label="開啟方式" />
        </div>

        <div>
          <p class="text-caption mb-2 font-medium text-txt-dark">
            講者名單（{{ form.speaker.items.length }} 位）
          </p>
          <AdminRepeatableList
            v-model="form.speaker.items"
            add-label="新增一位講者"
            :new-item="() => ({ id: '', name: '', org: '', role: '', tag: 'Speaker', skills: [], portrait: '' })"
          >
            <template #item="{ item }">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AdminField v-model="item.id" label="ID" hint="不重複英數，給前端當 key 用" />
                <AdminField v-model="item.name" label="姓名" />
                <AdminField v-model="item.org" label="單位" />
                <AdminField v-model="item.role" label="職稱" />
                <AdminField v-model="item.tag" label="身份標籤" hint="例如 Keynote Speaker / Speaker" />
                <AdminField v-model="item.portrait" label="頭像圖片路徑" hint="/speakers/xxx.png，圖片上傳之後再接" />
              </div>
              <AdminField
                :model-value="joinLines(item.skills)"
                label="技能標籤"
                hint="一行一個"
                multiline
                @update:model-value="v => item.skills = splitLines(v)"
              />
            </template>
          </AdminRepeatableList>
        </div>
      </AdminSection>

      <!-- ============================== Venue ============================== -->
      <AdminSection v-show="activeTab === 'venue'" code="PL. IV" title="Venue（場地）">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminField v-model="form.venue.title_en" label="場地名稱（英文）" />
          <AdminField v-model="form.venue.title_zh" label="場地名稱（中文）" />
        </div>

        <div>
          <p class="text-caption mb-2 font-medium text-txt-dark">
            交通方式
          </p>
          <AdminRepeatableList
            v-model="form.venue.transports"
            add-label="新增一種交通方式"
            :new-item="() => ({ title: '', description: '' })"
          >
            <template #item="{ item }">
              <AdminField v-model="item.title" label="標題" hint="例如 By MRT" />
              <AdminField v-model="item.description" label="說明" multiline />
            </template>
          </AdminRepeatableList>
        </div>

        <p class="text-caption font-medium text-txt-dark">
          「更多資訊」連結
        </p>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminField v-model="form.venue.more_link.label" label="文字" />
          <AdminField v-model="form.venue.more_link.href" label="連結網址" />
          <AdminField v-model="form.venue.more_link.target" label="開啟方式" />
        </div>
      </AdminSection>

      <!-- ============================== FAQ ============================== -->
      <AdminSection v-show="activeTab === 'faq'" code="PL. V" title="FAQ（常見問答）">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminField v-model="form.faq.title_en" label="標題（英文）" />
          <AdminField v-model="form.faq.title_zh" label="標題（中文）" />
        </div>
        <AdminField v-model="form.faq.total_pages" label="總頁數" type="number" hint="⚠️ 查過現有首頁畫面，這個欄位目前沒有被用到，留著先不動" />

        <div>
          <p class="text-caption mb-2 font-medium text-txt-dark">
            問答列表（{{ form.faq.items.length }} 筆）
          </p>
          <AdminRepeatableList
            v-model="form.faq.items"
            add-label="新增一筆問答"
            :new-item="() => ({ question: '', answer: '' })"
          >
            <template #item="{ item }">
              <AdminField v-model="item.question" label="問題" />
              <AdminField v-model="item.answer" label="答案" multiline />
            </template>
          </AdminRepeatableList>
        </div>
      </AdminSection>

      <!-- ============================== Ticket ============================== -->
      <AdminSection v-show="activeTab === 'ticket'" code="PL. VI" title="Ticket（票券）">
        <AdminField
          :model-value="joinLines(form.ticket.heading_lines)"
          label="標題（斷行陣列）"
          hint="一行一個，首頁會照順序換行顯示"
          multiline
          @update:model-value="v => form.ticket.heading_lines = splitLines(v)"
        />

        <p class="text-caption font-medium text-txt-dark">
          按鈕（CTA）
        </p>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminField v-model="form.ticket.cta.label" label="按鈕文字" />
          <AdminField v-model="form.ticket.cta.href" label="連結網址" />
          <AdminField v-model="form.ticket.cta.target" label="開啟方式" />
        </div>

        <div>
          <p class="text-caption mb-2 font-medium text-txt-dark">
            票種（{{ form.ticket.items.length }} 種）
          </p>
          <AdminRepeatableList
            v-model="form.ticket.items"
            add-label="新增一種票"
            :new-item="() => ({ code: '', title: '', price: '', unit: '元 / 人', category: '', is_highlighted: false, features: [] })"
          >
            <template #item="{ item }">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AdminField v-model="item.code" label="卷號" hint="例如 PL. VI · 01" />
                <AdminField v-model="item.title" label="票種名稱" />
                <AdminField v-model="item.price" label="價格" hint="純數字，逗號會自動處理" />
                <AdminField v-model="item.unit" label="單位" />
                <AdminField v-model="item.category" label="分類標籤" />
              </div>
              <AdminFieldCheckbox v-model="item.is_highlighted" label="強調顯示（首頁會特別標出這張票）" />

              <div>
                <p class="text-caption mb-2 text-txt-light">
                  票券內容（{{ item.features.length }} 項）
                </p>
                <AdminRepeatableList
                  v-model="item.features"
                  add-label="新增一項內容"
                  :new-item="() => ({ en: '', zh: '' })"
                >
                  <template #item="{ item: feature }">
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <AdminField v-model="feature.en" label="英文" />
                      <AdminField v-model="feature.zh" label="中文" />
                    </div>
                  </template>
                </AdminRepeatableList>
              </div>
            </template>
          </AdminRepeatableList>
        </div>
      </AdminSection>

      <!-- ============================== Sponsor ============================== -->
      <AdminSection v-show="activeTab === 'sponsor'" title="Sponsor（贊助商）">
        <AdminRepeatableList
          v-model="form.sponsor.items"
          add-label="新增一個贊助商"
          :new-item="() => ({ name: '', logo: '', logo_height: 32, badge: '' })"
        >
          <template #item="{ item }">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AdminField v-model="item.name" label="名稱" />
              <AdminField v-model="item.logo" label="Logo 圖片路徑" hint="/sponsors/xxx.svg，圖片上傳之後再接" />
              <AdminField v-model="item.logo_height" label="Logo 顯示高度（px）" type="number" />
              <AdminField v-model="item.badge" label="徽章文字" hint="選填，例如「連續 3 年贊助」" />
            </div>
          </template>
        </AdminRepeatableList>
      </AdminSection>

      <!-- ============================== Code of Conduct ============================== -->
      <AdminSection v-show="activeTab === 'code_of_conduct'" code="PL. VII" title="Code of Conduct（行為準則）">
        <AdminField v-model="form.code_of_conduct.title" label="標題" />
        <AdminField v-model="form.code_of_conduct.body_zh" label="中文內文" multiline />
        <AdminField v-model="form.code_of_conduct.body_en" label="英文內文" multiline />
      </AdminSection>

      <div class="mt-2 border border-dashed border-gray-400 bg-gray-50 p-4">
        <p class="text-caption text-txt-light">
          Save 按鈕先停用，這頁目前只是欄位預覽，資料改了不會真的存到任何地方，重新整理就會還原。
          要接成真的能存檔，得先決定「首頁內容之後要存在哪」（繼續用 JSON 檔、還是搬進 backend 的 D1），
          這是架構決定，我不會自己選，等你確認再動工。
        </p>
        <AtomButton
          intent="primary"
          rounded="none"
          disabled
          text="儲存變更（尚未串接）"
          class="mt-4"
        />
      </div>
    </form>
  </div>
</template>
