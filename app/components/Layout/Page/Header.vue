<script setup>
const route = useRoute()

// 資料來自 app/constants/data/global.json（靜態，見 useSiteData）
const { header } = useGlobalData()
const navItems = header.nav_items || []
const logoSrc = assetUrl(header.logo?.src)

// 資料只給語意（side / is_highlight），「哪個斷點顯示哪些」是版面規則，留在元件裡。
const EXPOSED_ON_MOBILE = 'ticket'   // 手機版是 header 上那顆購票 icon，不收進選單

const leftMenu = navItems.filter(item => item.side === 'left')
const rightMenu = navItems.filter(item => item.side === 'right')
const ticket = navItems.find(item => item.id === EXPOSED_ON_MOBILE)

// 選單清單：TICKET 已經是 header 上那顆 icon，不重複收進來，其餘七項全列。
const dropdownMenu = navItems.filter(item => item.id !== EXPOSED_ON_MOBILE)

const open = ref(false)
const rootRef = ref(null)
const menuRef = ref(null)

// 選單打開時鎖住背景、但選單自己要能捲。這件事要兩層才擋得完：
//   1. lenis.stop()      —— 擋桌機的滾輪（捲動被 Lenis 接管了，光鎖 html 沒用）
//   2. html.overflow-hidden —— 擋手機的原生觸控捲動（plugin 設的是 syncTouch: false，
//      觸控根本不經過 Lenis，只做第 1 步在手機上背景照捲）
// 面板本身另外標了 data-lenis-prevent，Lenis 才不會把選單裡的滾輪事件也吃掉。
const lenis = useLenis()

function lockBackground (locked) {
  if (typeof document === 'undefined') return
  if (locked) {
    lenis?.stop()
    document.documentElement.classList.add('overflow-hidden')
  } else {
    lenis?.start()
    document.documentElement.classList.remove('overflow-hidden')
  }
}

// 打開選單時，七個項目由上而下逐項淡入（面板本身的底色另外用 CSS 過場）
const { fadeInNow } = useFadeIn()
watch(open, async (isOpen) => {
  lockBackground(isOpen)
  if (!isOpen) return
  await nextTick()
  fadeInNow(menuRef.value, { step: 0.05, duration: 0.45, y: 12 })
})

// 選單開著時換頁／元件被拆掉，鎖不解開的話整站就再也捲不動了
onBeforeUnmount(() => lockBackground(false))

watch(() => route.fullPath, () => { open.value = false })

onMounted(() => {
  const { $gsap } = useNuxtApp()
  if (!$gsap || !rootRef.value) return

  const logo = rootRef.value.querySelector('[data-logo]')
  // 只取當前斷點「看得到」的項目（display:none 者 offsetParent 為 null），
  // 讓 from:'center' 以實際版面正中間為基準往外擴散
  const all = Array.from(rootRef.value.querySelectorAll('[data-nav-item]'))
  const items = all.filter(el => el.offsetParent !== null)
  // 目前隱藏的項目先設為可見，避免日後改變斷點時卡在 opacity-0
  $gsap.set(all.filter(el => el.offsetParent === null), { opacity: 1 })

  const tl = $gsap.timeline({ defaults: { ease: 'power2.out' } })
  // 1. logo 從上往下淡入
  tl.fromTo(
    logo,
    { y: -24, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.55 }
  )
  // 2. 選單接續 logo，從正中間往外逐個「從上往下」淡入
  tl.fromTo(
    items,
    { y: -16, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.45, stagger: { each: 0.06, from: 'center' } },
    '-=0.3'
  )
})
</script>

<template>
  <header
    ref="rootRef"
    class="fixed top-0 z-50 bg-black/50 left-0 w-full backdrop-blur-[2px]"
  >
    <div class="flex items-center justify-between gap-6 px-6 py-3 xl:justify-center xl:gap-[60px]">
      <!-- 左側選單（僅桌機 xl+：8 顆中文項在 lg 排不下） -->
      <nav class="hidden flex-1 basis-0 items-center justify-end gap-4 xl:flex">
        <a
          v-for="link in leftMenu"
          :key="link.id"
          data-nav-item
          :href="link.href"
          :target="link.target"
          :rel="linkRel(link.target)"
          class="shrink-0 whitespace-nowrap px-4 py-1 font-mono text-[16px] uppercase leading-none tracking-[0.04em] text-[#efe6d2] opacity-0 transition-colors hover:text-[#71c1f0]"
        >
          {{ link.label }}
        </a>
      </nav>

      <!-- 中央 logo（平板以下靠左） -->
      <NuxtLink data-logo to="/" class="flex shrink-0 items-center gap-1.5 opacity-0">
        <img
          :src="logoSrc"
          :alt="header.logo?.alt"
          :width="header.logo?.width"
          :height="header.logo?.height"
          class="h-7 w-auto"
        >
        <span class="flex items-center gap-1 font-mono text-xs uppercase tracking-[0.04em] text-[#efe6d2] opacity-80">
          <span v-for="part in header.logo?.suffix" :key="part">{{ part }}</span>
        </span>
      </NuxtLink>

      <!-- 右側選單（僅桌機 xl+） -->
      <nav class="hidden flex-1 basis-0 items-center gap-4 xl:flex">
        <a
          v-for="link in rightMenu"
          :key="link.id"
          data-nav-item
          :href="link.href"
          :target="link.target"
          :rel="linkRel(link.target)"
          class="shrink-0 whitespace-nowrap px-4 py-1 font-mono text-[16px] uppercase leading-none tracking-[0.04em] opacity-0 transition-colors hover:text-[#71c1f0]"
          :class="link.is_highlight ? 'text-[#71c1f0]' : 'text-[#efe6d2]'"
        >
          {{ link.label }}
        </a>
      </nav>

      <!-- 平板以下：購票 icon + 漢堡／叉叉。
           設計稿在 360px 寬只放得下兩顆 icon，購票是 icon 不是文字。 -->
      <div class="flex items-center gap-4 xl:hidden">
        <a
          v-if="ticket"
          :href="ticket.href"
          :target="ticket.target"
          :rel="linkRel(ticket.target)"
          data-nav-item
          class="flex size-6 shrink-0 items-center justify-center text-accent-1 opacity-0 transition-colors"
          :aria-label="ticket.label"
        >
          <AtomIcon name="ticket" is-full />
        </a>
        <!-- 開關同一顆：關著是漢堡、開著是叉叉 -->
        <button
          type="button"
          data-nav-item
          class="flex size-6 shrink-0 items-center justify-center text-pre-800 opacity-0"
          :aria-expanded="open"
          :aria-label="open ? header.menu_close_label : header.menu_open_label"
          @click="open = !open"
        >
          <AtomIcon v-if="open" name="close" is-full />
          <span v-else class="flex w-6 flex-col gap-1.5">
            <span class="block h-0.5 w-full bg-current"></span>
            <span class="block h-0.5 w-full bg-current"></span>
            <span class="block h-0.5 w-full bg-current"></span>
          </span>
        </button>
      </div>
    </div>

  </header>

    <!-- 行動選單：從 header 底下鋪滿整個畫面。
         ⚠️ 這一塊「不能」放進 <header> 裡面 —— header 自己有 backdrop-blur，
         backdrop-filter 會建立一個 backdrop root，巢狀在裡面的 backdrop-filter
         只糊得到那個 root 內部的東西：實測粒子會糊、但 hero 的文字整片清晰地
         透過來。放到 header 外面才吃得到整頁的背景。
         （順帶一提，放在裡面時 fixed 也會失效 —— backdrop-filter 同時是子孫 fixed
         的 containing block，inset 會相對 header 的 52px 去算，高度直接變 0。）
         52px = header 在手機的高度（py-3 上下各 12 + logo h-7 的 28）；
         pages/index.vue 的 hero 用 calc(100dvh-52px) 是同一個數字，改內距要一起改。
         z-25 讓它蓋住頁面內容、但仍在 header（z-50）底下，logo 與關閉鈕才點得到。
         ⚠️ 底色是半透明 + backdrop-blur，設計稿要透出背後的粒子場，不要改成不透明。
         blur 用 24px 而不是設計稿標的 8px —— 設計稿底下那張 hero 是壓暗的靜圖，
         實際背後是一直在動、還很亮的粒子場，8px 糊不掉，hero 的字會透過來跟選單打架。 -->
    <div
      data-lenis-prevent
      class="fixed inset-x-0 bottom-0 top-[52px] z-25 overflow-y-auto overscroll-contain bg-[rgba(10,10,12,0.7)] px-5 backdrop-blur-[24px] transition-opacity duration-300 xl:hidden"
      :class="open ? 'opacity-100' : 'pointer-events-none opacity-0'"
    >
      <ul ref="menuRef" class="flex flex-col py-4">
        <!-- 每一列：左邊英文大字、右邊中文。最後一列不畫虛線。 -->
        <li
          v-for="(link, i) in dropdownMenu"
          :key="link.id"
          :class="i < dropdownMenu.length - 1 ? 'border-b border-dashed border-pre-800/35' : ''"
        >
          <a
            data-fade="in"
            :href="link.href"
            :target="link.target"
            :rel="linkRel(link.target)"
            class="flex items-end justify-between py-4 text-pre-800 transition-colors hover:text-accent-1"
          >
            <span class="text-h3">
              {{ link.label_en }}
            </span>
            <span class="px-3 py-1 font-Noto text-btn">
              {{ link.label }}
            </span>
          </a>
        </li>
      </ul>
    </div>
</template>
