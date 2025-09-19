<template>
  <div
    class="gradient-dots-card border-[0.5px] border-webconf-frame bg-black px-5 pb-10 pt-8 sm:p-12 lg:px-[60px] lg:py-12"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.gradient-dots-card {
  background-image: url("/images/gradientDotsBg.webp");
  background-size: auto 215px;
  background-position: bottom;
  background-repeat: no-repeat;
}
</style>
