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
      class="main-footer relative border-t-[0.5px] border-webconf-frame bg-black"
    >
      <div
        class="container relative flex flex-col items-start gap-[60px] px-5 pb-20 pt-10 text-white sm:px-8 sm:pb-[100px] sm:pt-[60px] lg:px-20 xl:flex-row xl:items-end"
      >
        <!-- go top 按鈕 -->
        <ShareScrollToTopButton
          class="right-5 top-10 sm:right-8 sm:top-[60px] lg:right-20"
        />

        <!-- logo -->
        <div
          v-cursor="{ scale: 0.4, duration: 0.5 }"
          class="pic group mt-[52px] flex flex-col gap-1 sm:mt-0"
        >
          <NuxtLink
            aria-label="回到首頁"
            to="/"
            class="relative inline-block h-[91px] w-[240px] sm:size-full"
          >
            <!-- default logo -->
            <NuxtImg
              src="/images/footerLogo.webp"
              alt="2025 WebConf"
              width="280"
              height="106"
              format="webp"
              class="opacity-100 transition-opacity duration-500 lg:group-hover:opacity-0"
            />
            <!-- hover logo -->
            <NuxtImg
              src="/images/footerLogoHover.webp"
              alt="2025 WebConf"
              width="280"
              height="106"
              class="absolute inset-0 opacity-0 transition-opacity duration-500 lg:group-hover:opacity-100"
            />
          </NuxtLink>
          <span
            class="text-left text-sm leading-[1.8] tracking-[0.02em] transition-colors duration-500 lg:group-hover:text-webconf-blue"
          >WebConf Taiwan 2025 All Rights Reserved.</span>
        </div>

        <!-- 社群連結 -->
        <ul
          class="flex w-full flex-1 flex-wrap justify-between gap-y-4 text-h3-40 sm:w-full sm:flex-nowrap sm:gap-0 lg:w-auto lg:justify-end lg:gap-12"
        >
          <li
            v-for="socialitem in SOCIAL_ITEMS"
            :key="socialitem.name"
            class="w-1/2 sm:w-auto"
          >
            <NuxtLink
              v-cursor="{
                scale: 5,
                duration: 0.5,
                backgroundColor: 'rgba(0, 46, 255, 0.9)',
                text: 'FOLLOW',
              }"
              class="inline-block transition-colors duration-500 lg:hover:text-webconf-blue"
              target="_blank"
              :aria-label="socialitem.name"
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

<style scoped>
.main-footer {
  background-image: url("/images/footerBg.webp");
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: auto 155px;
}

@media (min-width: 1440px) {
  .main-footer {
    background-size: 100% 155px;
  }
}
</style>
