<script setup lang="ts">
import type p5 from 'p5'
import { useP5Sketch } from '~/composables/useP5'

// Canvas 尺寸
const CANVAS_WIDTH = 1240
const CANVAS_HEIGHT = 1021

// 視覺參數
const ANCHOR_POINT_SIZE = 16 // 錨點方塊的尺寸（從 SVG 中提取，16.054px ≈ 16px）
const DRAG_HITBOX_RADIUS = 12 // 可點擊拖曳的半徑
const FLOAT_AMPLITUDE = 10 // 漂浮最大偏移量（±10px）
const FLOAT_SPEED_MIN = 0.0005 // 漂浮動畫速度最小值
const FLOAT_SPEED_MAX = 0.001 // 漂浮動畫速度最大值

// 可見錨點配置
const CURVE1_ANCHOR_INDICES = [0, 3, 12] // 第一條曲線的可見錨點：起點、中間點、終點
const CURVE2_ANCHOR_INDICES = [0, 12, 18] // 第二條曲線的可見錨點：起點、中間點、終點

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

// 曲線漂浮控制器
class CurveFloatingController {
  tX: number
  tY: number
  speedX: number
  speedY: number
  offset: p5.Vector

  constructor(p: p5) {
    this.tX = Number(p.random(1000)) || 0
    this.tY = Number(p.random(2000)) || 1000
    this.speedX
      = Number(p.random(FLOAT_SPEED_MIN, FLOAT_SPEED_MAX)) || FLOAT_SPEED_MIN
    this.speedY
      = Number(p.random(FLOAT_SPEED_MIN, FLOAT_SPEED_MAX)) || FLOAT_SPEED_MIN
    this.offset = p.createVector(0, 0)
  }

  update(_p: p5) {
    this.tX += this.speedX
    this.tY += this.speedY

    const angleX = (this.tX * Math.PI * 2) % (Math.PI * 2)
    const angleY = (this.tY * Math.PI * 2) % (Math.PI * 2)

    const offX = Math.sin(angleX) * FLOAT_AMPLITUDE
    const offY = Math.cos(angleY) * FLOAT_AMPLITUDE

    this.offset.set(offX, offY)
  }

  getOffset(): p5.Vector {
    return this.offset
  }
}

// 曲線節點類別
class CurveNode {
  private basePosition: p5.Vector
  private isDragging: boolean
  private dragOffset: p5.Vector

  constructor(p: p5, x: number, y: number) {
    this.basePosition = p.createVector(x, y)
    this.isDragging = false
    this.dragOffset = p.createVector(0, 0)
  }

  getCurrentPosition(
    p: p5,
    curveController: CurveFloatingController,
  ): p5.Vector {
    if (this.isDragging) {
      return p.constructor.Vector.sub(
        p.createVector(p.mouseX, p.mouseY),
        this.dragOffset,
      )
    }
    return p.constructor.Vector.add(
      this.basePosition,
      curveController.getOffset(),
    )
  }

  drawAnchorPoint(
    p: p5,
    isActive: boolean,
    curveController: CurveFloatingController,
  ) {
    const position = this.getCurrentPosition(p, curveController)
    const activeColor = p.color(20, 120, 255)
    const inactiveColor = '#E6E6E6'

    // 繪製主要錨點
    p.noStroke()
    p.fill(isActive ? activeColor : inactiveColor)
    p.rectMode(p.CENTER)
    p.rect(position.x, position.y, ANCHOR_POINT_SIZE, ANCHOR_POINT_SIZE)

    // 繪製活動狀態的外框
    if (isActive) {
      p.noFill()
      p.stroke(20, 120, 255, 80)
      p.strokeWeight(2)
      p.rect(
        position.x,
        position.y,
        ANCHOR_POINT_SIZE + 4,
        ANCHOR_POINT_SIZE + 4,
      )
    }
  }

  // 控制點不需要視覺呈現
  drawControlPoint() {}

  startDrag(
    p: p5,
    mouseVec: p5.Vector,
    curveController: CurveFloatingController,
  ) {
    this.isDragging = true
    const currentPos = this.getCurrentPosition(p, curveController)
    this.dragOffset = p.constructor.Vector.sub(mouseVec, currentPos)
  }

  updateDrag(
    p: p5,
    mouseVec: p5.Vector,
    curveController: CurveFloatingController,
  ) {
    const targetPosition = p.constructor.Vector.sub(mouseVec, this.dragOffset)
    this.basePosition = p.constructor.Vector.sub(
      targetPosition,
      curveController.getOffset(),
    )
  }

  endDrag() {
    this.isDragging = false
  }
}

let nodes1: CurveNode[] = []
let nodes2: CurveNode[] = []
let curve1Controller: CurveFloatingController
let curve2Controller: CurveFloatingController
let draggingIndex = -1
let draggingCurve = -1

function sketch(p: p5) {
  p.setup = () => {
    p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)

    // 初始化曲線控制器
    curve1Controller = new CurveFloatingController(p)
    curve2Controller = new CurveFloatingController(p)

    // 初始化第一條曲線的節點
    nodes1 = curve1Points.map(point => new CurveNode(p, point.x, point.y))

    // 初始化第二條曲線的節點
    nodes2 = curve2Points.map(point => new CurveNode(p, point.x, point.y))

    p.noFill()
  }

  // 繪製貝茲曲線段
  function drawBezierSegments(
    p: p5,
    nodes: CurveNode[],
    controller: CurveFloatingController,
    segments: number[][],
  ): void {
    const points = nodes.map(node => node.getCurrentPosition(p, controller))

    for (const [start, c1, c2, end] of segments) {
      p.bezier(
        points[start].x,
        points[start].y,
        points[c1].x,
        points[c1].y,
        points[c2].x,
        points[c2].y,
        points[end].x,
        points[end].y,
      )
    }
  }

  p.draw = () => {
    // 確保 canvas 已經初始化
    if (!p.canvas)
      return
    p.clear()

    // 設置曲線樣式
    p.stroke('#E6E6E6')
    p.strokeWeight(2)
    p.noFill()

    // 繪製第一條曲線
    if (nodes1.length === curve1Points.length) {
      // 定義第一條曲線的貝茲曲線段
      const curve1Segments = [
        [0, 1, 2, 3], // 起點到錨點 1
        [3, 4, 5, 6], // 錨點 1 到錨點 2
        [6, 7, 8, 9], // 錨點 2 到錨點 3
        [9, 10, 11, 12], // 錨點 3 到終點
      ]
      drawBezierSegments(p, nodes1, curve1Controller, curve1Segments)
    }

    // 繪製第二條曲線
    if (nodes2.length === curve2Points.length) {
      // 定義第二條曲線的貝茲曲線段
      const curve2Segments = [
        [0, 1, 2, 3], // 起點到錨點 1
        [3, 4, 5, 6], // 錨點 1 到錨點 2
        [6, 7, 8, 9], // 錨點 2 到錨點 3
        [9, 10, 11, 12], // 錨點 3 到錨點 4
        [12, 13, 14, 15], // 錨點 4 到錨點 5
        [15, 16, 17, 18], // 錨點 5 到終點
      ]
      drawBezierSegments(p, nodes2, curve2Controller, curve2Segments)
    }

    // 更新曲線控制器
    curve1Controller.update(p)
    curve2Controller.update(p)

    // 更新所有節點
    for (let i = 0; i < nodes1.length; i++) {
      // 控制點使用透明繪製，除了指定的可見點
      if (!CURVE1_ANCHOR_INDICES.includes(i)) {
        nodes1[i].drawControlPoint()
      }
    }
    for (let i = 0; i < nodes2.length; i++) {
      // 控制點使用透明繪製，除了指定的可見點
      if (!CURVE2_ANCHOR_INDICES.includes(i)) {
        nodes2[i].drawControlPoint()
      }
    }

    // 繪製第一條曲線的錨點
    for (const i of CURVE1_ANCHOR_INDICES) {
      nodes1[i].drawAnchorPoint(
        p,
        draggingCurve === 0 && draggingIndex === i,
        curve1Controller,
      )
    }

    // 繪製第二條曲線的錨點
    for (const i of CURVE2_ANCHOR_INDICES) {
      nodes2[i].drawAnchorPoint(
        p,
        draggingCurve === 1 && draggingIndex === i,
        curve2Controller,
      )
    }
  }

  // 檢查滑鼠是否在 canvas 範圍內
  function isMouseInCanvas(p: p5): boolean {
    return (
      p.canvas
      && p.mouseX >= 0
      && p.mouseY >= 0
      && p.mouseX <= p.width
      && p.mouseY <= p.height
    )
  }

  // 找到最近的可拖曳錨點
  function findNearestDraggablePoint(
    p: p5,
  ): { index: number, curve: number } | null {
    let bestDistance = Infinity
    let bestIndex = -1
    let bestCurve = -1

    // 檢查兩條曲線的錨點
    const curves = [
      {
        nodes: nodes1,
        indices: CURVE1_ANCHOR_INDICES,
        controller: curve1Controller,
        id: 0,
      },
      {
        nodes: nodes2,
        indices: CURVE2_ANCHOR_INDICES,
        controller: curve2Controller,
        id: 1,
      },
    ]

    for (const curve of curves) {
      for (const i of curve.indices) {
        const pos = curve.nodes[i].getCurrentPosition(p, curve.controller)
        const distance = p.dist(p.mouseX, p.mouseY, pos.x, pos.y)

        if (distance < DRAG_HITBOX_RADIUS * 1.4 && distance < bestDistance) {
          bestDistance = distance
          bestIndex = i
          bestCurve = curve.id
        }
      }
    }

    return bestIndex === -1 ? null : { index: bestIndex, curve: bestCurve }
  }

  // 取得當前拖曳的節點和控制器
  function getDragTarget(): {
    node: CurveNode
    controller: CurveFloatingController
  } | null {
    if (draggingIndex === -1)
      return null

    return {
      node: draggingCurve === 0 ? nodes1[draggingIndex] : nodes2[draggingIndex],
      controller: draggingCurve === 0 ? curve1Controller : curve2Controller,
    }
  }

  p.mousePressed = () => {
    if (!isMouseInCanvas(p))
      return

    // 重置拖曳狀態
    draggingIndex = -1
    draggingCurve = -1

    // 尋找最近的可拖曳點
    const nearest = findNearestDraggablePoint(p)
    if (!nearest)
      return

    // 開始拖曳
    draggingIndex = nearest.index
    draggingCurve = nearest.curve
    const mouseVec = p.createVector(p.mouseX, p.mouseY)
    const target = getDragTarget()
    target?.node.startDrag(p, mouseVec, target.controller)
  }

  p.mouseDragged = () => {
    if (!isMouseInCanvas(p))
      return

    const target = getDragTarget()
    if (!target)
      return

    const mouseVec = p.createVector(p.mouseX, p.mouseY)
    target.node.updateDrag(p, mouseVec, target.controller)
  }

  p.mouseReleased = () => {
    const target = getDragTarget()
    if (!target)
      return

    target.node.endDrag()
    draggingIndex = -1
    draggingCurve = -1
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
