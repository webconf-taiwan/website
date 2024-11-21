<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import { sponsorsData } from '~/constants/sponsors'

const { $gsap } = useNuxtApp()

const breakpoints = useBreakpoints(breakpointsTailwind)
const desktop = breakpoints.greater('lg')

const parallaxSection = ref<HTMLElement | null>(null)

const parallaxSectionToPositionY = computed(() => {
  return desktop.value ? -250 : -150
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
    class="full-bleed relative z-10 mt-20 bg-black px-5 py-20 sm:mt-32 lg:-mt-20"
  >
    <div class="mx-auto max-w-[1096px] space-y-[60px] md:space-y-16">
      <SponsorList
        :sponsor-list="sponsorsData.sponsors"
        type-name="贊助商"
        intro-title="贊助商"
      />

      <SponsorList
        :sponsor-list="sponsorsData.specialSponsors"
        type-name="特別贊助"
        intro-title="贊助商"
      />
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
