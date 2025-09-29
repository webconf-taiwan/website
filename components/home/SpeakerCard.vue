<script setup lang="ts">
import { useGsap } from '~/composables/useGsap'

interface Props {
  originalIndex: number
  speakers: {
    name: string
    src: string
  }[]
  isParentHovered?: boolean
}

const props = defineProps<Props>()

const gsap = useGsap()

const cardContainer = ref<HTMLDivElement>()
const currentIndex = ref(props.originalIndex)
const isAnimating = ref(false)
let slideInterval: NodeJS.Timeout | null = null

function getNextIndex() {
  return (currentIndex.value + 1) % props.speakers.length
}

const currentSpeaker = computed(() => props.speakers[currentIndex.value])
const nextSpeaker = computed(() => props.speakers[getNextIndex()])

// 向左滑動
function slideToNext() {
  if (!cardContainer.value || isAnimating.value) {
    return
  }

  isAnimating.value = true

  stopSliding()

  const timeline = gsap.timeline({
    onComplete: () => {
      currentIndex.value = getNextIndex()
      if (cardContainer.value) {
        gsap.set(cardContainer.value, { x: 0 })
      }
      isAnimating.value = false
      startSliding() // 動畫結束後重新啟動定時器
    },
  })

  // 向左滑動到下一張卡片位置
  timeline.to(cardContainer.value, {
    x: '-50%',
    duration: 1,
    ease: 'power2.inOut',
    force3D: true,
    willChange: 'transform',
  })
}

// 向右滑動
function slideToPrev() {
  if (!cardContainer.value || isAnimating.value) {
    return
  }

  isAnimating.value = true

  stopSliding()

  // 設定卡片容器的初始位置為 -50%，以顯示前一張卡片
  gsap.set(cardContainer.value, { x: '-50%' })
  currentIndex.value
    = (currentIndex.value - 1 + props.speakers.length) % props.speakers.length

  const timeline = gsap.timeline({
    onComplete: () => {
      if (cardContainer.value) {
        gsap.set(cardContainer.value, { x: 0 })
      }

      isAnimating.value = false
      startSliding()
    },
  })

  timeline.to(cardContainer.value, {
    x: 0,
    duration: 0.8,
    ease: 'power2.inOut',
    force3D: true,
    willChange: 'transform',
  })
}

function startSliding() {
  if (slideInterval) {
    clearInterval(slideInterval)
  }

  slideInterval = setInterval(() => {
    if (!props.isParentHovered && !isAnimating.value) {
      slideToNext()
    }
  }, 3000)
}

function stopSliding() {
  if (slideInterval) {
    clearInterval(slideInterval)
    slideInterval = null
  }
}

onMounted(() => {
  startSliding()
})

onUnmounted(() => {
  stopSliding()
})

defineExpose({
  slideToNext,
  slideToPrev,
})

watch(
  () => props.isParentHovered,
  (newVal) => {
    if (newVal) {
      stopSliding()
    }
    else {
      startSliding()
    }
  },
)
</script>

<template>
  <div
    :class="{
      'border-l-[0.5px]': originalIndex === 0,
    }"
    class="col-span-1 flex flex-col items-center justify-center border-r-[0.5px] border-webconf-gray/50 px-8 pb-7 pt-10 xl:px-12"
  >
    <div
      v-cursor="{
        scale: 5,
        duration: 0.5,
        backgroundColor: 'rgba(0, 46, 255, 0.9)',
        text: 'VIEW',
      }"
      class="relative w-full overflow-hidden"
    >
      <div
        ref="cardContainer"
        class="flex w-[200%]"
        style="will-change: transform; transform: translateZ(0)"
      >
        <!-- 當前講者卡片 -->
        <NuxtLink
          to="/"
          class="w-1/2 shrink-0"
        >
          <div class="group relative">
            <div
              class="aspect-speaker-img w-full bg-cover bg-center grayscale group-hover:grayscale-0"
              :style="{
                backgroundImage: `url(${currentSpeaker.src})`,
                transition: 'filter 0.3s',
              }"
            ></div>

            <ShareGradientMask class="group-hover:opacity-0" />
            <ShareNoiseMask class="group-hover:opacity-0" />
          </div>

          <h3 class="mt-4 pb-3 text-h4-24">
            {{ currentSpeaker.name }}
          </h3>
        </NuxtLink>

        <!-- 下一張講者卡片 -->
        <div class="w-1/2 shrink-0">
          <div class="group relative">
            <div
              class="aspect-speaker-img w-full bg-cover bg-center grayscale group-hover:grayscale-0"
              :style="{
                backgroundImage: `url(${nextSpeaker.src})`,
                transition: 'filter 0.3s',
              }"
            ></div>
            <ShareGradientMask class="group-hover:opacity-0" />
            <ShareNoiseMask class="group-hover:opacity-0" />
          </div>

          <h3 class="mt-4 text-h4-24">
            {{ nextSpeaker.name }}
          </h3>
        </div>
      </div>
    </div>
  </div>
</template>
