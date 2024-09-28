<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')

const { isDrawerActive, openDrawer, closeDrawer } = useDrawerState()

const scrollableContent = ref<HTMLElement | null>(null)

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
</script>

<template>
  <!-- Overlay -->
  <Transition name="fade">
    <div
      v-if="isActive"
      class="fixed inset-0 z-40 from-primary-green/0"
      :class="[isSmallerLg ? 'bg-gradient-to-b to-primary-green/80 to-60%' : 'bg-gradient-to-r to-primary-green/90']"
    ></div>
  </Transition>

  <!-- Drawer -->
  <Transition
    :name="isSmallerLg ? 'slide-up' : 'slide-left'"
    @after-leave="restoreScroll"
  >
    <div
      v-if="isActive"
      class="fixed z-[1000] flex flex-col bg-black px-0 py-5 shadow-lg lg:w-[50dvw] lg:p-10"
      :class="[
        isSmallerLg ? 'inset-x-0 bottom-0 max-h-[85dvh] min-h-[30dvh]' : 'inset-y-0 right-0 w-80',
      ]"
    >
      <!-- Drawer header -->
      <div class="mb-8 space-y-2 px-5 lg:px-10">
        <NuxtImg
          src="/drawer/drawer-top-decorate-lg.svg"
          class="hidden w-full sm:block"
        />
        <NuxtImg
          src="/drawer/drawer-top-decorate.svg"
          class="block w-full sm:hidden"
        />
        <slot name="header"></slot>
      </div>

      <!-- Scrollable content area -->
      <div
        ref="scrollableContent"
        data-lenis-prevent
        class="drawer-content mb-10 min-h-[20dvh] flex-1 overflow-y-auto px-5 lg:px-10"
      >
        <slot name="content"></slot>
      </div>

      <!-- Drawer footer -->
      <div class="space-y-2">
        <div class="flex h-3 justify-center space-x-1.5">
          <span
            v-for="(_, index) in 6"
            :key="index"
            class="h-full w-[2px] bg-primary-green"
          ></span>
        </div>

        <div class="w-full border-t border-primary-green"></div>
      </div>

      <!-- Close button -->
      <DrawerClose
        breakpoint="lg"
        @close="close"
      />
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  @apply lg:translate-x-full translate-y-full lg:translate-y-0;
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

/* 自定義滾動條樣式 */
.drawer-content {
  scrollbar-width: thin;
  scrollbar-color: var(--primary-green) black;
}

.drawer-content::-webkit-scrollbar-thumb {
  border-radius: 6px;
}
</style>
