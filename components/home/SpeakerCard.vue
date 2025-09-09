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
    duration: 1,
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
    v-cursor="{
      scale: 5,
      duration: 0.5,
      backgroundColor: 'rgba(0, 46, 255, 0.9)',
      text: 'VIEW',
    }"
    class="relative w-full max-w-full overflow-hidden"
  >
    <div
      ref="cardContainer"
      class="flex w-[200%]"
      style="will-change: transform; transform: translateZ(0)"
    >
      <!-- 當前講者卡片 -->
      <div class="w-1/2 shrink-0">
        <div class="group relative">
          <NuxtImg
            :src="currentSpeaker.src"
            alt="speaker"
            width="264"
            height="376"
            class="grayscale duration-300 group-hover:grayscale-0"
          />

          <!-- 藍色漸層遮罩 -->
          <div
            class="absolute inset-0 bg-gradient-to-b from-black to-webconf-blue mix-blend-plus-lighter duration-300 group-hover:opacity-0"
          ></div>

          <!-- 噪點遮罩 -->
          <div
            class="pointer-events-none absolute inset-0 duration-300 group-hover:opacity-0"
            style="
              background:
                repeating-radial-gradient(
                  circle,
                  rgba(0, 0, 0, 0.25) 0,
                  rgba(0, 0, 0, 0.25) 1px,
                  transparent 1px,
                  transparent 2px
                ),
                repeating-conic-gradient(
                  rgba(0, 0, 0, 0.25) 0,
                  rgba(0, 0, 0, 0.25) 1deg,
                  transparent 1deg,
                  transparent 2deg
                );
              background-size: 10px 10px;
              mix-blend-mode: soft-light;
            "
          ></div>
        </div>

        <h3 class="mt-4 text-h4-24">
          {{ currentSpeaker.name }}
        </h3>
      </div>

      <!-- 下一張講者卡片 -->
      <div class="w-1/2 shrink-0">
        <div class="group relative">
          <NuxtImg
            :src="nextSpeaker.src"
            alt="speaker"
            width="264"
            height="376"
            class="grayscale duration-300 group-hover:grayscale-0"
          />

          <!-- 藍色漸層遮罩 -->
          <div
            class="absolute inset-0 bg-gradient-to-b from-black to-webconf-blue mix-blend-plus-lighter duration-300 group-hover:opacity-0"
          ></div>

          <!-- 噪點遮罩 -->
          <div
            class="pointer-events-none absolute inset-0 duration-300 group-hover:opacity-0"
            style="
              background:
                repeating-radial-gradient(
                  circle,
                  rgba(0, 0, 0, 0.25) 0,
                  rgba(0, 0, 0, 0.25) 1px,
                  transparent 1px,
                  transparent 2px
                ),
                repeating-conic-gradient(
                  rgba(0, 0, 0, 0.25) 0,
                  rgba(0, 0, 0, 0.25) 1deg,
                  transparent 1deg,
                  transparent 2deg
                );
              background-size: 10px 10px;
              mix-blend-mode: soft-light;
            "
          ></div>
        </div>

        <h3 class="mt-4 text-h4-24">
          {{ nextSpeaker.name }}
        </h3>
      </div>
    </div>
  </div>
</template>
