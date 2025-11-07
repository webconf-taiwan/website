<script setup lang="ts">
const { gsap } = useGsap()
const route = useRoute()
const hiddenPaths = ['/agenda', '/sponsors', '/history']
const shouldHide = computed(() => {
  return hiddenPaths.some(path => route.path.startsWith(path))
})

onMounted(() => {
  if (shouldHide.value)
    return

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
    v-show="!shouldHide"
    class="pointer-events-none fixed inset-0 size-full touch-none select-none"
  >
    <div
      class="float-blocks absolute right-[19.33px] top-[79.65px] block size-[18.29px] bg-[#2F2ADB] md:hidden md:size-[22.05px]"
    ></div>
    <div
      class="float-blocks absolute right-[49.95px] top-[32.31px] block size-[18.29px] bg-[#2F2ADB] md:hidden md:size-[22.05px] lg:right-[103.15px] lg:top-[46px] lg:block"
    ></div>
    <div
      class="float-blocks absolute right-[49.89px] top-[50.03px] block size-[18.29px] bg-webconf-gray md:hidden md:size-[22.05px] lg:right-[29.05px] lg:top-[76.01px] lg:block"
    ></div>
    <div
      class="float-blocks absolute right-[0.05px] top-[87px] hidden size-[18.29px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-[6px] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:size-[22.05px] md:before:size-2 lg:block"
    ></div>
    <div
      class="float-blocks absolute bottom-0 left-0 size-[18.29px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-[6px] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:bottom-[10.05px] md:left-[10px] md:size-[22.05px] md:before:size-2"
    ></div>
    <div
      class="float-blocks absolute bottom-[36.57px] left-[28.4px] size-[18.29px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-[6px] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:bottom-[54.17px] md:left-[54.11px] md:size-[22.05px] md:before:size-2"
    ></div>
    <div
      class="float-blocks absolute bottom-0 left-[46.69px] size-[18.29px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-[6px] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:bottom-[12.06px] md:left-[70.16px] md:size-[22.05px] md:before:size-2"
    ></div>
    <div
      class="float-blocks absolute bottom-[107.78px] left-[9.14px] size-[18.29px] bg-[#2F2ADB] md:bottom-[41.11px] md:left-[76.16px] md:size-[22.05px]"
    ></div>
    <div
      class="float-blocks absolute bottom-[18.29px] left-[46.69px] size-[18.29px] bg-[#2F2ADB] md:bottom-[15.06px] md:left-[120.27px] md:size-[22.05px]"
    ></div>
    <div
      class="float-blocks absolute bottom-[11.06px] left-[182.44px] hidden size-[18.29px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-[6px] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:block md:size-[22.05px] md:before:size-2"
    ></div>
    <div
      class="float-blocks absolute bottom-[26.11px] left-[393.97px] hidden size-[18.29px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-[6px] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:block md:size-[22.05px] md:before:size-2"
    ></div>
    <div
      class="float-blocks absolute bottom-[49.48px] left-[67.83px] block size-[18.29px] bg-webconf-gray md:hidden"
    ></div>
  </div>
</template>
