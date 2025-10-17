<script setup lang="ts">
import { useBreakpoints } from '@vueuse/core'
import { EXTERNAL_LINKS } from '~/constants/external-links'

const ctaCard = ref(null)
const ctaContainer = ref(null)
const gsap = useGsap()

const breakpoints = useBreakpoints({
  sm: 640,
})

const isTablet = breakpoints.greaterOrEqual('sm')
let scrollTrigger: any = null

function initAnimation() {
  if (!ctaCard.value || !ctaContainer.value)
    return

  if (scrollTrigger) {
    scrollTrigger.kill()
  }
  gsap.killTweensOf(ctaCard.value)

  nextTick(() => {
    requestAnimationFrame(() => {
      // 初始設定：保持 CSS 定位，只控制 Y 軸移動
      gsap.set(ctaCard.value, {
        y: '100vh', // 從螢幕下方開始
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ctaContainer.value,
          start: 'top top',
          end: 'bottom center',
          pin: true,
          pinSpacing: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          preventOverlaps: true,
          scrub: 2,
          onRefresh: () => {
            // 存儲 ScrollTrigger 實例以便後續清理
            scrollTrigger = tl.scrollTrigger
          },
        },
      })

      tl.to(ctaCard.value, {
        ease: 'power2.out',
        y: 0, // 滑到原本的位置
      })

      scrollTrigger = tl.scrollTrigger
    })
  })
}

function resetAnimation() {
  if (!ctaCard.value)
    return

  // 清理 ScrollTrigger
  if (scrollTrigger) {
    scrollTrigger.kill()
    scrollTrigger = null
  }

  // 清除所有動畫
  gsap.killTweensOf(ctaCard.value)

  // 回復初始狀態 - 清除所有 GSAP 屬性，讓 CSS 接管
  gsap.set(ctaCard.value, {
    clearProps: 'all',
  })
}

onMounted(() => {
  if (!ctaCard.value || !ctaContainer.value)
    return

  if (isTablet.value) {
    initAnimation()
  }
  else {
    resetAnimation()
  }
})

// 監聽 breakpoint 變化
watch(isTablet, (newValue) => {
  if (newValue) {
    // 切換到平板模式，初始化動畫
    initAnimation()
  }
  else {
    // 切換到非平板模式，中斷動畫並回復初始狀態
    resetAnimation()
  }
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
              src="/images/CTATitleLogo.webp"
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
  background-image: url("/images/CTABg.webp");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
