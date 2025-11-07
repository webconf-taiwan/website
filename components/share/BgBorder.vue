<script setup lang="ts">
import type p5 from 'p5'
import { useBreakpoints } from '@vueuse/core'

const props = withDefaults(defineProps<Props>(), {
  borderColor: '#E6E6E6',
  borderWidth: 1,
  borderAlpha: 0.3,
  dvdDotSpeed: 1,
  dvdDotColors: () => ['#2F2ADB', '#919191', '#E6E6E6'] as const,
})
const breakpoints = useBreakpoints({
  lg: 1024,
})
const isDesktop = breakpoints.greaterOrEqual('lg')

interface Props {
  borderColor?: string
  borderWidth?: number
  borderAlpha?: number
  dvdDotSpeed?: number
  dvdDotColors?: [string, string, string]
}

// 定義 DVD 方框屬性
interface DVDBox {
  x: number // 初始座標
  y: number // 初始座標
  vx: number // 移動 x 座標
  vy: number // 移動 y 座標
  size: number // 大小
  color: string // 顏色
  colorIndex: number // 顏色索引
}

const gridContainer = ref<HTMLElement | null>(null)
const boxContainer = ref<HTMLElement | null>(null)
const contentContainer = ref<HTMLElement | null>(null)
const gridSizeRef = ref<number>(0)

let dvdDots: DVDBox[] = [] // DVD 方框狀態
const FIXED_GRID_SIZE = computed(() => (isDesktop.value ? 80 : 64)) // 網格的大小(固定值)
let gridSize: number // 網格大小（動態計算）
const ease = 0.25 // 平滑滑鼠追蹤係數

let topLayer: p5.Graphics | null // 上層灰網格緩衝
let bottomLayer: p5.Graphics | null // 下層藍網格緩衝
let tempLayer: p5.Graphics | null // 臨時圖層（用於遮罩效果）
let mx: number, my: number, tx: number, ty: number // 鼠標位置
let r: number // flashlight 半徑

const defaultColors = {
  primary: '#4a90ff', // 方框預設顏色
  topGrid: props.borderColor, // 上層灰網格顏色
  bottomGrid: '#002EFF', // 下層藍網格顏色
}

const dvdDotSize = 20
const headerOffset = 58 // 對應 h-[58px] 的高度偏移
const p5InstanceRef = ref<p5 | null>(null)

watch(
  () => props.dvdDotSpeed,
  (newSpped) => {
    for (const dot of dvdDots) {
      const speed = newSpped || 4
      dot.vx = dot.vx < 0 ? -Math.abs(speed) : Math.abs(speed)
      dot.vy = dot.vy < 0 ? -Math.abs(speed) : Math.abs(speed)
    }
  },
)

watch(
  [() => props.borderColor, () => props.borderWidth, () => props.borderAlpha],
  ([newColor, newWidth, newAlpha]) => {
    defaultColors.topGrid = newColor
    if (topLayer && p5InstanceRef.value) {
      const p = p5InstanceRef.value
      drawGrid(p, topLayer, p.color(newColor), newAlpha, newWidth)
    }
  },
)

function drawGrid(
  p: p5,
  pg: p5.Graphics,
  lineCol: p5.Color,
  alpha: number = 1,
  customStrokeWeight?: number,
) {
  if (!pg)
    return

  pg.background(0)

  const ctx = pg.drawingContext as CanvasRenderingContext2D
  if (!ctx)
    return

  const r = p.red(lineCol)
  const g = p.green(lineCol)
  const b = p.blue(lineCol)

  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
  ctx.lineWidth = customStrokeWeight || 0.5
  ctx.lineCap = 'butt'
  ctx.lineJoin = 'miter' // 確保連接點是尖角

  // 確保線條對齊到像素邊界，避免模糊
  const halfPixel = (customStrokeWeight || 0.5) % 2 === 0 ? 0 : 0.5

  ctx.beginPath()

  // 繪製垂直線 - 從第一條開始，避免邊界重疊
  for (let x = gridSize; x < pg.width; x += gridSize) {
    const adjustedX = Math.floor(x) + halfPixel
    ctx.moveTo(adjustedX, 0)
    ctx.lineTo(adjustedX, pg.height)
  }

  // 繪製水平線 - 從第一條開始，避免邊界重疊
  for (let y = gridSize; y < pg.height; y += gridSize) {
    const adjustedY = Math.floor(y) + halfPixel
    ctx.moveTo(0, adjustedY)
    ctx.lineTo(pg.width, adjustedY)
  }

  ctx.stroke()
}

// 圖層初始化函數
function initializeLayersSync(p: p5) {
  // 清理舊的 Graphics 對象
  if (topLayer) {
    topLayer.remove()
    topLayer = null
  }
  if (bottomLayer) {
    bottomLayer.remove()
    bottomLayer = null
  }
  if (tempLayer) {
    tempLayer.remove()
    tempLayer = null
  }

  if (p.width === undefined || p.height === undefined)
    return

  // 建立三層畫布
  topLayer = p.createGraphics(p.width, p.height, 'p2d')
  bottomLayer = p.createGraphics(p.width, p.height, 'p2d')
  tempLayer = p.createGraphics(p.width, p.height, 'p2d')

  topLayer.pixelDensity(1)
  bottomLayer.pixelDensity(1)
  tempLayer.pixelDensity(1)

  const { topGrid, bottomGrid } = defaultColors

  // 繪製底層藍色網格（完全不透明）
  drawGrid(p, bottomLayer, p.color(bottomGrid), 1, 2)

  // 繪製上層灰色網格（半透明）
  drawGrid(p, topLayer, p.color(topGrid), props.borderAlpha, props.borderWidth)
}

// p5 網格背景程式
function gridSketch(p: p5) {
  p.setup = () => {
    p5InstanceRef.value = p
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight, 'p2d')
    canvas.id('gridCanvas')
    canvas.parent(gridContainer.value!)
    p.pixelDensity(1)

    // 計算 gridSize 和設置 CSS 變數
    gridSize = FIXED_GRID_SIZE.value
    gridSizeRef.value = gridSize

    // 初始化 flashlight 參數
    r = isDesktop.value ? Math.min(p.width, p.height) * 0.25 : 0
    mx = tx = p.width / 2
    my = ty = p.height / 2

    watch(
      isDesktop,
      (newVal) => {
        if (!p)
          return
        r = newVal ? Math.min(p.width, p.height) * 0.25 : 0
      },
      { immediate: true },
    )

    initializeLayersSync(p)
  }

  p.draw = () => {
    if (!p || !topLayer || !bottomLayer || !tempLayer)
      return

    p.clear()

    // 平滑追蹤游標
    mx = p.lerp(mx, tx, ease)
    my = p.lerp(my, ty, ease)

    if (bottomLayer) {
      p.image(bottomLayer, 0, 0)
    }

    if (topLayer && tempLayer) {
      tempLayer.clear()
      tempLayer.image(topLayer, 0, 0)

      const ctx = tempLayer.drawingContext as CanvasRenderingContext2D
      if (ctx) {
        ctx.save()
        ctx.globalCompositeOperation = 'destination-out'
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, r)
        gradient.addColorStop(0, 'rgba(0,0,0,1)')
        gradient.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = gradient

        ctx.beginPath()
        ctx.arc(mx, my, r, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }

      p.image(tempLayer, 0, 0)
    }
  }

  const handleResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
    gridSize = FIXED_GRID_SIZE.value
    gridSizeRef.value = gridSize

    if (
      topLayer
      && (topLayer.width !== p.width || topLayer.height !== p.height)
    ) {
      initializeLayersSync(p)
    }
  }

  p.windowResized = function () {
    handleResized()
  }

  p.mouseMoved = () => {
    if (
      !p
      || !topLayer
      || !bottomLayer
      || !tempLayer
      || p.width === undefined
      || p.height === undefined
    ) {
      return
    }
    tx = p.constrain(p.mouseX, 0, p.width)
    ty = p.constrain(p.mouseY, 0, p.height)
  }

  p.mouseDragged = () => {
    if (
      !p
      || !topLayer
      || !bottomLayer
      || !tempLayer
      || p.width === undefined
      || p.height === undefined
    ) {
      return
    }
    tx = p.constrain(p.mouseX, 0, p.width)
    ty = p.constrain(p.mouseY, 0, p.height)
  }
}

// p5 方框動畫程式
function boxSketch(p: p5) {
  p.setup = () => {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight, 'p2d')
    canvas.parent(boxContainer.value!)
    p.pixelDensity(1)
    canvas.id('dvdDotCanvas')

    // 畫動態方框
    createDVDDots(p)
  }

  p.draw = () => {
    if (!p || p.width === undefined || p.height === undefined) {
      return
    }

    p.clear()
    updateAndDrawDVDDots(p)
  }

  const handleResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

  p.windowResized = function () {
    handleResized()
  }
}

// 創建 DVD 初始化設定
function createDVDDots(p: p5) {
  dvdDots = []

  // 確保方框完全在邊界內，考慮 header 偏移
  const buffer = 20
  const minX = dvdDotSize / 2 + buffer
  const maxX = p.width - dvdDotSize / 2 - buffer
  const minY = headerOffset + dvdDotSize / 2 + buffer
  const maxY = p.windowHeight - dvdDotSize / 2 - buffer

  dvdDots.push({
    x: p.random(minX, maxX),
    y: p.random(minY, maxY),
    vx: props.dvdDotSpeed,
    vy: props.dvdDotSpeed,
    size: dvdDotSize,
    color: defaultColors.primary,
    colorIndex: 0,
  })
}

// 更新和繪製 DVD 點
function updateAndDrawDVDDots(p: p5) {
  if (!p || p.width === undefined || p.height === undefined) {
    return
  }

  const buffer = 20

  for (const dot of dvdDots) {
    // 先更新位置
    dot.x += dot.vx
    dot.y += dot.vy

    // 邊界檢測，使用當前視窗的可見區域
    const minX = dot.size / 2 + buffer
    const maxX = p.width - dot.size / 2 - buffer
    const topBoundary = headerOffset + dot.size / 2 + buffer
    const bottomBoundary = p.windowHeight - dot.size / 2 - buffer

    if (dot.x <= minX) {
      dot.x = minX
      dot.vx = Math.abs(dot.vx)
      dot.colorIndex = (dot.colorIndex + 1) % props.dvdDotColors.length
      dot.color = props.dvdDotColors[dot.colorIndex]
    }
    if (dot.x >= maxX) {
      dot.x = maxX
      dot.vx = -Math.abs(dot.vx)
      dot.colorIndex = (dot.colorIndex + 1) % props.dvdDotColors.length
      dot.color = props.dvdDotColors[dot.colorIndex]
    }
    if (dot.y <= topBoundary) {
      dot.y = topBoundary
      dot.vy = Math.abs(dot.vy)
      dot.colorIndex = (dot.colorIndex + 1) % props.dvdDotColors.length
      dot.color = props.dvdDotColors[dot.colorIndex]
    }
    if (dot.y >= bottomBoundary) {
      dot.y = bottomBoundary
      dot.vy = -Math.abs(dot.vy)
      dot.colorIndex = (dot.colorIndex + 1) % props.dvdDotColors.length
      dot.color = props.dvdDotColors[dot.colorIndex]
    }

    drawGlowingBox(p, dot.x, dot.y, dot.size, dot.color)
  }
}

// 繪製方框
function drawGlowingBox(
  p: p5,
  x: number,
  y: number,
  size: number,
  colorHex: string,
) {
  const colorObj = p.color(colorHex)
  const r = p.red(colorObj)
  const g = p.green(colorObj)
  const b = p.blue(colorObj)

  // 核心方框
  p.fill(r, g, b)
  p.noStroke()
  p.rectMode(p.CENTER)
  p.rect(x, y, size, size)
}

const gridP5Sketch = useP5Sketch({
  container: gridContainer,
  sketch: gridSketch,
})

const boxP5Sketch = useP5Sketch({
  container: boxContainer,
  sketch: boxSketch,
})

onMounted(async () => {
  gridP5Sketch.createSketch()
  boxP5Sketch.createSketch()
})

onUnmounted(() => {
  document.documentElement.style.removeProperty('--grid-size')

  if (topLayer)
    topLayer.remove()
  if (bottomLayer)
    bottomLayer.remove()
  if (tempLayer)
    tempLayer.remove()

  gridP5Sketch.destroySketch()
  boxP5Sketch.destroySketch()
})
</script>

<template>
  <div class="relative size-full bg-black">
    <!-- 網格層 (最底層) -->
    <div
      ref="gridContainer"
      class="fixed inset-0 z-10 size-full"
    ></div>

    <!-- 浮動方塊特效 -->
    <ShareFloatingBlocks class="z-[15]" />

    <!-- 內容層 (圖片等) -->
    <div
      ref="contentContainer"
      class="content-container relative z-[20] flex min-h-screen flex-col overflow-x-clip"
    >
      <slot></slot>
    </div>

    <!-- 方框層 (最上層) -->
    <Teleport to="body">
      <div
        ref="boxContainer"
        class="pointer-events-none fixed inset-0 z-50 size-full"
      ></div>
    </Teleport>
  </div>
</template>

<style scoped>
@supports (min-height: 100dvh) {
  .hero-contentContainer {
    min-height: 100dvh;
  }
}
</style>
