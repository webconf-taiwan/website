<script setup lang="ts">
interface Props {
  speed?: number
}

const props = withDefaults(defineProps<Props>(), {
  speed: 1,
})

const { gsap } = useGsap()
const { x: mouseX, y: mouseY } = useMouse({ type: 'client' })

const cursorPosition = { x: 0, y: 0 }
const cursorRef = ref<HTMLElement | null>(null)
const device = useDevice()

const showCursor = computed(() => device.isDesktop)

let setX: (_value: number) => void
let setY: (_value: number) => void

onMounted(() => {
  if (!gsap || !showCursor.value)
    return

  setX = gsap.quickSetter(cursorRef.value, 'x', 'px') as (
    _value: number,
  ) => void
  setY = gsap.quickSetter(cursorRef.value, 'y', 'px') as (
    _value: number,
  ) => void

  const ticker = () => {
    cursorPosition.x += (mouseX.value - cursorPosition.x) * props.speed
    cursorPosition.y += (mouseY.value - cursorPosition.y) * props.speed

    setX(cursorPosition.x)
    setY(cursorPosition.y)
  }

  gsap.ticker.add(ticker)

  onUnmounted(() => {
    gsap.ticker.remove(ticker)
  })
})
</script>

<template>
  <div
    v-if="showCursor"
    ref="cursorRef"
    data-cursor
    class="pointer-events-none fixed left-0 top-0 z-[150] grid size-5 -translate-x-1/2 -translate-y-1/2 place-content-center will-change-transform"
  >
    <div
      data-cursor-inner
      class="absolute inset-0 bg-webconf-gray"
    ></div>
    <div
      data-cursor-text
      class="relative z-10 text-btn-14 text-white"
    ></div>
  </div>
</template>
