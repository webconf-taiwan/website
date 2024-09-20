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

  const mm = $gsap.matchMedia()

  const tl = $gsap.timeline({
    scrollTrigger: {
      trigger: headerRef,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  })

  const tlSm = $gsap.timeline({
    scrollTrigger: {
      trigger: headerRef,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  })

  mm.add({
    isPhone: `(max-width: 719px)`,
    isPad: `(min-width: 720px) and (max-width: 1023px)`,
    isDesktopSm: `(min-width: 1024px) and (max-width: 1279px)`,
    isDesktopLg: `(min-width: 1280px) and (max-width: 1530px)`,
    isDesktopXl: `(min-width: 1531px)`,
  }, (context) => {
    const { isPhone, isPad, isDesktopSm, isDesktopLg, isDesktopXl } = context.conditions as { isPhone: boolean, isPad: boolean, isDesktopSm: boolean, isDesktopLg: boolean, isDesktopXl: boolean }

    if (isPhone) {
      tlSm.restart()
      tlSm.from(headerLogoWordsSmRef.value, {
        y: 100,
        width: 'calc(100% - 40px)',
        // scale: 2,
        transformOrigin: 'center center',
        ease: 'power3.inOut',
      })
      tlSm.pause()
    }

    if (isPad) {
      tlSm.restart()
      tlSm.from(headerLogoWordsSmRef.value, {
        y: 110,
        width: 'calc(100% - 40px)',
        transformOrigin: 'top left',
        ease: 'power3.inOut',
      })
      tlSm.pause()
    }

    if (isDesktopSm) {
      tl.restart()
      tl.from(headerLogoWordsRef.value, {
        x: 10,
        y: 150,
        transformOrigin: 'top left',
        ease: 'power3.inOut',
        scale: 4.7,
      })
      tl.pause()
    }

    if (isDesktopLg) {
      tl.restart()
      tl.from(headerLogoWordsRef.value, {
        x: 10,
        y: 145,
        transformOrigin: 'top left',
        ease: 'power3.inOut',
        scale: 3.44,
      })
      tl.pause()
    }

    if (isDesktopXl) {
      tl.restart()
      tl.from(headerLogoWordsRef.value, {
        x: -36,
        y: 145,
        transformOrigin: 'top left',
        ease: 'power3.inOut',
        scale: 3.67,
      })
      tl.pause()
    }
  })
})
</script>

<template>
  <!-- 電腦版 -->
  <div
    ref="headerLogoWordsRef"
    class="relative hidden h-10 w-[14.5%] lg:block"
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
