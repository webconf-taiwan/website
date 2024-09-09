<script setup lang="ts">
import gsap from 'gsap'

const { setAnimationShown } = useLoadingState()

const isVisible = ref(true)
const container = ref<HTMLElement | null>(null)
const horizontalLine = ref<HTMLElement | null>(null)
const topCurtain = ref<HTMLElement | null>(null)
const bottomCurtain = ref<HTMLElement | null>(null)
const firstOvalGroup = ref<HTMLElement | null>(null)
const secondOvalGroup = ref<HTMLElement | null>(null)
const thirdOvalGroup = ref<HTMLElement | null>(null)
const fourthOvalGroup = ref<HTMLElement | null>(null)
const fifthOvalGroup = ref<HTMLElement | null>(null)

function disableScroll() {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

  document.body.style.overflow = 'hidden'
  document.body.style.touchAction = 'none'
  document.body.style.paddingRight = `${scrollbarWidth}px`
}

function enableScroll() {
  document.body.style.overflow = ''
  document.body.style.touchAction = ''
  document.body.style.paddingRight = ''
}

function preventDefault(e: Event) {
  e.preventDefault()
}

useEventListener(window, 'wheel', preventDefault, { passive: false })
useEventListener(window, 'touchmove', preventDefault, { passive: false })

onMounted(() => {
  window.scrollTo(0, 0)
  disableScroll()

  const tl = gsap.timeline({
    onComplete() {
      isVisible.value = false
      enableScroll()
      setAnimationShown()
    },
  })

  tl.to(horizontalLine.value, {
    width: '100%',
    duration: 3,
    ease: 'power3.inOut',
  })

  tl.to(horizontalLine.value, {
    opacity: 0,
    duration: 0.25,
    ease: 'power2.inOut',
  }, '>')

  tl.to([topCurtain.value, bottomCurtain.value], {
    scaleY: 0,
    duration: 1,
    ease: 'power4.inOut',
  }, '<')

  const ovalGroups = [firstOvalGroup, secondOvalGroup, thirdOvalGroup, fourthOvalGroup, fifthOvalGroup]

  const createOvalAnimation = (group: any, startTime: number) => {
    tl.to(group.value, {
      opacity: 1,
      duration: 0.25,
      ease: 'power2.inOut',
    }, startTime).to(group.value, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.inOut',
    }, `${startTime}+=0.25`)
  }

  for (let round = 0; round < 3; round++) {
    ovalGroups.forEach((group, index) => {
      const startTime = round + (index * 0.1)
      createOvalAnimation(group, startTime)
    })
  }
})
</script>

<template>
  <div
    v-if="isVisible"
    ref="container"
    class="fixed inset-0 z-[1000] flex items-center justify-center"
  >
    <div
      ref="horizontalLine"
      class="absolute left-1/2 top-1/2 z-[1020] h-0.5 -translate-x-1/2 -translate-y-1/2 bg-[#00FFCC]"
      style="width: 0;"
    ></div>

    <!-- First -->
    <div
      ref="firstOvalGroup"
      class="absolute z-[1030]"
      style="opacity: 0;"
    >
      <div class="h-[53px] w-3 rounded-[100%] border-2 border-white"></div>
    </div>

    <!-- Second -->
    <div
      ref="secondOvalGroup"
      class="absolute z-[1030] flex w-[100px] items-center justify-between"
      style="opacity: 0;"
    >
      <div class="h-[77px] w-4 rounded-[100%] border-2 border-[#00FFCC]"></div>
      <div class="h-[77px] w-4 rounded-[100%] border-2 border-[#00FFCC]"></div>
    </div>

    <!-- Third -->
    <div
      ref="thirdOvalGroup"
      class="absolute z-[1030] flex w-52 items-center justify-between"
      style="opacity: 0;"
    >
      <div class="h-[117px] w-7 rounded-[100%] border-2 border-[#00FFCC]"></div>
      <div class="h-[117px] w-7 rounded-[100%] border-2 border-[#00FFCC]"></div>
    </div>

    <!-- Fourth -->
    <div
      ref="fourthOvalGroup"
      class="absolute z-[1030] flex w-[336px] items-center justify-between"
      style="opacity: 0;"
    >
      <div class="h-[156px] w-9 rounded-[100%] border-2 border-white"></div>
      <div class="h-[156px] w-9 rounded-[100%] border-2 border-[#00FFCC]"></div>
    </div>

    <!-- Fifth -->
    <div
      ref="fifthOvalGroup"
      class="absolute z-[1030] flex w-[480px] items-center justify-between"
      style="opacity: 0;"
    >
      <div class="h-[196px] w-11 rounded-[100%] border-2 border-[#00FFCC]"></div>
      <div class="h-[196px] w-11 rounded-[100%] border-2 border-white"></div>
    </div>

    <div
      ref="topCurtain"
      class="absolute inset-x-0 top-0 z-[1010] h-1/2 origin-top bg-black"
    ></div>

    <div
      ref="bottomCurtain"
      class="absolute inset-x-0 bottom-0 z-[1010] h-1/2 origin-bottom bg-black"
    ></div>
  </div>
</template>

<style scoped></style>
