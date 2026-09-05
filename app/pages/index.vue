<script setup>
// 首頁 —— 「一鏡到底」版（整頁只有一張粒子 canvas）。
// 桌機：HomeField 一張 fixed canvas，從 PL.I 到 PL.VII 都是同一群粒子，
// 沿著捲動在六個關鍵影格之間連續變形（自由場 → side → 人像 → venue → faq → 自由場）。

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
    <HomeHero :data="home.hero" :backend="backend" />

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
      <HomeAbout :data="home.about" />

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
      <HomeTicket :data="home.ticket" />

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
