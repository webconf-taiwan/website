<script setup lang="ts">
const NAV_ITEMS = [
  { name: '議程資訊', href: '#' },
  { name: '講者介紹', href: '#' },
  { name: '場域介紹', href: '#' },
  { name: '贊助廠商', href: '#' },
  { name: '主辦團隊', href: '#' },
  { name: '歷屆回顧', href: '#' },
]
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-b-webconf-gray bg-black"
  >
    <div class="container flex items-center justify-between sm:px-12 lg:px-20">
      <h1 v-cursor="{ scale: 0.4, duration: 0.5 }">
        <span class="sr-only">2025 WebConf</span>
        <NuxtLink
          to="#"
          class="group relative inline-block"
        >
          <!-- default logo -->
          <NuxtImg
            src="/images/headerLogo.webp"
            alt="2025 WebConf"
            format="webp"
            width="191"
            height="28"
            class="opacity-100 transition-opacity duration-500 group-hover:opacity-0"
          />
          <!-- hover logo -->
          <NuxtImg
            src="/images/headerLogoHover.webp"
            alt="2025 WebConf"
            format="webp"
            width="191"
            height="28"
            class="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 2xl:w-[191px]"
          />
        </NuxtLink>
      </h1>

      <nav>
        <ul
          class="flex py-3 font-semibold leading-[1.6] tracking-[.04em] text-webconf-gray"
        >
          <li
            v-for="navItem in NAV_ITEMS"
            :key="navItem.name"
          >
            <NuxtLink
              v-cursor="{ scale: 0.4, duration: 0.5 }"
              class="inline-block px-3 py-1 transition-colors duration-500 hover:text-webconf-blue"
              :to="navItem.href"
            >
              {{ navItem.name }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
