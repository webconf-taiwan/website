<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <!-- Drawer header -->
  <div class="mb-8 space-y-2 px-5 lg:px-10">
    <NuxtImg
      src="/drawer/drawer-top-decorate-lg.svg"
      class="hidden w-full sm:block"
    />
    <NuxtImg
      src="/drawer/drawer-top-decorate.svg"
      class="block w-full sm:hidden"
    />
    <slot name="header"></slot>
  </div>

  <!-- Scrollable content area -->
  <div
    data-lenis-prevent
    class="drawer-content mb-10 min-h-[20dvh] flex-1 overflow-y-auto px-5 lg:px-10"
  >
    <slot name="content"></slot>
  </div>

  <!-- Drawer footer -->
  <div class="space-y-2">
    <div class="flex h-3 justify-center space-x-1.5">
      <span
        v-for="(_, index) in 6"
        :key="index"
        class="h-full w-[2px] bg-primary-green"
      ></span>
    </div>

    <div class="w-full border-t border-primary-green"></div>
  </div>
</template>

<style scoped></style>
