<template>
  <NuxtLink
    v-cursor="{ scale: 0.4, duration: 0.5 }"
    to="/"
    class="group relative inline-block bg-webconf-gray px-[67.5px] py-4 text-btn-16 font-semibold text-webconf-black duration-300 lg:hover:bg-webconf-blue lg:hover:text-white"
  >
    <slot></slot>

    <span
      class="absolute -left-3 bottom-0 size-3 bg-webconf-gray transition-transform duration-300 lg:group-hover:-translate-y-3 lg:group-hover:bg-webconf-blue"
    ></span>
    <span
      class="absolute -left-6 bottom-3 size-3 bg-webconf-gray transition-transform duration-300 lg:group-hover:-translate-y-3 lg:group-hover:bg-webconf-blue"
    ></span>
    <span
      class="absolute -right-3 -top-3 size-3 bg-webconf-gray transition-transform duration-300 lg:group-hover:translate-y-3 lg:group-hover:bg-webconf-blue"
    ></span>
  </NuxtLink>
</template>
