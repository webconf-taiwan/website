<script setup>
const props = defineProps({ data: { type: Object, required: true } })
const { isDesktop, viewportReady } = useViewportMode()
const wallRef = ref(null)
const boardRef = ref(null)
const galleryRef = ref(null)
const activeId = ref(props.data.active_id)
const positions = reactive({})
const draggingId = ref(null)
let gesture = null
let suppressClick = false
let galleryReady = false
let galleryIndex = 0
let settleTimer = 0
let autoplayTimer = 0
let galleryObserver = null
let motionQuery = null
const galleryVisible = ref(false)
const reducedMotion = ref(false)
const autoplayPaused = ref(false)
const interacting = ref(false)
const focusInside = ref(false)

const mobilePhotos = computed(() => props.data.mobile_order.map(id => props.data.photos.find(photo => photo.id === id)).filter(Boolean))
// Keep a copy on either side so the last → first transition always moves forward.
const slides = computed(() => [0, 1, 2].flatMap(copy => mobilePhotos.value.map(photo => ({ photo, copy }))))
useFadeIn(wallRef, { y: 20, duration: 0.8 })

function photoStyle(photo) {
  const position = positions[photo.id] || photo
  return {
    '--photo-x': `${position.x}%`,
    '--photo-y': `${position.y}%`,
    '--photo-width': `${photo.width / 1440 * 100}%`,
    '--photo-rotation': `${photo.rotation}deg`,
  }
}

function selectPhoto(id, index) {
  if (suppressClick) { suppressClick = false; return }
  activeId.value = id
  if (!isDesktop.value) scrollToSlide(index ?? mobilePhotos.value.length + mobilePhotos.value.findIndex(photo => photo.id === id), true)
}

function centerPhoto(id, smooth = false) {
  scrollToSlide(mobilePhotos.value.length + Math.max(0, mobilePhotos.value.findIndex(photo => photo.id === id)), smooth)
}

function scrollToSlide(index, smooth = false) {
  const gallery = galleryRef.value
  const photo = gallery?.children[index]
  if (!photo) return
  galleryIndex = index
  activeId.value = slides.value[index].photo.id
  gallery.scrollTo({ left: photo.offsetLeft - (gallery.clientWidth - photo.offsetWidth) / 2, behavior: smooth && !reducedMotion.value ? 'smooth' : 'instant' })
}

function onGalleryScroll() {
  if (!galleryReady) return
  const gallery = galleryRef.value
  if (!gallery) return
  const center = gallery.scrollLeft + gallery.clientWidth / 2
  let closest = 0
  let distance = Infinity
  for (const [index, photo] of [...gallery.children].entries()) {
    const next = Math.abs(photo.offsetLeft + photo.offsetWidth / 2 - center)
    if (next < distance) { closest = index; distance = next }
  }
  galleryIndex = closest
  activeId.value = slides.value[closest].photo.id
  clearTimeout(settleTimer)
  settleTimer = window.setTimeout(() => {
    if (gesture) return
    const count = mobilePhotos.value.length
    if (galleryIndex < count || galleryIndex >= count * 2) scrollToSlide(count + galleryIndex % count)
  }, 180)
}

function stopAutoplay() { clearInterval(autoplayTimer); autoplayTimer = 0 }
function syncAutoplay() {
  stopAutoplay()
  if (!galleryReady || isDesktop.value || !galleryVisible.value || reducedMotion.value || autoplayPaused.value || interacting.value || focusInside.value || document.hidden || mobilePhotos.value.length < 2) return
  autoplayTimer = window.setInterval(() => scrollToSlide(galleryIndex + 1, true), 4500)
}
function onMotionChange() { reducedMotion.value = motionQuery.matches }
function onGalleryFocusOut(event) {
  if (!galleryRef.value?.contains(event.relatedTarget)) focusInside.value = false
}

function startDrag(event, photo) {
  if (event.button !== 0 || (!isDesktop.value && event.pointerType !== 'mouse')) return
  suppressClick = false
  const board = boardRef.value.getBoundingClientRect()
  const position = positions[photo.id] || photo
  gesture = {
    id: photo.id, pointerId: event.pointerId, x: event.clientX, y: event.clientY,
    startX: position.x, startY: position.y, width: board.width, height: board.height,
    scrollLeft: galleryRef.value?.scrollLeft || 0, desktop: isDesktop.value, moved: false,
  }
  if (isDesktop.value) activeId.value = photo.id
  event.currentTarget.setPointerCapture(event.pointerId)
}

function moveDrag(event) {
  if (!gesture || event.pointerId !== gesture.pointerId) return
  const dx = event.clientX - gesture.x
  const dy = event.clientY - gesture.y
  if (Math.hypot(dx, dy) < 4 && !gesture.moved) return
  gesture.moved = true
  draggingId.value = gesture.id
  if (gesture.desktop) {
    // Keep the enlarged photo within the board, even after selecting an edge photo.
    positions[gesture.id] = {
      x: Math.max(18, Math.min(82, gesture.startX + dx / gesture.width * 100)),
      y: Math.max(25, Math.min(75, gesture.startY + dy / gesture.height * 100)),
    }
  } else {
    galleryRef.value.scrollLeft = gesture.scrollLeft - dx
  }
}

function endDrag(event) {
  if (!gesture || event.pointerId !== gesture.pointerId) return
  suppressClick = gesture.moved
  gesture = null
  draggingId.value = null
  if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
}

function onPhotoKey(event, photo) {
  const delta = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[event.key]
  if (!delta) return
  event.preventDefault()
  if (isDesktop.value) {
    activeId.value = photo.id
    const current = positions[photo.id] || photo
    positions[photo.id] = { x: Math.max(18, Math.min(82, current.x + delta[0])), y: Math.max(25, Math.min(75, current.y + delta[1])) }
  } else {
    const photos = mobilePhotos.value
    const next = (photos.findIndex(item => item.id === photo.id) + (delta[0] || delta[1]) / 2 + photos.length) % photos.length
    activeId.value = photos[next].id
    centerPhoto(activeId.value, true)
    galleryRef.value.children[photos.length + next]?.focus({ preventScroll: true })
  }
}

watch([viewportReady, isDesktop, galleryRef], async () => {
  gesture = null
  draggingId.value = null
  galleryReady = false
  stopAutoplay()
  await nextTick()
  if (!isDesktop.value && galleryRef.value) {
    centerPhoto(activeId.value)
    galleryReady = true
  }
  syncAutoplay()
}, { immediate: true, flush: 'post' })

watch([galleryVisible, reducedMotion, autoplayPaused, interacting, focusInside], syncAutoplay)
onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  onMotionChange()
  motionQuery.addEventListener('change', onMotionChange)
  galleryObserver = new IntersectionObserver(([entry]) => { galleryVisible.value = entry.isIntersecting }, { threshold: 0.4 })
  galleryObserver.observe(galleryRef.value)
  document.addEventListener('visibilitychange', syncAutoplay)
})
onBeforeUnmount(() => {
  stopAutoplay()
  clearTimeout(settleTimer)
  galleryObserver?.disconnect()
  motionQuery?.removeEventListener('change', onMotionChange)
  document.removeEventListener('visibilitychange', syncAutoplay)
})
</script>

<template>
  <section ref="wallRef" data-plate-gallery aria-labelledby="sponsors-gallery-heading" class="photo-wall relative z-10 overflow-hidden">
    <!-- 分開觸發標題與照片，避免手機捲到輪播前就播完整區動畫；board 保持固定，供粒子與拖曳量測。 -->
    <div ref="boardRef" class="photo-board relative mx-auto max-w-[1440px]">
      <div aria-hidden="true" class="mobile-gallery-art lg:hidden">
        <img :src="assetUrl('/figma/sponsors/mobile-orbit.png')" alt="" loading="lazy" decoding="async">
      </div>
      <div class="photo-heading relative z-10 mx-5 flex flex-col gap-4 lg:absolute lg:inset-x-[60px] lg:top-[60px] lg:mx-0">
        <h2 id="sponsors-gallery-heading" data-fade="in" class="text-en-h1 italic">
          <span class="block">{{ data.heading_lines[0] }}</span>
          <span class="block">{{ data.heading_lines[1] }}</span>
        </h2>
        <p data-fade="in" class="text-zh-h4">{{ data.subtitle }}</p>
      </div>

      <div class="hidden lg:contents" role="group" aria-label="活動照片牆；點選放大，拖曳或以方向鍵移動照片">
        <button
          v-for="photo in data.photos"
          :key="photo.id"
          type="button"
          class="desktop-photo"
          :class="{ 'is-active': activeId === photo.id, 'is-dragging': draggingId === photo.id }"
          :style="photoStyle(photo)"
          :aria-pressed="activeId === photo.id"
          :aria-label="photo.alt"
          :data-photo-id="photo.id"
          @click="selectPhoto(photo.id)"
          @pointerdown="startDrag($event, photo)"
          @pointermove="moveDrag"
          @pointerup="endDrag"
          @pointercancel="endDrag"
          @lostpointercapture="endDrag"
          @keydown="onPhotoKey($event, photo)"
        >
          <!-- 進場只移動內層，保留按鈕原本的旋轉、放大與拖曳座標。 -->
          <span data-fade="in" class="photo-print">
            <img :src="photo.src" alt="" width="1000" height="667" loading="lazy" decoding="async" draggable="false">
          </span>
        </button>
      </div>

      <div
        ref="galleryRef"
        data-fade="in"
        class="mobile-gallery relative mt-10 flex gap-2 overflow-x-auto lg:hidden"
        :class="{ 'is-dragging': draggingId }"
        role="group"
        aria-roledescription="輪播"
        aria-label="活動照片；左右滑動或使用方向鍵切換"
        data-lenis-prevent
        @scroll.passive="onGalleryScroll"
        @pointerdown="interacting = true"
        @pointerup="interacting = false"
        @pointercancel="interacting = false"
        @focusin="focusInside = true"
        @focusout="onGalleryFocusOut"
      >
        <button
          v-for="({ photo, copy }, index) in slides"
          :key="`${copy}-${photo.id}`"
          type="button"
          class="mobile-photo shrink-0"
          :class="{ 'is-active': activeId === photo.id }"
          :aria-pressed="activeId === photo.id"
          :aria-label="photo.alt"
          :aria-hidden="copy !== 1 ? 'true' : undefined"
          :tabindex="copy === 1 ? 0 : -1"
          :data-photo-id="photo.id"
          @click="selectPhoto(photo.id, index)"
          @pointerdown="startDrag($event, photo)"
          @pointermove="moveDrag"
          @pointerup="endDrag"
          @pointercancel="endDrag"
          @lostpointercapture="endDrag"
          @keydown="onPhotoKey($event, photo)"
        >
          <img :src="photo.src" alt="" width="1000" height="667" loading="lazy" decoding="async" draggable="false">
        </button>
      </div>
      <button v-if="!reducedMotion" type="button" class="gallery-toggle sr-only focus:not-sr-only focus:absolute focus:bottom-[76px] focus:right-5 focus:z-20 focus:bg-bg-mid focus:p-3 focus:outline focus:outline-accent-1 lg:hidden" :aria-label="autoplayPaused ? '播放輪播' : '暫停輪播'" :aria-pressed="autoplayPaused" @click="autoplayPaused = !autoplayPaused">
        <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="currentColor">
          <path v-if="autoplayPaused" d="M8 5v14l11-7z" />
          <path v-else d="M6 5h4v14H6zM14 5h4v14h-4z" />
        </svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.photo-board { padding: 32px 0 120px; }
.photo-heading { pointer-events: none; }
.mobile-gallery-art {
  position: absolute;
  top: 220px;
  left: 50%;
  width: 360px;
  height: 440px;
  overflow: hidden;
  transform: translateX(-50%);
  pointer-events: none;
  mix-blend-mode: lighten;
}
.mobile-gallery-art img {
  position: absolute;
  top: -0.06%;
  left: -36.67%;
  width: 173.33%;
  max-width: none;
  height: 100.13%;
}
.mobile-gallery {
  --card-width: min(300px, calc(100vw - 60px));
  padding-inline: calc((100% - var(--card-width)) / 2);
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
}
.mobile-gallery::-webkit-scrollbar { display: none; }
.mobile-photo {
  width: var(--card-width);
  padding: 4px;
  border: 1px solid rgb(239 230 210 / 35%);
  background: rgb(10 10 12 / 70%);
  scroll-snap-align: center;
  cursor: grab;
}
.mobile-gallery.is-dragging { scroll-snap-type: none; }
.mobile-gallery.is-dragging .mobile-photo { cursor: grabbing; }
.mobile-photo img, .photo-print img {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 2;
  height: auto;
  object-fit: cover;
  pointer-events: none;
  filter: grayscale(1);
  transition: filter 350ms;
}
.is-active img { filter: grayscale(0); }
.desktop-photo:focus-visible, .mobile-photo:focus-visible {
  outline: 2px solid theme('colors.accent.1');
  outline-offset: 4px;
}
@media (min-width: 1024px) {
  .photo-board { height: clamp(640px, 50vw, 720px); padding: 0; }
  .desktop-photo {
    position: absolute;
    left: var(--photo-x);
    top: var(--photo-y);
    width: var(--photo-width);
    transform: translate(-50%, -50%) rotate(var(--photo-rotation));
    transition: transform 350ms;
    touch-action: none;
    cursor: grab;
    z-index: 20;
  }
  .desktop-photo.is-active { z-index: 30; transform: translate(-50%, -50%) rotate(0deg) scale(1.05); }
  .desktop-photo.is-dragging { cursor: grabbing; transition: none; }
  .photo-print {
    display: block;
    padding: 8px;
    border: 1px solid rgb(239 230 210 / 35%);
    background: rgb(10 10 12 / 70%);
    scale: 1;
    transition: scale 350ms;
  }
  .desktop-photo:not(.is-active):hover .photo-print { animation: photo-breathe 2.4s ease-in-out infinite; }
  .desktop-photo.is-dragging .photo-print { animation: none; }
  .photo-heading h2 { max-width: 700px; }
}
@keyframes photo-breathe { 0%, 100% { scale: 1; } 25% { scale: 1.05; } 75% { scale: 0.95; } }
@media (prefers-reduced-motion: reduce) {
  .desktop-photo:not(.is-active):hover .photo-print { animation: none; }
  .desktop-photo, .photo-print, .mobile-photo img, .photo-print img { transition: none; }
}
</style>
