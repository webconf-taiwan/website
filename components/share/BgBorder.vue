<script setup lang="ts">
import { useBreakpoints, useEventListener, useRafFn } from '@vueuse/core'

const props = withDefaults(defineProps<Props>(), {
  borderColor: '#E6E6E6',
  borderWidth: 1,
  borderAlpha: 0.3,
  dvdDotSpeed: 1,
  dvdDotColors: () => ['#2F2ADB', '#919191', '#E6E6E6'],
})
const route = useRoute()
const breakpoints = useBreakpoints({
  lg: 1024,
})
const isDesktop = breakpoints.greaterOrEqual('lg')

const isInSpeakerDetailPage = computed(() => {
  const isAgendaDetail = route.path.startsWith('/agenda')
  const isSpeakerDetail
    = route.path.startsWith('/speakers/') && route.path !== '/speakers'

  return isAgendaDetail || isSpeakerDetail
})

const { isMenuOpen } = useGlobalState()

interface Props {
  borderColor?: string
  borderWidth?: number
  borderAlpha?: number
  dvdDotSpeed?: number
  dvdDotColors?: [string, string, string]
}

/*
 * 網格與手電筒效果全部交給 CSS：
 * 底層是藍色網格，上層是不透明的灰色網格，手電筒用 mask 在上層挖出一個漸層圓洞露出底層。
 * 原本用 p5 每一幀重畫三張滿版畫布，就算畫面沒變也一直在畫，捲動時會掉到 20～30 fps
 */
const gridStyle = computed(() => ({
  '--grid-line-color': `color-mix(in srgb, ${props.borderColor} ${props.borderAlpha * 100}%, transparent)`,
  '--grid-line-width': `${props.borderWidth}px`,
}))

const gridContainer = ref<HTMLElement | null>(null)
const ease = 0.25 // 平滑滑鼠追蹤係數
let mx = 0
let my = 0
let tx = 0
let ty = 0

// 只在游標移動、手電筒還沒追上時才逐幀更新，追上就停
const flashlight = useRafFn(
  () => {
    mx += (tx - mx) * ease
    my += (ty - my) * ease

    if (Math.abs(tx - mx) < 0.5 && Math.abs(ty - my) < 0.5) {
      mx = tx
      my = ty
      flashlight.pause()
    }

    gridContainer.value?.style.setProperty('--flashlight-x', `${mx}px`)
    gridContainer.value?.style.setProperty('--flashlight-y', `${my}px`)
  },
  { immediate: false },
)

useEventListener(
  'pointermove',
  (event: PointerEvent) => {
    if (!isDesktop.value || event.pointerType !== 'mouse')
      return

    tx = event.clientX
    ty = event.clientY
    flashlight.resume()
  },
  { passive: true },
)

// 定義 DVD 方框屬性
interface DVDBox {
  x: number // 中心座標
  y: number // 中心座標
  vx: number // 每幀移動的 x 距離（以 60fps 計）
  vy: number // 每幀移動的 y 距離（以 60fps 計）
  colorIndex: number // 顏色索引
}

const dvdDotSize = 20
const dvdDotBuffer = 20
const headerOffset = 58 // 對應 h-[58px] 的高度偏移
const dvdDotRef = ref<HTMLElement | null>(null)
const dvdDotColor = ref('#4a90ff') // 第一次碰壁前的顏色
let dvdDot: DVDBox | null = null

watch(
  () => props.dvdDotSpeed,
  (newSpeed) => {
    if (!dvdDot)
      return
    const speed = newSpeed || 4
    dvdDot.vx = dvdDot.vx < 0 ? -Math.abs(speed) : Math.abs(speed)
    dvdDot.vy = dvdDot.vy < 0 ? -Math.abs(speed) : Math.abs(speed)
  },
)

function getDvdBounds() {
  const half = dvdDotSize / 2 + dvdDotBuffer
  return {
    minX: half,
    maxX: window.innerWidth - half,
    minY: headerOffset + half,
    maxY: window.innerHeight - half,
  }
}

function nextDvdColor(dot: DVDBox) {
  dot.colorIndex = (dot.colorIndex + 1) % props.dvdDotColors.length
  dvdDotColor.value = props.dvdDotColors[dot.colorIndex]
}

// 方塊是單獨一個小元素，只改 transform，不必為了它重畫一張滿版畫布
const dvdAnimation = useRafFn(
  ({ delta }) => {
    if (!dvdDot || !dvdDotRef.value)
      return

    // 分頁切回來時 delta 會很大，最多補一幀左右的距離
    const step = Math.min(delta, 34) / (1000 / 60)
    const dot = dvdDot
    const { minX, maxX, minY, maxY } = getDvdBounds()

    dot.x += dot.vx * step
    dot.y += dot.vy * step

    if (dot.x <= minX) {
      dot.x = minX
      dot.vx = Math.abs(dot.vx)
      nextDvdColor(dot)
    }
    if (dot.x >= maxX) {
      dot.x = maxX
      dot.vx = -Math.abs(dot.vx)
      nextDvdColor(dot)
    }
    if (dot.y <= minY) {
      dot.y = minY
      dot.vy = Math.abs(dot.vy)
      nextDvdColor(dot)
    }
    if (dot.y >= maxY) {
      dot.y = maxY
      dot.vy = -Math.abs(dot.vy)
      nextDvdColor(dot)
    }

    dvdDotRef.value.style.transform = `translate3d(${dot.x - dvdDotSize / 2}px, ${dot.y - dvdDotSize / 2}px, 0)`
  },
  { immediate: false },
)

onMounted(() => {
  mx = tx = window.innerWidth / 2
  my = ty = window.innerHeight / 2

  const { minX, maxX, minY, maxY } = getDvdBounds()
  dvdDot = {
    x: minX + Math.random() * (maxX - minX),
    y: minY + Math.random() * (maxY - minY),
    vx: props.dvdDotSpeed,
    vy: props.dvdDotSpeed,
    colorIndex: 0,
  }
  dvdAnimation.resume()
})
</script>

<template>
  <div class="relative size-full bg-black">
    <!-- 網格層 (最底層) -->
    <div
      ref="gridContainer"
      class="grid-placeholder fixed inset-0 z-10 size-full"
      :style="gridStyle"
    ></div>

    <!-- 浮動方塊特效 -->
    <ShareFloatingBlocks class="z-[15]" />

    <!-- 內容層 (圖片等) -->
    <div
      class="content-container relative z-[20] flex min-h-screen flex-col overflow-x-clip"
    >
      <slot></slot>
    </div>

    <!-- 方框層 (最上層) -->
    <Teleport to="body">
      <div
        ref="dvdDotRef"
        :class="
          (isMenuOpen && !isDesktop) || isInSpeakerDetailPage
            ? 'invisible'
            : 'visible'
        "
        class="pointer-events-none fixed left-0 top-0 z-50 will-change-transform"
        :style="{
          width: `${dvdDotSize}px`,
          height: `${dvdDotSize}px`,
          backgroundColor: dvdDotColor,
        }"
      ></div>
    </Teleport>
  </div>
</template>

<style scoped>
/*
 * 線條從第一個間距開始畫，左緣與上緣在 0 的那條用 clip-path 裁掉。
 * 底層藍線寬 2px、以格線為中心，所以往回偏 1px
 */
.grid-placeholder {
  --grid-size: 64px;
  background-color: #000;
  background-image:
    linear-gradient(to right, #002eff 2px, transparent 2px),
    linear-gradient(to bottom, #002eff 2px, transparent 2px);
  background-size: var(--grid-size) var(--grid-size);
  background-position: -1px -1px;
  clip-path: inset(1px 0 0 1px);
}

/* 上層灰網格，底色不透明，蓋住藍網格 */
.grid-placeholder::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: #000;
  background-image:
    linear-gradient(
      to right,
      var(--grid-line-color) var(--grid-line-width),
      transparent var(--grid-line-width)
    ),
    linear-gradient(
      to bottom,
      var(--grid-line-color) var(--grid-line-width),
      transparent var(--grid-line-width)
    );
  background-size: var(--grid-size) var(--grid-size);
}

/* 桌機才有手電筒：以游標為圓心、半徑為視窗短邊的 1/4，中心完全透出藍網格，往外漸回灰網格 */
@media (min-width: 1024px) {
  .grid-placeholder {
    --grid-size: 80px;
  }

  .grid-placeholder::before {
    mask-image: radial-gradient(
      circle 25vmin at var(--flashlight-x, 50%) var(--flashlight-y, 50%),
      transparent,
      #000
    );
  }
}

@supports (min-height: 100dvh) {
  .hero-contentContainer {
    min-height: 100dvh;
  }
}
</style>
