<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { speakers } from '~/constants'

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerOrEqualSm = breakpoints.smallerOrEqual('sm')

const isShowSkeleton = ref(true)
const currentSpeakerId = ref<string | undefined>()

const maskClipPath = computed(() => {
  return isSmallerOrEqualSm.value ? 'M144,0 H320 V320 H0 V30 L100,30 Z' : 'M192,0 H424 V424 H0 V40 L132,40 Z'
})

const filterSpeakers = computed(() => {
  return speakers.slice(0, isSmallerOrEqualSm.value ? 10 : 27)
})

function updateSpeakerId(speakerId?: string) {
  currentSpeakerId.value = speakerId
}

const debounceHoverSpeakerName = useDebounceFn((speakerId: string) => {
  console.log(speakerId)
}, 500)

onMounted(() => {
  isShowSkeleton.value = false
})
</script>

<template>
  <section class="mx-auto w-[min(100%,1096px)] border-white/20 pb-[60px] lg:pb-20">
    <div class="mb-10 flex items-center justify-between lg:mb-20">
      <HomeSectionTitle>
        <template #title>
          SPEAKERS
        </template>
        <template #subTitle>
          講者
        </template>
      </HomeSectionTitle>
    </div>

    <div class="flex flex-col items-center lg:flex-row lg:items-stretch">
      <!-- Speakers carousel -->
      <Skeleton
        v-if="isShowSkeleton"
        class="mb-8 mr-0 size-80 shrink-0 bg-primary-foreground/50 sm:size-[424px] lg:mb-0 lg:mr-6"
        :is-show-loading="true"
      />
      <HomeSpeakersCarousel
        :speakers="filterSpeakers"
        :mask-clip-path="maskClipPath"
        @update-speaker-id="updateSpeakerId"
      />

      <!-- Speakers name list -->
      <div class="relative grid w-full grid-flow-col grid-cols-2 grid-rows-5 sm:grid-cols-3 lg:grid-rows-9">
        <HomeSpeakersDividingLines :is-show-skeleton="isShowSkeleton" />

        <template v-if="isShowSkeleton">
          <Skeleton
            v-for="(_, index) in 3"
            :key="index"
            class="row-span-full h-[200px] w-4/5 bg-primary-foreground/50 lg:h-full"
            :class="index === 3 ? 'hidden sm:block' : ''"
          />
        </template>

        <ClientOnly>
          <div
            v-for="speaker in filterSpeakers"
            :key="speaker.id"
            class="relative before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:-translate-x-1/2 before:bg-primary-green/0 before:transition-colors before:duration-500"
            :class="[currentSpeakerId === speaker.id ? 'before:bg-primary-green/100' : '']"
          >
            <button
              type="button"
              class="size-full truncate pl-4 pr-2 text-left transition-colors duration-500"
              :class="[currentSpeakerId === speaker.id ? 'text-primary-green' : 'text-white']"
              @mouseenter="debounceHoverSpeakerName(speaker.id)"
            >
              {{ speaker.name }}
            </button>
          </div>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>

<style scope>
.grid-speakers-separator-line {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background-image: linear-gradient(to bottom, var(--primary-green), var(--primary-green) 4px, transparent 4px, transparent 8px);
  background-repeat: repeat;
  background-size: 100% 8px;
}
</style>
