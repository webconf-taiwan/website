<script setup lang="ts">
const lenis = useLenis()

function scrollToTop() {
  lenis.scrollTo(0)
}
</script>

<template>
  <button
    v-cursor="{ scale: 0.4, duration: 0.5 }"
    type="button"
    aria-label="回到頁面頂端"
    class="group absolute grid aspect-square w-10 cursor-none place-content-center bg-webconf-gray/90 transition-colors duration-500 lg:hover:bg-webconf-blue/90"
    @click="scrollToTop"
  >
    <Icon
      name="heroicons:arrow-up"
      class="size-6 text-black lg:group-hover:text-white"
    />
  </button>
</template>
