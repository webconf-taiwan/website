<script setup lang="ts"></script>

<template>
  <h3 class="lg:venue-title-trapezoid flex flex-wrap items-center gap-x-4 bg-primary-faint-green px-2 py-2.5 lg:justify-center lg:bg-primary-green/25 lg:py-0">
    <span class="h-9 content-center font-['Mina'] text-[1.75rem] font-bold uppercase tracking-wider lg:h-[52px] lg:pt-1 lg:text-[2rem]">
      <slot name="title"></slot>
    </span>

    <span class="shrink-0 text-xl font-medium tracking-wider lg:text-lg">
      <slot name="subTitle"></slot>
    </span>
  </h3>
</template>

<style scoped>
</style>
