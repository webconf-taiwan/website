<script setup lang="ts">
const { gsap } = useGsap()
const containerRef = ref<HTMLElement | null>(null)

onMounted(() => {
  nextTick(() => {
    if (!containerRef.value)
      return

    const els = containerRef.value.querySelectorAll(
      '.banner-float-block',
    ) as NodeListOf<HTMLElement>

    if (!els || els.length === 0)
      return

    els.forEach((el) => {
      gsap.to(el, {
        x: () => gsap.utils.random(-10, 10),
        y: () => gsap.utils.random(-10, 10),
        duration: gsap.utils.random(1, 1.5),
        ease: 'none',
        repeat: -1,
        repeatRefresh: true,
      })
    })
  })
})
</script>

<template>
  <div
    ref="containerRef"
    class="pointer-events-none absolute inset-0 z-[1] size-full touch-none select-none"
  >
    <div
      class="banner-float-block absolute bottom-[29px] right-[54px] block size-3 bg-[#2F2ADB] lg:bottom-[55.95px] lg:right-[133.15px] lg:size-[22.05px]"
    ></div>
    <div
      class="banner-float-block absolute bottom-[14px] right-[28px] block size-3 bg-webconf-gray lg:bottom-[25.94px] lg:right-[59.15px] lg:size-[22.05px]"
    ></div>
    <div
      class="banner-float-block absolute bottom-[10px] right-[13px] size-3 bg-[#909090] before:absolute before:inset-1/2 before:block before:size-1 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] lg:bottom-[14.95px] lg:right-[29.95px] lg:size-[22.05px] lg:before:size-2"
    ></div>
    <div
      class="banner-float-block absolute bottom-[12px] left-[11px] size-3 bg-[#909090] before:absolute before:inset-1/2 before:block before:size-1 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] lg:bottom-[4.06px] lg:left-[10px] lg:size-[22.05px] lg:before:size-2"
    ></div>
    <div
      class="banner-float-block absolute bottom-10 left-[33px] size-3 bg-[#909090] before:absolute before:inset-1/2 before:block before:size-1 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] lg:bottom-[48.17px] lg:left-[54.11px] lg:size-[22.05px] lg:before:size-2"
    ></div>
    <div
      class="banner-float-block absolute bottom-3 left-[47px] size-3 bg-[#909090] before:absolute before:inset-1/2 before:block before:size-1 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] lg:bottom-[6.06px] lg:left-[70.16px] lg:size-[22.05px] lg:before:size-2"
    ></div>
    <div
      class="banner-float-block absolute bottom-[26px] left-[49px] size-3 bg-[#2F2ADB] lg:bottom-[35.11px] lg:left-[76.16px] lg:size-[22.05px]"
    ></div>
    <div
      class="banner-float-block absolute bottom-[19px] left-[88px] size-3 bg-[#2F2ADB] lg:bottom-[9.06px] lg:left-[120.27px] lg:size-[22.05px]"
    ></div>
    <div
      class="banner-float-block absolute bottom-[5.06px] left-[182.44px] hidden size-[22.05px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] lg:block"
    ></div>
    <div
      class="banner-float-block absolute bottom-[20.11px] left-[393.97px] hidden size-[22.05px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] lg:block"
    ></div>
    <div
      class="banner-float-block absolute bottom-[48px] left-[63px] block size-[12px] bg-webconf-gray lg:hidden"
    ></div>
  </div>
</template>
