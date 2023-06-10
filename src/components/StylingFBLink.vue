<!-- SharedStyle.vue -->
<template>
  <div class="flex flex-col justify-center items-center">
    <a href="https://www.facebook.com/WebConfTaiwan" target="_blank">
      <div class="fbIcon w-6 h-6 bg-cover"></div>
    </a>
    <div class="m-2 w-0.5 h-10 bg-custom-teal-500"></div>
    <p class="writing-vertical text-custom-teal-500 text-sm font-rajdhani">
      Webconf 2023 All Rights Reserved.
    </p>
  </div>
</template>

<style scoped>
.fbIcon {
  background-image: url('@/assets/images/icon/ic_fb_l.svg');
}
.writing-vertical {
  writing-mode: vertical-rl;
}
</style>
