<script setup lang="ts">
import Nav from '~/components/nav/Nav.vue'
</script>

<template>
  <div>
    <Header />
    <Nav />
    <slot></slot>
    <Footer />
  </div>
</template>
