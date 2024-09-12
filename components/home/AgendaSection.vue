<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import cubeAnimation from '~/assets/lottie/cube_animation.json'

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smallerOrEqual('lg')

const cubeSize = computed(() => isMobile.value ? 320 : 424)
</script>

<template>
  <section class="full-bleed bg-black px-5 py-20">
    <div class="mx-auto max-w-[1096px]">
      <div class="mb-8 flex items-center justify-between">
        <HomeSectionTitle>
          <template #title>
            AGENDA
          </template>
          <template #subTitle>
            議程
          </template>
        </HomeSectionTitle>

        <div class="flex items-center gap-x-6">
          <button
            type="button"
            class="flex w-40 items-center justify-center gap-x-2 border border-primary-green bg-gradient-to-b from-primary-green/10 to-primary-green/50 py-4 text-xl"
          >
            <span class="">關於我們</span>
          </button>
          <button
            type="button"
            class="flex w-40 items-center justify-center gap-x-2 border border-primary-green bg-gradient-to-b from-primary-green/10 to-primary-green/50 py-4 text-xl"
          >
            <span class="">查看議程</span>
            <Icon
              name="i-heroicons-arrow-right"
              size="24"
            />
          </button>
        </div>
      </div>

      <HomeAgendaCubeAnimation
        :animation-data="cubeAnimation"
        :loop="true"
        :autoplay="true"
        :speed="1"
        :height="cubeSize"
        :width="cubeSize"
      />
    </div>
  </section>
</template>

<style scope></style>
