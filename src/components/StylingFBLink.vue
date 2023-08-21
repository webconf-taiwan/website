<script setup>
import { ref, onMounted } from "vue";

const fbDecorativeLink = ref();

const scrollHandler = () => {
  const scrollDistanceToBottom = document.documentElement.scrollHeight - (window.innerHeight + window.pageYOffset);

  const isBottom = scrollDistanceToBottom < 100;

  fbDecorativeLink.value.style.opacity = isBottom ? 0 : 1;
};

onMounted(() => {
  window.addEventListener("scroll", scrollHandler);
});
</script>

<template>
  <div ref="fbDecorativeLink" class="flex flex-col items-center justify-center transition-opacity duration-300">
    <a href="https://www.facebook.com/WebConfTaiwan" target="_blank">
      <div class="w-6 h-6 bg-cover fbIcon"></div>
    </a>
    <div class="m-2 w-0.5 h-10 bg-custom-teal-500"></div>
    <p class="text-sm writing-vertical text-custom-teal-500">Webconf 2023 All Rights Reserved.</p>
  </div>
</template>

<style scoped>
.fbIcon {
  background-image: url("@/assets/images/icon/ic_fb_l.svg");
}
.writing-vertical {
  writing-mode: vertical-rl;
}
</style>
