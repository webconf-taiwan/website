<script setup lang="ts">
import { useEventListener } from '@vueuse/core'

const headerRef = ref<HTMLDivElement | null>(null)
const gradientOpacity = ref(0)

/**
 * 計算漸層的透明度，滾動距離越大，透明度越高
 */
function checkScroll() {
  const scrollPercentage = Math.min(window.scrollY / 200, 1)
  gradientOpacity.value = scrollPercentage
}

useEventListener(window, 'scroll', checkScroll)
</script>

<template>
  <header class="lg:flex lg:justify-center">
    <div
      ref="headerRef"
      class="fixed left-0 top-0 z-30 flex min-h-12 w-full items-center justify-center overflow-x-clip px-10 lg:fixed lg:left-1/2 lg:max-w-[1440px] lg:-translate-x-1/2 lg:justify-between"
    >
      <div
        class=" absolute inset-0 bg-gradient-to-t from-transparent to-gradient-bg-start/70 transition-opacity duration-150 lg:hidden"
        :style="{ opacity: gradientOpacity }"
      ></div>
      <LogoAnimation
        v-if="headerRef"
        :header-ref="headerRef"
      />
    </div>
  </header>

  <!-- header 佔位格 -->
  <div class="h-12 lg:h-[72px]"></div>
</template>
