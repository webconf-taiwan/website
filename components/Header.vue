<script setup lang="ts">
import Nav from './Nav.vue'

const headerRef = ref<HTMLDivElement | null>(null)
</script>

<template>
  <header
    ref="headerRef"
    class="fixed top-0 z-50 flex min-h-12 w-full items-center justify-center overflow-x-clip px-10 py-4 lg:justify-between"
  >
    <LogoAnimation
      v-if="headerRef"
      :header-ref="headerRef"
    />

    <Nav />
  </header>

  <!-- header 佔位格 -->
  <div class="h-12 lg:h-[72px]"></div>
</template>
