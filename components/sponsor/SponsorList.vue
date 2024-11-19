<script setup lang="ts">
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { breakpointsTailwind } from '@vueuse/core'
import type { Sponsor } from '~/types/sponsors'

defineProps<{
  renderData: Sponsor[]
  typeName: string
}>()

const breakpoints = useBreakpoints(breakpointsTailwind)
const mobile = breakpoints.smaller('md')
const tablet = breakpoints.between('md', 'lg')

const maskClipPath = computed(() => {
  if (mobile.value)
    return 'M135,0 H320 V320 H0 V35 L90,35 Z'

  if (tablet.value)
    return 'M85,0 H220 V220 H0 V25 L60,25 Z'

  return 'M110,0 H280 V280 H0 V30 L70,30 Z'
})

const svgViewBox = computed(() => {
  if (mobile.value)
    return '0 0 320 320'

  if (tablet.value)
    return '0 0 220 220'

  return '0 0 280 280'
})

const isOpen = ref(true)
</script>

<template>
  <div>
    <SponsorTitle>
      <template #title>
        {{ typeName }}
      </template>
    </SponsorTitle>

    <div
      v-for="sponsor in renderData"
      :key="sponsor.name"
      class="mt-12 flex flex-col items-center justify-between gap-x-10 gap-y-5 md:flex-row md:items-start"
    >
      <!-- Organization logo -->
      <ClientOnly>
        <div class="relative size-[320px] shrink-0 md:size-[220px] lg:size-[280px]">
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
            :src="sponsor.logo"
            :alt="sponsor.name"
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

      <div class="grow space-y-6">
        <!-- Organization name -->
        <div class="flex items-center justify-between gap-x-4 pb-4 md:border-b md:border-white">
          <h3 class="text-[2rem] tracking-wide md:text-2xl lg:text-[2rem]">
            {{ sponsor.name }}
          </h3>

          <Button
            as-child
            variant="custom"
            size="customSmall"
            rounded="none"
          >
            <NuxtLink
              to="/agenda"
              class="hidden space-x-2 px-9 pr-6 text-base md:flex md:items-center"
            >
              <span class="text-xl tracking-wide">企業徵才</span>
              <Icon
                name="i-heroicons:link-20-solid"
                size="24"
                class="shrink-0"
              />
            </NuxtLink>
          </Button>
        </div>

        <!-- Organization introduction -->
        <div class="border border-primary-green px-5 py-4">
          <Collapsible v-model:open="isOpen">
            <CollapsibleTrigger as-child>
              <button
                type="button"
                class="flex w-full items-center justify-between text-xl"
              >
                <span>贊助商簡介</span>
                <Icon
                  name="i-heroicons:chevron-down"
                  size="16"
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <p class="leading-[1.6rem] tracking-wider">
                {{ sponsor.introduction }}
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
