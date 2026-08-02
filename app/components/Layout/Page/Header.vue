<script setup>
const { app } = useRuntimeConfig()
const route = useRoute()
const logoSrc = `${app.baseURL}logo-webconf.svg`.replace(/\/{2,}/g, '/')

// 單一來源；responsive 呈現由下方 template 控制
const agenda = { label: 'AGENDA', href: '#agenda' }
const ticket = { label: 'TICKET', href: '#ticket', highlight: true }

const leftMenu = [
  agenda,
  { label: 'SPEAKER', href: '#speaker' },
  { label: 'VENUE', href: '#venue' }
]
const rightMenu = [
  { label: 'SPONSORS', href: '#sponsors' },
  { label: 'HISTORY', href: '#history' },
  ticket
]

// 漢堡選單內容：TICKET 永遠外露不收；AGENDA 在 md 已外露，故 md 以上隱藏
const dropdownMenu = [
  { ...agenda, cls: 'md:hidden' },
  { label: 'SPEAKER', href: '#speaker' },
  { label: 'VENUE', href: '#venue' },
  { label: 'SPONSORS', href: '#sponsors' },
  { label: 'HISTORY', href: '#history' }
]

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
    class="sticky top-0 z-50 bg-black/80 backdrop-blur-[8px]"
  >
    <div class="flex items-center justify-between gap-6 px-6 py-3 lg:justify-center lg:gap-[60px]">
      <!-- 左側選單（僅桌機 lg+） -->
      <nav class="hidden w-[360px] items-center justify-end gap-4 lg:flex">
        <a
          v-for="link in leftMenu"
          :key="link.href"
          data-nav-item
          :href="link.href"
          class="px-4 py-1 font-mono text-[16px] uppercase leading-none tracking-[0.04em] text-[#efe6d2] opacity-0 transition-colors hover:text-[#71c1f0]"
        >
          {{ link.label }}
        </a>
      </nav>

      <!-- 中央 logo（平板以下靠左） -->
      <NuxtLink data-logo to="/" class="flex shrink-0 items-center gap-1.5 opacity-0">
        <img :src="logoSrc" alt="WebConf" class="h-7 w-auto" width="112" height="28">
        <span class="flex items-center gap-1 font-mono text-xs uppercase tracking-[0.04em] text-[#efe6d2] opacity-80">
          <span>tw</span><span>·</span><span>26</span>
        </span>
      </NuxtLink>

      <!-- 右側選單（僅桌機 lg+） -->
      <nav class="hidden w-[360px] items-center gap-4 lg:flex">
        <a
          v-for="link in rightMenu"
          :key="link.href"
          data-nav-item
          :href="link.href"
          class="px-4 py-1 font-mono text-[16px] uppercase leading-none tracking-[0.04em] opacity-0 transition-colors hover:text-[#71c1f0]"
          :class="link.highlight ? 'text-[#71c1f0]' : 'text-[#efe6d2]'"
        >
          {{ link.label }}
        </a>
      </nav>

      <!-- 平板以下：外露項目 + 漢堡鈕 -->
      <div class="flex items-center gap-2 lg:hidden">
        <!-- AGENDA：md 才外露 -->
        <a
          :href="agenda.href"
          data-nav-item
          class="hidden px-3 py-1 font-mono text-[16px] uppercase leading-none tracking-[0.04em] text-[#efe6d2] opacity-0 transition-colors hover:text-[#71c1f0] md:block"
        >
          {{ agenda.label }}
        </a>
        <!-- TICKET：一律外露 -->
        <a
          :href="ticket.href"
          data-nav-item
          class="px-3 py-1 font-mono text-[16px] uppercase leading-none tracking-[0.04em] text-[#71c1f0] opacity-0 transition-colors"
        >
          {{ ticket.label }}
        </a>
        <!-- 漢堡鈕（三槓・白色） -->
        <button
          type="button"
          data-nav-item
          class="flex size-10 shrink-0 flex-col items-center justify-center gap-1.5 opacity-0"
          :aria-expanded="open"
          aria-label="開啟選單"
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
      class="fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 lg:hidden"
      :class="open ? 'opacity-100' : 'pointer-events-none opacity-0'"
      @click="open = false"
    ></div>
    <aside
      class="fixed right-0 top-0 z-50 flex h-dvh w-72 max-w-[80vw] flex-col bg-[#0a0a0b] transition-transform duration-300 ease-out lg:hidden"
      :class="open ? 'translate-x-0' : 'translate-x-full'"
    >
      <button
        type="button"
        class="self-end p-6 text-white"
        aria-label="關閉選單"
        @click="open = false"
      >
        <span class="relative block size-5">
          <span class="absolute left-0 top-1/2 block h-0.5 w-full -translate-y-1/2 rotate-45 bg-current"></span>
          <span class="absolute left-0 top-1/2 block h-0.5 w-full -translate-y-1/2 -rotate-45 bg-current"></span>
        </span>
      </button>
      <ul class="flex flex-col px-6">
        <li v-for="link in dropdownMenu" :key="link.href" :class="link.cls">
          <a
            :href="link.href"
            class="block py-3 font-mono text-[16px] uppercase tracking-[0.04em] text-[#efe6d2] transition-colors hover:text-[#71c1f0]"
          >
            {{ link.label }}
          </a>
        </li>
      </ul>
    </aside>
  </header>
</template>
