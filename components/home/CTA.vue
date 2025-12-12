<script setup lang="ts">
import { EXTERNAL_LINKS } from '~/constants/externalLinks'

const ctaCard = ref<HTMLElement | null>(null)
const ctaContainer = ref<HTMLElement | null>(null)
const { gsap } = useGsap()

let matchMedia: gsap.MatchMedia | null = null
let resizeTimeout: NodeJS.Timeout | null = null

function initScrollAnimation() {
  // 先清理舊的動畫
  if (matchMedia) {
    matchMedia.revert()
  }

  matchMedia = gsap.matchMedia()

  if (!ctaCard.value || !ctaContainer.value || matchMedia === null)
    return

  matchMedia.add('(min-width: 640px)', () => {
    const updateCardPosition = () => {
      const containerHeight = ctaContainer.value!.offsetHeight
      const cardHeight = ctaCard.value!.offsetHeight
      const startY = (containerHeight - cardHeight) / 2 + containerHeight / 2
      return startY
    }

    // 初始設定卡片位置
    gsap.set(ctaCard.value, {
      y: updateCardPosition(),
    })

    // 建立滾動時間軸
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ctaContainer.value,
        start: 'top top',
        end: 'bottom center',
        pin: true,
        pinSpacing: true,
        scrub: 2,
      },
    })

    timeline.to(ctaCard.value, {
      y: 0,
      ease: 'power2.out',
    })

    // 清理函數
    return () => {
      timeline.scrollTrigger?.kill()
      timeline.kill()
      gsap.set(ctaCard.value!, { clearProps: 'all' })
    }
  })
}

// Resize 處理函數 - 完全重新初始化
function handleResize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }

  resizeTimeout = setTimeout(() => {
    // 使用 macrotask 確保 DOM 完全更新
    setTimeout(() => {
      initScrollAnimation()
      gsap.ScrollTrigger.refresh()
    }, 0)
  }, 200)
}

// 生命週期
onMounted(() => {
  setTimeout(() => {
    initScrollAnimation()
    gsap.ScrollTrigger.refresh()
  }, 100)

  // 監聽 resize 事件
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  // 清理 resize 監聽器
  window.removeEventListener('resize', handleResize)

  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }

  matchMedia?.revert()
})
</script>

<template>
  <section>
    <div v-arrow="{ speed1: '10s', color: '#E6E6E6' }"></div>
    <div
      ref="ctaContainer"
      class="cta-section relative aspect-[3/2] overflow-hidden border-t-[0.5px] border-webconf-gray bg-black sm:aspect-auto sm:min-h-screen"
    >
      <div class="flex h-full items-center justify-center overflow-hidden">
        <div
          ref="ctaCard"
          class="hidden w-full sm:block md:max-w-[524px] lg:max-w-[647px]"
        >
          <ShareGradientDotsCard class="max-w-none text-center">
            <div class="flex flex-col items-center pb-10 pt-4 sm:py-0">
              <div class="pb-6 sm:pb-10">
                <NuxtImg
                  src="/images/home/CTA/CTATitleLogo.svg"
                  alt="2025 WebConf Taiwan"
                  width="409"
                  height="60"
                  loading="lazy"
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
                aria-label="前往 WebConf 2025 購票頁面"
              >
                前往購票
              </ShareLinkButton>
            </div>
          </ShareGradientDotsCard>
        </div>
      </div>
    </div>
    <div class="block w-full md:hidden">
      <ShareGradientDotsCard class="max-w-none text-center">
        <div class="flex flex-col items-center pb-10 pt-4 sm:py-0">
          <div class="pb-6 sm:pb-10">
            <NuxtImg
              src="/images/home/CTA/CTATitleLogo.svg"
              alt="2025 WebConf Taiwan"
              width="409"
              height="60"
              loading="lazy"
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
            aria-label="前往 WebConf 2025 購票頁面"
          >
            前往購票
          </ShareLinkButton>
        </div>
      </ShareGradientDotsCard>
    </div>
  </section>
</template>

<style scoped>
.cta-section {
  background-image: url("/images/home/CTA/CTABg.webp");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
