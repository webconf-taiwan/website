<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { navLinks } from '~/constants'

const { $gsap } = useNuxtApp()

const navRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const navTl = $gsap.timeline({
    delay: 4,
  })

  navTl.fromTo(navRef.value, {
    x: '100%',
    opacity: 0,
  }, {
    x: '0%',
    opacity: 1,
    duration: 1,
    ease: 'back.out',
  })
})
</script>

<template>
  <!-- 手機版 -->
  <nav class="fixed right-0 top-0 z-10 bg-black lg:hidden">
    <div class="relative flex h-12 w-10 items-center pl-1">
      <div
        class="absolute left-0 top-0 h-full w-3 -translate-x-3 bg-black"
        style="clip-path: polygon(100% 0%, 100% 50%, 100% 100%, 100% 100%, 0 65%, 0 0);"
      ></div>
      <Icon
        name="heroicons:bars-3-16-solid"
        class="size-6 text-primary-green"
      />
    </div>
  </nav>
  
  <!-- 電腦版 -->
  <nav
    ref="navRef"
    class="absolute right-0 hidden items-center bg-black lg:flex"
    style="opacity: 0; transform: translateX(100%);"
  >
    <div
      class="absolute left-0 top-0 h-full w-5 -translate-x-5 bg-black"
      style="clip-path: polygon(100% 0%, 100% 50%, 100% 100%, 100% 100%, 0 65%, 0 0);"
    ></div>

    <router-link
      v-for="link in navLinks"
      :key="link.name"
      :to="link.href"
      class="group relative px-[14px] py-3 hover:text-white"
    >
      <span class="text-h5">
        {{ link.name }}
      </span>
      <span class="absolute bottom-0 left-0 h-[1px] w-full origin-left scale-x-0 bg-white transition-transform duration-200 group-hover:scale-x-100"></span>
    </router-link>
  </nav>
</template>
