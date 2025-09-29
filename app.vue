<script setup lang="ts">
const { isFirstLoad } = useGlobalState()

defineOgImage({
  url: 'https://2025.webconf.tw/images/seo/ogImage.png',
  width: 1200,
  height: 630,
  alt: 'WebConf Taiwan 2025',
})

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
