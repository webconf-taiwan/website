<script setup lang="ts">
const NAV_ITEMS = [
  { name: '議程資訊', href: '#', isTablet: true, isDesktop: true },
  { name: '講者介紹', href: '#', isTablet: false, isDesktop: true },
  { name: '場域介紹', href: '#', isTablet: true, isDesktop: true },
  { name: '贊助廠商', href: '#', isTablet: false, isDesktop: true },
  { name: '主辦團隊', href: '#', isTablet: false, isDesktop: true },
  { name: '歷屆回顧', href: '#', isTablet: false, isDesktop: true },
]
const isSaleOpen = useGlobalState().isSaleOpen
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-b-webconf-gray bg-black"
  >
    <div
      class="container flex items-center justify-between px-5 sm:px-8 lg:px-20"
    >
      <!-- logo -->
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

      <!-- 導覽列 -->
      <div class="flex items-center gap-4 py-3 text-btn-16 text-webconf-gray">
        <nav>
          <ul class="flex py-[3px]">
            <li
              v-for="navItem in NAV_ITEMS"
              :key="navItem.name"
              class="hidden"
              :class="{
                'sm:block': navItem.isTablet,
                'lg:block': navItem.isDesktop,
              }"
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

        <NuxtLink
          to="#"
          :class="{ hidden: isSaleOpen }"
        >
          <ShareTag size="lg">
            前往購票
          </ShareTag>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
