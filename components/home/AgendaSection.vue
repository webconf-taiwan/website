<script setup lang="ts">
import cubeAnimation from '~/assets/lottie/cube_animation.json'

const { $gsap } = useNuxtApp()

const parallaxSection = ref<HTMLElement | null>(null)

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
    y: -250,
    ease: 'power2.out',
  })
})
</script>

<template>
  <section
    ref="parallaxSection"
    class="full-bleed relative bg-black px-5 py-20"
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

        <div class="hidden items-center gap-x-6 lg:flex">
          <button
            type="button"
            class="flex items-center justify-center gap-x-2 border border-primary-green bg-gradient-to-b from-primary-green/10 to-primary-green/50 px-9 py-4 text-xl"
          >
            <span class="">關於我們</span>
          </button>
          <button
            type="button"
            class="flex items-center justify-center gap-x-2 border border-primary-green bg-gradient-to-b from-primary-green/10 to-primary-green/50 px-9 py-4 text-xl"
          >
            <span class="">查看議程</span>
            <Icon
              name="i-heroicons-arrow-right"
              size="24"
            />
          </button>
        </div>
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
        <button
          type="button"
          class="flex items-center justify-center gap-x-2 border border-primary-green bg-gradient-to-b from-primary-green/10 to-primary-green/50 py-4 text-xl"
        >
          <span class="">關於我們</span>
        </button>
        <button
          type="button"
          class="flex items-center justify-center gap-x-2 border border-primary-green bg-gradient-to-b from-primary-green/10 to-primary-green/50 py-4 text-xl"
        >
          <span class="">查看議程</span>
          <Icon
            name="i-heroicons-arrow-right"
            size="24"
          />
        </button>
      </div>
    </div>

    <div class="trapezoid-top-left"></div>
    <div class="trapezoid-top-right"></div>
    <div class="trapezoid-bottom-center"></div>
  </section>
</template>

<style scope>
.trapezoid-bottom-center {
  background-color: black;
  position: absolute;
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  width: clamp(140px, 50dvw, 400px);
  height: clamp(20px, 3dvw, 32px);
  clip-path: polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%);
}

.trapezoid-top-left {
  background-color: black;
  position: absolute;
  top: 1px;
  left: 0;
  transform: translateY(-100%);
  width: clamp(140px, 30dvw, 360px);
  height: clamp(20px, 3dvw, 32px);
  clip-path: polygon(0% 0%, calc(100% - 20px) 0%, 100% 100%, 0% 100%);
}

.trapezoid-top-right {
  background-color: black;
  position: absolute;
  top: 1px;
  right: 0;
  transform: translateY(-100%);
  width: clamp(140px, 30dvw, 360px);
  height: clamp(20px, 3dvw, 32px);
  clip-path: polygon(calc(0% + 20px) 0%, 100% 0%, 100% 100%, 0% 100%);
}
</style>
