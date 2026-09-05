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
</script>

<template>
  <section
    id="ticket"
    data-same-ticket
    class="relative z-10 flex flex-col gap-y-6"
  >
    <h2 class="text-center text-h1">
      <template v-for="(line, i) in content.heading_lines" :key="i">
        <br v-if="i > 0">{{ line }}
      </template>
    </h2>
    <!-- 設計稿是 2×2：四張票橫排一列在 1440 就剩不到 320px，卡片內的
         「Three-Person Group Offer」那種長英文會擠成三行。 -->
    <div class="mx-auto grid w-full max-w-[960px] grid-cols-1 gap-6 px-5 md:grid-cols-2 md:items-stretch">
      <TicketCard
        v-for="ticket in content.items" :key="ticket.code"
        :data="ticket"
      />
  </div>
  <div class="flex justify-center">
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
