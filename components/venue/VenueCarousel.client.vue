<script setup lang="ts">
import type { Carousel, CarouselApi } from '~/components/ui/carousel'
import type { VenueLocation } from '~/types/venue'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import Autoplay from 'embla-carousel-autoplay'

const props = defineProps<{
  locations: VenueLocation[]
}>()

const emit = defineEmits<{
  updateLocationId: [locationId?: string]
}>()

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerOrEqualSm = breakpoints.smallerOrEqual('sm')

const maskClipPath = computed(() => {
  return isSmallerOrEqualSm.value ? 'M144,0 H320 V320 H0 V30 L100,30 Z' : 'M192,0 H424 V424 H0 V40 L132,40 Z'
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

  carouselApi.value?.scrollTo(index, true)
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
  <div class="relative mb-8 mr-0 before:absolute before:left-0 before:top-1 before:h-[1px] before:w-[100px] before:bg-primary-green after:absolute after:left-0 after:top-[14px] after:h-[1px] after:w-[76px] after:bg-primary-green sm:before:top-1.5 sm:before:h-[2px] sm:before:w-[132px] sm:after:top-5 sm:after:h-[2px] sm:after:w-[100px] lg:mb-0 lg:mr-6">
    <svg
      class="absolute"
      width="0"
      height="0"
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
      class="max-w-[424px] before:absolute before:inset-x-0 before:bottom-0 before:z-10 before:h-1.5 before:bg-primary-green"
      style="clip-path: url(#square-with-corner-cut);"
      :opts="{
        align: 'start',
        loop: true,
        duration: 20,
        watchDrag: false,
      }"
      :plugins="[Autoplay({
        delay: 3000,
        stopOnInteraction: false,
      })]"
      @init-api="setApi"
    >
      <CarouselContent class="size-80 sm:size-[424px]">
        <CarouselItem
          v-for="location in locations"
          :key="location.id"
          class="w-full bg-slate-400"
        >
          <div class="relative aspect-[1/1] w-full">
            <NuxtImg
              :src="location.carouselImage"
              :alt="location.text"
              class="h-auto w-full object-cover"
              draggable="false"
            />
          </div>
        </CarouselItem>
      </CarouselContent>

      <template #frame-border>
        <svg
          class="pointer-events-none absolute left-0 top-0 size-full"
          viewBox="0 0 424 424"
        >
          <path
            d="M192,1 H423 V423 H1 V41 L133,41 Z"
            fill="none"
            stroke="var(--primary-green)"
            stroke-width="3"
          />
        </svg>
      </template>
    </Carousel>
  </div>
</template>

<style scoped></style>
