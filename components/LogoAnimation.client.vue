<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { nextTick, onMounted, ref } from 'vue'

const { headerRef } = defineProps<{
  headerRef: HTMLDivElement | null
}>()

const { $gsap } = useNuxtApp()
const headerLogoWordsRef = ref<HTMLDivElement | null>(null)
const headerLogoWordsSmRef = ref<HTMLDivElement | null>(null)
const headerLogoLinkRef = ref<HTMLDivElement | null>(null)
const headerLogoLinkSmRef = ref<HTMLDivElement | null>(null)

const logoContainerRef = ref<HTMLElement | null>(null)
const logoContainerWidth = ref(0)

function updateLogoContainerWidth() {
  const container = document.getElementById('logoContainer')
  if (container) {
    logoContainerWidth.value = container.offsetWidth
  }
}

onMounted(async () => {
  await nextTick()

  logoContainerRef.value = document.getElementById('logoContainer')
  updateLogoContainerWidth()

  // 使用 useResizeObserver 來監聽 logoContainer 的大小變化
  if (logoContainerRef.value) {
    useResizeObserver(logoContainerRef, () => {
      updateLogoContainerWidth()
      console.log('Logo container resized:', logoContainerWidth.value)
    })
  }

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
      markers: true,
    },
  })

  mm.add({
    isPhone: `(max-width: 719px)`,
    isPad: `(min-width: 720px) and (max-width: 1024px)`,
    isDesktop: `(min-width: 1025px)`,
  }, (context) => {
    const { isPhone, isPad, isDesktop } = context.conditions as { isPhone: boolean, isPad: boolean, isDesktop: boolean }

    if (isPhone) {
      tlSm.from(headerLogoWordsSmRef.value, {
        y: '+=100',
        width: 'calc(100% - 40px)',
        transformOrigin: 'top center',
        ease: 'power3.inOut',
      })
    }

    if (isPad) {
      tlSm.from(headerLogoWordsSmRef.value, {
        y: '+=110',
        width: 'calc(100% - 40px)',
        transformOrigin: 'top left',
        ease: 'power3.inOut',
      })
    }

    if (isDesktop) {
      tl.from(headerLogoWordsRef.value, {
        x: '-=40',
        y: '+=150',
        width: () => `${logoContainerWidth.value}px`,
        // scale: 3.78,
      })
    }
  })
})
</script>

<template>
  <!-- 電腦版 -->
  <div
    ref="headerLogoWordsRef"
    class="relative hidden h-10 lg:block w-[20%]"
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
