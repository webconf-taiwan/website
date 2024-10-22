<script setup lang="ts">
import { useEventListener } from '@vueuse/core'

const headerRef = ref<HTMLDivElement | null>(null)
const gradientOpacity = ref(0)

const route = useRoute()
const isHome = computed(() => route.name === 'index')

/**
 * 計算漸層的透明度，滾動距離越大，透明度越高
 */
function checkScroll() {
  const scrollPercentage = Math.min(window.scrollY / 200, 1)
  gradientOpacity.value = scrollPercentage
}

useEventListener(window, 'scroll', checkScroll)
</script>

<template>
  <header class="flex h-12 items-center lg:h-[72px] lg:justify-center">
    <div
      ref="headerRef"
      class="fixed left-0 top-0 z-30 flex w-full items-center justify-center overflow-x-clip px-5 lg:left-1/2 lg:max-w-[1440px] lg:-translate-x-1/2 lg:justify-between lg:px-10"
    >
      <div
        class="absolute inset-0 bg-gradient-to-t from-transparent to-gradient-bg-start/70 transition-opacity duration-150 lg:hidden"
        :style="{ opacity: gradientOpacity }"
      ></div>
      <template v-if="isHome">
        <LogoAnimation
          v-if="headerRef"
          :header-ref="headerRef"
        />
      </template>
      <template v-else>
        <div class="h-6 w-[192px]">
          <NuxtLink
            to="/"
            class="block py-3"
          >
            <NuxtImg
              src="/logo-words.svg"
              alt="logo"
              class="h-auto w-full"
            />
          </NuxtLink>
        </div>
      </template>
    </div>
  </header>
</template>
