<script setup lang="ts">
const { headerRef } = defineProps<{
  headerRef: HTMLDivElement | null
}>()

const { $gsap } = useNuxtApp()
const headerLogoWordsRef = ref<HTMLDivElement | null>(null)
const headerLogoWordsSmRef = ref<HTMLDivElement | null>(null)

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
      start: '-1px top',
      end: 'bottom top',
      scrub: 1,
      // markers: true,
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
      tlSm.fromTo(headerLogoWordsSmRef.value, {
        y: 100,
        width: 'calc(100vw - 40px)',
      }, {
        y: 0,
        width: '30dvw',
        ease: 'power3.inOut',
      })
      tlSm.pause()
    }

    if (isPad) {
      tlSm.restart()
      tlSm.fromTo(headerLogoWordsSmRef.value, {
        y: 110,
        width: 'calc(100vw - 40px)',
        transformOrigin: 'center center',
      }, {
        y: 0,
        width: '30dvw',
        transformOrigin: 'center center',
        ease: 'power3.inOut',
      })
      tlSm.pause()
    }

    if (isDesktopSm) {
      tl.restart()
      tl.from(headerLogoWordsRef.value, {
        x: 8,
        y: 115,
        transformOrigin: 'top left',
        ease: 'power3.inOut',
        scale: 4.7,
      })
      tl.pause()
    }

    if (isDesktopLg) {
      tl.restart()
      tl.from(headerLogoWordsRef.value, {
        x: 8,
        y: 130,
        transformOrigin: 'top left',
        ease: 'power3.inOut',
        scale: 3.44,
      })
      tl.pause()
    }

    if (isDesktopXl) {
      tl.restart()
      tl.from(headerLogoWordsRef.value, {
        x: -40,
        y: 132,
        transformOrigin: 'top left',
        ease: 'power3.inOut',
        scale: 3.7,
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
    class="relative hidden h-10 w-full max-w-[14.5%] lg:block"
  >
    <NuxtImg
      src="/logo-words.svg"
      alt="logoWords"
      class="absolute left-0 top-4 h-auto w-full"
    />
  </div>

  <!-- 手機版 -->
  <div
    ref="headerLogoWordsSmRef"
    class="relative h-10 w-full min-w-[192px] lg:hidden"
  >
    <NuxtImg
      id="headerLogoWordsSm"
      src="/logo-words.svg"
      alt="logoWords"
      class="absolute left-0 top-4 h-auto w-full"
    />
  </div>
</template>
