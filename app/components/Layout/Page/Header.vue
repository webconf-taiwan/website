<script setup>
const route = useRoute()

// 資料來自 app/constants/data/global.json（靜態，見 useSiteData）
const { header } = useGlobalData()
const navItems = header.nav_items || []
const logoSrc = assetUrl(header.logo?.src)

// 資料只給語意（side / is_highlight），「哪個斷點顯示哪些」是版面規則，留在元件裡。
const EXPOSED_ON_MOBILE = 'ticket'   // 一律外露、不收進漢堡
const EXPOSED_ON_MD = 'agenda'       // md 才外露，所以漢堡裡的那顆要在 md 以上藏起來

const leftMenu = navItems.filter(item => item.side === 'left')
const rightMenu = navItems.filter(item => item.side === 'right')
const agenda = navItems.find(item => item.id === EXPOSED_ON_MD)
const ticket = navItems.find(item => item.id === EXPOSED_ON_MOBILE)

// 漢堡選單內容：TICKET 永遠外露不收；AGENDA 在 md 已外露，故 md 以上隱藏
const dropdownMenu = navItems
  .filter(item => item.id !== EXPOSED_ON_MOBILE)
  .map(item => ({ ...item, cls: item.id === EXPOSED_ON_MD ? 'md:hidden' : '' }))

const open = ref(false)
const rootRef = ref(null)

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
    class="fixed top-0 z-50 bg-black/80 left-0 w-full backdrop-blur-[8px]"
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

      <!-- 平板以下：外露項目 + 漢堡鈕 -->
      <div class="flex items-center gap-2 xl:hidden">
        <!-- AGENDA：md 才外露 -->
        <a
          v-if="agenda"
          :href="agenda.href"
          :target="agenda.target"
          :rel="linkRel(agenda.target)"
          data-nav-item
          class="hidden whitespace-nowrap px-3 py-1 font-mono text-[16px] uppercase leading-none tracking-[0.04em] text-[#efe6d2] opacity-0 transition-colors hover:text-[#71c1f0] md:block"
        >
          {{ agenda.label }}
        </a>
        <!-- TICKET：一律外露 -->
        <a
          v-if="ticket"
          :href="ticket.href"
          :target="ticket.target"
          :rel="linkRel(ticket.target)"
          data-nav-item
          class="whitespace-nowrap px-3 py-1 font-mono text-[16px] uppercase leading-none tracking-[0.04em] text-[#71c1f0] opacity-0 transition-colors"
        >
          {{ ticket.label }}
        </a>
        <!-- 漢堡鈕（三槓・白色） -->
        <button
          type="button"
          data-nav-item
          class="flex size-10 shrink-0 flex-col items-center justify-center gap-1.5 opacity-0"
          :aria-expanded="open"
          :aria-label="header.menu_open_label"
          @click="open = true"
        >
          <span class="block h-0.5 w-6 bg-white"></span>
          <span class="block h-0.5 w-6 bg-white"></span>
          <span class="block h-0.5 w-6 bg-white"></span>
        </button>
      </div>
    </div>

    <!-- 行動選單：右側滑出抽屜 -->
    <div
      class="fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 xl:hidden"
      :class="open ? 'opacity-100' : 'pointer-events-none opacity-0'"
      @click="open = false"
    ></div>
    <!-- 抽屜關閉時用 translate-x-full 收在畫面右外側，會把頁面捲動範圍撐寬
         （390px 視窗實測被撐成 678px、可以橫捲）。外面包一層會裁切的固定容器
         擋掉；容器本身不吃事件，抽屜再把 pointer-events 收回來。 -->
    <div class="pointer-events-none fixed inset-0 z-50 overflow-x-hidden xl:hidden">
      <aside
        class="pointer-events-auto absolute right-0 top-0 flex h-dvh w-72 max-w-[80vw] flex-col bg-[#0a0a0b] transition-transform duration-300 ease-out"
        :class="open ? 'translate-x-0' : 'translate-x-full'"
      >
        <button
          type="button"
          class="self-end p-6 text-white"
          :aria-label="header.menu_close_label"
          @click="open = false"
        >
          <span class="relative block size-5">
            <span class="absolute left-0 top-1/2 block h-0.5 w-full -translate-y-1/2 rotate-45 bg-current"></span>
            <span class="absolute left-0 top-1/2 block h-0.5 w-full -translate-y-1/2 -rotate-45 bg-current"></span>
          </span>
        </button>
        <ul class="flex flex-col px-6">
          <li v-for="link in dropdownMenu" :key="link.id" :class="link.cls">
            <a
              :href="link.href"
              :target="link.target"
              :rel="linkRel(link.target)"
              class="block py-3 font-mono text-[16px] uppercase tracking-[0.04em] text-[#efe6d2] transition-colors hover:text-[#71c1f0]"
            >
              {{ link.label }}
            </a>
          </li>
        </ul>
      </aside>
    </div>
  </header>
</template>
