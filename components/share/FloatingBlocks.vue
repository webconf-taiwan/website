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
  <div class="pointer-events-none fixed inset-0 z-[1] size-full">
    <div
      class="float-blocks absolute right-[7.16%] top-[6.39%] size-[22.05px] bg-[#2F2ADB]"
    ></div>
    <div
      class="float-blocks absolute right-[2.02%] top-[10.57%] size-[22.05px] bg-webconf-gray"
    ></div>
    <div
      class="float-blocks absolute right-[0.05px] top-[12.09%] size-[22.05px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-['']"
    ></div>
    <div
      class="float-blocks absolute bottom-[1.48%] left-[0.7%] size-[22.05px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-['']"
    ></div>
    <div
      class="float-blocks absolute bottom-[7.53%] left-[3.76%] size-[22.05px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-['']"
    ></div>
    <div
      class="float-blocks absolute bottom-[1.68%] left-[4.88%] size-[22.05px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-['']"
    ></div>
    <div
      class="float-blocks absolute bottom-[5.71%] left-[5.29%] size-[22.05px] bg-[#2F2ADB]"
    ></div>
    <div
      class="float-blocks absolute bottom-[2.1%] left-[8.36%] size-[22.05px] bg-[#2F2ADB]"
    ></div>
    <div
      class="float-blocks absolute bottom-[1.54%] left-[12.67%] size-[22.05px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-['']"
    ></div>
    <div
      class="float-blocks absolute bottom-[3.63%] left-[26.25%] size-[22.05px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-['']"
    ></div>
  </div>
</template>
