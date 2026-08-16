<script setup>
import TicketCard from '~/components/Common/Card/TicketCard.vue';

// 首頁 PL.I（Hero）+ PL.II（About）。
// 背景是一張固定的粒子場 canvas（HomeParticleField），兩個區塊都疊在它上面 ——
// 捲動時是「相機」在移動、色盤在過渡，粒子模擬全程沒有停過。

const fieldRef = ref(null)

// 右下角的狀態列會顯示實際跑起來的後端（webgpu / webgl2 / canvas2d）
const backend = computed(() => fieldRef.value?.backend || '')

const skills = ['UI · UX', 'Frontend', 'AI Agent', 'Backend', 'Agile']

// PL. VI · 票種資料。先集中成一個變數，之後做關注點分離時，
// 整包搬去 composable 或改接 CMS/API 都只動這裡，template 不用改。
const tickets = ref([
  {
    code: 'PL. VI · 01',
    title: '一般票',
    price: '4,980',
    category: 'FIELD NOTES · General Admission',
    highlighted: false,
    features: [
      { en: 'Programme', zh: '兩日完整議程' },
      { en: 'Daily Hospitality', zh: '兩日午餐、下午茶' },
      { en: 'Annual Edition', zh: '年度紀念品' },
      { en: 'Interactive Area', zh: '攤位互動體驗' }
    ]
  },
  {
    code: 'PL. VI · 02',
    title: '三人揪團票',
    price: '4,400',
    category: 'Field Group · Group Admission',
    highlighted: true,
    features: [
      { en: 'Three-Person Group Offer', zh: '三人同行限定優惠' },
      { en: 'Programme', zh: '兩日完整議程' },
      { en: 'Daily Hospitality', zh: '兩日午餐、下午茶' },
      { en: 'Annual Edition', zh: '年度紀念品' },
      { en: 'Interactive Area', zh: '攤位互動體驗' }
    ],
    backgroundColor: '',
  }])
</script>

<template>
  <div class="relative bg-black text-[#efe6d2]">
    <HomeParticleField ref="fieldRef" />

    <!-- ===================================================================
         PL. I — Hero
         data-field-hero 是背景粒子場的 ScrollTrigger 觸發器：這個區塊的底邊
         從畫面底捲到畫面頂的這段 = 粒子場從滿版遷移到左側、色盤轉金橄欖。
    ==================================================================== -->
    <section
      data-field-hero
      class="relative z-10 flex bg-black/30 min-h-[calc(100dvh-52px)] flex-col items-center justify-center px-6 py-20 text-center"
    >
      <p class="font-mono text-fs-micro uppercase text-white/55">
        PL. I · Living Specimen · 2026
      </p>

      <h1 class="mt-6 font-serif text-[clamp(72px,13vw,240px)] italic leading-[0.95] tracking-[-0.02em]">
        WebConf
      </h1>

      <p class="mt-6 font-serif text-[clamp(18px,2.2vw,30px)] italic leading-snug">
        Taipei Popop · Dec 11-12, 2026
      </p>

      <p class="mt-3 font-mono text-fs-micro uppercase text-white/55">
        Agent · Connections · Code
      </p>

      <a
        href="#ticket"
        class="mt-10 inline-block border border-[#71c1f0]/60 px-8 py-3 font-zh text-fs-btn text-[#efe6d2] transition-colors hover:border-[#71c1f0] hover:bg-[#71c1f0]/10"
      >
        前往購票 →
      </a>

      <!-- 四角的「標本標籤」：科學紀錄語彙，桌機才出現 -->
      <div class="pointer-events-none absolute inset-x-6 bottom-8 hidden items-end justify-between lg:flex">
        <div class="text-left">
          <p class="font-mono text-fs-micro uppercase text-white/55">
            Code · Emergence
          </p>
          <p class="font-serif text-fs-caption italic text-white/55">
            vol. iii · plate i .
          </p>
        </div>
        <div class="text-right">
          <p class="font-mono text-fs-micro uppercase text-white/55">
            N 25.04° · E 121.56°
          </p>
          <p class="font-serif text-fs-caption italic text-white/55">
            simulation · live{{ backend ? ` · ${backend}` : '' }}
          </p>
        </div>
      </div>
    </section>

    <!-- ===================================================================
         PL. II — About
    ==================================================================== -->
    <section
      id="about"
      class="relative z-10 bg-black/30 px-6 lg:px-12 2xl:px-20"
    >
      <div class="mx-auto grid max-w-[1680px] border-t border-pre-800/35 pt-8 pb-16 md:pb-24 grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <!-- 左欄：卷號 + Skills 標本框 -->
        <div class="lg:col-span-4">
          <p class="font-mono text-fs-micro uppercase text-[#71c1f0]/70">
            PL. II
          </p>
          <p class="mt-2 font-serif text-fs-h2 italic leading-none">
            II.
          </p>
          <p class="mt-2 font-mono text-fs-micro uppercase text-white/55">
            About
          </p>

          <!-- Skills 框：疊在背景粒子團上的「觀察框」。刻意留大量上方空白，
               讓框落在粒子團中段（設計稿的構圖）。 -->
          <div class="relative mt-24 max-w-[280px] lg:ml-16 lg:mt-40">
            <!-- 十字準星 -->
            <span class="pointer-events-none absolute -left-4 top-1/2 font-mono text-fs-caption text-white/40">+</span>
            <div class="relative border border-white/25 px-4 py-5">
              <span class="absolute -top-2.5 left-3 bg-black px-1 font-mono text-fs-caption text-white/60">
                Skills
              </span>
              <ul class="space-y-1 text-right font-mono text-fs-caption text-white/55">
                <li v-for="s in skills" :key="s">
                  {{ s }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 右欄：主文案 -->
        <div class="lg:col-span-8">
          <h2 class="font-serif text-[clamp(40px,5.2vw,88px)] leading-[1.08] tracking-[-0.02em]">
            An emergent gathering of the Web.
          </h2>

          <p class="mt-8 max-w-[52ch] font-serif text-[clamp(18px,1.6vw,26px)] italic leading-[1.5] text-[#efe6d2]/90">
            WebConf Taiwan is a two-day field study of the living web —
            where <span class="text-[#71c1f0]">agents</span>,
            <span class="text-[#71c1f0]">connections</span>, and
            <span class="text-[#71c1f0]">code</span>
            coalesce into something larger than their parts.
          </p>

          <p class="mt-8 max-w-[46ch] font-zh text-fs-body-lg text-[#efe6d2]/75">
            WebConf 是一年一度聚集網頁技術專家與愛好者的盛會。今年以「湧現」為主題，從生態學家的視角，觀察 AI Agent 如何執行任務、工具與平台如何串接，以及程式碼如何改變網頁的運作方式。這些技術如同顯微鏡下的細胞，從簡單規則出發，彼此影響、共同演化，逐步形成新的網頁生態。
          </p>

          <a
            href="#agenda"
            class="mt-10 inline-block border border-[#71c1f0]/60 px-8 py-3 font-zh text-fs-btn text-[#efe6d2] transition-colors hover:border-[#71c1f0] hover:bg-[#71c1f0]/10"
          >
            議程資訊 →
          </a>
        </div>
      </div>
    </section>

    <!-- ===================================================================
         PL. III — Speaker
         自己帶一張獨立的粒子 canvas（人像點雲），捲到中央時會把上面那張背景場
         接管過去暫停 —— 同時只有一張在算。仲裁見 useParticleStage。
    ==================================================================== -->
    <HomeSpeakerField />

    <!-- ===================================================================
         PL. IV — Venue + PL. V — FAQ
         兩區共用一張 sticky canvas，捲過去時點雲從第一隻標本連續變形成第二隻。
         右側文字區塊尚未實作。
    ==================================================================== -->
    <HomeVenueFaqField />

    <section class="relative flex flex-col gap-y-6">
      <h2 class="text-center text-h1">
        Two ways<br>to enter the field.
      </h2>
      <div class="flex flex-col gap-6 px-5 md:flex-row md:justify-center md:items-stretch">
        <TicketCard
          v-for="ticket in tickets" :key="ticket.code"
          :data="ticket"
        />
      </div>
      <div class="flex justify-center">
        <AtomButton
          intent="specimen"
          size="md"
          rounded="none"
          href="#ticket"
          text="前往購票"
        >
          前往購票
          <span class="flex size-6 items-center justify-center">
            <AtomIcon name="arrow-right-thin" class="h-[5px] w-3" />
          </span>
        </AtomButton>
      </div>
    </section>

    <!-- 贊助商跑馬燈。素材在 public/sponsors/ -->
    <HomeSponsorMarquee />

    <!-- ===================================================================
         PL. VII — Code of Conduct
         沒有自己的 canvas：視覺主體是把背後的背景粒子場糊掉的那塊毛玻璃。
    ==================================================================== -->
    <HomeCodeOfConduct />
  </div>
</template>
