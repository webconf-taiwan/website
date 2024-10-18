<script setup lang="ts"></script>

<template>
  <div class="pointer-events-none fixed inset-0 z-[1000] mx-auto max-w-7xl">
    <div class="pointer-events-auto absolute bottom-4 right-0 grid grid-cols-1 grid-rows-2 gap-y-2">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped></style>
