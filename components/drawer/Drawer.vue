<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { cn } from '~/lib/utils'

type SlideDirection = 'slide-left' | 'slide-right' | 'slide-up' | 'slide-up-full' | 'slide-down'

const props = withDefaults(defineProps<{
  defaultCloseBtn?: boolean
  slideDirection?: SlideDirection
  drawerClass?: HTMLAttributes['class']
}>(), {
  defaultCloseBtn: true,
  slideDirection: 'slide-up',
})
const agendasStore = useAgendasStore()
const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')

const { isDrawerActive, openDrawer, closeDrawer } = useDrawerState()

const isActive = computed(() => isDrawerActive())

function open() {
  openDrawer()
}

function close() {
  closeDrawer()
  // agendasStore.cleanDrawerRenderData()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isActive.value) {
    close()
    // agendasStore.cleanDrawerRenderData()
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
  if (newValue)
    handlePageScroll()
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

/**
 * 判斷 Overlay 方向
 */
const overlayClassMap = {
  'slide-left': 'bg-gradient-to-r to-primary-green/90',
  'slide-right': 'bg-gradient-to-l to-primary-green/90',
  'slide-up': 'bg-gradient-to-b to-primary-green to-80%',
  'slide-up-full': 'bg-gradient-to-b to-primary-green to-30%',
  'slide-down': 'bg-gradient-to-t to-primary-green/90 to-60%',
}

const overlayClass = computed(() =>
  overlayClassMap[props.slideDirection] || overlayClassMap['slide-up'],
)

/**
 * 判斷 Overlay 動畫方向
 */
const overlayTransition = computed(() => `fade-${props.slideDirection.split('-')[1]}`)

/**
 * 判斷 Drawer Content 各斷點樣式
 */
const drawerContentClass = computed(() => {
  const baseClasses = {
    'slide-up': 'inset-x-0 bottom-0 max-h-[calc(100dvh-48px)] sm:max-h-[calc(100dvh-56px)]',
    'slide-up-full': 'inset-x-0 bottom-0 h-[calc(100dvh-48px)] sm:h-[calc(100dvh-56px)]',
    'slide-down': 'inset-x-0 top-0 max-h-[85dvh] min-h-[30dvh]',
    'slide-left': 'inset-y-0 right-0 w-80',
    'slide-right': 'inset-y-0 left-0 w-80',
  }

  if (isSmallerLg.value) {
    return baseClasses[props.slideDirection] || baseClasses['slide-up']
  }
  else {
    return baseClasses[props.slideDirection] || 'inset-y-0 right-0 w-80'
  }
})
</script>

<template>
  <!-- Overlay -->
  <Transition :name="overlayTransition">
    <div
      v-if="isActive"
      class="fixed inset-0 z-[1020] from-primary-green/0"
      :class="overlayClass"
    ></div>
  </Transition>

  <Transition name="mask">
    <div
      v-if="isActive"
      class="fixed inset-0 z-[1010] bg-black/80 delay-200"
    ></div>
  </Transition>

  <!-- Drawer -->
  <Transition
    :name="slideDirection"
    @after-leave="restoreScroll"
  >
    <div
      v-if="isActive"
      :class="cn(
        'fixed z-[1030] flex flex-col bg-black px-0 py-5 shadow-lg lg:w-[50dvw] lg:p-10',
        drawerContentClass,
        props.drawerClass,
      )"
    >
      <slot></slot>
      <slot name="custom"></slot>

      <DrawerClose
        v-if="defaultCloseBtn"
        breakpoint="lg"
        @close="close"
      />
    </div>
  </Transition>
</template>

<style scoped>
.mask-enter-active,
.mask-leave-active {
  transition: opacity 0.3s ease;
}

.mask-leave-active {
  transition-delay: 0.2s;
}

.mask-enter-from,
.mask-leave-to {
  opacity: 0;
}

.fade-up-enter-active,
.fade-up-leave-active,
.fade-down-enter-active,
.fade-down-leave-active,
.fade-left-enter-active,
.fade-left-leave-active,
.fade-right-enter-active,
.fade-right-leave-active {
  transition: all 0.5s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  @apply translate-y-full;
}

.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  @apply -translate-y-full;
}

.fade-left-enter-from,
.fade-left-leave-to {
  opacity: 0;
  @apply translate-x-full;
}

.fade-right-enter-from,
.fade-right-leave-to {
  opacity: 0;
  @apply -translate-x-full;
}

.slide-up-enter-active,
.slide-up-leave-active,
.slide-up-full-enter-active,
.slide-up-full-leave-active,
.slide-down-enter-active,
.slide-down-leave-active,
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to,
.slide-up-full-enter-from,
.slide-up-full-leave-to {
  transform: translateY(100%);
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(calc(100% + 56px));
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(calc(-100% - 56px));
}
</style>
