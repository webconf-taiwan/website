<script setup lang="ts"></script>

<template>
  <h3 class="flex items-center gap-x-4">
    <div class="w-3 shrink-0 space-y-1.5 lg:translate-y-0.5">
      <span
        v-for="(_, index) in 6"
        :key="index"
        class="block h-[2px] w-full bg-primary-green"
      ></span>
    </div>

    <span class="text-[40px] font-bold uppercase text-primary-green">
      <slot name="title"></slot>
    </span>
  </h3>
</template>

<style scoped></style>
