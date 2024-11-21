<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import CardItem from '~/components/ui/card3d/CardItem.vue'
import { socialIconMap } from '~/constants'
import type { SocialLinkType } from '~/types/common'
import type { Staff } from '~/types/staff'

const { staff } = defineProps<{
  staff: Staff
}>()

const breakpoints = useBreakpoints(breakpointsTailwind)

const isSmaller = {
  sm: breakpoints.smaller('md'), // 0-767px
  md: breakpoints.between('md', 'lg'), // 768-1023px
  lg: breakpoints.greater('lg'), // >= 1024px
}

const maskClipPath = computed(() => {
  if (isSmaller.sm.value) {
    return 'M135,0 H288 V288 H0 V35 L90,35 Z' // 手機
  }

  if (isSmaller.md.value) {
    return 'M85,0 H197 V197 H0 V25 L60,25 Z' // 平板
  }

  return 'M110,0 H260 V260 H0 V30 L70,30 Z' // 電腦
})

const svgViewBox = computed(() => {
  if (isSmaller.sm.value) {
    return '0 0 288 288'
  }

  if (isSmaller.md.value) {
    return '0 0 197 197'
  }

  return '0 0 260 260'
})

function getSocialLinks(links: {
  type: string
  url: string
}[]) {
  return links.map(link => ({
    href: link.url,
    icon: socialIconMap[link.type as SocialLinkType] || '',
    type: link.type,
  }))
}
</script>

<template>
  <CardItem
    :translate-z="100"
  >
    <!-- Avatar -->
    <div class="relative size-[288px] md:size-[197px] lg:size-[260px]">
      <NuxtImg
        :src="staff.avatar"
        :alt="`avatar｜${staff.name}`"
        class="size-full"
        format="webp"
        :placeholder="[32, 32, 80, 5]"
        draggable="false"
        style="clip-path: url(#square-with-corner-cut-staff);"
      />
      <svg
        class="absolute"
        width="0"
        height="0"
      >
        <defs>
          <clipPath id="square-with-corner-cut-staff">
            <path :d="maskClipPath" />
          </clipPath>
        </defs>
      </svg>
      <svg
        class="pointer-events-none absolute left-0 top-0 size-full"
        :view-box="svgViewBox"
      >
        <path
          :d="maskClipPath"
          fill="none"
          stroke="var(--primary-green)"
          stroke-width="3"
        />
      </svg>

      <!-- 社群連結 -->
      <ul
        v-if="staff.socialLinks.length > 0"
        class="speaker-social-links-tag absolute bottom-0 right-0 flex items-end gap-x-2 bg-primary-green p-[5px] pl-[25px] pr-2 lg:pl-8"
      >
        <li
          v-for="socialLink in getSocialLinks(staff.socialLinks)"
          :key="socialLink.type"
          class="group bg-primary-green"
        >
          <NuxtLink
            :to="socialLink.href"
            :title="socialLink.type"
            target="_blank"
            :aria-label="socialLink.type"
            class="relative flex size-full items-center justify-center transition-all duration-150 lg:group-hover:scale-110"
          >
            <Icon
              :name="socialLink.icon"
              size="24"
              class="text-black"
            />
            <span class="sr-only">{{ socialLink.type }}</span>
          </NuxtLink>
        </li>
      </ul>

      <div class="absolute inset-x-0 bottom-0 z-10 h-1.5 bg-primary-green"></div>
      <div class="absolute top-[3px] z-10 h-[1px] w-[100px] bg-primary-green md:w-[65px] lg:w-[88px]"></div>
      <div class="absolute top-[15px] z-10 h-[1px] w-[70px] bg-primary-green md:top-[13px] md:w-[50px] lg:top-[15px] lg:w-[60px]"></div>
    </div>
  </CardItem>

  <CardItem
    :translate-z="50"
    :translate-y="10"
    :translate-x="10"
  >
    <p class="mt-4">
      {{ staff.jobTitle }}
    </p>
  </CardItem>

  <CardItem
    :translate-z="70"
    :translate-x="10"
  >
    <p class="mt-[10px] text-[32px] font-bold">
      {{ staff.name }}
    </p>
  </CardItem>
</template>

<style scoped>
.speaker-social-links-tag {
  clip-path: polygon(calc(0% + 24px) 0%, 100% 0%, 100% 100%, 0% 100%);

  @media screen and (min-width: 640px) {
    clip-path: polygon(calc(0% + 32px) 0%, 100% 0%, 100% 100%, 0% 100%);
  }
}
</style>
