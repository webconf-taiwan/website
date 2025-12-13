<script setup lang="ts">
const hoveredImageIndex = ref(-1)
const { gsap, ScrollTrigger } = useGsap()
const { width } = useWindowSize()

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

interface ScrollTriggerInstance {
  instance: any
  element: HTMLElement
}
const scrollTriggerInstances = ref<ScrollTriggerInstance[]>([])
let resizeTimeout: NodeJS.Timeout | null = null
const isInitialized = ref(false)

function cleanupScrollTriggers() {
  scrollTriggerInstances.value.forEach(({ instance, element }) => {
    if (instance) {
      instance.kill()
    }
    // 清除 GSAP 設定的樣式，讓元素回到原始位置
    gsap.set(element, { clearProps: 'all' })
  })
  scrollTriggerInstances.value = []
}

function initParallaxEffect() {
  cleanupScrollTriggers()

  // sm 以下不啟動滾動視差效果
  if (width.value < 640) {
    isInitialized.value = true
    return
  }

  const images = [
    { ref: aboutPhotoL1Ref, y: 300 },
    { ref: aboutPhotoL2Ref, y: 200 },
    { ref: aboutPhotoL3Ref, y: 150 },
    { ref: aboutPhotoR1Ref, y: 200 },
    { ref: aboutPhotoR2Ref, y: 100 },
    { ref: aboutPhotoR3Ref, y: 250 },
  ]

  images.forEach(({ ref, y }) => {
    if (ref.value) {
      const element = (ref.value as any).$el || ref.value

      const animation = gsap.from(element, {
        y,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom center',
          scrub: 2,
          toggleActions: 'play none none reverse',
          // 防止初始化時的抖動
          invalidateOnRefresh: true,
        },
      })

      if (animation.scrollTrigger) {
        scrollTriggerInstances.value.push({
          instance: animation.scrollTrigger,
          element,
        })
      }
    }
  })

  isInitialized.value = true
}

function handleResize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }

  resizeTimeout = setTimeout(() => {
    initParallaxEffect()
    // 延遲 refresh 確保元素已經重新定位
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })
  }, 200)
}

watch(width, handleResize)

onMounted(() => {
  // 等待頁面完全載入和 ScrollTrigger 初始化
  nextTick(() => {
    setTimeout(() => {
      initParallaxEffect()
      // 使用 requestAnimationFrame 確保在下一幀才 refresh
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })
    }, 150)
  })
})

onBeforeUnmount(() => {
  cleanupScrollTriggers()
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
/* 確保圖片在視差效果初始化前有正確的位置 */
.about-photo {
  /* 防止 GSAP 初始化時的閃爍 */
  will-change: transform;
}

/* 手機版確保圖片位置正確（不受視差效果影響） */
@media (max-width: 639px) {
  .about-photo {
    transform: translate3d(0, 0, 0) !important;
  }
}
</style>
