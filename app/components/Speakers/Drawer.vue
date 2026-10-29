<script setup>
// 講者頁的講者抽屜（Figma：SPEAKERS_popup / Profile Page）。
// 桌機由右側滑出、寬 820；窄視窗是 header 底下整片蓋滿。開關都是右進右出。
//
// 開哪一位由頁面的 ?speaker=<id> 決定（設計稿要求每位講者有獨立連結可分享），
// 這個元件只管畫：關閉、切換講者都 emit 出去，由頁面改網址。
//
// 同一場有多位講者（對談）時，上半部的講者資料可以 ← 1/2 → 切換、不用關掉抽屜；
// 下半部的議程是那一場共用的，切換時不動。
//
// 動態（GSAP）：打開時抽屜滑進來、裡面標 data-reveal 的資訊由上往下依序浮現；
// 切換講者時標 data-swap 的那幾塊往切換方向滑出，換成下一位再從另一側滑進來，
// 講者區的高度同時補間到新高度（介紹長短不一，不補間的話下面的議程會跳一下）。
// 頁碼不在 data-swap 裡，切換時留在原地、焦點也不會掉。
const props = defineProps({
  // useSpeakersData 的 items（含 sessions）
  items: { type: Array, default: () => [] },
  // 目前開著的講者 id；空字串 = 關閉
  current: { type: String, default: '' },
})
const emit = defineEmits(['close', 'select'])

const byId = computed(() => new Map(props.items.map(p => [p.id, p])))
const open = computed(() => byId.value.has(props.current))
// 畫面上顯示的講者。切換時要等舊的滑出去才換，所以跟 props.current 分開；
// 關閉時也留著，抽屜滑出去的那段還看得到內容
const shownId = ref(open.value ? props.current : '')
const speaker = computed(() => byId.value.get(shownId.value) || null)

// 議程：講者自己的場次。對談那場的講者名單就是可以切換的那幾位
const sessions = computed(() => speaker.value?.sessions || [])
const peers = computed(() => {
  const panel = sessions.value.find(s => s.speakers.length > 1)
  return panel ? panel.speakers.filter(id => byId.value.has(id)) : []
})
const peerIndex = computed(() => peers.value.indexOf(props.current))
let direction = 1
const go = (step) => {
  const n = peers.value.length
  if (!n) return
  direction = step < 0 ? -1 : 1
  emit('select', peers.value[(peerIndex.value + step + n) % n])
}

const specOf = id => String(props.items.findIndex(p => p.id === id) + 1).padStart(2, '0')

const LINKS = [
  { key: 'facebook', icon: 'facebook', label: 'Facebook' },
  { key: 'threads', icon: 'threads', label: 'Threads' },
  { key: 'linkedin', icon: 'linkedin', label: 'LinkedIn' },
  { key: 'instagram', icon: 'instagram', label: 'Instagram' },
  { key: 'x', icon: 'twitter-x', label: 'X' },
  // 設計稿只有前五個（Figma 匯出的線框 icon）；個人網站是 CSV 的「其他連結」，先借 bootstrap 的 globe，內縮一點跟線框 icon 的重量接近
  { key: 'website', icon: 'globe', label: '個人網站', pad: true },
]
const links = computed(() => LINKS.filter(l => speaker.value?.links?.[l.key]).map(l => ({ ...l, href: speaker.value.links[l.key] })))

// "2026-12-11" → "12/11 (fri.)"（設計稿的寫法）
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
function dateText (date) {
  const [y, m, d] = date.split('-').map(Number)
  return `${m}/${d} (${WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}.)`
}
const slotTime = slot => `${dateText(slot.date)} ${[slot.start, slot.end].filter(Boolean).join('~')}`
const dayText = session => [...new Set(session.slots.map(slot => `Day ${slot.day}`))].join('・')

// 摘要／目標會眾／預期收穫：CSV 來的原文，「•」開頭的行是條列，其他是段落
function blocks (text = '') {
  const out = []
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const bullet = /^[•・\-‧]\s*/.test(line)
    const t = line.replace(/^[•・\-‧]\s*/, '')
    const last = out[out.length - 1]
    if (bullet) last?.type === 'list' ? last.items.push(t) : out.push({ type: 'list', items: [t] })
    else out.push({ type: 'p', text: t })
  }
  return out
}
const SECTIONS = [
  { key: 'abstract', label: '議程介紹' },
  { key: 'audience', label: '目標會眾' },
  { key: 'takeaways', label: '預期收穫' },
]
const sectionsOf = session => SECTIONS.map(s => ({ ...s, blocks: blocks(session[s.key]) })).filter(s => s.blocks.length)

// 分享：手機有系統分享就用，沒有就複製連結
const copied = ref(false)
let copiedTimer = 0
async function share () {
  // 站上的頁面網址結尾都有斜線（/speakers/），router 換 query 時會吃掉它，分享前補回來省一次轉址
  const u = new URL(window.location.href)
  if (!u.pathname.endsWith('/')) u.pathname += '/'
  const url = u.toString()
  if (navigator.share) {
    try { await navigator.share({ title: `${speaker.value.name}｜WebConf Taiwan 2026`, url }) } catch {}
    return
  }
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}

// 開著的時候鎖住背景捲動（同 Header 的選單：lenis 擋滾輪、html overflow 擋觸控），
// 抽屜本身標 data-lenis-prevent 才捲得動。關掉後焦點還給開抽屜的那張卡。
const lenis = useLenis()
const closeRef = ref(null)
const scrollRef = ref(null)
let returnFocus = null
watch(open, async (isOpen) => {
  if (isOpen) {
    returnFocus = document.activeElement
    lenis?.stop()
    document.documentElement.classList.add('overflow-hidden')
    await nextTick()
    closeRef.value?.focus({ preventScroll: true })
  } else {
    lenis?.start()
    document.documentElement.classList.remove('overflow-hidden')
    returnFocus?.focus?.({ preventScroll: true })
    returnFocus = null
  }
}, { immediate: true })
// ----- 動態 -----
const gsap = useNuxtApp().$gsap
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const profileRef = ref(null)

// 打開：抽屜本身的滑入是 CSS transition，這裡只做裡面內容的依序浮現
function onPanelEnter (el) {
  if (!gsap || reduced()) return
  gsap.fromTo(el.querySelectorAll('[data-reveal]'),
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05, delay: 0.18, clearProps: 'opacity,transform' })
}

// 切換：舊的滑出 → 換人 → 新的從另一側滑進來，高度同時補間。
// 連點的話只有最後一次會走完（token 對不上的直接收手）
let swapToken = 0
async function swapTo (id) {
  const box = profileRef.value
  if (!gsap || !box || reduced()) {
    shownId.value = id
    return
  }
  const token = ++swapToken
  const dir = direction
  direction = 1
  const from = box.offsetHeight
  box.style.height = `${from}px`
  box.style.overflow = 'hidden'
  const out = box.querySelectorAll('[data-swap]')
  gsap.killTweensOf(out)
  await gsap.to(out, { opacity: 0, x: -24 * dir, duration: 0.24, ease: 'power2.in', stagger: 0.02 })
  if (token !== swapToken) return

  shownId.value = id
  await nextTick()
  scrollRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
  box.style.height = 'auto'
  const to = box.offsetHeight
  box.style.height = `${from}px`
  gsap.to(box, {
    height: to,
    duration: 0.5,
    ease: 'power3.inOut',
    onComplete: () => {
      if (token !== swapToken) return
      box.style.height = ''
      box.style.overflow = ''
    }
  })
  gsap.fromTo(box.querySelectorAll('[data-swap]'),
    { opacity: 0, x: 32 * dir },
    { opacity: 1, x: 0, duration: 0.65, ease: 'power3.out', stagger: 0.05, clearProps: 'opacity,transform' })
  const img = box.querySelector('[data-swap] img')
  if (img) gsap.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 0.9, ease: 'power3.out', clearProps: 'transform' })
}

// 對談的其他講者照片先載好，切換時照片才不會晚一拍才出現
watch(peers, (ids) => {
  for (const id of ids) {
    const p = byId.value.get(id)
    if (p) new Image().src = p.photo || p.portrait
  }
})

watch(() => props.current, (id, prev) => {
  if (!byId.value.has(id)) return // 關閉：留著目前的內容給滑出動畫用
  if (!byId.value.has(prev) || !shownId.value) {
    shownId.value = id // 從關著打開，不用切換動畫（交給 onPanelEnter）
    return
  }
  if (id !== shownId.value) swapTo(id)
})

const onKeydown = (e) => { if (e.key === 'Escape' && open.value) emit('close') }
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimeout(copiedTimer)
  if (open.value) {
    lenis?.start()
    document.documentElement.classList.remove('overflow-hidden')
  }
})
</script>

<template>
  <Teleport to="body">
    <!-- appear：直接開分享連結進來（一載入就是開著的）也要滑進來 -->
    <Transition
      appear
      enter-active-class="transition-opacity duration-500 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-[400ms] ease-in"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-25 bg-bg-mid/70" aria-hidden="true" @click="emit('close')" />
    </Transition>

    <Transition
      appear
      enter-active-class="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      @enter="onPanelEnter"
      enter-from-class="translate-x-full"
      leave-active-class="transition-transform duration-[400ms] ease-[cubic-bezier(0.64,0,0.78,0)]"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="open && speaker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="speaker-drawer-name"
        class="fixed bottom-0 right-0 top-[52px] z-25 flex w-full flex-col bg-bg-mid lg:top-0 lg:w-[820px] lg:max-w-[calc(100vw-48px)] lg:border-l lg:border-pre-800/35 lg:pt-14"
      >
        <!-- 關閉／分享：桌機壓在抽屜左緣（一半在外）；窄視窗是右上角一排，固定在捲動區上面不跟著捲 -->
        <div class="flex shrink-0 justify-end gap-2 px-5 pb-4 pt-6 lg:absolute lg:left-0 lg:top-[141px] lg:z-1 lg:-translate-x-1/2 lg:flex-col-reverse lg:gap-4 lg:p-0">
          <button
            type="button"
            class="relative flex size-10 items-center justify-center border border-pre-800/35 bg-bg-mid text-pre-800 transition-colors hover:text-accent-1"
            :aria-label="copied ? '已複製連結' : '分享這位講者'"
            @click="share"
          >
            <AtomIcon name="share" class="size-4" />
            <span
              v-if="copied"
              aria-live="polite"
              class="absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap border border-pre-800/35 bg-bg-mid px-2 py-1 text-body-sm text-pre-800 lg:left-full lg:right-auto lg:ml-2 lg:mr-0"
            >已複製連結</span>
          </button>
          <button
            ref="closeRef"
            type="button"
            class="flex size-10 items-center justify-center border border-pre-800/35 bg-bg-mid text-pre-800 transition-colors hover:text-accent-1"
            aria-label="關閉"
            @click="emit('close')"
          >
            <AtomIcon name="close" class="size-5" />
          </button>
        </div>

        <div ref="scrollRef" data-lenis-prevent class="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
          <!-- ===== 講者 ===== -->
          <section ref="profileRef" class="px-5 pb-10 pt-4 lg:px-10 lg:pb-12 lg:pt-12">
            <p data-reveal data-swap class="text-meta text-pre-800">SPEAKER · {{ specOf(speaker.id) }}</p>

            <div class="mt-5 flex flex-col lg:flex-row lg:gap-10">
              <div class="flex shrink-0 justify-between lg:flex-col lg:items-center lg:justify-start">
                <div data-reveal data-swap class="size-[200px] overflow-hidden bg-pre-800/5">
                  <img :src="speaker.photo || speaker.portrait" :alt="speaker.name" width="1000" height="1000" class="block size-full object-cover">
                </div>

                <!-- 對談：切換同一場的講者。桌機在照片下面 ← 1/2 →；窄視窗直排在照片右邊 -->
                <div v-if="peers.length > 1" data-reveal class="flex flex-col items-end justify-between text-pre-800 lg:mt-4 lg:flex-row lg:items-center lg:gap-4">
                  <button type="button" class="hidden p-1 transition-opacity hover:text-accent-1 disabled:opacity-35 lg:block" :disabled="peerIndex === 0" aria-label="上一位講者" @click="go(-1)">
                    <AtomIcon name="arrow-left" class="size-4" />
                  </button>
                  <p class="flex flex-col items-center gap-2 text-en-body-md lg:flex-row lg:gap-0" aria-live="polite">
                    <span>{{ peerIndex + 1 }}</span><span aria-hidden="true">/</span><span>{{ peers.length }}</span>
                    <span class="sr-only">位講者</span>
                  </p>
                  <button type="button" class="p-1 transition-opacity hover:text-accent-1 disabled:opacity-35 lg:hidden" aria-label="下一位講者" @click="go(1)">
                    <AtomIcon name="arrow-right" class="size-4" />
                  </button>
                  <button type="button" class="hidden p-1 transition-opacity hover:text-accent-1 disabled:opacity-35 lg:block" :disabled="peerIndex === peers.length - 1" aria-label="下一位講者" @click="go(1)">
                    <AtomIcon name="arrow-right" class="size-4" />
                  </button>
                </div>
              </div>

              <div class="mt-5 flex min-w-0 flex-1 flex-col lg:mt-0">
                <div class="flex items-start justify-between gap-4">
                  <div data-reveal data-swap class="flex flex-col gap-1">
                    <h2 id="speaker-drawer-name" class="text-zh-h4 text-pre-800 [word-break:keep-all]">
                      <span v-for="(r, k) in nameRuns(speaker.name)" :key="k" :class="r.zh ? '' : 'font-en-serif font-normal italic'">{{ r.t }}</span>
                    </h2>
                    <p v-if="speaker.org || speaker.role" class="flex flex-wrap items-center gap-1 text-body-sm text-pre-800/[62%]">
                      <span v-if="speaker.org">{{ speaker.org }}</span>
                      <span v-if="speaker.org && speaker.role" aria-hidden="true">·</span>
                      <span v-if="speaker.role">{{ speaker.role }}</span>
                    </p>
                  </div>
                  <ul v-if="links.length" data-reveal data-swap class="hidden shrink-0 items-center gap-2 pt-1 lg:flex">
                    <li v-for="link in links" :key="link.key">
                      <a :href="link.href" target="_blank" rel="noopener noreferrer" :aria-label="`${speaker.name} 的 ${link.label}`" class="block text-pre-800 transition-colors hover:text-accent-1">
                        <AtomIcon :name="link.icon" class="size-6" :class="{ 'p-[3px]': link.pad }" />
                      </a>
                    </li>
                  </ul>
                </div>

                <p v-if="speaker.bio" data-reveal data-swap class="mt-6 whitespace-pre-line text-body text-pre-800 lg:mt-8">{{ speaker.bio }}</p>

                <ul v-if="links.length" data-reveal data-swap class="mt-5 flex items-center gap-2 lg:hidden">
                  <li v-for="link in links" :key="link.key">
                    <a :href="link.href" target="_blank" rel="noopener noreferrer" :aria-label="`${speaker.name} 的 ${link.label}`" class="block text-pre-800 transition-colors hover:text-accent-1">
                      <AtomIcon :name="link.icon" class="size-6" :class="{ 'p-[3px]': link.pad }" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- ===== 議程（同一場的講者共用，切換講者時不動） ===== -->
          <section
            v-for="session in sessions"
            :key="session.id"
            class="mx-5 border-t border-pre-800/35 pb-12 pt-6 lg:mx-0 lg:px-12 lg:pt-11"
          >
            <p data-reveal class="text-meta !normal-case text-pre-800">AGENDA<template v-if="session.slots.length"> · {{ dayText(session) }}</template></p>

            <div class="mt-5 lg:mt-8 lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
              <div data-reveal class="flex gap-2 max-lg:order-last max-lg:mt-5 lg:flex-col lg:items-start" :class="{ 'lg:hidden': !session.notes_url && !session.slides_url }">
                <a v-if="session.notes_url" :href="session.notes_url" target="_blank" rel="noopener noreferrer" class="flex h-8 w-[113px] items-center justify-center border border-accent-1 text-zh-btn font-medium text-pre-800 transition-colors hover:bg-accent-1/10">共筆文件</a>
                <a v-if="session.slides_url" :href="session.slides_url" target="_blank" rel="noopener noreferrer" class="flex h-8 w-[113px] items-center justify-center border border-accent-1 text-zh-btn font-medium text-pre-800 transition-colors hover:bg-accent-1/10">投影片</a>
              </div>

              <div data-reveal class="flex flex-col gap-3" :class="{ 'lg:col-span-2': !session.notes_url && !session.slides_url }">
                <h3 class="text-zh-h3 text-pre-800">
                  <span v-for="(r, k) in nameRuns(session.title)" :key="k" :class="r.zh ? '' : 'font-en-serif font-normal italic'">{{ r.t }}</span>
                </h3>
                <p v-for="(slot, k) in session.slots" :key="k" class="flex flex-wrap items-baseline gap-x-2 text-pre-800">
                  <span class="text-en-h5 italic">{{ slotTime(slot) }}</span>
                  <span aria-hidden="true">·</span>
                  <span class="text-zh-h6">{{ slot.room }}</span>
                </p>
                <ul v-if="session.skills?.length" class="flex flex-wrap gap-x-2 gap-y-1 text-meta !normal-case text-pre-800/[62%]">
                  <li v-for="skill in session.skills" :key="skill">#{{ skill }}</li>
                </ul>
              </div>
            </div>

            <div
              v-for="(part, p) in sectionsOf(session)"
              :key="part.key"
              data-reveal
              class="border-t border-dashed border-pre-800/35 pt-7 lg:grid lg:grid-cols-[248px_minmax(0,1fr)]"
              :class="p === 0 ? 'mt-10' : 'mt-8'"
            >
              <h4 class="text-zh-h5 text-pre-800">{{ part.label }}</h4>
              <div class="mt-4 flex flex-col gap-3 text-body text-pre-800/[62%] lg:mt-0">
                <template v-for="(block, b) in part.blocks" :key="b">
                  <ul v-if="block.type === 'list'" class="flex flex-col">
                    <li v-for="(line, l) in block.items" :key="l" class="flex gap-2"><span aria-hidden="true">・</span><span>{{ line }}</span></li>
                  </ul>
                  <p v-else>{{ block.text }}</p>
                </template>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
