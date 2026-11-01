<script setup>
// 場域頁第三區「Find your way around.」場館平面圖。
//
// 桌機：上排 tab 切換、下面一格輪播（自己會換下一張；滑鼠移上去、焦點在裡面、
//       點過 tab、捲出畫面或減少動態時都不換）。
// 窄視窗：每棟一張卡片直排，點卡片開燈箱看大圖，燈箱底下一排縮圖可以切換（設計稿「放大圖片」）。
//
// 背景：桌機有 WebGPU 時是側欄菌落散回來的自由場（CommonPlatePage 的 after 區，
// AgendaParticleField 的 outroMix）；沒有 WebGPU 放首頁那支自由場影片，窄視窗放影片的定格圖。
const props = defineProps({
  data: { type: Object, required: true },
  desktopMode: { type: String, default: 'pending' },
})

const maps = computed(() => props.data.maps || [])
const { isDesktop, viewportReady } = useViewportMode()

const sectionRef = ref(null)
useFadeIn(sectionRef, { step: 0.1 })

// 「B 棟」這種：建築代號後面接一個「棟」（HQ 不是建築，不接）
const titleOf = map => `${map.code}${map.building ? ' 棟' : ''}`

// ─── 桌機：tab ＋ 輪播 ─────────────────────────────────────────────────────
const AUTOPLAY_MS = 6000
const current = ref(0)
const tabRefs = ref([])
const carouselRef = ref(null)
const hovering = ref(false)
const focusInside = ref(false)
const inView = ref(false)
const reducedMotion = ref(false)
// 使用者點過 tab 就交給他自己切，不再自動換；暫停鈕也是同一個開關
const autoplayStopped = ref(false)
let timer = 0
let observer = null
let motionQuery = null

const autoplaying = computed(() => isDesktop.value && inView.value && !hovering.value && !focusInside.value && !reducedMotion.value && !autoplayStopped.value && maps.value.length > 1)

function select (index, { focus = false, user = true } = {}) {
  const count = maps.value.length
  current.value = (index + count) % count
  if (user) autoplayStopped.value = true
  if (focus) nextTick(() => tabRefs.value[current.value]?.focus())
}

// tablist 的方向鍵：左右換、Home/End 到頭尾（WAI-ARIA tabs 的自動啟用模式）
function onTabKey (e) {
  const keys = { ArrowRight: current.value + 1, ArrowLeft: current.value - 1, Home: 0, End: maps.value.length - 1 }
  if (!(e.key in keys)) return
  e.preventDefault()
  select(keys[e.key], { focus: true })
}

watch(autoplaying, (on) => {
  clearInterval(timer)
  timer = on ? window.setInterval(() => select(current.value + 1, { user: false }), AUTOPLAY_MS) : 0
})

// 拖曳／滑動換張：拖的時候輪播跟著手走，放開時超過門檻（寬度 15% 或甩得夠快）就換下一張，
// 不然彈回原位。滑鼠、觸控、筆都走 pointer events。頭尾會繞回去（同自動輪播）。
const dragX = ref(0)
const dragging = ref(false)
let drag = null

function onDragStart (e) {
  if (e.button !== 0 || maps.value.length < 2) return
  drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), width: e.currentTarget.clientWidth, locked: false }
}
function onDragMove (e) {
  if (!drag || e.pointerId !== drag.id) return
  const dx = e.clientX - drag.x
  const dy = e.clientY - drag.y
  if (!drag.locked) {
    // 先動了 8px 才判斷方向：直的就放給頁面捲動
    if (Math.hypot(dx, dy) < 8) return
    if (Math.abs(dy) > Math.abs(dx)) { drag = null; return }
    drag.locked = true
    dragging.value = true
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  dragX.value = dx
}
function onDragEnd (e) {
  if (!drag || e.pointerId !== drag.id) return
  const { width, t, locked } = drag
  drag = null
  if (!locked) return
  const dx = dragX.value
  const speed = Math.abs(dx) / Math.max(1, performance.now() - t)
  if (Math.abs(dx) > width * 0.15 || (Math.abs(dx) > 30 && speed > 0.5)) select(current.value + (dx < 0 ? 1 : -1))
  dragging.value = false
  dragX.value = 0
}

// 觸控板左右滑：只吃橫向為主的滾輪，累積超過 60px 換一張，換完冷卻 700ms（一次甩動只換一張）
let wheelSum = 0
let wheelLock = 0
function onWheel (e) {
  if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
  e.preventDefault()
  if (performance.now() < wheelLock) return
  wheelSum += e.deltaX
  if (Math.abs(wheelSum) < 60) return
  select(current.value + (wheelSum > 0 ? 1 : -1))
  wheelSum = 0
  wheelLock = performance.now() + 700
}

function onFocusOut (e) {
  if (!carouselRef.value?.contains(e.relatedTarget)) focusInside.value = false
}

function motionChanged () { reducedMotion.value = motionQuery.matches }

// ─── 窄視窗：燈箱 ─────────────────────────────────────────────────────────
// 開著的時候鎖住背景捲動（同講者抽屜：lenis 擋滾輪、html overflow 擋觸控），
// 關掉後焦點還給開燈箱的那張卡。
const lightbox = ref(-1)
const closeRef = ref(null)
const dialogRef = ref(null)
const thumbsRef = ref(null)
const lenis = useLenis()
let returnFocus = null

function openLightbox (index, e) {
  returnFocus = e?.currentTarget || document.activeElement
  lightbox.value = index
}
function closeLightbox () { lightbox.value = -1 }

watch(lightbox, async (index, prev) => {
  const open = index >= 0
  if (open === prev >= 0) {
    // 燈箱裡切換：把選中的縮圖捲進畫面
    await nextTick()
    thumbsRef.value?.children[index]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reducedMotion.value ? 'auto' : 'smooth' })
    return
  }
  if (open) {
    lenis?.stop()
    document.documentElement.classList.add('overflow-hidden')
    await nextTick()
    closeRef.value?.focus({ preventScroll: true })
    thumbsRef.value?.children[index]?.scrollIntoView({ block: 'nearest', inline: 'center' })
  } else {
    lenis?.start()
    document.documentElement.classList.remove('overflow-hidden')
    returnFocus?.focus?.({ preventScroll: true })
    returnFocus = null
  }
})

// 跨到桌機就收掉（燈箱只有窄視窗用）
watch(isDesktop, (desktop) => { if (desktop) closeLightbox() })

function onDialogKey (e) {
  if (e.key === 'Escape') { closeLightbox(); return }
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const count = maps.value.length
    lightbox.value = (lightbox.value + (e.key === 'ArrowRight' ? 1 : -1) + count) % count
    return
  }
  // 焦點留在燈箱裡
  if (e.key !== 'Tab') return
  const focusables = dialogRef.value?.querySelectorAll('button')
  if (!focusables?.length) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}

onMounted(() => {
  motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
  motionChanged()
  motionQuery.addEventListener('change', motionChanged)
  observer = new IntersectionObserver(([entry]) => { inView.value = entry.isIntersecting }, { threshold: 0.4 })
  if (carouselRef.value) observer.observe(carouselRef.value)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  observer?.disconnect()
  motionQuery?.removeEventListener('change', motionChanged)
  if (lightbox.value >= 0) {
    lenis?.start()
    document.documentElement.classList.remove('overflow-hidden')
  }
})
</script>

<template>
  <section ref="sectionRef" aria-labelledby="venue-floor-heading" class="venue-floor relative overflow-hidden">
    <!-- 背景：沒有即時粒子時的替身（見檔頭） -->
    <ClientOnly>
      <HomeVideoField v-if="viewportReady && isDesktop && desktopMode === 'fallback'" />
      <img
        v-if="viewportReady && !isDesktop"
        :src="assetUrl('/videos/hero-field-biolum-poster.jpg')" alt="" aria-hidden="true" loading="lazy" decoding="async"
        class="venue-floor-poster pointer-events-none absolute inset-0 size-full object-cover"
      >
    </ClientOnly>

    <div class="relative mx-auto max-w-[1440px] pb-[120px] pt-0 lg:px-[60px]">
      <div class="relative border-t border-pre-800/35 pt-6 max-lg:mx-5 lg:pt-10">
        <CommonPlate
          data-fade="in"
          :data="data.plate"
          :divider="false"
          class="!flex-row !items-baseline !gap-x-4 !py-0 lg:absolute lg:left-0 lg:top-10 lg:!flex-col lg:!gap-x-0"
        />

        <div class="mt-10 flex flex-col items-center gap-2 text-center lg:mt-0 lg:gap-4">
          <h2 id="venue-floor-heading" data-fade="in" class="text-en-h1 italic text-pre-800 [text-shadow:0_0_12px_#0a0a0c]">{{ data.heading }}</h2>
          <p data-fade="in" class="text-zh-h4 text-pre-800 [text-shadow:0_0_12px_#0a0a0c]">{{ data.subtitle }}</p>
        </div>
      </div>

      <!-- ─── 桌機：tab ＋ 輪播 ─── -->
      <div
        ref="carouselRef"
        data-fade="in"
        class="mx-auto mt-12 hidden max-w-[1096px] border border-pre-800/35 bg-bg-mid lg:block"
        role="region"
        aria-roledescription="輪播"
        aria-label="場館平面圖"
        @mouseenter="hovering = true"
        @mouseleave="hovering = false"
        @focusin="focusInside = true"
        @focusout="onFocusOut"
      >
        <div class="relative border-b border-pre-800/35">
          <div role="tablist" aria-label="選擇場館" class="flex flex-wrap items-center justify-center px-6 py-[14px]" @keydown="onTabKey">
            <template v-for="(map, i) in maps" :key="map.id">
              <span v-if="i > 0" aria-hidden="true" class="px-3 text-accent-1">·</span>
              <button
                :id="`venue-map-tab-${map.id}`"
                :ref="el => { tabRefs[i] = el }"
                type="button"
                role="tab"
                :aria-selected="current === i"
                :aria-controls="`venue-map-panel-${map.id}`"
                :tabindex="current === i ? 0 : -1"
                class="whitespace-nowrap py-1 text-zh-body-md transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-1"
                :class="current === i ? 'text-accent-1' : 'text-pre-800 hover:text-accent-1'"
                @click="select(i)"
              >
                {{ map.code }} {{ map.label }}
              </button>
            </template>
          </div>
          <!-- 暫停鈕平常藏著，用鍵盤 Tab 到時才出現（同贊助頁照片牆） -->
          <button
            v-if="!reducedMotion && !autoplayStopped"
            type="button"
            class="sr-only focus:not-sr-only focus:absolute focus:right-2 focus:top-1/2 focus:-translate-y-1/2 focus:bg-bg-mid focus:p-2 focus:text-zh-body-md focus:text-pre-800 focus:outline focus:outline-1 focus:outline-accent-1"
            @click="autoplayStopped = true"
          >
            停止自動輪播
          </button>
        </div>

        <div
          class="venue-map-viewport relative touch-pan-y select-none overflow-hidden"
          :class="dragging ? 'cursor-grabbing' : 'cursor-grab'"
          @pointerdown="onDragStart"
          @pointermove="onDragMove"
          @pointerup="onDragEnd"
          @pointercancel="onDragEnd"
          @lostpointercapture="onDragEnd"
          @dragstart.prevent
          @wheel="onWheel"
        >
          <div
            class="venue-map-track flex"
            :class="{ 'is-dragging': dragging }"
            :style="{ transform: `translateX(calc(-${current * 100}% + ${dragX}px))` }"
          >
            <div
              v-for="(map, i) in maps"
              :id="`venue-map-panel-${map.id}`"
              :key="map.id"
              role="tabpanel"
              :aria-labelledby="`venue-map-tab-${map.id}`"
              :aria-hidden="current !== i"
              :inert="current !== i"
              class="relative w-full shrink-0"
            >
              <picture>
                <source v-if="map.fallback" :srcset="assetUrl(map.src)" type="image/webp">
                <img
                  :src="assetUrl(map.fallback || map.src)" :alt="map.alt" width="1180" height="550"
                  :loading="i === 0 ? 'eager' : 'lazy'" decoding="async" draggable="false"
                  class="block h-auto w-full select-none"
                >
              </picture>
              <p v-if="map.pending" class="absolute right-6 top-5 text-zh-body-md text-pre-800/[62%]">配置尚未定案，敬請期待</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── 窄視窗：卡片清單 ─── -->
      <ul class="mx-5 mt-6 flex flex-col border border-pre-800/35 bg-bg-mid lg:hidden">
        <li v-for="(map, i) in maps" :key="map.id" data-fade="in" :class="{ 'border-t border-pre-800/35': i > 0 }">
          <button
            type="button"
            class="block w-full text-left focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-2 focus-visible:outline-accent-1"
            :aria-label="`放大 ${map.code} ${map.label}平面圖`"
            @click="openLightbox(i, $event)"
          >
            <span class="flex items-center justify-between border-b border-pre-800/35 px-5 py-3">
              <span class="text-zh-body-md font-medium text-pre-800">{{ map.code }} {{ map.label }}</span>
              <AtomIcon name="zoom-in" class="size-5 text-pre-800" />
            </span>
            <picture>
              <source v-if="map.fallback" :srcset="assetUrl(map.src)" type="image/webp">
              <img
                :src="assetUrl(map.fallback || map.src)" :alt="map.alt" width="1180" height="550"
                loading="lazy" decoding="async" draggable="false"
                class="block h-auto w-full select-none"
              >
            </picture>
          </button>
        </li>
      </ul>
    </div>

    <!-- ─── 窄視窗：燈箱（設計稿「放大圖片」） ─── -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300 ease-out motion-reduce:transition-none"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200 ease-in motion-reduce:transition-none"
        leave-to-class="opacity-0"
      >
        <div
          v-if="lightbox >= 0 && maps[lightbox]"
          ref="dialogRef"
          role="dialog"
          aria-modal="true"
          aria-labelledby="venue-lightbox-title"
          data-lenis-prevent
          class="fixed inset-x-0 bottom-0 top-[52px] z-25 flex flex-col overflow-y-auto overscroll-contain bg-[rgba(10,10,12,0.85)] px-5 pb-10 pt-6 backdrop-blur-[12px] lg:hidden"
          @keydown="onDialogKey"
          @click.self="closeLightbox"
        >
          <div class="flex items-start justify-between gap-4">
            <h2 id="venue-lightbox-title" class="flex flex-col gap-1 pt-12 text-pre-800">
              <span class="font-en-serif text-[40px] font-normal italic leading-[1.2] tracking-[0.02em]">
                {{ maps[lightbox].code }}<span v-if="maps[lightbox].building" class="ml-2 font-zh-serif text-[22px] not-italic">棟</span>
              </span>
              <span class="font-zh-serif text-[22px] font-medium leading-[1.2]">{{ maps[lightbox].label }}</span>
            </h2>
            <button
              ref="closeRef"
              type="button"
              class="flex size-10 shrink-0 items-center justify-center border border-pre-800/35 bg-bg-mid text-pre-800 transition-colors hover:text-accent-1"
              aria-label="關閉"
              @click="closeLightbox"
            >
              <AtomIcon name="close" class="size-5" />
            </button>
          </div>

          <div class="relative mt-6 bg-pre-800/[4%]">
            <picture>
              <source v-if="maps[lightbox].fallback" :srcset="assetUrl(maps[lightbox].src)" type="image/webp">
              <img
                :src="assetUrl(maps[lightbox].fallback || maps[lightbox].src)" :alt="maps[lightbox].alt" width="1180" height="550"
                decoding="async" draggable="false" class="block h-auto w-full select-none"
              >
            </picture>
          </div>

          <div ref="thumbsRef" class="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]" role="group" aria-label="切換場館">
            <button
              v-for="(map, i) in maps"
              :key="map.id"
              type="button"
              class="w-[86px] shrink-0 border p-0.5 transition-colors"
              :class="i === lightbox ? 'border-pre-800' : 'border-pre-800/35 opacity-70'"
              :aria-label="`${titleOf(map)} ${map.label}`"
              :aria-current="i === lightbox ? 'true' : undefined"
              @click="lightbox = i"
            >
              <img :src="assetUrl(map.fallback || map.src)" alt="" width="1180" height="550" loading="lazy" decoding="async" class="block h-auto w-full">
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.venue-map-track { transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1); }
.venue-map-track.is-dragging { transition: none; }
@media (prefers-reduced-motion: reduce) {
  .venue-map-track { transition: none; }
}
/* 窄視窗的定格圖只當底紋：壓暗、上下淡出，不搶平面圖的線條 */
.venue-floor-poster {
  opacity: 0.55;
  mask-image: linear-gradient(to bottom, transparent, #000 160px, #000 calc(100% - 160px), transparent);
}
</style>
