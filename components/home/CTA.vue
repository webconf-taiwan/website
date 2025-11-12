<script setup lang="ts">
import { EXTERNAL_LINKS } from '~/constants/externalLinks'

const ctaCard = ref(null)
const ctaContainer = ref(null)
const { gsap } = useGsap()
let mm: any = null

onMounted(() => {
  nextTick(() => {
    requestAnimationFrame(() => {
      if (!ctaCard.value || !ctaContainer.value)
        return

      mm = gsap.matchMedia()

      mm.add('(min-width: 768px)', () => {
        const resetForMeasure = () => {
          gsap.set(ctaCard.value, { yPercent: 100 })
        }

        resetForMeasure()

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ctaContainer.value,
            start: 'top top',
            end: 'bottom center',
            pin: true,
            pinSpacing: true,
            scrub: 2,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            preventOverlaps: true,
            onRefreshInit: resetForMeasure,
          },
        })

        tl.to(ctaCard.value, {
          yPercent: 0,
          ease: 'power2.out',
        })
        return () => {
          tl.scrollTrigger?.kill()
          tl.kill()
          gsap.set(ctaCard.value, { clearProps: 'all' })
        }
      })
    })
  })
})

onBeforeUnmount(() => {
  mm?.revert()
})
</script>

<template>
  <section v-arrow="{ speed1: '10s', color: '#E6E6E6' }">
    <div
      ref="ctaContainer"
      class="cta-section relative aspect-[3/2] overflow-y-clip border-t-[0.5px] border-webconf-gray bg-black sm:aspect-auto sm:min-h-screen"
    ></div>
    <div
      ref="ctaCard"
      class="relative left-auto top-auto w-full translate-x-0 translate-y-0 sm:absolute sm:left-1/2 sm:top-1/2 sm:max-w-[524px] sm:-translate-x-1/2 sm:-translate-y-1/2 lg:max-w-[647px]"
    >
      <ShareGradientDotsCard class="max-w-none text-center">
        <div class="flex flex-col items-center pb-10 pt-4 sm:py-0">
          <div class="pic pb-6 sm:pb-10">
            <NuxtImg
              src="/images/home/CTA/CTATitleLogo.svg"
              alt="2025 webconf CTA"
              width="409"
              height="60"
            />
          </div>
          <p class="pb-10 text-left text-body-16 text-white sm:pb-[60px]">
            這裡不只是分享最新網頁技術趨勢的舞台，更是你與專家、愛好者交流的最佳機會。今年我們將聚焦
            AI、機器學習和優化使用者體驗設計，帶來滿滿的靈感與實用經驗。誠摯邀請你一起加入，和來自各地的技術人碰撞想法，共同探索網頁未來的無限可能！
          </p>
          <ShareLinkButton
            :to="EXTERNAL_LINKS.CONF_TICKET_URL"
            target="_blank"
            rel="noopener noreferrer"
          >
            前往購票
          </ShareLinkButton>
        </div>
      </ShareGradientDotsCard>
    </div>
  </section>
</template>

<style>
.cta-section {
  background-image: url("/images/home/CTA/CTABg.webp");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
