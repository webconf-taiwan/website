<script setup>
import TicketCard from '~/components/Common/Card/TicketCard.vue';

// 首頁 PL.I（Hero）+ PL.II（About）。
// 背景是一張固定的粒子場 canvas（HomeParticleField），兩個區塊都疊在它上面 ——
// 捲動時是「相機」在移動、色盤在過渡，粒子模擬全程沒有停過。
//
// 內容資料統一由 /api/home 取得（見 useSiteData / server/api/home.get.js），
// 這一頁是唯一的取資料點，各區塊元件一律用 props 拿，不各自打 API。

const home = await useHomeData()

const fieldRef = ref(null)

// 右下角的狀態列會顯示實際跑起來的後端（webgpu / webgl2 / canvas2d）
const backend = computed(() => fieldRef.value?.backend || '')
</script>

<template>
  <div class="relative bg-black text-[#efe6d2]">
    <HomeParticleField ref="fieldRef" />

    <!-- 側邊章節指示器。fixed 在畫面左側，捲到哪一卷就亮哪一顆，點了直接跳過去。
         ⚠️ 它靠 section 的 id 定位（hero / about / speaker / venue / faq /
         ticket / code-of-conduct），加減區塊時記得一起維護。 -->
    <CommonChapterNav />

    <!-- ===================================================================
         PL. I — Hero
         data-field-hero 是背景粒子場的 ScrollTrigger 觸發器：這個區塊的底邊
         從畫面底捲到畫面頂的這段 = 粒子場從滿版遷移到左側、色盤轉金橄欖。
    ==================================================================== -->
    <section
      id="hero"
      data-field-hero
      class="relative z-10 flex bg-black/30 min-h-[calc(100dvh-52px)] flex-col items-center justify-center px-6 py-20 text-center"
    >
      <p class="font-mono text-fs-micro uppercase text-white/55">
        {{ home.hero.plate_label }}
      </p>

      <h1 class="mt-6 font-serif text-[clamp(72px,13vw,240px)] italic leading-[0.95] tracking-[-0.02em]">
        {{ home.hero.title }}
      </h1>

      <p class="mt-6 font-serif text-[clamp(18px,2.2vw,30px)] italic leading-snug">
        {{ home.hero.subtitle }}
      </p>

      <p class="mt-3 font-mono text-fs-micro uppercase text-white/55">
        {{ home.hero.keywords }}
      </p>

      <a
        :href="home.hero.cta?.href"
        :target="home.hero.cta?.target"
        :rel="linkRel(home.hero.cta?.target)"
        class="mt-10 inline-block border border-[#71c1f0]/60 px-8 py-3 font-zh text-fs-btn text-[#efe6d2] transition-colors hover:border-[#71c1f0] hover:bg-[#71c1f0]/10"
      >
        {{ home.hero.cta?.label }}
      </a>

      <!-- 四角的「標本標籤」：科學紀錄語彙，桌機才出現 -->
      <div class="pointer-events-none absolute inset-x-6 bottom-8 hidden items-end justify-between lg:flex">
        <div class="text-left">
          <p class="font-mono text-fs-micro uppercase text-white/55">
            {{ home.hero.corner_left?.label }}
          </p>
          <p class="font-serif text-fs-caption italic text-white/55">
            {{ home.hero.corner_left?.note }}
          </p>
        </div>
        <div class="text-right">
          <p class="font-mono text-fs-micro uppercase text-white/55">
            {{ home.hero.corner_right?.label }}
          </p>
          <!-- note 後面接的是執行期才知道的繪圖後端，不是資料 -->
          <p class="font-serif text-fs-caption italic text-white/55">
            {{ home.hero.corner_right?.note }}{{ backend ? ` · ${backend}` : '' }}
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
            {{ home.about.plate?.code }}
          </p>
          <p class="mt-2 font-serif text-fs-h2 italic leading-none">
            {{ home.about.plate?.number }}
          </p>
          <p class="mt-2 font-mono text-fs-micro uppercase text-white/55">
            {{ home.about.plate?.label }}
          </p>

          <!-- Skills 框：疊在背景粒子團上的「觀察框」。刻意留大量上方空白，
               讓框落在粒子團中段（設計稿的構圖）。 -->
          <div class="relative mt-24 max-w-[280px] lg:ml-16 lg:mt-40">
            <!-- 十字準星 -->
            <span class="pointer-events-none absolute -left-4 top-1/2 font-mono text-fs-caption text-white/40">+</span>
            <div class="relative border border-white/25 px-4 py-5">
              <span class="absolute -top-2.5 left-3 bg-black px-1 font-mono text-fs-caption text-white/60">
                {{ home.about.skills_box_label }}
              </span>
              <ul class="space-y-1 text-right font-mono text-fs-caption text-white/55">
                <li v-for="s in home.about.skills" :key="s">
                  {{ s }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 右欄：主文案 -->
        <div class="lg:col-span-8">
          <h2 class="font-serif text-[clamp(40px,5.2vw,88px)] leading-[1.08] tracking-[-0.02em]">
            {{ home.about.heading }}
          </h2>

          <!-- 中間要換色的字（agents / connections / code）由資料切成 runs 標 is_accent，
               而不是在 JSON 裡塞 HTML 再 v-html。 -->
          <p class="mt-8 max-w-[52ch] font-serif text-[clamp(18px,1.6vw,26px)] italic leading-[1.5] text-[#efe6d2]/90">
            <template v-for="(run, i) in home.about.lede_runs" :key="i">
              <span v-if="run.is_accent" class="text-[#71c1f0]">{{ run.text }}</span>
              <template v-else>{{ run.text }}</template>
            </template>
          </p>

          <p class="mt-8 max-w-[46ch] font-zh text-fs-body-lg text-[#efe6d2]/75">
            {{ home.about.body_zh }}
          </p>

          <a
            :href="home.about.cta?.href"
            :target="home.about.cta?.target"
            :rel="linkRel(home.about.cta?.target)"
            class="mt-10 inline-block border border-[#71c1f0]/60 px-8 py-3 font-zh text-fs-btn text-[#efe6d2] transition-colors hover:border-[#71c1f0] hover:bg-[#71c1f0]/10"
          >
            {{ home.about.cta?.label }}
          </a>
        </div>
      </div>
    </section>

    <!-- ===================================================================
         PL. III — Speaker
         自己帶一張獨立的粒子 canvas（人像點雲），捲到中央時會把上面那張背景場
         接管過去暫停 —— 同時只有一張在算。仲裁見 useParticleStage。
    ==================================================================== -->
    <HomeSpeakerField :data="home.speaker" />

    <!-- ===================================================================
         PL. IV — Venue + PL. V — FAQ
         兩區共用一張 sticky canvas，捲過去時點雲從第一隻標本連續變形成第二隻。
    ==================================================================== -->
    <HomeVenueFaqField :venue="home.venue" :faq="home.faq" />

    <!-- PL. VI — Ticket。id 同時是 CommonChapterNav 的錨點與 hero CTA 的 #ticket 目標。 -->
    <!-- ⚠️ 不要加 scroll-mt-*：Lenis 的 scrollTo 會吃 scroll-margin，
         跟 CommonChapterNav 自己的 offset 疊起來會多空一截，跟其他六區對不齊。 -->
    <section id="ticket" class="relative flex flex-col gap-y-6">
      <h2 class="text-center text-h1">
        <template v-for="(line, i) in home.ticket.heading_lines" :key="i">
          <br v-if="i > 0">{{ line }}
        </template>
      </h2>
      <div class="flex flex-col gap-6 px-5 md:flex-row md:justify-center md:items-stretch">
        <TicketCard
          v-for="ticket in home.ticket.items" :key="ticket.code"
          :data="ticket"
        />
      </div>
      <div class="flex justify-center">
        <AtomButton
          intent="specimen"
          size="md"
          rounded="none"
          :href="home.ticket.cta?.href"
          :text="home.ticket.cta?.label"
        >
          {{ home.ticket.cta?.label }}
          <span class="flex size-6 items-center justify-center">
            <AtomIcon name="arrow-right-thin" class="h-[5px] w-3" />
          </span>
        </AtomButton>
      </div>
    </section>

    <!-- 贊助商跑馬燈。素材在 public/sponsors/ -->
    <HomeSponsorMarquee :data="home.sponsor" />

    <!-- ===================================================================
         PL. VII — Code of Conduct
         沒有自己的 canvas：視覺主體是把背後的背景粒子場糊掉的那塊毛玻璃。
    ==================================================================== -->
    <!-- 章節錨點交給上面那個 fixed 的 CommonChapterNav，關掉區塊內建的靜態版本 -->
    <HomeCodeOfConduct :data="home.code_of_conduct" :show-chapter-dots="false" />
  </div>
</template>
