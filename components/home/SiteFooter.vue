<script setup lang="ts">
const SOCIAL_ITEMS = [
  { name: 'Mail', href: 'mailto:hi@webconf.tw' },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/WebConfTaiwan/?locale=zh_TW',
  },
  { name: 'Instagram', href: 'http://instagram.com/webconftw/' },
  { name: 'Threads', href: 'https://www.threads.com/@webconftw' },
]
</script>

<template>
  <ClientOnly>
    <footer
      v-arrow="{ speed1: '10s', color: 'white' }"
      class="main-footer relative border-t-[0.5px] border-webconf-gray/50 bg-black"
    >
      <div
        class="container relative flex items-end justify-between pb-[60px] pt-[100px] text-white sm:px-12 lg:px-20"
      >
        <ShareScrollToTopButton class="right-20 top-[100px]" />
        <div
          v-cursor="{ scale: 0.4, duration: 0.5 }"
          class="pic group flex flex-col gap-1"
        >
          <NuxtLink
            to="#"
            class="relative inline-block"
          >
            <!-- default logo -->
            <NuxtImg
              src="/images/footerLogo.png"
              alt="2025 WebConf"
              format="webp"
              width="280"
              height="106"
              class="opacity-100 transition-opacity duration-500 group-hover:opacity-0"
            />
            <!-- hover logo -->
            <NuxtImg
              src="/images/footerLogoHover.png"
              alt="2025 WebConf"
              format="webp"
              width="280"
              height="106"
              class="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          </NuxtLink>
          <span
            class="text-left text-sm leading-[1.8] tracking-[0.02em] transition-colors duration-500 group-hover:text-webconf-blue"
          >WebConf Taiwan 2025 All Rights Reserved.</span>
        </div>

        <ul class="flex min-w-0 flex-1 justify-end gap-12 text-h3-40">
          <li
            v-for="socialitem in SOCIAL_ITEMS"
            :key="socialitem.name"
          >
            <NuxtLink
              v-cursor="{
                scale: 5,
                duration: 0.5,
                backgroundColor: 'rgba(0, 46, 255, 0.9)',
                text: 'FOLLOW',
              }"
              class="inline-block transition-colors duration-500 hover:text-webconf-blue"
              target="_blank"
              :to="socialitem.href"
            >
              {{ socialitem.name }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </footer>
  </ClientOnly>
</template>

<style>
.main-footer {
  background-image: url("/images/footerBg.png");
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: 100% auto;
}
</style>
