<script setup lang="ts">
import type { Carousel, CarouselApi } from '~/components/ui/carousel'
import type { Speaker } from '~/types/speakers'
import Autoplay from 'embla-carousel-autoplay'

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

  return props.speakers[currentSpeakerIndex.value].displayName
})

const currentSpeakerId = computed(() => {
  if (currentSpeakerIndex.value === null)
    return

  return props.speakers[currentSpeakerIndex.value].id
})

function setApi(val: CarouselApi) {
  carouselApi.value = val
}

const isGlitching = ref(false)

const { start: cancelGlitching } = useTimeoutFn(() => {
  isGlitching.value = false
}, 500)

function triggerGlitch() {
  isGlitching.value = true
  cancelGlitching()
}

watchOnce(carouselApi, (api) => {
  if (!api)
    return

  currentSpeakerIndex.value = api.selectedScrollSnap()

  api.on('select', () => {
    currentSpeakerIndex.value = api.selectedScrollSnap()
    triggerGlitch()
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

  carouselApi.value?.scrollTo(index, true)
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
      :class="{ 'glitch-effect': isGlitching }"
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
        jump: true,
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
              :alt="speaker.displayName"
              class="h-auto w-full object-cover"
              format="webp"
              :placeholder="[32, 32, 80, 5]"
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

    <div class="speaker-name-tag absolute bottom-1 right-0 flex h-8 w-fit items-center justify-center bg-primary-green pl-8 pr-5 font-medium sm:h-12 sm:pl-10 sm:pr-4">
      <span
        :data-text="currentSpeakerName"
        class="relative inline-block size-full max-w-[20ch] content-center truncate whitespace-nowrap px-2 text-xl sm:text-[28px]"
        :class="[{ 'text-glitch': isGlitching }, isGlitching ? 'text-black/20' : 'text-black']"
      >
        {{ currentSpeakerName }}
      </span>
    </div>

    <div class="absolute inset-x-0 bottom-0 h-1 bg-primary-green"></div>
  </div>
</template>

<style scoped>
@keyframes text-glitch {
  0% {
    transform: translateX(0);
    clip: rect(0, 100%, 100%, 0);
  }
  25% {
    transform: translateX(-6px);
    clip: rect(10px, 900px, 100px, 0);
  }
  50% {
    transform: translateX(20px);
    clip: rect(50px, 900px, 200px, 0);
  }
  75% {
    transform: translateX(-4px);
    clip: rect(75px, 900px, 300px, 0);
  }
  100% {
    transform: translateX(0);
    clip: rect(100px, 900px, 400px, 0);
  }
}

.text-glitch::before,
.text-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  align-content: center;
  text-align: center;
}

.text-glitch::before {
  color: #f0f;
  opacity: 0.7;
  z-index: -1;
  animation: text-glitch 0.8s infinite;
  animation-timing-function: steps(3, end);
}

.text-glitch::after {
  color: blue;
  opacity: 0.7;
  z-index: -2;
  animation: text-glitch 0.8s infinite 0.1s;
  animation-timing-function: steps(3, end);
}

@keyframes glitch-anim {
  0% {
    clip-path: inset(40% 0 61% 0);
    filter: hue-rotate(-10deg);
  }
  20% {
    clip-path: inset(92% 0 1% 0);
    filter: hue-rotate(10deg) saturate(110%);
  }
  40% {
    clip-path: inset(43% 0 1% 0);
    filter: hue-rotate(20deg) contrast(110%);
  }
  60% {
    clip-path: inset(50% 0 20% 0);
    filter: hue-rotate(-15deg) brightness(110%);
  }
  80% {
    clip-path: inset(54% 0 7% 0);
    filter: hue-rotate(15deg) saturate(105%);
  }
  100% {
    clip-path: inset(58% 0 43% 0);
    filter: hue-rotate(0deg);
  }
}

.glitch-effect::before,
.glitch-effect::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  clip-path: inset(0);
  opacity: 0.5;
}

.glitch-effect::before {
  left: 1px;
  background-color: hsla(168, 100%, 50%, 1);
  animation: glitch-anim 300ms infinite linear alternate-reverse;
}

.glitch-effect::after {
  left: -1px;
  background-color: hsla(168, 100%, 50%, 1);
  animation: glitch-anim 300ms infinite linear alternate-reverse;
}

.glitch-effect {
  animation: glitch-anim 1000ms infinite;
  animation-timing-function: steps(3, end);
}

.speaker-name-tag {
  clip-path: polygon(calc(0% + 24px) 0%, 100% 0%, 100% 100%, 0% 100%);

  @media screen and (min-width: 640px) {
    clip-path: polygon(calc(0% + 32px) 0%, 100% 0%, 100% 100%, 0% 100%);
  }
}
</style>
