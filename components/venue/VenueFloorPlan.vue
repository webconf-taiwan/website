<script setup lang="ts">
import type { VenueLocation } from '~/types/venue'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { venueLocations } from '~/constants/venue'

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')

const currentLocationId = ref<string | undefined>()
const canExecuteSelectLocation = ref(false)
const venueCarouselRef = useTemplateRef('venueCarouselRef')

const carouselLocations = venueLocations.filter(location => !!location.carouselImage)

function filterLocationTextColor(location: VenueLocation) {
  if (!location.isOpen)
    return 'text-white/85'

  if (currentLocationId.value === location.id)
    return 'text-primary-green'

  return 'text-white'
}

const { start: startSelectTimer, stop: stopSelectTimer } = useTimeoutFn((locationId) => {
  canExecuteSelectLocation.value = true
  selectLocation(locationId)
}, 500)

const { start: startRecoverAutoplayTimer } = useTimeoutFn(() => {
  venueCarouselRef.value?.recoverCarouselAutoplay()
  canExecuteSelectLocation.value = false
}, 3000)

function updateLocationId(locationId?: string) {
  currentLocationId.value = locationId
}

function selectLocation(locationId: string) {
  venueCarouselRef.value?.selectLocation(locationId)
}

function enterLocationHandler(locationId: string) {
  if (isSmallerLg.value)
    return

  venueCarouselRef.value?.stopCarouselAutoplay()
  canExecuteSelectLocation.value = false
  startSelectTimer(locationId)
}

function leaveLocationHandler() {
  if (isSmallerLg.value)
    return

  venueCarouselRef.value?.recoverCarouselAutoplay()
  stopSelectTimer()
  canExecuteSelectLocation.value = false
}

function clickLocationHandler(locationId: string) {
  if (!isSmallerLg.value)
    return

  canExecuteSelectLocation.value = true
  selectLocation(locationId)
  venueCarouselRef.value?.stopCarouselAutoplay()
  startRecoverAutoplayTimer()
}
</script>

<template>
  <section>
    <VenueTitle class="z-10 mb-9 max-lg:sticky max-lg:left-0 max-lg:top-12 ">
      <template #title>
        VENUE FLOOR PLAN
      </template>
      <template #subTitle>
        場館平面圖
      </template>
    </VenueTitle>

    <div class="flex flex-col items-center lg:flex-row lg:items-stretch">
      <!-- Venue carousel -->
      <VenueCarousel
        ref="venueCarouselRef"
        :locations="carouselLocations"
        class="mb-8 lg:mb-0"
        @update-location-id="updateLocationId"
      />

      <!-- Venue locations list -->
      <div class="flex w-full items-center justify-center px-2 lg:translate-x-[-1px] lg:border-2 lg:border-b-8 lg:border-l-0 lg:border-primary-green">
        <div class="relative row-auto grid w-full grid-cols-2 sm:max-w-[424px] lg:w-fit lg:grid-cols-1">
          <VenueFloorPlanDividingLines />
          <div
            v-for="location in venueLocations"
            :key="location.id"
            class="relative"
            @mouseenter="enterLocationHandler(location.id)"
            @mouseleave="leaveLocationHandler"
          >
            <NuxtLink
              v-if="location.url"
              external
              :to="location.url"
              target="_blank"
              :aria-label="location.text"
              class="flex size-full items-center justify-between gap-x-2 truncate py-2 pl-3.5 pr-2 text-left text-base font-bold transition-colors sm:justify-start xl:pl-8 xl:text-xl"
              :class="[filterLocationTextColor(location)]"
            >
              <span>{{ location.text }}</span>
              <Icon
                name="i-heroicons-arrow-top-right-on-square"
                class="shrink-0"
              />
            </NuxtLink>
            <button
              v-else
              type="button"
              :aria-label="location.text"
              class="flex size-full items-center justify-start truncate py-2 pl-3.5 pr-2 text-left text-base font-bold tracking-wide xl:pl-8 xl:text-xl"
              :class="[filterLocationTextColor(location)]"
              :disabled="!location.isOpen"
              @click="clickLocationHandler(location.id)"
            >
              <span>{{ location.text }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
