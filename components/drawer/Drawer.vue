<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

const { isHamburgerActive } = defineProps<{
  isHamburgerActive?: boolean
}>()
const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')

const { isDrawerActive, openDrawer, closeDrawer } = useDrawerState()

const isActive = computed(() => isDrawerActive())

function open() {
  openDrawer()
}

function close() {
  closeDrawer()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isActive.value) {
    close()
  }
}

function handlePageScroll() {
  const windowRightOffset = window.innerWidth - document.documentElement.clientWidth

  if (isActive.value) {
    document.body.style.paddingRight = `${windowRightOffset}px`
    document.body.style.overflow = 'hidden'
  }
}

function restoreScroll() {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}

watch(isActive, (newValue) => {
  if (newValue) {
    handlePageScroll()
  }
})

useEventListener(window, 'keydown', handleKeydown)

onMounted(() => {
  handlePageScroll()
})

onUnmounted(() => {
  restoreScroll()
})

defineExpose({
  open,
  close,
})

// 判斷 Overlay 方向
const overlayDirection = computed(() => {
  if (isSmallerLg.value && isHamburgerActive) {
    return 'bg-gradient-to-t to-primary-green/80 to-60%'
  }
  if (isSmallerLg.value) {
    return 'bg-gradient-to-b to-primary-green/80 to-60%'
  }
  return 'bg-gradient-to-r to-primary-green/90'
})

// 判斷 Overlay 動畫方向
const overlayTransition = computed(() => {
  if (isSmallerLg.value && isHamburgerActive) {
    return 'fade-bottom'
  }
  return 'fade'
})
// 判斷 Drawer 開啟方向
const drawerDirection = computed(() => {
  if (isSmallerLg.value && isHamburgerActive) {
    return 'slide-down'
  }
  if (isSmallerLg.value) {
    return 'slide-up'
  }
  return 'slide-left'
})

// 判斷 Drawer Content 各斷點樣式
const drawerContentDirection = computed(() => {
  if (isSmallerLg.value && isHamburgerActive) {
    return 'inset-x-0 top-0 max-h-[85dvh] min-h-[30dvh]'
  }
  if (isSmallerLg.value) {
    return 'inset-x-0 bottom-0 max-h-[85dvh] min-h-[30dvh]'
  }
  return 'inset-y-0 right-0 w-80'
})
</script>

<template>
  <!-- Overlay -->
  <Transition :name="overlayTransition">
    <div
      v-if="isActive"
      class="fixed inset-0 z-40 from-primary-green/0"
      :class="overlayDirection"
    ></div>
  </Transition>

  <!-- Drawer -->
  <Transition
    :name="drawerDirection"
    @after-leave="restoreScroll"
  >
    <div
      v-if="isActive"
      class="fixed z-[1000] flex flex-col bg-black px-0 py-5 shadow-lg lg:w-[50dvw] lg:p-10"
      :class="drawerContentDirection"
    >
      <!-- Drawer header -->
      <slot name="header"></slot>

      <!-- Scrollable content area -->
      <slot name="content"></slot>

      <!-- Drawer footer -->
      <slot name="footer"></slot>

      <!-- Close button -->
      <slot name="close-button"></slot>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active,
.fade-bottom-enter-active,
.fade-bottom-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  @apply lg:translate-x-full translate-y-full lg:translate-y-0;
}

.fade-bottom-enter-from,
.fade-bottom-leave-to {
  opacity: 0;
  @apply -translate-y-full;
}

.slide-up-enter-active,
.slide-up-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(calc(100% + 48px));
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(calc(100% + 56px));
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(calc(-100% - 48px));
}

/* 自定義滾動條樣式 */
.drawer-content {
  scrollbar-width: thin;
  scrollbar-color: var(--primary-green) black;
}

.drawer-content::-webkit-scrollbar-thumb {
  border-radius: 6px;
}
</style>
