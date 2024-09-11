<script setup lang="ts">
import LogoAnimation from './LogoAnimation.vue'
import Nav from './Nav.vue'

const headerRef = ref<HTMLDivElement | null>(null)
</script>

<template>
  <header
    ref="headerRef"
    class="sticky top-0 flex w-full items-center justify-between px-10 py-4"
  >
    <LogoAnimation
      v-if="headerRef"
      :header-ref="headerRef"
    />

    <Nav />
  </header>
</template>
