<script setup>
import TicketCard from '~/components/Common/Card/TicketCard.vue';

// 首頁 —— 「一鏡到底」版（整頁只有一張粒子 canvas）。
//
// 桌機：HomeField 一張 fixed canvas，從 PL.I 到 PL.VII 都是同一群粒子，
// 沿著捲動在六個關鍵影格之間連續變形（自由場 → side → 人像 → venue → faq → 自由場）。
// 好處是區塊之間沒有任何淡入淡出或黑色硬邊，是「同一群粒子流過去」；
// 代價是每一區的底色只能半透明壓黑（不透明會蓋掉自己的粒子）。
//
// ⚠️ pages/index-old.vue 是被它取代的舊版（三張 canvas，靠 useParticleStage 仲裁
// 同時只有一張在算）。那頁與 app/components/Home/ 的三個 Field 元件都還留著，
// 但已經不是站上的首頁 —— 改東西時注意別改錯一組：
//   一鏡到底（本頁）→ Home/{Field,MobileField,Speaker,SpeakerPortrait,VenueFaq}.vue
//   舊的三張        → Home/{ParticleField,SpeakerField,VenueFaqField}.vue
//
// ─── RWD：一鏡到底只有桌機有 ──────────────────────────────────────────────
// 上面那條時間軸是「全程都在算」的 compute pass + 全螢幕 HDR render pass，而且
// 點數要取全頁最吃密度的那一格當基準（50000 顆）。手機／平板撐不住，而且那些
// 變形（side.png、菌落場、faq 標本）在窄視窗的版面裡本來就攤不開。
//
// 所以 <1024px（斷點與版面的 lg 對齊，見 useViewportMode）改成：
//   PL.I   hero          HomeMobileField —— 一張 fixed 的自由場 canvas
//   PL.II  about         沒有 canvas（底色改不透明，設計稿右下那團粒子拿掉）
//   PL.III speaker       觀景框裡自己一張小 canvas，只有換人時才有變化
//   PL.IV  venue         沒有 canvas
//   PL.V   faq           沒有 canvas
//   PL.VI～VII 票券／贊助／CoC   跟 hero 同一張 —— 它在 PL.II～PL.V 期間是 pause 的
//                        （被不透明底色蓋住，看不出定格），捲到這裡再醒回來繼續動

const home = await useHomeData()

// 「一鏡到底」只有桌機（≥1024px）跑得動，窄視窗換成幾張各自獨立、只在自己那一區
// 跑的小 canvas。完整的理由與各區塊的取捨在 app/composables/useViewportMode.js。
const { isDesktop, viewportReady } = useViewportMode()

const fieldRef = ref(null)

// 右下角的狀態列會顯示實際跑起來的後端（webgpu / webgl2 / canvas2d）
const backend = computed(() => fieldRef.value?.backend || '')

// ⚠️ 這裡原本有 `useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })`
// —— 那是這一頁還叫 index-same.vue、只是給設計對照用的時候加的。
// 現在它是正式首頁，那行必須拿掉，否則整個站的首頁會被搜尋引擎排除。
// robots / sitemap 統一由 @nuxtjs/seo 依 nuxt.config 的 site.indexable 管理。
</script>

<template>
  <div class="relative bg-black text-[#efe6d2]">
    <!-- 粒子場。桌機是整頁唯一的那張（speakers 只用來拿 portrait 路徑，
         也就是 PL.III 影格的點雲）；窄視窗換成只服務 hero 與票券區的自由場，
         PL.III 的人像由觀景框裡自己那張畫（見 HomeSpeaker）。
         ⚠️ 一定要包 <ClientOnly> —— 斷點只有 client 量得到，直接 v-if 會在
         hydration 時對不起來。canvas 本來就是 onMounted 才建引擎，不影響首屏。 -->
    <ClientOnly>
      <template v-if="viewportReady">
        <HomeField
          v-if="isDesktop"
          ref="fieldRef"
          :speakers="home.speaker?.items || []"
        />
        <HomeMobileField v-else ref="fieldRef" />
      </template>
    </ClientOnly>

    <!-- 側邊章節指示器。fixed 在畫面左側，捲到哪一卷就亮哪一顆，點了直接跳過去。
         原本這串點是 PL.III 與 PL.VII 各自畫一份靜態的，會跟著區塊捲走也點不了。 -->
    <CommonChapterNav />

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
         PL. II ～ PL. V —— 窄視窗的「沒有粒子」那一段
         ⚠️ 不透明底色掛在「這一層」，不是各區塊自己來。
         各區塊自己鋪的話，區塊交界會有一條看得見的縫：版面高度是小數
         （實測 about 的底邊在 406.539px），交界那一列被兩個區塊各蓋半格，
         剩下的那半格就露出背後那張 fixed canvas —— 畫面上是一條會動的點線。
         包成一段連續的底就沒有內部交界了。
         ⚠️ 顏色用純黑（＝頁面根層的 bg-black），不要用 #0a0a0c：粒子引擎的
         compose pass 是 clearValue{a:1} 的「不透明純黑」，PL.III 觀景框裡那張
         canvas 因此是一塊 #000 的方塊。底色若是 #0a0a0c，那塊方塊的邊界就看得出來
         （實測 (0,0,0) vs (10,10,12)，暗色畫面上是一圈很淡但明確的框）。
         桌機這一層要透明：那幾區的粒子就畫在背後那張 canvas 上。
    ==================================================================== -->
    <div class="relative z-10 bg-black lg:bg-transparent">
      <!-- ===================================================================
           PL. II — About
      ==================================================================== -->
      <section
        id="about"
        class="relative z-10 px-6 lg:bg-black/30 lg:px-12 2xl:px-20"
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
      <HomeSpeaker :data="home.speaker" />

      <!-- ===================================================================
           PL. IV — Venue + PL. V — FAQ（同上，兩隻標本也是同一群粒子）
      ==================================================================== -->
      <HomeVenueFaq :venue="home.venue" :faq="home.faq" />
    </div>

    <!-- ===================================================================
         PL. VI — Ticket
         data-same-ticket 是最後一段的觸發器：粒子從 faq.png 散回滿版自由場，
         票券／贊助／CoC 三區共用開場那種「一直在演化的生態」。
    ==================================================================== -->
    <!-- data-same-outro 是窄視窗那張 canvas 的第二個活動區間（見 HomeMobileField）：
         這一段進畫面就把 hero 那張從 pause 喚醒，離開再停。
         ⚠️ 要包住票券／贊助／CoC 三區 —— 設計稿上這三區的底就是 hero 那種生態，
         中間任何一段沒被包到，粒子就會在那裡定格一下。 -->
    <div data-same-outro>
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
  </div>
</template>
