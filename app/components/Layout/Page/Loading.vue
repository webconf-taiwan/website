<script setup>
/**
 * 蓋板 Loading
 * - 半透明黑底 + 置中 spinner
 * - 用 :show 控制
 * - 顯示時鎖 body scroll，避免使用者操作底下內容
 *
 * 用法：<LayoutPageLoading :show="submitting" text="處理中…" />
 */
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: ''
  }
})

watch(() => props.show, (value) => {
  if (typeof document === 'undefined') return

  document.body.style.overflow = value ? 'hidden' : ''
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-300 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="flex flex-col items-center gap-4">
          <div class="size-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
          <p v-if="text" class="text-zh-body-2 text-white">
            {{ text }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
