<script setup lang="ts">
const { headerRef } = defineProps<{
  headerRef: HTMLDivElement | null
}>()

const { $gsap } = useNuxtApp()
const headerLogoWordsRef = ref<HTMLDivElement | null>(null)
const headerLogoWordsSmRef = ref<HTMLDivElement | null>(null)
const headerLogoLinkRef = ref<HTMLDivElement | null>(null)
const headerLogoLinkSmRef = ref<HTMLDivElement | null>(null)

onMounted(async () => {
  await nextTick()

  const tl = $gsap.timeline({
    scrollTrigger: {
      trigger: headerRef,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      // markers: true,
    },
  })

  tl.fromTo(headerLogoWordsRef.value, {
    x: 310,
    y: 230,
    // scale,
  }, {
    x: 0,
    y: 0,
    scale: 1,
    ease: 'power3.inOut',
  }).fromTo(headerLogoLinkSmRef.value, {
    x: 278,
    y: 243,
    scale: 3.58,
    zIndex: -1,
  }, {
    x: 0,
    y: 0,
    scale: 1,
    zIndex: 20,
    opacity: 1,
    ease: 'power3.inOut',
  })

  const tlSm = $gsap.timeline({
    scrollTrigger: {
      trigger: headerRef,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      markers: true,
    },
  })

  tlSm.from(headerLogoWordsSmRef.value, {
    y: '13dvh',
    width: 'calc(100% - 40px)',
    transformOrigin: 'top center',
    ease: 'power3.inOut',
  })
})
</script>

<template>
  <!-- 電腦版 -->
  <div
    ref="headerLogoWordsRef"
    class="relative hidden h-10 w-[200px] lg:block"
  >
    <NuxtImg
      src="/logoWords.svg"
      alt="logoWords"
      class="absolute left-0 top-0 h-auto w-full"
    />

    <div ref="headerLogoLinkSmRef">
      <NuxtLink
        to="/"
        class="absolute left-0 top-0 size-full"
      />
    </div>
  </div>

  <!-- 手機版 -->
  <div
    ref="headerLogoWordsSmRef"
    class="fixed h-10 w-[30%] lg:hidden"
  >
    <NuxtImg
      id="headerLogoWordsSm"
      src="/logoWords.svg"
      alt="logoWords"
      class="absolute left-0 top-4 h-auto w-full"
    />

    <div ref="headerLogoLinkRef">
      <NuxtLink
        to="/"
        class="absolute left-0 top-0 size-full"
      />
    </div>
  </div>
</template>
