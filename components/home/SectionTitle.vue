<script setup lang="ts"></script>

<template>
  <h2 class="flex items-start gap-x-2">
    <div class="w-3 translate-y-0.5 space-y-1.5">
      <span class="block h-[2px] w-full bg-primary-green"></span>
      <span class="block h-[2px] w-full bg-primary-green"></span>
      <span class="block h-[2px] w-full bg-primary-green"></span>
      <span class="block h-[2px] w-full bg-primary-green"></span>
      <span class="block h-[2px] w-full bg-primary-green"></span>
    </div>

    <span class="section-title-text font-['Mina']">
      <slot name="title"></slot>
    </span>

    <span class="text-xl tracking-wider lg:text-2xl">
      <slot name="subTitle"></slot>
    </span>
  </h2>
</template>

<style scope></style>
