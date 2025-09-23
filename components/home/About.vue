<script setup lang="ts">
const hoveredImageIndex = ref(-1)

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
</script>

<template>
  <div
    id="about-section"
    class="relative z-0 min-h-screen w-full"
  >
    <section class="container flex flex-col sm:flex-row">
      <div class="flex flex-col items-start sm:w-1/2 xl:mb-[72px]">
        <NuxtImg
          ref="aboutPhotoL1Ref"
          src="/images/aboutPhotoL1.webp"
          alt="about"
          width="360"
          height="240"
          class="blue-shadow about-img-filter relative hidden w-full sm:left-0 sm:mt-[300px] sm:block sm:max-w-[280px] xl:left-[120px] xl:mt-[900px] xl:max-w-[360px]"
          :class="{ 'is-hovered': hoveredImageIndex === 1 }"
        />
        <NuxtImg
          ref="aboutPhotoL2Ref"
          src="/images/aboutPhotoL2.webp"
          alt="about"
          width="360"
          height="240"
          class="blue-shadow about-img-filter relative mt-[160px] hidden w-full sm:left-10 sm:block sm:max-w-[280px] xl:-left-10 xl:max-w-[360px]"
          :class="{ 'is-hovered': hoveredImageIndex === 2 }"
        />
        <NuxtImg
          ref="aboutPhotoL3Ref"
          src="/images/aboutPhotoL3.webp"
          alt="about"
          width="439"
          height="293"
          class="blue-shadow about-img-filter relative w-full sm:left-0 sm:mt-[250px] sm:max-w-[360px] xl:left-10 xl:max-w-[439px]"
          :class="{ 'is-hovered': hoveredImageIndex === 3 }"
        />
      </div>

      <div class="container relative flex justify-center">
        <HomeAboutCard />
      </div>

      <div class="flex flex-col items-end sm:w-1/2">
        <NuxtImg
          ref="aboutPhotoR1Ref"
          src="/images/aboutPhotoR1.webp"
          alt="about"
          width="420"
          height="280"
          class="blue-shadow about-img-filter relative hidden w-full sm:right-10 sm:mt-[150px] sm:block sm:max-w-[280px] xl:right-20 xl:mt-[590px] xl:max-w-[420px]"
          :class="{ 'is-hovered': hoveredImageIndex === 4 }"
        />
        <NuxtImg
          ref="aboutPhotoR2Ref"
          src="/images/aboutPhotoR2.webp"
          alt="about"
          width="480"
          height="320"
          class="blue-shadow about-img-filter relative w-full sm:-right-10 sm:mt-[200px] sm:max-w-[360px] xl:right-0 xl:mt-[160px] xl:max-w-[439px]"
          :class="{ 'is-hovered': hoveredImageIndex === 5 }"
        />
        <NuxtImg
          ref="aboutPhotoR3Ref"
          src="/images/aboutPhotoR3.webp"
          alt="about"
          width="240"
          height="160"
          class="blue-shadow about-img-filter relative hidden w-full sm:right-10 sm:mt-[200px] sm:block sm:max-w-[240px] xl:right-[120px] xl:mt-[280px]"
          :class="{ 'is-hovered': hoveredImageIndex === 6 }"
        />
      </div>
    </section>
  </div>
</template>
