<script setup>
// 側邊章節指示器（PL.I ～ PL.VII）。
//
// 原本這串點是「每一區各自畫一份」（SpeakerField 亮第 3 顆、CodeOfConduct 亮第 7 顆），
// 各自 absolute 在自己的區塊裡 —— 捲到別區就跟著捲走，也點不了。
// 改成頁面層級的 fixed 元件之後：
//   · 全程停在畫面左側，隨時看得出現在在第幾卷
//   · 可以點，點了直接捲過去（有 Lenis 就交給它，維持整站一致的緩動）
//
// 亮哪一顆是「最後一個頂邊已經越過視窗 45% 的區塊」。用比視窗中線再高一點的位置
// 判斷，捲到區塊標題露出來時指示器就跟著換，讀起來比等到正中央才換自然。

const props = defineProps({
  // 每一項：{ id: 區塊的 DOM id, code: 'PL. I', label: 'HERO' }
  items: {
    type: Array,
    default: () => ([
      { id: 'hero', code: 'PL. I', label: 'HERO' },
      { id: 'about', code: 'PL. II', label: 'ABOUT' },
      { id: 'speaker', code: 'PL. III', label: 'SPEAKER' },
      { id: 'venue', code: 'PL. IV', label: 'VENUE' },
      { id: 'faq', code: 'PL. V', label: 'FAQ' },
      { id: 'ticket', code: 'PL. VI', label: 'TICKET' },
      { id: 'code-of-conduct', code: 'PL. VII', label: 'CODE OF CONDUCT' },
    ])
  },
  // 捲過去時要空出來的高度（固定 header 的高度）
  offset: {
    type: Number,
    default: 60
  }
})

const active = ref(0)
// ⚠️ 要在 setup 期間取，不能等到 click handler 裡才呼叫 ——
// useLenis 內部是 useNuxtApp()，在事件處理器裡拿不到 Nuxt instance。
const lenis = useLenis()
let raf = 0
let onScroll = null

function update () {
  const mid = window.innerHeight * 0.45
  let idx = 0
  props.items.forEach((item, i) => {
    const el = document.getElementById(item.id)
    if (el && el.getBoundingClientRect().top <= mid) idx = i
  })
  active.value = idx
}

function go (item) {
  const el = document.getElementById(item.id)
  if (!el) return
  // Lenis 接管了捲動，直接 scrollIntoView 會跟它的慣性打架
  if (lenis) lenis.scrollTo(el, { offset: -props.offset })
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - props.offset, behavior: 'smooth' })
}

onMounted(() => {
  // rAF 節流：捲動事件一秒可以來上百次，但實際要算的只是幾個 getBoundingClientRect
  onScroll = () => {
    if (raf) return
    raf = requestAnimationFrame(() => { raf = 0; update() })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  update()
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  if (onScroll) {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  }
})
</script>

<template>
  <!-- ⚠️ z 值只能用 tailwind.config.cjs 裡自訂的那組（-10 / 0..5 / 25 / 50 / 75 / 100）。
       寫 z-30 產不出 CSS、會退回 z-auto —— 那樣就會被 DOM 在後面的區塊蓋掉，點不到。 -->
  <nav
    aria-label="章節導覽"
    class="fixed left-[60px] top-1/2 z-25 hidden -translate-y-1/2 flex-col items-center lg:flex"
  >
    <span aria-hidden="true" class="h-2.5 w-px bg-pre-800/35" />
    <template v-for="(item, i) in items" :key="item.id">
      <!-- -my-2 py-2 / -mx-3 px-3：點擊範圍撐到 20×26，但版面間距與原本的純裝飾版一致 -->
      <button
        type="button"
        class="group relative -mx-3 -my-2 flex px-3 py-2"
        :aria-label="`${item.code} ${item.label}`"
        :aria-current="active === i ? 'true' : undefined"
        @click="go(item)"
      >
        <span
          class="size-1 shrink-0 rounded-full transition-colors"
          :class="active === i ? 'bg-accent-1' : 'border border-pre-800/35 group-hover:border-accent-1'"
        />
        <!-- 卷號只在 hover / focus 時浮出來，平常維持設計稿上那串乾淨的點 -->
        <span
          class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 whitespace-nowrap pl-2 font-mono text-[10px] uppercase tracking-[0.2em] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          :class="active === i ? 'text-accent-1' : 'text-pre-800/70'"
        >
          {{ item.code }}
        </span>
      </button>
      <span v-if="i < items.length - 1" aria-hidden="true" class="h-6 w-px bg-pre-800/35" />
    </template>
    <span aria-hidden="true" class="h-2.5 w-px bg-pre-800/35" />
  </nav>
</template>
