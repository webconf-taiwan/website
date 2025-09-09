<script setup lang="ts">
interface Props {
  originalIndex: number
  speakers: {
    name: string
    src: string
  }[]
}

const props = defineProps<Props>()
const gsap = useGsap()

// 當前顯示的講者索引
const currentIndex = ref(props.originalIndex)

// 容器和滑動元素的 ref
const cardContainer = ref<HTMLDivElement>()
const cardSlider = ref<HTMLDivElement>()

// 計算下一個索引
function getNextIndex() {
  return (currentIndex.value + 1) % props.speakers.length
}

// 計算當前講者
const currentSpeaker = computed(() => props.speakers[currentIndex.value])
const nextSpeaker = computed(() => props.speakers[getNextIndex()])

// 執行滑動動畫
function slideToNext() {
  if (!cardSlider.value) {
    return
  }

  const timeline = gsap.timeline({
    onComplete: () => {
      // 動畫完成後更新索引並重置位置
      currentIndex.value = getNextIndex()
      gsap.set(cardSlider.value, { x: 0 })
    },
  })

  // 滑動動畫：向左滑動一個卡片的寬度
  timeline.to(cardSlider.value, {
    x: '-50%',
    duration: 1,
    ease: 'power2.inOut',
  })
}

// 設置定時器
let intervalId: NodeJS.Timeout | null = null

onMounted(() => {
  // 每 3 秒自動滑動到下一張
  intervalId = setInterval(slideToNext, 3000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div
    ref="cardContainer"
    class="relative overflow-hidden"
  >
    <div
      ref="cardSlider"
      class="flex w-[200%]"
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

      <!-- 下一張講者卡片（用於動畫） -->
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
