<script setup>
const props = defineProps({ data: { type: Object, required: true } })
const { isDesktop, viewportReady } = useViewportMode()
const boardRef = ref(null)
const galleryRef = ref(null)
const activeId = ref(props.data.active_id)
const positions = reactive({})
const draggingId = ref(null)
let gesture = null
let suppressClick = false
let galleryReady = false

const mobilePhotos = computed(() => props.data.mobile_order.map(id => props.data.photos.find(photo => photo.id === id)).filter(Boolean))

function photoStyle(photo, index) {
  const position = positions[photo.id] || photo
  return {
    '--photo-x': `${position.x}%`,
    '--photo-y': `${position.y}%`,
    '--photo-width': `${photo.width / 1440 * 100}%`,
    '--photo-rotation': `${photo.rotation}deg`,
    '--photo-delay': `${-index * 1.7}s`,
  }
}

function selectPhoto(id) {
  if (suppressClick) { suppressClick = false; return }
  activeId.value = id
  if (!isDesktop.value) centerPhoto(id, true)
}

function centerPhoto(id, smooth = false) {
  const gallery = galleryRef.value
  const photo = gallery?.querySelector(`[data-photo-id="${id}"]`)
  if (!photo) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  gallery.scrollTo({ left: photo.offsetLeft - (gallery.clientWidth - photo.offsetWidth) / 2, behavior: smooth && !reduce ? 'smooth' : 'instant' })
}

function onGalleryScroll() {
  if (!galleryReady) return
  const gallery = galleryRef.value
  if (!gallery) return
  const center = gallery.scrollLeft + gallery.clientWidth / 2
  let closest = null
  let distance = Infinity
  for (const photo of gallery.querySelectorAll('[data-photo-id]')) {
    const next = Math.abs(photo.offsetLeft + photo.offsetWidth / 2 - center)
    if (next < distance) { closest = photo.dataset.photoId; distance = next }
  }
  if (closest) activeId.value = closest
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
    const next = Math.max(0, Math.min(photos.length - 1, photos.findIndex(item => item.id === photo.id) + (delta[0] || delta[1]) / 2))
    activeId.value = photos[next].id
    centerPhoto(activeId.value, true)
    galleryRef.value.querySelector(`[data-photo-id="${activeId.value}"]`)?.focus({ preventScroll: true })
  }
}

watch([viewportReady, isDesktop, galleryRef], async () => {
  gesture = null
  draggingId.value = null
  galleryReady = false
  await nextTick()
  if (!isDesktop.value && galleryRef.value) {
    centerPhoto(activeId.value)
    galleryReady = true
  }
}, { immediate: true, flush: 'post' })
</script>

<template>
  <section aria-labelledby="sponsors-gallery-heading" class="photo-wall relative z-10 overflow-hidden bg-bg-mid">
    <div ref="boardRef" class="photo-board relative mx-auto max-w-[1440px]">
      <div class="photo-heading relative z-10 mx-5 flex flex-col gap-4 lg:absolute lg:inset-x-[60px] lg:top-[60px] lg:mx-0">
        <h2 id="sponsors-gallery-heading" class="text-en-h1 italic">
          <span class="block">{{ data.heading_lines[0] }}</span>
          <span class="block">{{ data.heading_lines[1] }}</span>
        </h2>
        <p class="text-zh-h4">{{ data.subtitle }}</p>
      </div>

      <div class="hidden lg:contents" role="group" aria-label="活動照片牆；點選放大，拖曳或以方向鍵移動照片">
        <button
          v-for="(photo, index) in data.photos"
          :key="photo.id"
          type="button"
          class="desktop-photo"
          :class="{ 'is-active': activeId === photo.id, 'is-dragging': draggingId === photo.id }"
          :style="photoStyle(photo, index)"
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
          <span class="photo-print">
            <img :src="photo.src" alt="" width="1000" height="667" loading="lazy" decoding="async" draggable="false">
          </span>
        </button>
      </div>

      <div
        ref="galleryRef"
        class="mobile-gallery relative mt-10 flex gap-2 overflow-x-auto lg:hidden"
        :class="{ 'is-dragging': draggingId }"
        role="group"
        aria-roledescription="輪播"
        aria-label="活動照片；左右滑動或使用方向鍵切換"
        data-lenis-prevent
        @scroll.passive="onGalleryScroll"
      >
        <button
          v-for="photo in mobilePhotos"
          :key="photo.id"
          type="button"
          class="mobile-photo shrink-0"
          :class="{ 'is-active': activeId === photo.id }"
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
          <img :src="photo.src" alt="" width="1000" height="667" loading="lazy" decoding="async" draggable="false">
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.photo-board { padding: 32px 0 120px; }
.photo-heading { pointer-events: none; }
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
  padding: 4px 8px 14px;
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
    transition: width 350ms, transform 350ms;
    touch-action: none;
    cursor: grab;
    z-index: 20;
  }
  .desktop-photo.is-active { width: 34.7222%; z-index: 30; transform: translate(-50%, -50%) rotate(0deg); }
  .desktop-photo.is-dragging { cursor: grabbing; transition: none; }
  .photo-print {
    display: block;
    padding: 8px;
    border: 1px solid rgb(239 230 210 / 35%);
    background: rgb(10 10 12 / 70%);
    animation: photo-breathe 12s ease-in-out var(--photo-delay) infinite alternate;
  }
  .is-dragging .photo-print, .desktop-photo:focus-visible .photo-print { animation-play-state: paused; }
  .photo-heading h2 { max-width: 700px; }
}
@keyframes photo-breathe { from { scale: 0.95; } to { scale: 1.05; } }
@media (prefers-reduced-motion: reduce) {
  .photo-print { animation: none; }
  .desktop-photo, .mobile-photo img, .photo-print img { transition: none; }
}
</style>
