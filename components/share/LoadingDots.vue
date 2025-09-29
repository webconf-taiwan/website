<script setup lang="ts">
const gsap = useGsap()

const { setFirstLoad } = useGlobalState()
onMounted(() => {
  const dots = gsap.utils.toArray('.dot') as HTMLElement[]
  const horizontalLine = document.querySelector(
    '.horizontalLine',
  ) as HTMLElement

  const tl = gsap.timeline({ repeat: -1 })

  dots.forEach((dot) => {
    tl.to(dot, {
      y: -30,
      duration: 0.3,
      backgroundColor: '#002EFF',
      ease: 'power1.inOut',
      yoyo: true,
      repeat: 1,
    })
  })

  gsap.to(horizontalLine, {
    width: '100%',
    duration: 3,
    ease: 'power1.inOut',
    delay: 0.4,
    onComplete: () => {
      setFirstLoad(true)
    },
  })
})
</script>

<template>
  <div class="min-h-svh cursor-auto bg-black">
    <div
      class="absolute bottom-5 right-10 flex gap-[30px] px-[19px] py-[43px] sm:bottom-10 sm:right-20"
    >
      <div class="dot size-[18px] bg-webconf-gray"></div>
      <div class="dot size-[18px] bg-webconf-gray"></div>
      <div class="dot size-[18px] bg-webconf-gray"></div>
    </div>
    <div
      class="horizontalLine absolute bottom-[70px] left-0 h-[1px] w-0 bg-webconf-gray sm:bottom-[90px]"
    ></div>
  </div>
</template>
