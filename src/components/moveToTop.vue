<template>
  <a href="#" @click.prevent="scrollToTop">
    <div
      class="flex flex-col items-center justify-end border border-custom-teal-500 bg-custom-gray-800 relative w-10 h-10"
    >
      <div class="w-3 border border-custom-teal-500 absolute top-[6px]"></div>
      <div class="arrow w-8 h-8 bg-cover rotate-180"></div>
    </div>
  </a>
</template>

<style scoped>
.arrow {
  background-image: url('@/assets/images/icon/ic_scroll_l.svg');
}
</style>

<script setup>
const scrollToTop = () => {
  if (window.scrollY > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, window.scrollY - 50);
  }
};
</script>
