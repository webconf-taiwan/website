<script setup lang="ts">
import Nav from '~/components/nav/Nav.vue'
</script>

<template>
  <main class="layout-grid">
    <Header />
    <Nav />
    <slot></slot>
    <Footer />
  </main>
</template>
