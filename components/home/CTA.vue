<script setup lang="ts">
const ctaCard = ref(null)
const ctaContainer = ref(null)
// const gsap = useGsap()

onMounted(() => {
  // if (!ctaCard.value || !ctaContainer.value)
  //   return
  // gsap.set(ctaCard.value, { y: '100vh' })
  // const tl = gsap.timeline({
  //   scrollTrigger: {
  //     trigger: ctaContainer.value,
  //     start: 'top 80%',
  //     end: 'bottom 80%',
  //     invalidateOnRefresh: true,
  //     anticipatePin: 1,
  //     scrub: 2,
  //   },
  // })
  // tl.to(ctaCard.value, {
  //   y: 0,
  // })
})
</script>

<template>
  <section v-arrow="{ speed1: '10s', color: 'white' }">
    <div
      ref="ctaContainer"
      class="cta-section relative aspect-[3/2] overflow-y-clip border-t-[0.5px] border-webconf-gray bg-black sm:aspect-auto sm:h-screen"
    ></div>
    <div
      ref="ctaCard"
      class="relative left-auto top-auto translate-x-0 translate-y-0 sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
    >
      <ShareGradientDotsCard
        class="max-w-none text-center sm:max-w-[524px] lg:max-w-[647px]"
      >
        <div class="flex flex-col items-center">
          <div class="pic pb-6 sm:pb-10">
            <NuxtImg
              src="/images/CTATitleLogo.webp"
              alt="2025 webconf CTA"
              format="webp"
              width="409"
              height="60"
            />
          </div>
          <p class="pb-10 text-left text-body-16 text-white sm:pb-[60px]">
            這裡不只是分享最新網頁技術趨勢的舞台，更是你與專家、愛好者交流的最佳機會。今年我們將聚焦
            AI、機器學習和優化使用者體驗設計，帶來滿滿的靈感與實用經驗。誠摯邀請你一起加入，和來自各地的技術人碰撞想法，共同探索網頁未來的無限可能！
          </p>
          <ShareLinkButton to="#">
            前往購票
          </ShareLinkButton>
        </div>
      </ShareGradientDotsCard>
    </div>
  </section>
</template>

<style>
.cta-section {
  background-image: url("/images/CTABg.webp");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

@media (min-width: 640px) {
  .cta-section {
    background-attachment: fixed;
  }
}
</style>
