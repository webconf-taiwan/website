<script setup lang="ts">
import Autoplay from 'embla-carousel-autoplay'
import type { Carousel, CarouselApi } from '~/components/ui/carousel'
import type { Speaker } from '~/types/speakers'

const props = defineProps<{
  speakers: Speaker[]
  maskClipPath: string
}>()

const emit = defineEmits<{
  updateSpeakerId: [speakerId?: string]
}>()

defineExpose({
  selectSpeaker,
  stopCarouselAutoplay,
  recoverCarouselAutoplay,
})

const carouselContainerRef = ref<InstanceType<typeof Carousel> | null>(null)
const carouselApi = ref<CarouselApi>()

const currentSpeakerIndex = ref<number | null>(null)

const currentSpeakerName = computed<string>(() => {
  if (currentSpeakerIndex.value === null)
    return ''

  return props.speakers[currentSpeakerIndex.value].name
})

const currentSpeakerId = computed(() => {
  if (currentSpeakerIndex.value === null)
    return

  return props.speakers[currentSpeakerIndex.value].id
})

function setApi(val: CarouselApi) {
  carouselApi.value = val
}

watchOnce(carouselApi, (api) => {
  if (!api)
    return

  currentSpeakerIndex.value = api.selectedScrollSnap()

  api.on('select', () => {
    currentSpeakerIndex.value = api.selectedScrollSnap()
  })
})

watch(currentSpeakerId, (speakerId) => {
  if (speakerId === null)
    return

  emit('updateSpeakerId', speakerId)
})

function selectSpeaker(speakerId: string) {
  const index = props.speakers.findIndex(speaker => speaker.id === speakerId)

  if (index === -1)
    return

  carouselApi.value?.scrollTo(index)
}

function stopCarouselAutoplay() {
  carouselApi.value?.plugins().autoplay?.stop()
}

function recoverCarouselAutoplay() {
  carouselApi.value?.plugins().autoplay?.play()
}
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
      orientation="vertical"
      class="max-w-[424px] before:absolute before:inset-x-0 before:bottom-0 before:z-10 before:h-1.5 before:bg-primary-green"
      style="clip-path: url(#square-with-corner-cut);"
      :opts="{
        align: 'start',
      }"
      :plugins="[Autoplay({
        delay: 2500,
        stopOnInteraction: false,
      })]"
      @init-api="setApi"
    >
      <CarouselContent class="size-80 sm:size-[424px]">
        <CarouselItem
          v-for="speaker in speakers"
          :key="speaker.id"
          class="w-full bg-slate-400"
        >
          <div class="relative aspect-[1/1] w-full">
            <NuxtImg
              :src="speaker.avatar"
              :alt="speaker.name"
              class="h-auto w-full object-cover"
              format="webp"
              :placeholder="[32, 32, 80, 5]"
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

    <div class="speaker-name-tag absolute bottom-1 right-0 flex h-8 w-fit items-center justify-center bg-primary-green pl-8 pr-5 font-medium text-black sm:h-12 sm:pl-10 sm:pr-4">
      <span
        class="inline-block w-full max-w-[20ch] truncate whitespace-nowrap text-xl sm:text-[28px]"
      >
        {{ currentSpeakerName }}
      </span>
    </div>
  </div>
</template>

<style scope>
.speaker-name-tag {
  clip-path: polygon(calc(0% + 24px) 0%, 100% 0%, 100% 100%, 0% 100%);

  @media screen and (min-width: 640px) {
    clip-path: polygon(calc(0% + 32px) 0%, 100% 0%, 100% 100%, 0% 100%);
  }
}
</style>
