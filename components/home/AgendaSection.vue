<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import cubeAnimation from '~/assets/lottie/cube_animation.json'

const { $gsap } = useNuxtApp()

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')

const parallaxSection = ref<HTMLElement | null>(null)

const parallaxSectionToPositionY = computed(() => {
  return isSmallerLg.value ? -150 : -250
})

const aboutUsDrawer = useTemplateRef('aboutUsDrawer')

const drawerSlideDirection = computed(() => {
  return isSmallerLg.value ? 'slide-up' : 'slide-left'
})

onMounted(() => {
  if (!parallaxSection.value)
    return

  const tl = $gsap.timeline({
    scrollTrigger: {
      trigger: parallaxSection.value,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  })

  tl.fromTo(parallaxSection.value, {
    y: 0,
  }, {
    y: parallaxSectionToPositionY.value,
    ease: 'power2.out',
  })
})
</script>

<template>
  <section
    ref="parallaxSection"
    class="full-bleed relative z-10 mt-40 bg-black px-5 py-36 sm:mt-28 lg:-mt-8"
  >
    <div class="mx-auto max-w-[1096px]">
      <div class="mb-8 flex items-center justify-start lg:justify-between">
        <HomeSectionTitle>
          <template #title>
            AGENDA
          </template>
          <template #subTitle>
            議程
          </template>
        </HomeSectionTitle>

        <Button
          type="button"
          variant="custom"
          size="custom"
          rounded="none"
          class="hidden lg:block"
          @click="aboutUsDrawer?.open()"
        >
          <span class="text-xl">關於我們</span>
        </Button>

        <Teleport to="body">
          <Drawer
            ref="aboutUsDrawer"
            :slide-direction="drawerSlideDirection"
          >
            <DrawerContentLayout>
              <template #header>
                <HomeSectionTitle>
                  <template #title>
                    About
                  </template>
                  <template #subTitle>
                    關於
                  </template>
                </HomeSectionTitle>
              </template>
              <template #content>
                <div class="space-y-5 text-justify leading-7 tracking-wide lg:flex-1">
                  <p>
                    WebConf Taiwan 是一個聚集網頁技術愛好者和專家的年度盛會，讓大家一起探索網頁技術的演進和未來發展趨勢。過去幾年，網路世界變化迅速，我們將在這次研討會上回顧網頁技術的演變歷程，了解那些改變遊戲規則的關鍵時刻。
                  </p>
                  <p>
                    除了回顧過去，WebConf Taiwan 更專注於未來。我們會討論如何利用人工智慧和機器學習來改善使用者體驗，以及行動優化和響應式設計在現代網頁開發中的重要性。還有最新的業界趨勢分享，幫助企業把握未來發展方向，保持競爭優勢。
                  </p>
                  <p>
                    這將是一個充滿創意和靈感的活動，讓你與來自各地的網頁技術專業人士互動交流，共同探討未來的技術創新和可能性。
                  </p>
                </div>
              </template>
            </DrawerContentLayout>
          </Drawer>
        </Teleport>
      </div>

      <div class="mb-10 flex flex-col items-center gap-8 lg:mb-0 lg:flex-row lg:justify-between">
        <HomeAgendaCubeAnimation
          class="w-[clamp(320px,_60dvw,_100%)] shrink-0 lg:w-[clamp(320px,_50dvw,424px)]"
          :animation-data="cubeAnimation"
          :loop="true"
          :autoplay="true"
          :speed="1"
        />

        <div class="w-full space-y-8 lg:max-w-[536px] lg:space-y-[60px] lg:px-0">
          <HomeAgendaIntroContent>
            <template #title>
              WEB DEVELOPMENT
            </template>
            <template #description>
              包含 Frontend、Backend、DevOps、技術管理等相關議題。將深入探討各種 Web 技術的最新趨勢、過往發展，以及如何透過這些技術來提升網站或應用程式的品質、效能與安全性。
            </template>
          </HomeAgendaIntroContent>

          <HomeAgendaIntroContent>
            <template #title>
              UI/UX DESIGN
            </template>
            <template #description>
              本屆科技年會將探討 UI/UX 設計的最新趨勢，包括使用者界面設計、使用者體驗優化、人機互動設計等議題，以深入探討如何打造出引人入勝的用戶體驗，提升產品的價值和競爭力。
            </template>
          </HomeAgendaIntroContent>
        </div>
      </div>

      <div class="mx-auto flex max-w-[180px] flex-col gap-y-4 lg:hidden">
        <Button
          type="button"
          variant="custom"
          size="custom"
          rounded="none"
          class="block lg:hidden"
          @click="aboutUsDrawer?.open()"
        >
          <span class="text-xl">關於我們</span>
        </Button>
      </div>
    </div>

    <div class="trapezoid trapezoid-top-left"></div>
    <div class="trapezoid trapezoid-top-right"></div>
    <div class="trapezoid trapezoid-bottom-center"></div>
  </section>
</template>

<style scoped>
.trapezoid {
  background-color: black;
  position: absolute;
  z-index: -1;
}

.trapezoid-bottom-center {
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  width: clamp(140px, 50dvw, 400px);
  height: clamp(20px, 3dvw, 32px);
  clip-path: polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%);
}

.trapezoid-top-left {
  top: 1px;
  left: 0;
  transform: translateY(-100%);
  width: clamp(140px, 30dvw, 360px);
  height: clamp(20px, 3dvw, 32px);
  clip-path: polygon(0% 0%, calc(100% - 20px) 0%, 100% 100%, 0% 100%);
}

.trapezoid-top-right {
  top: 1px;
  right: 0;
  transform: translateY(-100%);
  width: clamp(140px, 30dvw, 360px);
  height: clamp(20px, 3dvw, 32px);
  clip-path: polygon(calc(0% + 20px) 0%, 100% 0%, 100% 100%, 0% 100%);
}
</style>
