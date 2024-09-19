<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

// const modelValue = defineModel<boolean>({ required: true })

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerOrEqualLg = breakpoints.smallerOrEqual('lg')

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
      class="fixed inset-0 z-40 bg-black/50"
    ></div>
  </Transition>

  <!-- Drawer -->
  <Transition
    :name="isSmallerOrEqualLg ? 'slide-up' : 'slide-left'"
    @after-leave="restoreScroll"
  >
    <div
      v-if="isActive"
      class="fixed z-[1000] flex flex-col overflow-y-auto bg-black shadow-lg"
      :class="[
        isSmallerOrEqualLg ? 'inset-x-0 bottom-0 h-2/3' : 'inset-y-0 right-0 w-80',
      ]"
    >
      <!-- Drawer Header -->
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-lg font-semibold">
          Drawer Title
        </h2>
        <button
          class="text-gray-500 hover:text-gray-700"
          @click="close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Scrollable Content Area -->
      <div
        ref="scrollableContent"
        data-lenis-prevent
        class="drawer-content flex-1 overflow-y-auto p-4"
      >
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
}

/* 自定義滾動條樣式 */
.drawer-content {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.drawer-content::-webkit-scrollbar {
  width: 6px;
}

.drawer-content::-webkit-scrollbar-track {
  background: #f7fafc;
}

.drawer-content::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}
</style>
