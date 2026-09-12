<script setup>
import TicketCard from '~/components/Common/Card/TicketCard.vue'

// PL. VI — Ticket。
//
// ⚠️ section 上的 data-same-ticket 不能拿掉：那是粒子最後一段變形
// （faq.png 散回滿版自由場）的觸發器，HomeField 用 querySelector 找它。
// 外面那層 data-same-outro 包住票券／贊助／CoC 三區，留在 pages/index.vue。

const props = defineProps({
  // 首頁資料的 ticket 區塊
  data: {
    type: Object,
    default: () => ({})
  }
})

const content = computed(() => props.data || {})

// 進場：大標 → 四張票依序 → 底下的購票按鈕
const sectionRef = ref(null)
useFadeIn(sectionRef, { step: 0.12 })
</script>

<template>
  <section
    id="ticket"
    ref="sectionRef"
    data-same-ticket
    class="relative z-10 flex flex-col py-8 md:py-12 lg:py-15"
  >
    <!-- 卷號標籤。窄視窗橫排一行、桌機直排，跟 PL.III～PL.V 同一套寫法。
         border-t 是設計稿橫貫區塊頂端的那條分隔線。 -->
    <CommonPlate :data="content.plate" data-fade="in" class="mx-6 lg:mx-[60px]" />

    <h2 data-fade="in" class="text-center text-en-h1 mb-6 md:mb-8 lg:mb-12">
      <template v-for="(line, i) in content.heading_lines" :key="i">
        <br v-if="i > 0">{{ line }}
      </template>
    </h2>

    <!-- 設計稿是 2×2：四張票橫排一列在 1440 就剩不到 320px，卡片內的
         「Three-Person Group Offer」那種長英文會擠成三行。 -->
    <div class="mx-auto grid w-full max-w-[960px] grid-cols-1 gap-6 px-5 md:grid-cols-2 md:items-stretch  mb-6 md:mb-8 lg:mb-12">
      <!-- ⚠️ data-fade 標在外層包裝、不是 TicketCard 本身：卡片裡有自己的展開收合
           transition，讓 gsap 直接動卡片的 opacity 兩邊會打架。 -->
      <div
        v-for="ticket in content.items"
        :key="ticket.code"
        data-fade="in"
        class="flex grow"
      >
        <TicketCard :data="ticket" />
      </div>
    </div>

    <div data-fade="in" class="flex justify-center">
      <AtomButton
        intent="specimen"
        size="md"
        rounded="none"
        :href="content.cta?.href"
        :text="content.cta?.label"
      >
        {{ content.cta?.label }}
        <span class="flex size-6 items-center justify-center">
          <AtomIcon name="arrow-right-thin" class="h-[5px] w-3" />
        </span>
      </AtomButton>
    </div>
  </section>
</template>
