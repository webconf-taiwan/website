<script setup lang="ts">
const { gsap } = useGsap()

onMounted(() => {
  const els = gsap.utils.toArray('.float-blocks') as HTMLElement[]

  if (!els.length)
    return

  const mm = gsap.matchMedia()

  mm.add('(min-width: 1024px)', () => {
    gsap.delayedCall(0.6, () => {
      for (const el of els) {
        gsap.to(el, {
          x: () => gsap.utils.random(-10, 10),
          y: () => gsap.utils.random(-10, 10),
          duration: gsap.utils.random(1, 1.5),
          ease: 'none',
          repeat: -1,
          repeatRefresh: true,
        })
      }
    })
  })

  onUnmounted(() => {
    mm.revert()
  })
})
</script>

<template>
  <div
    class="pointer-events-none fixed inset-0 z-[1] hidden size-full touch-none select-none lg:block"
  >
    <div
      class="float-blocks absolute bottom-[10.06px] left-[10px] size-[22.05px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-['']"
    ></div>
    <div
      class="float-blocks absolute bottom-[12.06px] left-[70.16px] size-[22.05px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-['']"
    ></div>
    <div
      class="float-blocks absolute bottom-[54.17px] left-[54.11px] size-[22.05px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-['']"
    ></div>
    <div
      class="float-blocks absolute bottom-[11.06px] left-[182.44px] size-[22.05px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-['']"
    ></div>
    <div
      class="float-blocks absolute bottom-[41.11px] left-[76.16px] block size-[22.05px] bg-[#2F2ADB]"
    ></div>
    <div
      class="float-blocks absolute bottom-[15.06px] left-[120.27px] block size-[22.05px] bg-[#2F2ADB]"
    ></div>
  </div>
</template>
