<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { venueLocations } from '~/constants/venue'

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')

const venueCarouselRef = useTemplateRef('venueCarouselRef')

const carouselLocations = venueLocations.filter(location => !!location.carouselImage)
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

    <div>
      <!-- Venue carousel -->
      <VenueCarousel
        ref="venueCarouselRef"
        :locations="carouselLocations"
        class="mb-8"
      />

      <!-- Venue locations list -->
      <div class="relative row-auto grid w-full grid-cols-2">
        <VenueFloorPlanDividingLines />

        <div
          v-for="location in venueLocations"
          :key="location.id"
          class=" relative"
        >
          <NuxtLink
            v-if="location.url"
            external
            :to="location.url"
            target="_blank"
            :aria-label="location.text"
            class="flex size-full items-center justify-between truncate py-2 pl-3.5 pr-2 text-left text-base font-bold"
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
            class="flex size-full items-center justify-start py-2 pl-3.5 pr-2 text-left text-base font-bold tracking-wide"
            :class="[location.isOpen ? 'text-white' : 'text-white/85']"
            :disabled="!location.isOpen"
          >
            <span>{{ location.text }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
