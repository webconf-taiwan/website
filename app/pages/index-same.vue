<script setup>
import TicketCard from '~/components/Common/Card/TicketCard.vue';

// 首頁 —— 「整頁只有一張 canvas」的比較版本。
//
// 內容與 pages/index.vue 完全一樣（同一份 /api/home 資料、同一組文案與版面），
// 差別只在粒子的做法：
//
//   pages/index.vue（原版）      三張 canvas
//     · HomeParticleField   固定背景，PL.I / PL.II
//     · HomeSpeakerField    PL.III 自己一張，人像可以鎖到很死
//     · HomeVenueFaqField   PL.IV + PL.V 共用一張 sticky
//     三張靠 useParticleStage 仲裁，同時只有一張在算，其餘定格。
//
//   pages/index-same.vue（本頁）  一張 canvas
//     · HomeSameField       從 PL.I 到 PL.VII 都是同一群粒子，沿著捲動在六個
//       關鍵影格之間連續變形（自由場 → side → 人像 → venue → faq → 自由場）。
//
// 看得出來的差異：
//   1. 區塊之間沒有任何淡入淡出或黑色硬邊，是「同一群粒子流過去」
//   2. 每一區的底色只能半透明壓黑（不透明會蓋掉自己的粒子），整頁層次更連貫
//   3. 人像的銳利度略遜原版 —— 前後都還要變成別的東西，物理參數只能沿捲動插值
//   4. 沒有交棒、沒有台下追趕，狀態機小很多（少了約 200 行的邊界處理）
//
// 各元件都是另外一組（app/components/HomeSame/），原版的三個元件一行都沒動，
// 兩頁可以並排比較。

const home = await useHomeData()

const fieldRef = ref(null)

// 右下角的狀態列會顯示實際跑起來的後端（webgpu / webgl2 / canvas2d）
const backend = computed(() => fieldRef.value?.backend || '')

// 這是比較用的頁面，不要被搜尋引擎收錄成首頁的重複內容
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <div class="relative bg-black text-[#efe6d2]">
    <!-- 整頁唯一的 canvas。speakers 只用來拿 portrait 路徑（PL.III 影格的點雲）。 -->
    <HomeSameField ref="fieldRef" :speakers="home.speaker?.items || []" />

    <!-- 側邊章節指示器。fixed 在畫面左側，捲到哪一卷就亮哪一顆，點了直接跳過去。
         原本這串點是 PL.III 與 PL.VII 各自畫一份靜態的，會跟著區塊捲走也點不了。 -->
    <CommonChapterNav />

    <!-- 版本切換。純粹是給設計對照用的，不在設計稿裡 —— 定案後直接刪掉這一塊。 -->
    <NuxtLink
      to="/"
      class="fixed bottom-4 left-4 z-50 border border-white/25 bg-black/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/60 backdrop-blur-sm transition-colors hover:border-white/60 hover:text-white"
    >
      ← 三張 canvas 版
    </NuxtLink>

    <!-- ===================================================================
         PL. I — Hero
         data-same-hero 是第 1 段（自由場 → side.png）的觸發器：這個區塊的底邊
         從畫面底捲到畫面頂的這段 = 粒子從滿版自由場收攏成 side.png。
    ==================================================================== -->
    <section
      id="hero"
      data-same-hero
      class="relative z-10 flex min-h-[calc(100dvh-52px)] flex-col items-center justify-center bg-black/30 px-6 py-20 text-center"
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
      <div class="mx-auto grid max-w-[1680px] grid-cols-1 gap-12 border-t border-pre-800/35 pb-16 pt-8 md:pb-24 lg:grid-cols-12 lg:gap-10">
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
          <div class="relative hidden lg:block mt-24 max-w-[280px] lg:ml-16 lg:mt-40">
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
         PL. III — Speaker（沒有自己的 canvas，人像是同一群粒子變成的）
    ==================================================================== -->
    <HomeSameSpeaker :data="home.speaker" />

    <!-- ===================================================================
         PL. IV — Venue + PL. V — FAQ（同上，兩隻標本也是同一群粒子）
    ==================================================================== -->
    <HomeSameVenueFaq :venue="home.venue" :faq="home.faq" />

    <!-- ===================================================================
         PL. VI — Ticket
         data-same-ticket 是最後一段的觸發器：粒子從 faq.png 散回滿版自由場，
         票券／贊助／CoC 三區共用開場那種「一直在演化的生態」。
    ==================================================================== -->
    <section
      id="ticket"
      data-same-ticket
      class="relative z-10 flex flex-col gap-y-6"
    >
      <h2 class="text-center text-h1">
        <template v-for="(line, i) in home.ticket.heading_lines" :key="i">
          <br v-if="i > 0">{{ line }}
        </template>
      </h2>
      <div class="flex flex-col gap-6 px-5 md:flex-row md:items-stretch md:justify-center">
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
         毛玻璃把背後的粒子糊掉 —— 這一區在兩個版本裡是完全一樣的。
    ==================================================================== -->
    <!-- 章節錨點交給上面那個 fixed 的 CommonChapterNav，關掉區塊內建的靜態版本 -->
    <HomeCodeOfConduct :data="home.code_of_conduct" :show-chapter-dots="false" />
  </div>
</template>
