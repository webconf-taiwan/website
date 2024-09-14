<script setup lang="ts">
import Nav from './Nav.vue'

const headerRef = ref<HTMLDivElement | null>(null)
</script>

<template>
  <header
    ref="headerRef"
    class="sticky top-0 z-10 flex min-h-12 w-full items-center justify-between overflow-x-clip px-10 py-4"
  >
    <LogoAnimation
      v-if="headerRef"
      :header-ref="headerRef"
    />

    <Nav />
  </header>
</template>
