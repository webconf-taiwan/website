<script setup>
/**
 * 全螢幕黑幕轉場
 * - 換頁時先淡出成全黑，蓋住舊頁面，等新頁面 mount 完成後再淡出黑幕、露出新內容
 * - 只在「換路徑」時觸發，同頁的 query/hash 變化不會蓋黑幕
 *
 * 用法：<LayoutPageTransition />（全域掛一次即可，見 app.vue）
 */
const DURATION = 300

const show = ref(false)
const router = useRouter()
const nuxtApp = useNuxtApp()

onMounted(() => {
  const removeGuard = router.beforeEach((to, from) => {
    if (to.path === from.path) return

    show.value = true
    return new Promise((resolve) => setTimeout(resolve, DURATION))
  })

  const removeHook = nuxtApp.hook('page:finish', () => {
    show.value = false
  })

  onBeforeUnmount(() => {
    removeGuard()
    removeHook()
  })
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
        class="pointer-events-none fixed inset-0 z-[2000] bg-black"
        aria-hidden="true"
      ></div>
    </Transition>
  </Teleport>
</template>
