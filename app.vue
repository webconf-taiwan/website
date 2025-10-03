<script setup lang="ts">
const { isFirstLoad } = useGlobalState()

defineOgImage({
  url: 'https://webconf.tw/images/seo/ogImage.png',
  width: 1200,
  height: 630,
  alt: 'WebConf Taiwan 2025',
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
  <Body
    class="main-body cursor-auto bg-black lg:cursor-none"
    :class="{ 'overflow-hidden': !isFirstLoad }"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </Body>
</template>

<style scoped>
/* 進入時由下往上淡入 */
.page-enter-active {
  transition: all 0.5s;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

/* 離開時模糊消失 */
.page-leave-active {
  transition: all 0.4s;
}
.page-leave-to {
  opacity: 0;
  filter: blur(0.5rem);
}
</style>
