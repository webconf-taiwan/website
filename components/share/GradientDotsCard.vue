<template>
  <div
    class="gradient-dots-card border-[0.5px] border-webconf-gray bg-black px-[60px] py-12"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.gradient-dots-card {
  background-image: url("/images/gradientDotsBg.webp");
  background-size: contain;
  background-position: bottom;
  background-repeat: no-repeat;
}
</style>
