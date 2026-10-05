<script setup>
// 桌機「沒有 WebGPU」時，PL.II / PL.IV / PL.V 左側那塊的裝飾圖 —— 代替背後那張即時粒子 canvas
// 在這三區收攏出來的形狀（side.png、菌落場、faq.png）。
//
// ─── 什麼時候出現 ──────────────────────────────────────────────────────────
// 只有「桌機（≥1024px）＋ 沒有可用的 WebGPU」（= pages/index.vue 的 desktopVideo）。
// 那時整頁的粒子 canvas 沒掛，hero 與票券～CoC 兩段有影片頂著（HomeVideoField），
// 中間這三區原本就只剩頁面底色、左欄整塊是空的。
// 有 WebGPU 的桌機是粒子自己變形過來；窄視窗是 HomeDeco（從分隔線後面探出來的那一組）。
// 條件自己判斷，呼叫端直接放就好。?webgpu=off 可以在有 WebGPU 的電腦上預覽。
//
// ─── 定位 ──────────────────────────────────────────────────────────────────
// 絕對定位在呼叫端的區塊裡，位置與寬度由呼叫端用 class 給（left / top / w-*）。
// 要在某條線裁掉的話，呼叫端再給 bottom-* + overflow-hidden（外層不動，所以裁切線是固定的）。
// z-[-1] 讓文字永遠蓋在上面 —— 呼叫端的區塊要是層疊上下文（加 `isolate`），理由同 HomeDeco。
//
// ─── 動畫（跟 HomeDeco 同一套，各掛各的層）─────────────────────────────────
//   外層       定位用，什麼動畫都不掛
//   parallax   視差：區塊經過畫面的這段，圖片從 -d 慢慢沉到 +d（scrub），d = 圖寬 × parallax
//   inner      進場：捲到時從左邊 32px 外滑回來 + 淡入，播一次
// ⚠️ 初始的 opacity:0 是 JS 設的，JS 沒跑起來時圖片仍然看得見。reduced-motion 不做動畫。
//
// ─── 圖片 ──────────────────────────────────────────────────────────────────
// <picture>：WebP 優先、退回同名 PNG（每個 .webp 旁邊都要有同名 .png）。都在首屏之外，所以 lazy。

defineOptions({ inheritAttrs: false })

const props = defineProps({
  // 檔案路徑，不含副檔名
  src: { type: String, required: true },
  // 圖檔本身的尺寸（給瀏覽器預留比例用）
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  // 視差位移量（單邊），以「圖片寬度」的倍數表示；0 = 不做視差
  parallax: { type: Number, default: 0.08 }
})

const { isDesktop, viewportReady } = useViewportMode()
const { webgpu } = useWebGpuSupport()
const show = computed(() => viewportReady.value && isDesktop.value && webgpu.value === false)

const rootRef = ref(null)
const innerRef = ref(null)
const parallaxRef = ref(null)
let trigger = null
let tween = null
let parallaxTween = null

function teardown () {
  trigger?.kill()
  tween?.kill()
  parallaxTween?.scrollTrigger?.kill()
  parallaxTween?.kill()
  trigger = tween = parallaxTween = null
}

function setup () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const { $gsap, $ScrollTrigger } = useNuxtApp()
  if (!$gsap || !$ScrollTrigger || !rootRef.value || !innerRef.value) return

  $gsap.set(innerRef.value, { opacity: 0, x: -32 })
  trigger = $ScrollTrigger.create({
    trigger: rootRef.value,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      tween = $gsap.to(innerRef.value, { opacity: 1, x: 0, duration: 1.4, ease: 'power3.out' })
    },
  })

  if (props.parallax > 0 && parallaxRef.value) {
    // 位移量吃圖片「實際顯示」的寬度，resize 後要重算，所以用函式值 + invalidateOnRefresh
    const d = () => (rootRef.value?.offsetWidth || 0) * props.parallax
    parallaxTween = $gsap.fromTo(parallaxRef.value, { y: () => -d() }, {
      y: d,
      ease: 'none',
      scrollTrigger: {
        trigger: rootRef.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    })
  }
}

// ⚠️ 不是 onMounted：show 要等 WebGPU 偵測完才成立，跨過斷點時也會進出。
// 看 rootRef 有沒有掛上來，掛上來才建、拿掉就清。
watch(rootRef, (el) => {
  teardown()
  if (el) setup()
}, { flush: 'post' })

onBeforeUnmount(teardown)
</script>

<template>
  <ClientOnly>
    <div
      v-if="show"
      v-bind="$attrs"
      ref="rootRef"
      class="pointer-events-none absolute z-[-1]"
      aria-hidden="true"
    >
      <div ref="parallaxRef">
        <div ref="innerRef">
          <picture>
            <source :srcset="`${src}.webp`" type="image/webp">
            <img
              :src="`${src}.png`"
              alt=""
              :width="width"
              :height="height"
              loading="lazy"
              decoding="async"
              draggable="false"
              class="block h-auto w-full max-w-none select-none"
            >
          </picture>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
