<script setup lang="ts">
const lenis = useLenis()

function scrollToTop() {
  lenis.scrollTo(0)
}
</script>

<template>
  <button
    type="button"
    class="group absolute grid aspect-square w-10 cursor-none place-content-center bg-webconf-gray/90 transition-colors duration-500 hover:bg-webconf-blue/90"
    @click="scrollToTop"
  >
    <Icon
      name="heroicons:arrow-up"
      class="size-6 text-black group-hover:text-white"
    />
  </button>
</template>
