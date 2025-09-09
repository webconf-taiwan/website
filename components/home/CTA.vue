<script setup lang="ts">
import { NuxtImg, ShareGradientDotsCard, ShareLinkButton } from '#components'

const ctaCard = ref(null)
const ctaContainer = ref(null)
const gsap = useGsap()

onMounted(() => {
  if (!ctaCard.value || !ctaContainer.value)
    return

  gsap.set(ctaCard.value, { y: '100vh' })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ctaContainer.value,
      start: 'top 80%',
      end: 'bottom 80%',
      invalidateOnRefresh: true,
      anticipatePin: 1,
      scrub: 2,
    },
  })

  tl.to(ctaCard.value, {
    y: 0,
  })
})
</script>

<template>
  <section v-arrow="{ speed1: '10s', color: 'white' }">
    <div
      ref="ctaContainer"
      class="cta-section grid aspect-[2/1] place-content-center overflow-y-clip border-t-[0.5px] border-webconf-gray bg-black"
    >
      <div ref="ctaCard">
        <ShareGradientDotsCard
          class="text-center sm:max-w-[447px] lg:max-w-[647px]"
        >
          <div class="flex flex-col items-center">
            <div class="pic px-[59.42px] pb-10">
              <NuxtImg
                src="/images/CTATitleLogo.png"
                alt="2025 webconf CTA"
                width="409"
                height="60"
              />
            </div>
            <p class="pb-[60px] text-left text-body-16 text-white">
              這裡不只是分享最新網頁技術趨勢的舞台，更是你與專家、愛好者交流的最佳機會。今年我們將聚焦
              AI、機器學習和優化使用者體驗設計，帶來滿滿的靈感與實用經驗。誠摯邀請你一起加入，和來自各地的技術人碰撞想法，共同探索網頁未來的無限可能！
            </p>
            <ShareLinkButton to="#">
              前往購票
            </ShareLinkButton>
          </div>
        </ShareGradientDotsCard>
      </div>
    </div>
  </section>
</template>

<style>
.cta-section {
  background-image: url("/images/CTABg.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}
</style>
