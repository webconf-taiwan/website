<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import Nav from './Nav.vue'

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
      class="fixed left-0 top-0 z-50 flex min-h-12 w-full items-center justify-center overflow-x-clip px-10 py-4 lg:fixed lg:left-1/2 lg:max-w-[1440px] lg:-translate-x-1/2 lg:justify-between"
    >
      <div
        class="full-bleed absolute inset-0 bg-gradient-to-t from-transparent to-gradient-bg-start/70 transition-opacity duration-150 lg:hidden"
        :style="{ opacity: gradientOpacity }"
      ></div>
      <LogoAnimation
        v-if="headerRef"
        :header-ref="headerRef"
      />
      <Nav v-if="false" />
    </div>
  </header>

  <!-- header 佔位格 -->
  <div class="h-12 lg:h-[72px]"></div>
</template>
