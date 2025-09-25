<script setup lang="ts">
const hoveredImageIndex = ref(-1)
const gsap = useGsap()

// 定義圖片配置
const imageConfigs = [
  { id: 1, src: '/images/aboutPhotoL1.webp', y: 400, side: 'left', order: 1 },
  { id: 2, src: '/images/aboutPhotoL2.webp', y: 200, side: 'left', order: 2 },
  { id: 3, src: '/images/aboutPhotoL3.webp', y: 300, side: 'left', order: 3 },
  { id: 4, src: '/images/aboutPhotoR1.webp', y: 200, side: 'right', order: 1 },
  { id: 5, src: '/images/aboutPhotoR2.webp', y: 100, side: 'right', order: 2 },
  { id: 6, src: '/images/aboutPhotoR3.webp', y: 400, side: 'right', order: 3 },
]

// 圖片實例
const imageRefs = imageConfigs.map(() =>
  ref<Element | ComponentPublicInstance | null>(null),
)

// 統一管理 hover 效果
function setupImageHoverEffects() {
  imageRefs.forEach((ref, index) => {
    const { isOutside } = useMouseInElement(ref as any)

    watch(isOutside, (isOutsideValue) => {
      hoveredImageIndex.value = isOutsideValue ? -1 : index + 1
    })
  })
}

setupImageHoverEffects()

// 設定滾動視差效果
onMounted(() => {
  const images = imageConfigs.map((config, index) => ({
    ref: imageRefs[index],
    y: config.y,
  }))

  images.forEach(({ ref, y }) => {
    if (ref.value) {
      const element = ref.value.$el || ref.value

      // 保存原始位置
      const _originalY = window.getComputedStyle(element).transform

      gsap.from(element, {
        y,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom center',
          scrub: true,
          markers: true,
          toggleActions: 'play none none reverse',
        },
      })
    }
  })
})
</script>

<template>
  <div
    id="about-section"
    class="relative z-0 min-h-screen w-full"
  >
    <section class="container flex flex-col sm:flex-row">
      <div class="flex flex-col items-start sm:w-1/2 xl:mb-[72px]">
        <template
          v-for="config in imageConfigs.filter((img) => img.side === 'left')"
          :key="config.id"
        >
          <NuxtImg
            :ref="
              (el) => {
                if (el) imageRefs[config.id - 1].value = el;
              }
            "
            :src="config.src"
            alt="about"
            :width="config.order === 3 ? 439 : 360"
            :height="config.order === 3 ? 293 : 240"
            class="blue-shadow about-img-filter relative w-full"
            :class="[
              { 'is-hovered': hoveredImageIndex === config.id },
              config.order === 1
                && 'hidden sm:left-0 sm:mt-[300px] sm:block sm:max-w-[280px] xl:left-[120px] xl:mt-[260px] xl:max-w-[360px]',
              config.order === 2
                && 'mt-[160px] hidden w-full sm:left-10 sm:block sm:max-w-[280px] xl:-left-10 xl:max-w-[360px]',
              config.order === 3
                && 'sm:left-0 sm:mt-[250px] sm:max-w-[360px] xl:left-10 xl:max-w-[439px]',
            ]"
          />
        </template>
      </div>

      <div class="container relative flex justify-center">
        <HomeAboutCard />
      </div>

      <div class="flex flex-col items-end sm:w-1/2">
        <template
          v-for="(config, index) in imageConfigs.filter(
            (img) => img.side === 'right',
          )"
          :key="config.id"
        >
          <NuxtImg
            :ref="
              (el) => {
                if (el) imageRefs[config.id - 1].value = el;
              }
            "
            :src="config.src"
            alt="about"
            :width="config.order === 1 ? 420 : config.order === 2 ? 480 : 240"
            :height="config.order === 1 ? 280 : config.order === 2 ? 320 : 160"
            class="blue-shadow about-img-filter relative w-full"
            :class="[
              { 'is-hovered': hoveredImageIndex === config.id },
              config.order === 1
                && 'hidden sm:right-10 sm:mt-[150px] sm:block sm:max-w-[280px] xl:right-20 xl:mt-[120px] xl:max-w-[420px]',
              config.order === 2
                && 'sm:-right-10 sm:mt-[200px] sm:max-w-[360px] xl:right-0 xl:mt-[160px] xl:max-w-[439px]',
              config.order === 3
                && 'hidden sm:right-10 sm:mt-[200px] sm:block sm:max-w-[240px] xl:right-[120px] xl:mt-[280px]',
            ]"
          />
        </template>
      </div>
    </section>
  </div>
</template>
