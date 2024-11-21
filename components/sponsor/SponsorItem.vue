<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import type { Sponsor } from '~/types/sponsors'
import SponsorIntro from './SponsorIntro.vue'

defineProps<{
  sponsorData: Sponsor
  introTitle: string
}>()

const breakpoints = useBreakpoints(breakpointsTailwind)
const mobile = breakpoints.smaller('md')
const tablet = breakpoints.between('md', 'lg')

const maskClipPath = computed(() => {
  if (mobile.value)
    return 'M135,0 H288 V288 H0 V35 L90,35 Z'

  if (tablet.value)
    return 'M85,0 H240 V240 H0 V25 L60,25 Z'

  return 'M110,0 H280 V280 H0 V30 L70,30 Z'
})

const svgViewBox = computed(() => {
  if (mobile.value)
    return '0 0 288 288'

  if (tablet.value)
    return '0 0 240 240'

  return '0 0 280 280'
})
</script>

<template>
  <!-- Organization logo -->
  <ClientOnly>
    <div class="relative size-[288px] shrink-0 md:size-[240px] lg:size-[280px]">
      <svg
        class="absolute"
        width="0"
        height="0"
      >
        <defs>
          <clipPath id="square-with-corner-cut-sponsor">
            <path :d="maskClipPath" />
          </clipPath>
        </defs>
      </svg>
      <NuxtImg
        :src="sponsorData.logo"
        :alt="sponsorData.name"
        class="h-auto w-full lg:max-w-[280px]"
        format="webp"
        :placeholder="[32, 32, 80, 5]"
        draggable="false"
        style="clip-path: url(#square-with-corner-cut-sponsor);"
      />
      <svg
        class="pointer-events-none absolute left-0 top-0 size-full"
        :viewBox="svgViewBox"
      >
        <path
          :d="maskClipPath"
          fill="none"
          stroke="var(--primary-green)"
          stroke-width="3"
        />
      </svg>
      <div class="absolute inset-x-0 bottom-0 z-10 h-1 bg-primary-green"></div>
      <div class="absolute top-[3px] z-10 h-[1px] w-[100px] bg-primary-green md:w-[65px] lg:w-[88px]"></div>
      <div class="absolute top-[15px] z-10 h-[1px] w-[70px] bg-primary-green md:top-[13px] md:w-[50px] lg:top-[15px] lg:w-[60px]"></div>
    </div>
  </ClientOnly>

  <div class="w-full grow space-y-5 md:space-y-6">
    <!-- Organization name -->
    <div class="flex flex-col items-center gap-x-4 md:flex-row md:justify-between md:border-b md:border-white md:pb-4">
      <h3 class="text-[2rem] font-bold tracking-wider md:mb-0 md:text-2xl lg:text-[2rem]">
        {{ sponsorData.name }}
      </h3>

      <template v-if="sponsorData.recruitmentUrl">
        <Button
          as-child
          variant="custom"
          size="small-md-stretch"
          rounded="none"
        >
          <NuxtLink
            :to="sponsorData.recruitmentUrl"
            target="_blank"
            class="flex items-center justify-between px-5 pr-6 text-base max-md:mt-5 md:justify-center md:gap-x-2 md:px-0"
          >
            <span class="text-xl tracking-wide">企業徵才</span>
            <Icon
              name="i-heroicons:link-20-solid"
              size="20"
              class="shrink-0"
            />
          </NuxtLink>
        </Button>
      </template>
    </div>

    <!-- Organization introduction -->
    <SponsorIntroMobile
      v-show="mobile"
      :intro-title="introTitle"
      :introduction="sponsorData.introduction"
    />
    <SponsorIntro
      v-show="!mobile"
      :introduction="sponsorData.introduction"
    />

    <!-- Organization social links -->
    <SocialLinks :social-links="sponsorData.socialLinks" />
  </div>
</template>

<style scoped></style>
