<template>
  <NuxtLink
    v-cursor="{ scale: 0.4, duration: 0.5 }"
    to="/"
    class="group relative inline-block bg-white px-[67.5px] py-4 text-btn-16 text-webconf-black duration-300 hover:bg-webconf-blue hover:text-white"
  >
    <slot></slot>

    <span
      class="absolute -left-3 bottom-0 size-3 bg-white transition-transform duration-300 group-hover:-translate-y-3 group-hover:bg-webconf-blue"
    ></span>
    <span
      class="absolute -left-6 bottom-3 size-3 bg-white transition-transform duration-300 group-hover:-translate-y-3 group-hover:bg-webconf-blue"
    ></span>
    <span
      class="absolute -right-3 -top-3 size-3 bg-white transition-transform duration-300 group-hover:translate-y-3 group-hover:bg-webconf-blue"
    ></span>
  </NuxtLink>
</template>
