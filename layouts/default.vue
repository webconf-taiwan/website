<script setup lang="ts">
const lenis = useLenis()
const { isFirstLoad, setFirstLoad } = useGlobalState()

const route = useRoute()
const shouldShowLoading = computed(() => {
  return route.name !== 'all'
})

// 404 頁面就不顯示首次加載動畫
if (!shouldShowLoading.value) {
  setFirstLoad(true)
}

onMounted(() => {
  lenis.scrollTo(0, { immediate: true })
})
</script>

<template>
  <Teleport to="body">
    <!-- 全局使用 DVD 特效 -->
    <ShareCursorDot />
    <!-- 首次加載動畫 -->
    <ShareLoadingDots
      class="fixed inset-0 z-[100] overflow-hidden transition-opacity duration-1500"
      :class="[isFirstLoad ? 'pointer-events-none opacity-0' : 'opacity-100']"
    />
  </Teleport>
  <ShareBgBorder
    class="transition-opacity duration-1000"
    :class="[isFirstLoad ? 'opacity-100' : 'opacity-0']"
  >
    <HomeNavbar />
    <slot></slot>
    <HomeSiteFooter />
  </ShareBgBorder>
</template>
