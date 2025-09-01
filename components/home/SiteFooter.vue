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
      class="main-footer relative border-t border-t-webconf-gray bg-black before:animate-arrow-run"
    >
      <div
        class="container flex items-center justify-between px-20 pb-[60px] pt-[100px] text-white"
      >
        <div
          v-cursor="{ scale: 0.4, duration: 0.5 }"
          class="pic"
        >
          <NuxtLink
            to="#"
            class="group relative inline-block h-[105.61px] w-[280px]"
          >
            <!-- default logo -->
            <NuxtImg
              src="/images/footerLogo.png"
              alt="2025 WebConf"
              format="webp"
              class="absolute inset-0 size-full opacity-100 transition-opacity duration-500 group-hover:opacity-0"
            />
            <!-- hover logo -->
            <NuxtImg
              src="/images/footerLogoHover.png"
              alt="2025 WebConf"
              format="webp"
              class="absolute inset-0 size-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          </NuxtLink>
        </div>

        <ul class="flex gap-12">
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
              class="inline-block text-h3-40 transition-colors duration-500 hover:text-webconf-blue"
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

.main-footer::before {
  content: "";
  position: absolute;
  top: -6px;
  left: 10px;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 16px solid white;
}
</style>
