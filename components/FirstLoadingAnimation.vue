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
      class="absolute left-1/2 top-1/2 z-[1020] h-0.5 -translate-x-1/2 -translate-y-1/2 bg-primary-green"
      style="width: 0;"
    ></div>

    <!-- First -->
    <div
      ref="firstOvalGroup"
      class="absolute z-[1030]"
      style="opacity: 0;"
    >
      <div class="h-[26px] w-1.5 rounded-[100%] border-2 border-white lg:h-[53px] lg:w-3"></div>
    </div>

    <!-- Second -->
    <div
      ref="secondOvalGroup"
      class="absolute z-[1030] flex w-[50px] items-center justify-between lg:w-[100px]"
      style="opacity: 0;"
    >
      <div class="h-[38px] w-2 rounded-[100%] border-2 border-primary-green lg:h-[77px] lg:w-4"></div>
      <div class="h-[38px] w-2 rounded-[100%] border-2 border-primary-green lg:h-[77px] lg:w-4"></div>
    </div>

    <!-- Third -->
    <div
      ref="thirdOvalGroup"
      class="absolute z-[1030] flex w-[104px] items-center justify-between lg:w-52"
      style="opacity: 0;"
    >
      <div class="h-[58px] w-[13px] rounded-[100%] border-2 border-primary-green lg:h-[117px] lg:w-7"></div>
      <div class="h-[58px] w-[13px] rounded-[100%] border-2 border-primary-green lg:h-[117px] lg:w-7"></div>
    </div>

    <!-- Fourth -->
    <div
      ref="fourthOvalGroup"
      class="absolute z-[1030] flex w-[168px] items-center justify-between lg:w-[336px]"
      style="opacity: 0;"
    >
      <div class="h-[78px] w-[18px] rounded-[100%] border-2 border-white lg:h-[156px] lg:w-9"></div>
      <div class="h-[78px] w-[18px] rounded-[100%] border-2 border-primary-green lg:h-[156px] lg:w-9"></div>
    </div>

    <!-- Fifth -->
    <div
      ref="fifthOvalGroup"
      class="absolute z-[1030] flex w-60 items-center justify-between lg:w-[480px]"
      style="opacity: 0;"
    >
      <div class="h-[98px] w-[22px] rounded-[100%] border-2 border-primary-green lg:h-[196px] lg:w-11"></div>
      <div class="h-[98px] w-[22px] rounded-[100%] border-2 border-white lg:h-[196px] lg:w-11"></div>
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
