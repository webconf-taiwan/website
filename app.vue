<script setup lang="ts">
useSeoMeta({
  ogImage: 'https://webconf.tw/images/seo/ogImage.png',
  ogImageAlt: 'WebConf Taiwan 2025',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterImage: 'https://webconf.tw/images/seo/ogImage.png',
  twitterImageAlt: 'WebConf Taiwan 2025',
})

const isProduction = import.meta.env.PROD

if (isProduction) {
  useScript({
    'src': 'https://a.5xcamp.us/script.js',
    'defer': true,
    'data-website-id': '41664933-5ac4-4e59-ad44-2b69cc1dbbf4',
  })

  // Microsoft Clarity
  useHead({
    script: [
      {
        type: 'text/javascript',
        innerHTML: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "tyuse8vx6a");
        `,
      },
    ],
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
