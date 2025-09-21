<script setup lang="ts">
import type p5 from 'p5'

interface Props {
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

const props = withDefaults(defineProps<Props>(), {
  dvdDotSpeed: 4,
  dvdDotColors: () => ['#2F2ADB', '#919191', '#E6E6E6'] as const,
})

const gridContainer = ref<HTMLElement | null>(null)
const boxContainer = ref<HTMLElement | null>(null)
const contentContainer = ref<HTMLElement | null>(null)
const gridSizeRef = ref<number>(0)

let dvdDots: DVDBox[] = [] // DVD 方框狀態
const FIXED_GRID_SIZE = 80 // 網格的大小(固定值)
let gridSize: number // 網格大小（動態計算）
const ease = 0.25 // 平滑滑鼠追蹤係數

let topLayer: p5.Graphics // 上層灰網格緩衝
let bottomLayer: p5.Graphics // 下層藍網格緩衝
let tempLayer: p5.Graphics // 臨時圖層（用於遮罩效果）
let mx: number, my: number, tx: number, ty: number // 鼠標位置
let r: number // flashlight 半徑

const defaultColors = {
  primary: '#4a90ff', // 方框預設顏色
  topGrid: '#E6E6E6', // 上層灰網格顏色
  bottomGrid: '#002EFF', // 下層藍網格顏色
}

const dvdDotSize = 20
const headerOffset = 58 // 對應 h-[58px] 的高度偏移

watch(
  () => props.dvdDotSpeed,
  (newSpped) => {
    dvdDots.forEach((dot) => {
      const speed = newSpped || 4
      dot.vx = dot.vx < 0 ? -Math.abs(speed) : Math.abs(speed)
      dot.vy = dot.vy < 0 ? -Math.abs(speed) : Math.abs(speed)
    })
  },
)

function setCSSVariables(p: p5) {
  const diff = ((p.windowWidth - 1440) / 100) * 0.8
  const diff2 = ((p.windowWidth - 1440) / 100) * 0.2
  const diff3 = ((p.windowWidth - 1440) / 100) * 0.1
  const diff4 = ((p.windowWidth - 1440) / 100) * 0.4
  const diff6 = ((p.windowWidth - 1440) / 100) * 0.6
  const diff7 = ((p.windowWidth - 1440) / 100) * 0.7

  const cssUpdates = [
    ['--grid-size', `${gridSize}px`],
    ['--grid-diff', diff.toString()],
    ['--grid-diff-2', diff2.toString()],
    ['--grid-diff-3', diff3.toString()],
    ['--grid-diff-4', diff4.toString()],
    ['--grid-diff-6', diff6.toString()],
    ['--grid-diff-7', diff7.toString()],
  ] as const

  requestAnimationFrame(() => {
    cssUpdates.forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value)
    })
  })
}

function drawGrid(
  p: p5,
  pg: p5.Graphics,
  lineCol: p5.Color,
  alpha: number = 1.0,
  customStrokeWeight?: number,
) {
  pg.background(0)

  const r = p.red(lineCol)
  const g = p.green(lineCol)
  const b = p.blue(lineCol)
  pg.stroke(r, g, b, alpha * 255)
  pg.strokeWeight(customStrokeWeight || 0.5)

  // 繪製垂直線
  for (let x = 0; x < pg.width; x += gridSize) {
    pg.line(x, 0, x, pg.height)
  }

  // 繪製水平線
  for (let y = 0; y < pg.height; y += gridSize) {
    pg.line(0, y, pg.width, y)
  }
}

// 圖層初始化函數
function initializeLayersSync(p: p5) {
  // 清理舊的 Graphics 對象
  if (topLayer)
    topLayer.remove()
  if (bottomLayer)
    bottomLayer.remove()
  if (tempLayer)
    tempLayer.remove()

  // 建立三層畫布
  topLayer = p.createGraphics(p.width, p.height)
  bottomLayer = p.createGraphics(p.width, p.height)
  tempLayer = p.createGraphics(p.width, p.height)

  topLayer.pixelDensity(1)
  bottomLayer.pixelDensity(1)
  tempLayer.pixelDensity(1)

  const { topGrid, bottomGrid } = defaultColors

  // 繪製底層藍色網格（完全不透明）
  drawGrid(p, bottomLayer, p.color(bottomGrid), 1.0, 1.5)

  // 繪製上層灰色網格（半透明）
  drawGrid(p, topLayer, p.color(topGrid), 0.5, 0.5)
}

// p5 網格背景程式
function gridSketch(p: p5) {
  p.setup = () => {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
    canvas.id('gridCanvas')
    canvas.parent(gridContainer.value!)
    p.pixelDensity(1)

    // 計算 gridSize 和設置 CSS 變數
    gridSize = FIXED_GRID_SIZE
    gridSizeRef.value = gridSize
    setCSSVariables(p)

    // 初始化 flashlight 參數
    r = Math.min(p.width, p.height) * 0.25
    mx = tx = p.width / 2
    my = ty = p.height / 2

    initializeLayersSync(p)
  }

  p.draw = () => {
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
        gradient.addColorStop(0.0, 'rgba(0,0,0,1)')
        gradient.addColorStop(1.0, 'rgba(0,0,0,0)')
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

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
    gridSize = FIXED_GRID_SIZE
    gridSizeRef.value = gridSize
    setCSSVariables(p)
    initializeLayersSync(p)
  }

  p.mouseMoved = () => {
    tx = p.constrain(p.mouseX, 0, p.width)
    ty = p.constrain(p.mouseY, 0, p.height)
  }

  p.mouseDragged = () => {
    tx = p.constrain(p.mouseX, 0, p.width)
    ty = p.constrain(p.mouseY, 0, p.height)
  }

  p.keyPressed = () => {
    if (p.key === '+' || p.key === '=') {
      r *= 1.1
    }
    if (p.key === '-' || p.key === '_') {
      r *= 0.9
    }
    r = p.constrain(r, 8, Math.max(p.width, p.height))
  }
}

// p5 方框動畫程式
function boxSketch(p: p5) {
  p.setup = () => {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
    canvas.parent(boxContainer.value!)
    p.pixelDensity(1)
    canvas.id('dvdDotCanvas')

    // 畫動態方框
    createDVDDots(p)
  }

  p.draw = () => {
    p.clear()
    updateAndDrawDVDDots(p)
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
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
  const buffer = 20

  dvdDots.forEach((dot) => {
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
  })
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
  gridP5Sketch.destroySketch()
  boxP5Sketch.destroySketch()
})
</script>

<template>
  <div class="relative size-full bg-black">
    <!-- 網格層 (最底層) -->
    <div
      ref="gridContainer"
      class="fixed inset-0 z-[1] size-full"
    ></div>

    <!-- 浮動方塊特效 -->
    <ShareFloatingBlocks />

    <!-- 內容層 (圖片等) -->
    <div
      ref="contentContainer"
      class="relative z-[20] flex min-h-dvh flex-col overflow-x-clip"
    >
      <slot></slot>
    </div>

    <!-- 方框層 (最上層) -->
    <div
      ref="boxContainer"
      class="pointer-events-none fixed inset-0 z-[50] size-full"
    ></div>
  </div>
</template>
