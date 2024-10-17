<script setup lang="ts">
import { agendaTags } from '~/constants/agendas'
</script>

<template>
  <div class="relative mx-auto bg-[hsla(198,98%,16%,1)] px-4 py-5 md:px-9">
    <div class="absolute left-2 top-2 size-[10px] border-l border-t border-primary-green"></div>
    <div class="absolute right-2 top-2 size-[10px] border-r border-t border-primary-green"></div>
    <div class="absolute bottom-2 right-2 size-[10px] border-b border-r border-primary-green"></div>
    <div class="absolute bottom-2 left-2 size-[10px] border-b border-l border-primary-green"></div>

    <div class="flex flex-wrap content-center justify-center gap-3">
      <button
        v-for="tag in agendaTags"
        :key="tag.id"
        type="button"
        class="relative z-[1] border border-primary-green bg-transparent px-3 py-2 text-[hsla(170,100%,35%,1)] *:relative *:z-[3] before:absolute before:inset-0 before:z-[2] before:bg-[hsla(176,99%,29%,1)] before:opacity-0 before:transition-opacity hover:text-white hover:before:opacity-100"
      >
        <span>{{ tag.text }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
