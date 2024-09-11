<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const { headerRef } = defineProps<{
  headerRef: HTMLDivElement | null
}>()

gsap.registerPlugin(ScrollTrigger)

const headerLogoWordsRef = ref<HTMLImageElement | null>(null)
const headerLogoLinkRef = ref<HTMLAnchorElement | null>(null)

onMounted(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: headerRef,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      // markers: true,
    },
  })

  tl.fromTo(headerLogoWordsRef.value, {
    x: 278,
    y: 243,
    scale: 3.58,
  }, {
    x: 0,
    y: 0,
    scale: 1,
    ease: 'power3.inOut',
  }).fromTo(headerLogoLinkRef.value, {
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
})
</script>

<template>
  <div
    ref="headerLogoWordsRef"
    class="relative h-10 w-[200px]"
  >
    <NuxtImg
      src="/logoWords.svg"
      alt="logoWords"
      class="absolute left-0 top-0 size-full"
    />

    <NuxtLink
      ref="headerLogoLinkRef"
      to="/"
      class="absolute left-0 top-0 size-full"
    />
  </div>
</template>
