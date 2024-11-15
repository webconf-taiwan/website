<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { useMouseState } from './useMouseState'

defineProps({
  class: String,
  containerClass: String,
})

const containerRef = ref<HTMLElement | null>(null)
const mouseState = useMouseState()
provide('use3DCardMouseState', mouseState)

const breakpoints = useBreakpoints(breakpointsTailwind)
const isLargeScreen = breakpoints.greater('lg')

function handleMouseMove(e: MouseEvent) {
  if (!containerRef.value || !isLargeScreen.value)
    return
  const { left, top, width, height } = containerRef.value.getBoundingClientRect()
  const x = (e.clientX - left - width / 2) / 25
  const y = (e.clientY - top - height / 2) / 25
  containerRef.value.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`
}

function handleMouseEnter() {
  if (isLargeScreen.value)
    mouseState.setMouseEntered(true)
}

function handleMouseLeave() {
  if (!containerRef.value)
    return

  mouseState.setMouseEntered(false)
  containerRef.value.style.transform = `rotateY(0deg) rotateX(0deg)`
}
</script>

<template>
  <div
    class="flex items-center justify-center p-2"
    :class="[containerClass]"
    style="perspective: 1000px"
  >
    <div
      ref="containerRef"
      class="relative flex items-center justify-center transition-all duration-200 ease-linear"
      :class="[
        $props.class,
      ]"
      style="transform-style: preserve-3d"
      @mouseenter="handleMouseEnter"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <slot></slot>
    </div>
  </div>
</template>
