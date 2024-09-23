<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints, useWindowSize } from '@vueuse/core'
import { computed, ref } from 'vue'

const { $gsap } = useNuxtApp()

const tilesBackgroundStore = useTilesBackgroundStore()

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')

const { width, height } = useWindowSize()

const tileSize = computed(() => isSmallerLg.value ? 60 : 144)
const columns = computed(() => Math.ceil(width.value / tileSize.value) + 1)
const rows = computed(() => Math.ceil(height.value / tileSize.value))

const container = ref<HTMLDivElement | null>(null)
const tilesContainer = ref<HTMLDivElement | null>(null)
const tileElements = ref<HTMLDivElement[]>([])
const tempTileIndex = ref<number | null>(null)

const tiles = computed(() => {
  const tileCount = columns.value * rows.value
  return Array.from({ length: tileCount }, (_, i) => ({
    id: `tile-${i}`,
  }))
})

const containerWidth = computed(() => columns.value * tileSize.value)

const throttledMouseMoveFn = useThrottleFn((event: MouseEvent) => {
  if (isSmallerLg.value || !container.value || !tilesContainer.value)
    return

  const gridRect = tilesContainer.value.getBoundingClientRect()

  const relativeX = event.clientX - gridRect.left
  const relativeY = event.clientY - gridRect.top

  const col = Math.floor(relativeX / tileSize.value)
  const row = Math.floor(relativeY / tileSize.value)
  const index = row * columns.value + col

  if (index >= 0 && index < tileElements.value.length) {
    tempTileIndex.value = index
  }
}, 16) // Approximately 60 FPS

watch(tempTileIndex, (index, prevIndex) => {
  if (index === prevIndex)
    return

  if (index !== null)
    animateTile(index, tilesBackgroundStore.tilesTargetOpacity)
})

function animateTile(index: number, targetOpacity: string = '0.1') {
  const tile = tileElements.value[index]
  if (!tile)
    return

  $gsap.killTweensOf(tile)

  $gsap.to(tile, {
    backgroundColor: `hsla(168, 100%, 50%, ${targetOpacity})`,
    duration: 0.15,
    overwrite: true,
    ease: 'power2.out',
    onComplete: () => {
      $gsap.to(tile, {
        backgroundColor: 'hsla(168, 100%, 50%, 0)',
        duration: 1,
        delay: 0,
        ease: 'power1.out',
      })
    },
  })
}

useEventListener(document, 'mousemove', throttledMouseMoveFn)
</script>

<template>
  <div
    ref="container"
    class="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
  >
    <div
      ref="tilesContainer"
      class="absolute left-1/2 grid -translate-x-1/2"
      :style="{
        width: `${containerWidth}px`,
        gridTemplateColumns: `repeat(${columns}, ${tileSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${tileSize}px)`,
      }"
    >
      <div
        v-for="tile in tiles"
        :key="tile.id"
        :ref="el => { if (el) tileElements[Number(tile.id.split('-')[1])] = el as HTMLDivElement }"
        class="size-[60px] border border-primary-green/10 lg:size-36"
        :style="{ backgroundColor: 'hsla(168, 100%, 50%, 0)' }"
      ></div>
    </div>
  </div>
</template>
