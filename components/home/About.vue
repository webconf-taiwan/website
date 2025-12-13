<script setup lang="ts">
const hoveredImageIndex = ref(-1)
const { gsap, ScrollTrigger } = useGsap()

function useImageHoverEffect(index: number) {
  const imageRef = ref<HTMLElement | null>(null)
  const { isOutside } = useMouseInElement(imageRef)

  watch(isOutside, (isOutsideValue) => {
    if (!isOutsideValue) {
      hoveredImageIndex.value = index
    }
    else {
      hoveredImageIndex.value = -1
    }
  })
  return imageRef
}

const aboutPhotoL1Ref = useImageHoverEffect(1)
const aboutPhotoL2Ref = useImageHoverEffect(2)
const aboutPhotoL3Ref = useImageHoverEffect(3)
const aboutPhotoR1Ref = useImageHoverEffect(4)
const aboutPhotoR2Ref = useImageHoverEffect(5)
const aboutPhotoR3Ref = useImageHoverEffect(6)

let matchMedia: gsap.MatchMedia | null = null
let resizeTimeout: NodeJS.Timeout | null = null

function cleanupAnimations() {
  if (matchMedia) {
    matchMedia.revert()
    matchMedia = null
  }
}

function initParallaxEffect() {
  // 清理舊的動畫
  cleanupAnimations()

  // 使用 GSAP matchMedia 處理響應式
  matchMedia = gsap.matchMedia()

  const images = [
    { ref: aboutPhotoL1Ref, y: 300 },
    { ref: aboutPhotoL2Ref, y: 200 },
    { ref: aboutPhotoL3Ref, y: 150 },
    { ref: aboutPhotoR1Ref, y: 200 },
    { ref: aboutPhotoR2Ref, y: 100 },
    { ref: aboutPhotoR3Ref, y: 250 },
  ]

  if (!matchMedia)
    return

  // 只在 sm 以上啟動視差效果
  matchMedia.add('(min-width: 640px)', () => {
    images.forEach(({ ref, y }) => {
      if (ref.value) {
        const element = (ref.value as any).$el || ref.value

        gsap.fromTo(
          element,
          {
            y,
          },
          {
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: element,
              start: 'top bottom',
              end: 'bottom center',
              scrub: 2,
            },
          },
        )
      }
    })

    // 清理函數會自動被 matchMedia.revert() 呼叫
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (
          images.some(({ ref }) => {
            const element = (ref.value as any)?.$el || ref.value
            return trigger.trigger === element
          })
        ) {
          trigger.kill()
        }
      })
    }
  })
}

function handleResize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }

  resizeTimeout = setTimeout(() => {
    initParallaxEffect()
    ScrollTrigger.refresh()
  }, 200)
}

onMounted(() => {
  // 等待 DOM 和 GSAP plugin 完全初始化
  setTimeout(() => {
    initParallaxEffect()
    ScrollTrigger.refresh()
  }, 100)

  // 監聽 resize 事件
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  cleanupAnimations()
  window.removeEventListener('resize', handleResize)
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
})
</script>

<template>
  <div
    id="about-section"
    class="relative z-0 min-h-screen w-full"
  >
    <section class="container flex flex-col justify-center sm:flex-row">
      <div class="flex flex-col items-start sm:w-1/2 md:mb-[72px]">
        <NuxtImg
          ref="aboutPhotoL1Ref"
          src="/images/home/about/left-1.webp"
          alt="about"
          width="768"
          height="512"
          class="blue-shadow about-img-filter about-photo relative hidden w-full sm:left-0 sm:mt-[300px] sm:block sm:max-w-[280px] xl:left-[120px] xl:mt-[260px] xl:max-w-[360px]"
          :class="{ 'is-hovered': hoveredImageIndex === 1 }"
        />
        <NuxtImg
          ref="aboutPhotoL2Ref"
          src="/images/home/about/left-2.webp"
          alt="about"
          width="768"
          height="512"
          class="blue-shadow about-img-filter about-photo relative mt-[160px] hidden w-full sm:left-10 sm:block sm:max-w-[280px] xl:-left-10 xl:mt-[160px] xl:max-w-[360px]"
          :class="{ 'is-hovered': hoveredImageIndex === 2 }"
        />
        <NuxtImg
          ref="aboutPhotoL3Ref"
          src="/images/home/about/left-3.webp"
          alt="about"
          width="768"
          height="512"
          class="blue-shadow about-img-filter about-photo relative w-full sm:left-0 sm:mt-[250px] sm:max-w-[360px] xl:left-10 xl:mt-[150px] xl:max-w-[439px]"
          :class="{ 'is-hovered': hoveredImageIndex === 3 }"
        />
      </div>

      <HomeAboutCard />

      <div class="flex flex-col items-end sm:w-1/2">
        <NuxtImg
          ref="aboutPhotoR1Ref"
          src="/images/home/about/right-1.webp"
          alt="about"
          width="768"
          height="512"
          class="blue-shadow about-img-filter about-photo relative hidden w-full sm:right-10 sm:mt-[150px] sm:block sm:max-w-[280px] xl:right-20 xl:mt-[120px] xl:max-w-[420px]"
          :class="{ 'is-hovered': hoveredImageIndex === 4 }"
        />
        <NuxtImg
          ref="aboutPhotoR2Ref"
          src="/images/home/about/right-2.webp"
          alt="about"
          width="768"
          height="512"
          class="blue-shadow about-img-filter about-photo relative w-full sm:-right-10 sm:mt-[200px] sm:max-w-[360px] xl:right-0 xl:mt-[160px] xl:max-w-[439px]"
          :class="{ 'is-hovered': hoveredImageIndex === 5 }"
        />
        <NuxtImg
          ref="aboutPhotoR3Ref"
          src="/images/home/about/right-3.webp"
          alt="about"
          width="768"
          height="512"
          class="blue-shadow about-img-filter about-photo relative hidden w-full sm:right-10 sm:mt-[200px] sm:block sm:max-w-[240px] xl:right-[120px] xl:mt-[180px]"
          :class="{ 'is-hovered': hoveredImageIndex === 6 }"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-photo {
  /* 硬體加速，提升動畫效能 */
  will-change: transform;
  transform: translate3d(0, 0, 0);
}
</style>
