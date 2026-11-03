<script setup lang="ts">
const { isFirstLoad, setFirstLoad } = useGlobalState()

const route = useRoute()
const shouldShowLoading = computed(() => {
  return route.name === 'index'
})

await useAllSpeakers()

// 404 頁面就不顯示首次加載動畫
if (!shouldShowLoading.value) {
  setFirstLoad(true)
}
</script>

<template>
  <Teleport to="body">
    <!-- 全局使用 DVD 特效 -->
    <ShareCursorDot />
    <!-- 首次加載動畫 -->
    <ShareLoadingDots
      class="fixed inset-0 z-[200] cursor-none overflow-hidden transition-opacity duration-1500"
      :class="[isFirstLoad ? 'pointer-events-none opacity-0' : 'opacity-100']"
    />
  </Teleport>
  <ShareBgBorder
    class="transition-opacity duration-1000"
    :class="[isFirstLoad ? 'opacity-100' : 'opacity-0']"
  >
    <HomeNavbar />
    <!--
      頁面一定要包在自己的容器裡：開著講者彈窗（/agenda/10 這類子路由）直接點導覽列換頁時，
      out-in 轉場會找不到新頁面該插入的位置，退回插到容器最後面；
      容器若跟 Footer 共用，新頁面就會跑到 Footer 下面，畫面變成 Footer 在最上面
    -->
    <div>
      <slot></slot>
    </div>
    <HomeSiteFooter />
  </ShareBgBorder>
</template>
