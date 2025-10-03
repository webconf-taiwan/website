<script setup lang="ts">
const gsap = useGsap()

onMounted(() => {
  const els = gsap.utils.toArray('.float-blocks') as HTMLElement[]

  if (!els)
    return

  els.forEach((el) => {
    return gsap.to(el, {
      x: () => gsap.utils.random(-10, 10),
      y: () => gsap.utils.random(-10, 10),
      duration: gsap.utils.random(1, 1.5),
      ease: 'none',
      repeat: -1,
      repeatRefresh: true,
    })
  })
})
</script>

<template>
  <div
    class="pointer-events-none absolute inset-0 z-[1] size-full touch-none select-none"
  >
    <div
      class="float-blocks absolute bottom-[29px] right-[54px] block size-3 bg-[#2F2ADB] md:bottom-[50.95px] md:right-[133.15px] md:size-[22.05px]"
    ></div>
    <div
      class="float-blocks absolute bottom-[14px] right-[28px] block size-3 bg-webconf-gray md:bottom-[20.94px] md:right-[59.15px] md:size-[22.05px]"
    ></div>
    <div
      class="float-blocks absolute bottom-[10px] right-[13px] size-3 bg-[#909090] before:absolute before:inset-1/2 before:block before:size-1 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:bottom-[9.95px] md:right-[29.95px] md:size-[22.05px] md:before:size-2"
    ></div>
    <div
      class="float-blocks absolute bottom-[12px] left-[11px] size-3 bg-[#909090] before:absolute before:inset-1/2 before:block before:size-1 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:bottom-[10.05px] md:left-[10px] md:size-[22.05px] md:before:size-2"
    ></div>
    <div
      class="float-blocks absolute bottom-10 left-[33px] size-3 bg-[#909090] before:absolute before:inset-1/2 before:block before:size-1 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:bottom-[54.17px] md:left-[54.11px] md:size-[22.05px] md:before:size-2"
    ></div>
    <div
      class="float-blocks absolute bottom-3 left-[47px] size-3 bg-[#909090] before:absolute before:inset-1/2 before:block before:size-1 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:bottom-[12.06px] md:left-[70.16px] md:size-[22.05px] md:before:size-2"
    ></div>
    <div
      class="float-blocks absolute bottom-[26px] left-[49px] size-3 bg-[#2F2ADB] md:bottom-[41.11px] md:left-[76.16px] md:size-[22.05px]"
    ></div>
    <div
      class="float-blocks absolute bottom-[19px] left-[88px] size-3 bg-[#2F2ADB] md:bottom-[15.06px] md:left-[120.27px] md:size-[22.05px]"
    ></div>
    <div
      class="float-blocks absolute bottom-[11.06px] left-[182.44px] hidden size-3 bg-[#909090] before:absolute before:inset-1/2 before:block before:size-1 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:block md:size-[22.05px] md:before:size-2"
    ></div>
    <div
      class="float-blocks absolute bottom-[48px] left-[63px] block size-[12px] bg-webconf-gray md:hidden"
    ></div>
  </div>
</template>
