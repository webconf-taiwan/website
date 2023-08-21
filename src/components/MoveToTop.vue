<template>
  <a href="#" ref="moveToTop" class="transition-opacity duration-300" @click.prevent="scrollToTop">
    <div class="relative flex flex-col items-center justify-end w-10 h-10 border border-custom-teal-500 bg-custom-gray-800">
      <div class="w-3 border border-custom-teal-500 absolute top-[6px]"></div>
      <div class="w-8 h-8 rotate-180 bg-cover arrow"></div>
    </div>
  </a>
</template>

<style scoped>
.arrow {
  background-image: url("@/assets/images/icon/ic_scroll_l.svg");
}
</style>

<script setup>
import { ref, onMounted } from "vue";

const moveToTop = ref();

const scrollToTop = () => {
  if (window.scrollY > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, window.scrollY - 50);
  }
};

const isScrollAtTop800 = () => {
  if (window.scrollY > 800) {
    moveToTop.value.style.opacity = 1;
  } else {
    moveToTop.value.style.opacity = 0;
  }
};

onMounted(() => {
  window.addEventListener("scroll", isScrollAtTop800);
  moveToTop.value.style.opacity = 0;
});
</script>
