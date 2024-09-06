<script lang="ts" setup>
import { breakpointsTailwind } from '@vueuse/core'

interface Tile {
  opacity: number
  fadeIn: boolean
  startTime: number
}

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smallerOrEqual('lg')

const tilesCanvas = ref<HTMLCanvasElement | null>(null)

const tileSize = computed(() => isMobile.value ? 72 : 144)
const tileStrokeWidth = computed(() => isMobile.value ? 1 : 2)
let rows: number, cols: number
let offsetX: number

const maxOpacity = 0.1
const fadeInDuration = 150
const fadeOutDuration = 500

const highlightedTiles: Map<string, Tile> = new Map()

function resizeCanvas(canvas: Ref<HTMLCanvasElement | null>, ctx: CanvasRenderingContext2D): void {
  canvas.value!.width = document.body.clientWidth
  canvas.value!.height = document.body.clientHeight
  rows = Math.ceil(canvas.value!.height / tileSize.value)
  cols = Math.ceil(canvas.value!.width / tileSize.value) + 1
  offsetX = (canvas.value!.width % tileSize.value) / 2 - tileSize.value / 2
  drawGrid(canvas, ctx)
}

function drawGrid(canvas: Ref<HTMLCanvasElement | null>, ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height)
  ctx.fillStyle = 'rgb(255, 255, 255, 0%)'

  // Draw base grid
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = offsetX + j * tileSize.value
      const y = i * tileSize.value
      ctx.fillRect(x, y, tileSize.value, tileSize.value)
    }
  }

  // Draw tile stroke
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = tileStrokeWidth.value

  for (let i = 0; i <= rows; i++) {
    ctx.beginPath()
    ctx.moveTo(offsetX, i * tileSize.value)
    ctx.lineTo(offsetX + cols * tileSize.value, i * tileSize.value)
    ctx.stroke()
  }

  for (let j = 0; j <= cols; j++) {
    ctx.beginPath()
    ctx.moveTo(offsetX + j * tileSize.value, 0)
    ctx.lineTo(offsetX + j * tileSize.value, rows * tileSize.value)
    ctx.stroke()
  }

  if (isMobile.value)
    return

  // Draw highlighted cells ( only desktop )
  highlightedTiles.forEach((cell, key) => {
    const [row, col] = key.split(',').map(Number)
    ctx.fillStyle = `rgba(255, 255, 255, ${cell.opacity})`
    ctx.fillRect(offsetX + col * tileSize.value, row * tileSize.value, tileSize.value, tileSize.value)
  })
}

function updateHighlight(currentTime: number): void {
  if (isMobile.value)
    return

  let needsUpdate: boolean = false

  highlightedTiles.forEach((cell, key) => {
    const elapsed: number = currentTime - cell.startTime
    const duration: number = cell.fadeIn ? fadeInDuration : fadeOutDuration
    const progress: number = Math.min(elapsed / duration, 1)

    if (cell.fadeIn) {
      cell.opacity = progress * maxOpacity
    }
    else {
      cell.opacity = (1 - progress) * maxOpacity
    }

    if (progress === 1 && !cell.fadeIn) {
      if (!cell.fadeIn) {
        highlightedTiles.delete(key)
      }
      else {
        cell.opacity = maxOpacity
      }
    }

    needsUpdate = true
  })

  if (needsUpdate) {
    drawGrid(tilesCanvas!, tilesCanvas.value!.getContext('2d')!)
    requestAnimationFrame(updateHighlight)
  }
}

const throttledResizeFn = useThrottleFn(() => {
  if (!tilesCanvas.value)
    return
  const ctx = tilesCanvas.value.getContext('2d')

  if (!ctx)
    return

  resizeCanvas(tilesCanvas, ctx)
}, 100)

function mouseMoveFn(event: MouseEvent) {
  if (!tilesCanvas.value)
    return
  const ctx = tilesCanvas.value.getContext('2d')

  if (!ctx)
    return

  const rect = tilesCanvas.value.getBoundingClientRect()
  const col = Math.floor((event.clientX - rect.left - offsetX) / tileSize.value)
  const row = Math.floor((event.clientY - rect.top) / tileSize.value)

  if (row >= 0 && row < rows && col >= 0 && col < cols) {
    const key: string = `${row},${col}`
    if (!highlightedTiles.has(key) || !highlightedTiles.get(key)!.fadeIn) {
      highlightedTiles.set(key, {
        opacity: 0,
        fadeIn: true,
        startTime: performance.now(),
      })
      requestAnimationFrame(updateHighlight)
    }
  }

  highlightedTiles.forEach((cell, key) => {
    const [cellRow, cellCol] = key.split(',').map(Number)
    if (cellRow !== row || cellCol !== col) {
      if (cell.fadeIn) {
        cell.fadeIn = false
        cell.startTime = performance.now()
      }
    }
  })
}

useEventListener(document, 'mousemove', mouseMoveFn)

useEventListener(window, 'resize', throttledResizeFn)

onMounted(async () => {
  await nextTick()
  if (!tilesCanvas.value)
    return
  const ctx = tilesCanvas.value.getContext('2d')

  if (!ctx)
    return
  resizeCanvas(tilesCanvas, ctx)
})
</script>

<template>
  <canvas
    ref="tilesCanvas"
    class="pointer-events-none absolute left-0 top-0 -z-10 h-auto w-full"
  ></canvas>
</template>

<style scope></style>
