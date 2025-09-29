<script setup lang="ts">
const { isFirstLoad } = useGlobalState()
</script>

<template>
  <ShareLoadingDots
    class="fixed inset-0 z-50 overflow-hidden transition-opacity duration-1500"
    :class="[isFirstLoad ? 'pointer-events-none opacity-0' : 'opacity-100']"
  />
  <ShareBgBorder
    class="transition-opacity duration-1000"
    :class="[isFirstLoad ? 'opacity-100' : 'opacity-0']"
  >
    <ShareCursorDot />
    <HomeNavbar />
    <slot></slot>
    <HomeSiteFooter />
  </ShareBgBorder>
</template>
