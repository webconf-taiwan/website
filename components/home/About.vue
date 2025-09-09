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
    <HomeAboutCard />

    <section class="about-img-wrapper flex">
      <div class="flex w-1/2 flex-col items-start">
        <NuxtImg
          ref="aboutPhotoL1Ref"
          src="/images/aboutPhotoL1.webp"
          alt="about"
          width="360"
          height="240"
          class="blue-shadow about-img-filter relative left-[120px] mt-[900px]"
          :class="{ 'is-hovered': hoveredImageIndex === 1 }"
        />
        <NuxtImg
          ref="aboutPhotoL2Ref"
          src="/images/aboutPhotoL2.webp"
          alt="about"
          width="360"
          height="240"
          class="blue-shadow about-img-filter relative -left-10 mt-[160px]"
          :class="{ 'is-hovered': hoveredImageIndex === 2 }"
        />
        <NuxtImg
          ref="aboutPhotoL3Ref"
          src="/images/aboutPhotoL3.webp"
          alt="about"
          width="439"
          height="293"
          class="blue-shadow about-img-filter relative left-10 mb-[72px] mt-[250px]"
          :class="{ 'is-hovered': hoveredImageIndex === 3 }"
        />
      </div>

      <div class="flex w-1/2 flex-col items-end">
        <NuxtImg
          ref="aboutPhotoR1Ref"
          src="/images/aboutPhotoR1.webp"
          alt="about"
          width="420"
          height="280"
          class="blue-shadow about-img-filter relative right-20 mt-[590px]"
          :class="{ 'is-hovered': hoveredImageIndex === 4 }"
        />
        <NuxtImg
          ref="aboutPhotoR2Ref"
          src="/images/aboutPhotoR2.webp"
          alt="about"
          width="480"
          height="320"
          class="blue-shadow about-img-filter relative right-0 mt-[160px]"
          :class="{ 'is-hovered': hoveredImageIndex === 5 }"
        />
        <NuxtImg
          ref="aboutPhotoR3Ref"
          src="/images/aboutPhotoR3.webp"
          alt="about"
          width="240"
          height="160"
          class="blue-shadow about-img-filter relative right-[120px] mt-[280px]"
          :class="{ 'is-hovered': hoveredImageIndex === 6 }"
        />
      </div>
    </section>
  </div>
</template>
