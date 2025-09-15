<script setup lang="ts">
import type p5 from 'p5'
import { onMounted, onUnmounted, ref } from 'vue'
import { useP5Sketch } from '~/composables/useP5'

// Canvas 尺寸
const CANVAS_WIDTH = 1240
const CANVAS_HEIGHT = 1021

// 可調參數
const ANCHOR_SIZE = 16 // 錨點方塊的尺寸（從 SVG 中提取，16.054px ≈ 16px）
const DRAG_RADIUS = 12 // 可點擊拖曳的半徑
const AMPLITUDE = 10 // 漂浮最大偏移量（±10px）
const SPEED_MIN = 0.0005 // 時間步進（越小越慢）
const SPEED_MAX = 0.001

// 可見點的索引（可自由調整）
const CURVE1_VISIBLE_POINTS = [0, 5, 12] // 第一條曲線的可見點索引
const CURVE2_VISIBLE_POINTS = [0, 11, 18] // 第二條曲線的可見點索引

// 從 SVG 提取的關鍵錨點
const curve1Points = [
  { x: 682.5, y: 704 }, // 起點
  { x: 713.5, y: 659.167 }, // 控制點 1
  { x: 799.3, y: 550.9 }, // 控制點 2
  { x: 886.5, y: 488.5 }, // 錨點 1
  { x: 995.5, y: 410.5 }, // 控制點 3
  { x: 1033.38, y: 411.126 }, // 控制點 4
  { x: 1077.5, y: 487.5 }, // 錨點 2
  { x: 1124, y: 568 }, // 控制點 5
  { x: 1173.77, y: 523.874 }, // 控制點 6
  { x: 1202.5, y: 403 }, // 錨點 3
  { x: 1234, y: 270.5 }, // 控制點 7
  { x: 1209, y: 98.5 }, // 控制點 8
  { x: 1150, y: 21.5 }, // 終點
]

const curve2Points = [
  { x: 288, y: 461.999 }, // 起點
  { x: 330.5, y: 414.165 }, // 控制點 1
  { x: 419.5, y: 322.499 }, // 控制點 2
  { x: 551, y: 253.499 }, // 錨點 1
  { x: 682.5, y: 184.499 }, // 控制點 3
  { x: 772.5, y: 152.016 }, // 控制點 4
  { x: 847.5, y: 196.499 }, // 錨點 2
  { x: 922.5, y: 240.982 }, // 控制點 5
  { x: 891, y: 362.999 }, // 控制點 6
  { x: 831, y: 423.999 }, // 錨點 3
  { x: 771, y: 484.999 }, // 控制點 7
  { x: 661, y: 573.999 }, // 控制點 8
  { x: 432, y: 688.499 }, // 錨點 4
  { x: 203, y: 802.999 }, // 控制點 9
  { x: 17.3551, y: 900.499 }, // 控制點 10
  { x: 21, y: 977.499 }, // 錨點 5
  { x: 25, y: 1062 }, // 控制點 11
  { x: 413, y: 954.999 }, // 控制點 12
  { x: 629, y: 755.999 }, // 終點
]

const containerRef = ref<HTMLElement | null>(null)

// FloatingNode 類別
class FloatingNode {
  base: p5.Vector
  tX: number
  tY: number
  speedX: number
  speedY: number
  offset: p5.Vector
  dragging: boolean
  grabDelta: p5.Vector

  constructor(p: p5, x: number, y: number) {
    this.base = p.createVector(x, y)
    // 確保隨機時間參數是有效數字
    this.tX = Number(p.random(1000)) || 0
    this.tY = Number(p.random(2000)) || 1000
    this.speedX = Number(p.random(SPEED_MIN, SPEED_MAX)) || SPEED_MIN
    this.speedY = Number(p.random(SPEED_MIN, SPEED_MAX)) || SPEED_MIN
    this.offset = p.createVector(0, 0)
    this.dragging = false
    this.grabDelta = p.createVector(0, 0)
  }

  update(_p: p5) {
    if (!this.dragging) {
      // 使用正弦和餘弦函數創造平滑的循環運動
      this.tX += this.speedX
      this.tY += this.speedY

      // 使用三角函數生成平滑的循環運動
      const angleX = (this.tX * Math.PI * 2) % (Math.PI * 2)
      const angleY = (this.tY * Math.PI * 2) % (Math.PI * 2)

      // 將 sin 和 cos 的範圍從 [-1, 1] 映射到 [-AMPLITUDE, AMPLITUDE]
      const offX = Math.sin(angleX) * AMPLITUDE
      const offY = Math.cos(angleY) * AMPLITUDE

      this.offset.set(offX, offY)
    }
  }

  getRenderPos(p: p5): p5.Vector {
    if (this.dragging) {
      return p.constructor.Vector.sub(
        p.createVector(p.mouseX, p.mouseY),
        this.grabDelta,
      )
    }
    return p.constructor.Vector.add(this.base, this.offset)
  }

  draw(p: p5, isActive: boolean) {
    const pos = this.getRenderPos(p)

    // 繪製方形錨點
    p.noStroke()
    p.fill(isActive ? p.color(20, 120, 255) : '#E6E6E6') // 使用 SVG 中定義的顏色
    p.rectMode(p.CENTER)
    p.rect(pos.x, pos.y, ANCHOR_SIZE, ANCHOR_SIZE)

    // 如果是活動狀態，添加邊框效果
    if (isActive) {
      p.noFill()
      p.stroke(20, 120, 255, 80)
      p.strokeWeight(2)
      p.rect(pos.x, pos.y, ANCHOR_SIZE + 4, ANCHOR_SIZE + 4)
    }
  }

  // 新增方法：繪製控制點（完全透明）
  drawAsControlPoint(_p: p5) {
    // 不繪製任何內容，保持完全透明
  }

  beginDrag(p: p5, mouseVec: p5.Vector) {
    this.dragging = true
    const nowPos = this.getRenderPos(p)
    this.grabDelta = p.constructor.Vector.sub(mouseVec, nowPos)
  }

  dragTo(p: p5, mouseVec: p5.Vector) {
    const desiredPos = p.constructor.Vector.sub(mouseVec, this.grabDelta)
    this.base = p.constructor.Vector.sub(desiredPos, this.offset)
  }

  endDrag() {
    this.dragging = false
  }
}

let nodes1: FloatingNode[] = []
let nodes2: FloatingNode[] = []
let draggingIndex = -1
let draggingCurve = -1

function sketch(p: p5) {
  p.setup = () => {
    p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)

    // 初始化第一條曲線的節點
    nodes1 = curve1Points.map(point => new FloatingNode(p, point.x, point.y))

    // 初始化第二條曲線的節點
    nodes2 = curve2Points.map(point => new FloatingNode(p, point.x, point.y))

    p.noFill()
  }

  p.draw = () => {
    // 確保 canvas 已經初始化
    if (!p.canvas)
      return
    p.clear()

    // 繪製第一條曲線
    p.stroke('#E6E6E6')
    p.strokeWeight(2)
    p.noFill()

    // 繪製第一條曲線
    if (nodes1.length === curve1Points.length) {
      // 從 SVG 路徑：M682.5 704C713.5 659.167 799.3 550.9 886.5 488.5C995.5 410.5 1033.38 411.126 1077.5 487.5C1124 568 1173.77 523.874 1202.5 403C1234 270.5 1209 98.5 1150 21.5
      const p0 = nodes1[0].getRenderPos(p) // 起點
      const p1 = nodes1[1].getRenderPos(p) // 控制點
      const p2 = nodes1[2].getRenderPos(p) // 控制點
      const p3 = nodes1[3].getRenderPos(p) // 終點/起點
      const p4 = nodes1[4].getRenderPos(p) // 控制點
      const p5 = nodes1[5].getRenderPos(p) // 控制點
      const p6 = nodes1[6].getRenderPos(p) // 終點/起點
      const p7 = nodes1[7].getRenderPos(p) // 控制點
      const p8 = nodes1[8].getRenderPos(p) // 控制點
      const p9 = nodes1[9].getRenderPos(p) // 終點/起點
      const p10 = nodes1[10].getRenderPos(p) // 控制點
      const p11 = nodes1[11].getRenderPos(p) // 控制點
      const p12 = nodes1[12].getRenderPos(p) // 終點

      // 繪製四段貝茲曲線
      p.bezier(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)
      p.bezier(p3.x, p3.y, p4.x, p4.y, p5.x, p5.y, p6.x, p6.y)
      p.bezier(p6.x, p6.y, p7.x, p7.y, p8.x, p8.y, p9.x, p9.y)
      p.bezier(p9.x, p9.y, p10.x, p10.y, p11.x, p11.y, p12.x, p12.y)
    }

    // 繪製第二條曲線
    if (nodes2.length === curve2Points.length) {
      // 從 SVG 路徑：M288 461.999C330.5 414.165 419.5 322.499 551 253.499C682.5 184.499 772.5 152.016 847.5 196.499C922.5 240.982 891 362.999 831 423.999C771 484.999 661 573.999 432 688.499C203 802.999 17.3551 900.499 21 977.499C25 1062 413 954.999 629 755.999
      const p0 = nodes2[0].getRenderPos(p) // 起點
      const p1 = nodes2[1].getRenderPos(p) // 控制點
      const p2 = nodes2[2].getRenderPos(p) // 控制點
      const p3 = nodes2[3].getRenderPos(p) // 終點/起點
      const p4 = nodes2[4].getRenderPos(p) // 控制點
      const p5 = nodes2[5].getRenderPos(p) // 控制點
      const p6 = nodes2[6].getRenderPos(p) // 終點/起點
      const p7 = nodes2[7].getRenderPos(p) // 控制點
      const p8 = nodes2[8].getRenderPos(p) // 控制點
      const p9 = nodes2[9].getRenderPos(p) // 終點/起點
      const p10 = nodes2[10].getRenderPos(p) // 控制點
      const p11 = nodes2[11].getRenderPos(p) // 控制點
      const p12 = nodes2[12].getRenderPos(p) // 終點/起點
      const p13 = nodes2[13].getRenderPos(p) // 控制點
      const p14 = nodes2[14].getRenderPos(p) // 控制點
      const p15 = nodes2[15].getRenderPos(p) // 終點/起點
      const p16 = nodes2[16].getRenderPos(p) // 控制點
      const p17 = nodes2[17].getRenderPos(p) // 控制點
      const p18 = nodes2[18].getRenderPos(p) // 終點

      // 繪製六段貝茲曲線
      p.bezier(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)
      p.bezier(p3.x, p3.y, p4.x, p4.y, p5.x, p5.y, p6.x, p6.y)
      p.bezier(p6.x, p6.y, p7.x, p7.y, p8.x, p8.y, p9.x, p9.y)
      p.bezier(p9.x, p9.y, p10.x, p10.y, p11.x, p11.y, p12.x, p12.y)
      p.bezier(p12.x, p12.y, p13.x, p13.y, p14.x, p14.y, p15.x, p15.y)
      p.bezier(p15.x, p15.y, p16.x, p16.y, p17.x, p17.y, p18.x, p18.y)
    }

    // 更新所有節點
    for (let i = 0; i < nodes1.length; i++) {
      nodes1[i].update(p)
      // 控制點使用透明繪製，除了指定的可見點
      if (!CURVE1_VISIBLE_POINTS.includes(i)) {
        nodes1[i].drawAsControlPoint(p)
      }
    }
    for (let i = 0; i < nodes2.length; i++) {
      nodes2[i].update(p)
      // 控制點使用透明繪製，除了指定的可見點
      if (!CURVE2_VISIBLE_POINTS.includes(i)) {
        nodes2[i].drawAsControlPoint(p)
      }
    }

    // 繪製第一條曲線的可見點
    for (const i of CURVE1_VISIBLE_POINTS) {
      nodes1[i].draw(p, draggingCurve === 0 && draggingIndex === i)
    }

    // 繪製第二條曲線的可見點
    for (const i of CURVE2_VISIBLE_POINTS) {
      nodes2[i].draw(p, draggingCurve === 1 && draggingIndex === i)
    }
  }

  p.mousePressed = () => {
    // 確保滑鼠事件在 canvas 範圍內
    if (
      !p.canvas
      || p.mouseX < 0
      || p.mouseY < 0
      || p.mouseX > p.width
      || p.mouseY > p.height
    ) {
      return
    }

    draggingIndex = -1
    draggingCurve = -1
    let best = Infinity

    // 檢查第一條曲線的可見點
    for (const i of CURVE1_VISIBLE_POINTS) {
      const d = p.dist(
        p.mouseX,
        p.mouseY,
        nodes1[i].getRenderPos(p).x,
        nodes1[i].getRenderPos(p).y,
      )
      if (d < DRAG_RADIUS * 1.4 && d < best) {
        best = d
        draggingIndex = i
        draggingCurve = 0
      }
    }

    // 檢查第二條曲線的可見點
    for (const i of CURVE2_VISIBLE_POINTS) {
      const d = p.dist(
        p.mouseX,
        p.mouseY,
        nodes2[i].getRenderPos(p).x,
        nodes2[i].getRenderPos(p).y,
      )
      if (d < DRAG_RADIUS * 1.4 && d < best) {
        best = d
        draggingIndex = i
        draggingCurve = 1
      }
    }

    if (draggingIndex !== -1) {
      const mouseVec = p.createVector(p.mouseX, p.mouseY)
      if (draggingCurve === 0) {
        nodes1[draggingIndex].beginDrag(p, mouseVec)
      }
      else {
        nodes2[draggingIndex].beginDrag(p, mouseVec)
      }
    }
  }

  p.mouseDragged = () => {
    if (draggingIndex !== -1 && p.canvas) {
      const mouseVec = p.createVector(p.mouseX, p.mouseY)
      if (draggingCurve === 0) {
        nodes1[draggingIndex].dragTo(p, mouseVec)
      }
      else {
        nodes2[draggingIndex].dragTo(p, mouseVec)
      }
    }
  }

  p.mouseReleased = () => {
    if (draggingIndex !== -1 && p.canvas) {
      if (draggingCurve === 0) {
        nodes1[draggingIndex].endDrag()
      }
      else {
        nodes2[draggingIndex].endDrag()
      }
      draggingIndex = -1
      draggingCurve = -1
    }
  }
}

const { createSketch, destroySketch } = useP5Sketch({
  container: containerRef,
  sketch,
})

onMounted(() => {
  createSketch()
})

onUnmounted(() => {
  destroySketch()
})
</script>

<template>
  <div
    id="hero-curve"
    ref="containerRef"
    class="pointer-events-auto absolute left-0 top-0 h-[1021px] w-[1240px]"
  ></div>
</template>

<style scoped>
#hero-curve {
  touch-action: none;
}
</style>
