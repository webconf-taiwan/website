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

function handleClose() {
  close()
  console.log(1)
}
</script>

<template>
  <!-- Overlay -->
  <Transition name="fade">
    <div
      v-if="isActive"
      class="fixed inset-0 z-40 bg-gradient-to-t from-primary-green/0 to-primary-green/80 to-60%"
    ></div>
  </Transition>

  <!-- Drawer -->
  <Transition
    :name="isSmallerLg ? 'slide-down' : 'slide-left'"
    @after-leave="restoreScroll"
  >
    <div
      v-if="isActive"
      class="fixed z-[1000] flex flex-col bg-black px-0 pt-3"
      :class="[
        isSmallerLg ? 'inset-x-0 top-0 max-h-[85dvh] min-h-[30dvh]' : 'inset-y-0 right-0 w-80',
      ]"
    >
      <!-- Drawer header -->
      <div class="mb-8 flex justify-center space-y-2 px-10">
        <slot name="header"></slot>
      </div>

      <!-- Scrollable content area -->
      <div
        ref="scrollableContent"
        data-lenis-prevent
        class="drawer-content mb-10 min-h-[20dvh] flex-1 px-10 lg:px-10"
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
      <!-- <DrawerClose
        breakpoint="lg"
        @close="close"
      /> -->

      <button
        class="fixed right-0 top-0 p-3"
        @click="close"
      >
        <Icon
          name="material-symbols:close"
          class="size-6 text-primary-green"
        />
      </button>
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
  @apply lg:translate-x-full -translate-y-full lg:translate-y-0;
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(calc(-100% - 48px));
}
</style>
