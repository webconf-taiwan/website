<script setup>
// PL. IV（Venue）+ PL. V（FAQ）（首頁一鏡到底版）。
//
// 與 Home/VenueFaqField.vue 的差別：這裡「沒有 canvas」，也沒有 sticky 容器。
// 這個元件只剩版面。
//
// ⚠️ 底色是 RWD 的：
//   ≥1024px  半透明壓黑 —— 兩隻標本（菌落場、faq.png）的點雲由頁面底層那張唯一的
//            HomeField 畫，不透明底會把它們整片蓋掉。
//   <1024px  這兩區「完全沒有粒子」（見 useViewportMode）。設計稿上的標本在窄視窗
//            的版面裡本來就沒有位置攤開，而它們是全頁最吃密度的兩格（放射狀尖刺，
//            原版 VenueFaqField 為此用到 52000 顆），在手機上算了也只是被文字蓋掉。
//            擋住 hero 那張 fixed canvas 定格畫面的不透明底，是頁面在 PL.II～PL.V
//            外面包的那一層（見 pages/index.vue），不在這裡。
//
// 原版為了讓同一張 canvas 在捲過兩區時留在畫面上，得包一層 h-0 的 sticky 容器 +
// 溢出的 h-screen canvas，還要 overflow-clip 避免糊到票券區（而且只能用 clip
// 不能用 hidden，否則 sticky 會失效）—— 這些在單一 canvas 版本全部不需要，
// 因為那張 canvas 本來就是 fixed，永遠在畫面上。

const props = defineProps({
  venue: {
    type: Object,
    default: () => ({})
  },
  faq: {
    type: Object,
    default: () => ({})
  }
})

const { fadeIn, fadeInNow, killFadeIns } = useFadeIn()

// 分頁在前端切：資料一次把題目全給，per_page（一次顯示幾題）由資料決定，
// 總頁數用實際題數算 —— 別再讓資料寫死頁數，題目一加一減就會對不起來。
const faqPage = ref(1)
const faqListRef = ref(null)

// 換頁時題目是整批換掉的新 DOM（v-for 的 key 跟著題目走），
// 不補這一下新題目會直接硬跳出來。
watch(faqPage, async () => {
  await nextTick()
  fadeInNow(faqListRef.value, { step: 0.06, duration: 0.5 })
})
const FAQS = computed(() => props.faq?.items || [])            // 完整題庫（結構化資料要用全部）
const FAQ_PER_PAGE = computed(() => props.faq?.per_page || 3)
const FAQ_TOTAL_PAGES = computed(() => Math.max(1, Math.ceil(FAQS.value.length / FAQ_PER_PAGE.value)))
// per_page 改小／題目變少時，停在最後一頁的頁碼會超出範圍，這裡夾回來才不會整頁空白
const FAQ_PAGE = computed(() => Math.min(faqPage.value, FAQ_TOTAL_PAGES.value))
const FAQ_OFFSET = computed(() => (FAQ_PAGE.value - 1) * FAQ_PER_PAGE.value)
const FAQ_PAGE_ITEMS = computed(() => FAQS.value.slice(FAQ_OFFSET.value, FAQ_OFFSET.value + FAQ_PER_PAGE.value))

const venueRef = ref(null)
const faqRef = ref(null)

onMounted(() => {
  fadeIn(venueRef.value)
  fadeIn(faqRef.value)
})

onBeforeUnmount(() => killFadeIns())
</script>

<template>
  <!-- ⚠️ 底色見上面檔頭。窄視窗這裡不鋪底 —— 不透明底是頁面在 PL.II～PL.V 外面
       包的那一層（見 pages/index.vue）。 -->
  <div class="relative lg:bg-black/25">
    <!-- PL. IV — Venue。設計稿是兩欄：左欄固定 484 寬只放卷號，右欄 flex-1 放內容。
         兩欄各自有自己的 border-t（不是同一條線橫貫），右欄再多 24px 內縮。
         data-same-venue 是 HomeField 第 3 段（speaker → venue）的觸發器。 -->
    <section
      id="venue"
      ref="venueRef"
      data-same-venue
      class="relative z-10 min-h-[658px]"
    >
      <div class="flex flex-col lg:flex-row lg:items-start">
        <!-- 左欄：卷號。
             ⚠️ data-fade="in" 掛在「文字的外層」而不是有 border-t 的那層 ——
             分隔線要留在原地，只有文字淡入，線跟著飄會很奇怪。 -->
        <div class="shrink-0 px-6 pt-16 lg:w-[484px] lg:py-[60px] lg:pl-[60px] lg:pr-0">
          <CommonPlate :data="venue.plate" data-fade="in" />
        </div>

        <!-- 右欄：標題 + 交通方式 + 按鈕 -->
        <div class="min-w-0 flex-1 px-6 pb-16 lg:py-[60px] lg:pl-0 lg:pr-[60px]">
          <div class="flex flex-col gap-12 lg:border-t lg:border-pre-800/35 py-8 lg:pl-6">
            <div class="flex flex-col gap-4">
              <!-- 大標是設計稿的文案（venue.heading），不是場地英文名 ——
                   title_en（Taipei Popop）留給 schema.org 組地點名稱用，別混用。 -->
              <h2 data-fade="in" class="font-serif text-[40px] font-bold italic leading-[1.2] tracking-[0.02em] text-pre-800 lg:text-[64px]">
                {{ venue.heading }}
              </h2>
              <p data-fade="in" class="font-zh text-[22px] font-bold leading-[1.2] tracking-[0.02em] text-pre-800 lg:text-[28px]">
                {{ venue.title_zh }}
              </p>
            </div>

            <div class="flex flex-col gap-12">
              <!-- ⚠️ 這裡的藍是 #71c1f0，不是 token 的 accent-1 (#7cc8f2)。
                   設計稿兩種藍並存，不是筆誤。 -->
              <div class="flex max-w-[650px] flex-col gap-8">
                <div
                  v-for="transport in venue.transports"
                  :key="transport.title"
                  data-fade="in"
                  class="flex flex-col gap-2"
                >
                  <p class="font-serif text-[28px] font-bold italic leading-[1.2] tracking-[0.02em] text-[#71c1f0] lg:text-[32px]">
                    {{ transport.title }}
                  </p>
                  <p class="font-Noto text-[16px] leading-[1.6] tracking-[0.08em] text-pre-800/[62%] lg:text-[18px]">
                    {{ transport.description }}
                  </p>
                </div>
              </div>

              <a
                data-fade="in"
                :href="venue.more_link?.href"
                :target="venue.more_link?.target"
                :rel="linkRel(venue.more_link?.target)"
                class="inline-flex w-max items-center gap-x-1 border border-accent-1 bg-[#0a0a0c]/70 py-2 pl-5 pr-3 font-Noto text-[16px] font-medium leading-none tracking-[0.1em] text-pre-800 backdrop-blur-sm transition-colors hover:bg-accent-1/10"
              >
                {{ venue.more_link?.label }}
                <span class="flex size-6 items-center justify-center">
                  <AtomIcon name="arrow-right-thin" class="h-[5px] w-3" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PL. V — FAQ。兩欄結構與 PL.IV 相同。
         data-same-faq 是 HomeField 第 4 段（venue → faq）的觸發器。 -->
    <section
      id="faq"
      ref="faqRef"
      data-same-faq
      class="relative z-10 min-h-[741px]"
    >
      <div class="flex flex-col lg:flex-row lg:items-start">
        <!-- 左欄：卷號 -->
        <div class="shrink-0 px-6 pt-16 lg:w-[484px] lg:py-[60px] lg:pl-[60px] lg:pr-0">
          <CommonPlate :data="faq.plate" data-fade="in" />
        </div>

        <!-- 右欄：標題 + 問答 + 分頁 -->
        <div class="min-w-0 flex-1 px-6 pb-16 lg:py-[60px] lg:pl-0 lg:pr-[60px]">
          <div class="flex flex-col gap-6 md:gap-8 lg:gap-12 lg:border-t lg:border-pre-800/35 lg:pt-8 lg:pl-6">
            <div class="flex flex-col gap-4">
              <h2 data-fade="in" class="font-serif text-[40px] font-bold italic leading-[1.2] tracking-[0.02em] text-pre-800 lg:text-[64px]">
                {{ faq.title_en }}
              </h2>
              <p data-fade="in" class="font-zh text-[22px] font-bold leading-[1.2] tracking-[0.02em] text-pre-800 lg:text-[28px]">
                {{ faq.title_zh }}
              </p>
            </div>

            <ul ref="faqListRef" class="flex flex-col">
              <li
                v-for="(item, i) in FAQ_PAGE_ITEMS"
                :key="item.question"
                data-fade="in"
                class="flex gap-x-4 py-6 lg:gap-x-6"
                :class="i < FAQ_PAGE_ITEMS.length - 1 ? 'border-b border-dashed border-pre-800/35' : ''"
              >
                <span class="shrink-0 font-serif text-[20px] font-bold italic leading-[1.4] text-[#71c1f0]">
                  Q{{ FAQ_OFFSET + i + 1 }}
                </span>
                <div class="flex min-w-0 flex-col gap-3">
                  <p class="font-zh text-[18px] font-bold leading-[1.4] text-pre-800">
                    {{ item.question }}
                  </p>
                  <p class="flex gap-x-2 font-Noto text-[15px] leading-[1.7] tracking-[0.04em] text-pre-800/[62%]">
                    <span class="shrink-0">→</span>
                    <span>{{ item.answer }}</span>
                  </p>
                </div>
              </li>
            </ul>

            <div data-fade="in">
              <CommonControlPagination
                v-model:page="faqPage"
                :total="FAQ_TOTAL_PAGES"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
