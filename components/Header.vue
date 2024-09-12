<script setup lang="ts">
import LogoAnimation from './LogoAnimation.client.vue'
import Nav from './Nav.vue'

const headerRef = ref<HTMLDivElement | null>(null)
</script>

<template>
  <header
    ref="headerRef"
    class="sticky top-0 z-10 flex w-full items-center justify-between overflow-x-clip px-10 py-4"
  >
    <LogoAnimation
      v-if="headerRef"
      :header-ref="headerRef"
    />

    <Nav />
  </header>
</template>
