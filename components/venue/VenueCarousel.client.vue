<script setup lang="ts">
import type { Carousel, CarouselApi } from '~/components/ui/carousel'
import type { VenueLocation } from '~/types/venue'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import Autoplay from 'embla-carousel-autoplay'
import Fade from 'embla-carousel-fade'

const props = defineProps<{
  locations: VenueLocation[]
}>()

const emit = defineEmits<{
  updateLocationId: [locationId?: string]
}>()

const breakpoints = useBreakpoints(breakpointsTailwind)
const isLargerOrEqualSm = breakpoints.greaterOrEqual('sm')
const isLargerOrEqualLg = breakpoints.greaterOrEqual('lg')

const carrouselImageSrcSuffix = computed(() => {
  if (isLargerOrEqualLg.value)
    return ''

  return '_sm'
})

const maskClipPathMap = {
  mobile: 'M144,0 H320 V320 H0 V30 L100,30 Z',
  tablet: 'M192,0 H424 V424 H0 V40 L132,40 Z',
  desktop: 'M192,0 H782 V484 H0 V40 L132,40 Z',
}

const maskClipPath = computed(() => {
  if (isLargerOrEqualLg.value)
    return maskClipPathMap.desktop
  else if (isLargerOrEqualSm.value)
    return maskClipPathMap.tablet
  else
    return maskClipPathMap.mobile
})

const frameBorderPathMap = {
  tablet: 'M192,1 H423 V423 H1 V41 L133,41 Z',
  desktop: 'M192,0 H786 V483 H1 V41 L133,41 Z',
}

const frameBorderViewBoxMap = {
  tablet: '0 0 424 424',
  desktop: '0 0 784 484',
}

const frameBorderPath = computed(() => {
  if (isLargerOrEqualLg.value)
    return frameBorderPathMap.desktop
  else
    return frameBorderPathMap.tablet
})

const frameBorderViewBox = computed(() => {
  if (isLargerOrEqualLg.value)
    return frameBorderViewBoxMap.desktop
  else
    return frameBorderViewBoxMap.tablet
})

const carouselContainerRef = ref<InstanceType<typeof Carousel> | null>(null)
const carouselApi = ref<CarouselApi>()
const currentLocationIndex = ref<number | null>(null)

const currentLocationId = computed(() => {
  if (currentLocationIndex.value === null)
    return

  return props.locations[currentLocationIndex.value].id
})

function setApi(val: CarouselApi) {
  carouselApi.value = val
}

watchOnce(carouselApi, (api) => {
  if (!api)
    return

  currentLocationIndex.value = api.selectedScrollSnap()

  api.on('select', () => {
    currentLocationIndex.value = api.selectedScrollSnap()
  })
})
watch(currentLocationId, (locationId) => {
  if (locationId === null)
    return

  emit('updateLocationId', locationId)
})

function selectLocation(locationId: string) {
  const index = props.locations.findIndex(location => location.id === locationId)

  if (index === -1)
    return

  carouselApi.value?.scrollTo(index, false)
}

function stopCarouselAutoplay() {
  carouselApi.value?.plugins().autoplay?.stop()
}

function recoverCarouselAutoplay() {
  carouselApi.value?.plugins().autoplay?.play()
}

defineExpose({
  selectLocation,
  stopCarouselAutoplay,
  recoverCarouselAutoplay,
})
</script>

<template>
  <div class="relative before:absolute before:left-0 before:top-1 before:h-[1px] before:w-[100px] before:bg-primary-green after:absolute after:left-0 after:top-[14px] after:h-[1px] after:w-[76px] after:bg-primary-green sm:before:top-1.5 sm:before:h-[2px] sm:before:w-[132px] sm:after:top-5 sm:after:h-[2px] sm:after:w-[100px]">
    <svg
      class="absolute"
    >
      <defs>
        <clipPath id="square-with-corner-cut">
          <path :d="maskClipPath" />
        </clipPath>
      </defs>
    </svg>

    <Carousel
      ref="carouselContainerRef"
      orientation="horizontal"
      class="max-w-[424px] before:absolute before:inset-x-0 before:bottom-0 before:z-10 before:h-2 before:bg-primary-green lg:max-w-full"
      style="clip-path: url(#square-with-corner-cut);"
      :opts="{
        align: 'center',
        loop: true,
        duration: 20,
        containScroll: false,
      }"
      :plugins="[
        Autoplay({
          delay: 3000,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
        Fade(),
      ]"
      @init-api="setApi"
    >
      <CarouselContent class="size-80 sm:size-[424px] lg:h-[484px] lg:w-[782px]">
        <CarouselItem
          v-for="location in locations"
          :key="location.id"
          class="w-full bg-primary-green/20"
        >
          <div class="relative aspect-[1/1] size-full">
            <NuxtImg
              :src="`${location.carouselImage}${carrouselImageSrcSuffix}.svg`"
              :alt="location.text"
              class="size-full object-cover"
              draggable="false"
            />
          </div>
        </CarouselItem>
      </CarouselContent>

      <template #frame-border>
        <svg
          class="pointer-events-none absolute left-0 top-0 size-full"
          :viewBox="frameBorderViewBox"
        >
          <path
            :d="frameBorderPath"
            fill="none"
            stroke="var(--primary-green)"
            stroke-width="3"
          />
        </svg>
      </template>
    </Carousel>

    <div class="venue-carousel-tag absolute bottom-1 right-0 flex h-8 w-fit items-center justify-center bg-primary-green pl-7 pr-4 font-medium sm:h-12 sm:pl-10 sm:pr-4">
      <span
        class="relative inline-block size-full max-w-[20ch] content-center truncate whitespace-nowrap text-base font-bold tracking-wide text-black sm:text-2xl lg:font-medium"
      >
        瓶蓋工廠台北製造所
      </span>
    </div>
  </div>
</template>

<style scoped>
.venue-carousel-tag {
  clip-path: polygon(calc(0% + 24px) 0%, 100% 0%, 100% 100%, 0% 100%);

  @media screen and (min-width: 640px) {
    clip-path: polygon(calc(0% + 32px) 0%, 100% 0%, 100% 100%, 0% 100%);
  }
}
</style>
