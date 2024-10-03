<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import {
  speakers,
} from '~/constants'

const speakersDesktopColumns = 3
const speakersDesktopRows = 9
const speakersMobileColumns = 2
const speakersMobileRows = 5

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerOrEqualSm = breakpoints.smallerOrEqual('sm')
const isSmallerLg = breakpoints.smaller('lg')

const maskClipPath = computed(() => {
  return isSmallerOrEqualSm.value ? 'M144,0 H320 V320 H0 V30 L100,30 Z' : 'M192,0 H424 V424 H0 V40 L132,40 Z'
})

const speakersListLimit = computed(() => {
  return isSmallerOrEqualSm.value
    ? speakersMobileColumns * speakersMobileRows
    : speakersDesktopColumns * speakersDesktopRows
})

const filterSpeakers = computed(() => {
  return speakers.slice(0, speakersListLimit.value)
})

const speakersColumns = computed(() => {
  return isSmallerOrEqualSm.value ? speakersMobileColumns : speakersDesktopColumns
})

const speakersRows = computed(() => {
  return isSmallerLg.value ? speakersMobileRows : speakersDesktopRows
})

const isShowSkeleton = ref(true)

onMounted(() => {
  isShowSkeleton.value = false
})

/**
 * Interaction between carousel and speaker name list
 */
const currentSpeakerId = ref<string | undefined>()
const canExecuteSelectSpeakerName = ref(false)
const speakerCarouselRef = useTemplateRef('speakerCarouselRef')

const { start: startTimer, stop: stopTimer } = useTimeoutFn((speakerId) => {
  canExecuteSelectSpeakerName.value = true
  selectSpeakerName(speakerId)
}, 500)

const { start: startRecoverAutoplayTimer } = useTimeoutFn(() => {
  speakerCarouselRef.value?.recoverCarouselAutoplay()
  canExecuteSelectSpeakerName.value = false
}, 3000)

function updateSpeakerId(speakerId?: string) {
  currentSpeakerId.value = speakerId
}

function selectSpeakerName(speakerId: string) {
  if (!canExecuteSelectSpeakerName.value)
    return

  speakerCarouselRef.value?.selectSpeaker(speakerId)
}

function enterSpeakerNameHandler(speakerId: string) {
  if (isSmallerLg.value)
    return

  speakerCarouselRef.value?.stopCarouselAutoplay()
  canExecuteSelectSpeakerName.value = false
  startTimer(speakerId)
}

function leaveSpeakerNameHandler() {
  if (isSmallerLg.value)
    return

  speakerCarouselRef.value?.recoverCarouselAutoplay()
  stopTimer()
  canExecuteSelectSpeakerName.value = false
}

function clickSpeakerNameHandler(speakerId: string) {
  if (!isSmallerLg.value)
    return

  canExecuteSelectSpeakerName.value = true
  selectSpeakerName(speakerId)
  speakerCarouselRef.value?.stopCarouselAutoplay()

  startRecoverAutoplayTimer()
}
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
        ref="speakerCarouselRef"
        :speakers="filterSpeakers"
        :mask-clip-path="maskClipPath"
        @update-speaker-id="updateSpeakerId"
      />

      <!-- Speakers name list -->
      <div
        class="relative grid w-full grid-flow-col grid-cols-2 grid-rows-5 sm:grid-cols-3 sm:grid-rows-9"
      >
        <HomeSpeakersDividingLines v-if="!isShowSkeleton" />

        <HomeSpeakersComingSoon
          v-if="!isShowSkeleton"
          :speakers="filterSpeakers"
          :speakers-rows="speakersRows"
          :speakers-columns="speakersColumns"
        />

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
            class="relative before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:-translate-x-1/2 before:bg-primary-green/0 before:transition-all before:duration-500"
            :class="[currentSpeakerId === speaker.id ? 'before:scale-y-100 before:bg-primary-green/100' : 'before:scale-y-50']"
          >
            <button
              type="button"
              class="size-full truncate py-2 pl-4 pr-2 text-left text-base font-bold duration-500 lg:text-lg lg:font-medium lg:hover:bg-white/5"
              :class="[currentSpeakerId === speaker.id ? 'text-primary-green' : 'text-white']"
              @click="clickSpeakerNameHandler(speaker.id)"
              @mouseenter="enterSpeakerNameHandler(speaker.id)"
              @mouseleave="leaveSpeakerNameHandler"
            >
              {{ speaker.displayName }}
            </button>
          </div>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
