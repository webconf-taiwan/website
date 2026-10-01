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

// ─── SEO / AEO ──────────────────────────────────────────────────────────────
// 標題、描述、活動日期地點都在 app/constants/data/seo.json。
// ⚠️ 這段原本只在 index-old.vue 有，換成一鏡到底版時沒搬過來 —— 首頁一度只剩
// 全站預設的 "WebConf | WebConf"、沒有 description、也沒有 Event 結構化資料。
const seo = useSeoData()
const site = useSiteConfig()
const siteUrl = site.url.replace(/\/+$/, '')
const { event } = seo
usePageSeo('/')

useSchemaOrg([
  defineWebPage({ name: seo.pages['/'].title, description: seo.pages['/'].description, mainEntity: { '@id': `${siteUrl}/#event` } })
])

// Event 直接輸出已確認的資料，避免套件替 Offer 補入臆測的有效期限及庫存狀態。
// 日期、票價與講者仍與畫面共用來源，SSR 即可讀取。
const eventSchema = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  image: `${siteUrl}${seo.site.og_image.src}`,
  '@id': `${siteUrl}/#event`,
  url: `${siteUrl}/`,
  name: event.name,
  description: seo.pages['/'].description,
  startDate: event.start_date,
  endDate: event.end_date,
  eventAttendanceMode: `https://schema.org/${event.attendance_mode}`,
  eventStatus: `https://schema.org/${event.status}`,
  inLanguage: 'zh-TW',
  location: {
    '@type': 'Place',
    name: event.venue.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: event.venue.street_address,
      addressLocality: event.venue.locality,
      addressRegion: event.venue.region,
      postalCode: event.venue.postal_code,
      addressCountry: event.venue.country
    }
  },
  organizer: { '@id': `${siteUrl}/#identity` },
  performer: (home.speaker?.items || []).map(p => ({
    '@type': 'Person',
    name: p.name,
    jobTitle: p.role,
    worksFor: p.org ? { '@type': 'Organization', name: p.org } : undefined
  })),
  offers: (home.ticket?.items || []).map(item => ({
    '@type': 'Offer',
    name: item.title,
    price: item.price.replace(/,/g, ''),
    priceCurrency: 'TWD',
    url: `${siteUrl}/${event.ticket_anchor}`
  }))
}
useHead({ script: [{
  key: 'event-jsonld',
  type: 'application/ld+json',
  innerHTML: JSON.stringify(eventSchema).replace(/</g, '\\u003c')
}] })

// 「一鏡到底」只有桌機（≥1024px）跑得動，窄視窗換成幾張各自獨立、只在自己那一區
// 跑的小 canvas。完整的理由與各區塊的取捨在 app/composables/useViewportMode.js。
const { isDesktop, viewportReady } = useViewportMode()
// 桌機沒有可用的 WebGPU（顯示卡被瀏覽器擋、Windows ARM 筆電…）時，即時粒子會退到 CPU 卡死。
// 那時整頁背景關掉，只在 hero 與票券～CoC 兩段各放一支事先錄好的循環影片（HomeVideoField），
// 講者改用靜態圖（見 Speaker.vue）。null = 還在偵測，先什麼都不掛。
// 窄視窗同理，只是影片維持 fixed 一支（中間那段本來就有不透明底色蓋住），見 HomeVideoField。
const { webgpu } = useWebGpuSupport()
// ⚠️ 要等 mounted 才成立：videoMode 也拿去切 <ClientOnly> 外面的東西（CoC 的 thin-glass），
// SSR 時一定是 false；偵測在 hydration 前就有結果的話（?webgpu=off、沒有 navigator.gpu）
// class 會對不上，而正式版的 hydration 不會修正 class —— 毛玻璃就永遠停在 SSR 那一版。
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const videoMode = computed(() => mounted.value && viewportReady.value && webgpu.value === false)
const desktopVideo = computed(() => videoMode.value && isDesktop.value)

const fieldRef = ref(null)

// 右下角的狀態列會顯示實際跑起來的後端（webgpu / webgl2 / canvas2d）
// 影片版沒有引擎，但仍顯示偵測結果：沒有 WebGPU 的機器原本就是退到 canvas2d，
// 標成 canvas2d 讓看的人知道這台走的是哪條路（影片只是那條路的替身）。
const backend = computed(() => fieldRef.value?.backend || (videoMode.value ? 'canvas2d' : ''))

// 互動模式（彩蛋）。手勢那邊算出螢幕座標與力道，這裡轉交給粒子場 ——
// 相機變換（zoom / offset）由 HomeField.pushAt 自己處理。
const { isOn: interactiveOn } = useInteractiveMode()
const handPush = (x, y, radius, strength) => fieldRef.value?.pushAt?.(x, y, radius, strength)
const handGather = (x, y, radius, amount) => fieldRef.value?.gatherAt?.(x, y, radius, amount)

</script>

<template>
  <div class="relative bg-bg-mid text-[#efe6d2]">
    <!-- 粒子場。桌機是整頁唯一的那張（speakers 只用來拿 portrait 路徑，
         也就是 PL.III 影格的點雲）；窄視窗換成只服務 hero 與票券區的自由場，
         PL.III 的人像由觀景框裡自己那張畫（見 HomeSpeaker）。
         ⚠️ 一定要包 <ClientOnly> —— 斷點只有 client 量得到，直接 v-if 會在
         hydration 時對不起來。canvas 本來就是 onMounted 才建引擎，不影響首屏。 -->
    <ClientOnly>
      <template v-if="viewportReady">
        <HomeField
          v-if="isDesktop && webgpu === true"
          ref="fieldRef"
          :speakers="home.speaker?.items || []"
        />
        <HomeMobileField v-else-if="!isDesktop && webgpu === true" ref="fieldRef" />
        <HomeVideoField
          v-else-if="!isDesktop && webgpu === false"
          fixed
          intro
          :active-in="['#hero', '[data-same-outro]']"
        />
      </template>
    </ClientOnly>

    <!-- 側邊章節指示器。fixed 在畫面左側，捲到哪一卷就亮哪一顆，點了直接跳過去。
         原本這串點是 PL.III 與 PL.VII 各自畫一份靜態的，會跟著區塊捲走也點不了。 -->
    <CommonChapterNav />

    <!-- 互動模式（彩蛋）：Ctrl + 2 + 6 叫出確認窗，確認後開相機用手勢推粒子。
         ⚠️ 只有桌機那張 canvas 有 pushAt —— 窄視窗是另一支 HomeMobileField，
         而且手舉在手機鏡頭前也擺不出這些手勢，所以整組只在 isDesktop 掛載。 -->
    <ClientOnly>
      <HomeInteractiveGate v-if="isDesktop && webgpu" />
      <HomeHandField
        v-if="isDesktop && webgpu && interactiveOn"
        :on-push="handPush"
        :on-gather="handGather"
      />
    </ClientOnly>

    <!-- ===================================================================
         PL. I — Hero
         data-same-hero 是第 1 段（自由場 → side.png）的觸發器：這個區塊的底邊
         從畫面底捲到畫面頂的這段 = 粒子從滿版自由場收攏成 side.png。
    ==================================================================== -->
    <!-- 影片版（沒有 WebGPU 的桌機）：hero 自己一支背景影片，見 HomeVideoField -->
    <div class="relative">
      <ClientOnly>
        <HomeVideoField v-if="desktopVideo" intro />
      </ClientOnly>
      <HomeHero :data="home.hero" :backend="backend" />
    </div>

    <!-- ===================================================================
         PL. II ～ PL. V —— 窄視窗的「沒有粒子」那一段
         ⚠️ 不透明底色掛在「這一層」，不是各區塊自己來。
         各區塊自己鋪的話，區塊交界會有一條看得見的縫：版面高度是小數
         （實測 about 的底邊在 406.539px），交界那一列被兩個區塊各蓋半格，
         剩下的那半格就露出背後那張 fixed canvas —— 畫面上是一條會動的點線。
         包成一段連續的底就沒有內部交界了。
         ⚠️ 顏色用頁面底色 #0a0a0c（＝頁面根層的 bg-bg-mid），而且要跟粒子引擎的
         compose 底色（makeEngine 的 opts.bg）同一個色：PL.III 觀景框裡那張 canvas
         是一塊不透明方塊，兩邊不同色時方塊邊界就看得出來（以前引擎固定純黑時實測
         (0,0,0) vs (10,10,12)，暗色畫面上是一圈很淡但明確的框）。
         桌機這一層要透明：那幾區的粒子就畫在背後那張 canvas 上。
    ==================================================================== -->
    <div class="relative z-10 bg-bg-mid lg:bg-transparent">
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
    <div data-same-outro class="relative">
      <!-- 影片版：票券 → 贊助 → CoC 共用一支背景影片（CoC 的毛玻璃會把它糊掉） -->
      <ClientOnly>
        <HomeVideoField v-if="desktopVideo" />
      </ClientOnly>
      <HomeTicket :data="home.ticket" />

    <!-- 贊助商跑馬燈。素材在 public/sponsors/ -->
    <HomeSponsorMarquee :data="home.sponsor" />

    <!-- ===================================================================
         PL. VI — Code of Conduct
         毛玻璃把背後的粒子糊掉 —— 這一區在兩個版本裡是完全一樣的。
    ==================================================================== -->
    <!-- 章節錨點交給上面那個 fixed 的 CommonChapterNav，關掉區塊內建的靜態版本 -->
    <HomeCodeOfConduct :data="home.code_of_conduct" :show-chapter-dots="false" :thin-glass="videoMode" />
    </div>
  </div>
</template>
