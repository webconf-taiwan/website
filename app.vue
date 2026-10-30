<script setup lang="ts">
useSeoMeta({
  ogImage: 'https://2025.webconf.tw/images/seo/ogImage.png',
  ogImageAlt: 'WebConf Taiwan 2025',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterImage: 'https://2025.webconf.tw/images/seo/ogImage.png',
  twitterImageAlt: 'WebConf Taiwan 2025',
})

const isProduction = import.meta.env.PROD

if (isProduction) {
  useScript({
    'src': 'https://a.5xcamp.us/script.js',
    'defer': true,
    'data-website-id': '41664933-5ac4-4e59-ad44-2b69cc1dbbf4',
  })
}

useEasterEgg()
</script>

<template>
  <Body class="main-body cursor-auto bg-black lg:cursor-none">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </Body>
</template>

<style scoped>
/*
 * 進入時由下往上滑入，不做淡入：整頁一起淡入要把整頁當成半透明圖層合成，換頁會掉幀。
 * 透明度不在 transition 裡，第一幀之後就直接是完全不透明
 */
.page-enter-active {
  transition: transform 0.5s;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

/* 離開時淡出；整頁加上模糊太吃顯示卡，換頁會掉到 30 fps 左右，所以拿掉 */
.page-leave-active {
  transition: opacity 0.4s;
}
.page-leave-to {
  opacity: 0;
}
</style>
