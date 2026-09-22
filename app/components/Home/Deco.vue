<script setup>
// 手機／平板（< 1024px）版面的裝飾圖 —— 一團靜態的點畫，從下一區的分隔線後面「探出來」。
//
// ─── 為什麼是圖片而不是粒子 ────────────────────────────────────────────────
// 桌機這幾處的點雲是背後那張 fixed canvas 畫的（見 pages/index.vue）；窄視窗的
// PL.II～PL.V 沒有 canvas、底色是不透明的（見 useViewportMode），設計稿在這個尺寸
// 放的是事先渲染好的圖。所以桌機（lg 以上）一律不顯示（lg:hidden）。
//
// ─── 定位怎麼運作 ──────────────────────────────────────────────────────────
// 外層是一個 overflow-hidden 的容器：寬 = 區塊寬，底邊剛好對齊「下一區的分隔線」，
// 高 = 分隔線以上要露出的高度。圖片絕對定位在容器頂端，超出的部分（下半、超出畫面
// 右緣的部分）全部被容器裁掉 —— 這同時也擋住了「圖片比視窗寬 → 頁面出現橫向捲軸」。
//
// ⚠️ 底邊要對齊分隔線，而分隔線比「本區塊底邊」再往下一段（下一區的上內距 + CommonPlate
// 的邊距），所以呼叫端要用 class 傳 bottom 負值，值 = 下一區頂端到它那條線的距離：
//   About → Speaker      -bottom-16            （Speaker 的 py-16）
//   Venue → FAQ          bottom-0              （FAQ 頂端就是那條線）
//   FAQ   → Ticket       -bottom-8 md:-bottom-12（Ticket 的 py-8 / md:py-12）
// 那幾區的內距改了，這裡要跟著改。
// ⚠️ 量法：#speaker / #faq / [data-same-ticket] 的頂端到第一條 border-t 的距離，
// 而且「要等淡入動畫跑完再量」—— 那條 plate 是 data-fade，淡入前還有 y:16 的位移，
// 沒等的話會多算 16px。
//
// ─── 進場：滑入 + 淡入 ─────────────────────────────────────────────────────
// 捲到這一區時播一次（ScrollTrigger once）。方向由 from 參數決定：
//   right   從右邊 32px 外的位置滑回來（固定距離，不跟圖寬走；靠右的圖本來就有一截被
//           容器右緣裁掉，所以看起來是從畫面邊緣輕輕滑進來）
//   bottom  從下面 25% 高的位置往上浮回來（超出容器底邊的那段被分隔線裁掉，
//           所以是「從分隔線後面升起來」）
//
// ─── 視差：跟著捲動上下位移 ────────────────────────────────────────────────
// 進場之後，圖片隨捲動慢慢往下沉（scrub）：捲得越往下，圖就越往分隔線後面藏一點，
// 像是比頁面慢半拍。往回捲會反向回來。位移量 = 圖片寬度 × parallax（預設 0.12，
// 手機上約 45px；給 0 就關掉）。範圍：容器頂端進到畫面 90% 處 → 容器底邊離開畫面頂端。
//
// ⚠️ 三種動畫各掛在自己那一層，不能疊在同一個元素上：
//   容器（外層）  固定不動的裁切框，要跟分隔線對齊 —— 什麼動畫都不能掛
//   parallax 層   視差（y，scrub）
//   inner 層      進場（opacity / x 或 yPercent，一次性）
//   <img>         定位用的 transform（見 imgStyle）—— 不能掛
// 視差往下移會讓圖片頂端露出一小段空白（容器是透明的），所以位移量不要太大。
// ⚠️ 初始的 opacity:0 是 JS 設的、不是寫在 CSS：JS 沒跑起來時圖片仍然看得見。
// 這些圖都在首屏之外，設定前那一幀使用者看不到。reduced-motion 不做動畫、直接顯示。
//
// ─── 圖片 ──────────────────────────────────────────────────────────────────
// ⚠️ 用 <picture>：WebP 優先、不支援的裝置退回同名 PNG（約定：每個 .webp 旁邊都要有
// 同名 .png）。z-[-1] 讓文字永遠蓋在它上面 —— 定位過的元素預設會畫在一般文字上方。
// 這些圖都在首屏之外，所以 lazy。
//
// ⚠️ z-[-1] 要成立，呼叫端的區塊必須是「層疊上下文」，否則它會掉到外層那塊 bg-black
// 的後面、整張看不見。⚠️ 不能靠區塊上的 z-10 —— 這個專案的 Tailwind 沒有 .z-10 這條
// 規則（只有 z-1、z-2…），那個 class 是空操作。所以呼叫端的區塊要加 `isolate`。

defineOptions({ inheritAttrs: false })

const props = defineProps({
  // 檔案路徑，不含副檔名（'/home-deco-1' → /home-deco-1.webp + .png）
  src: { type: String, required: true },
  // 圖檔本身的尺寸（給瀏覽器預留比例用）
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  // 圖片寬度 = min(視窗寬 × size, max)。手機 402px 時 size 0.93 ≈ 375px；
  // 平板不要無限放大，用 max 封頂。
  size: { type: Number, default: 0.93 },
  max: { type: Number, default: 440 },
  // 分隔線以上露出的高度，以「圖片寬度」的倍數表示（跟著寬度一起縮放）
  reveal: { type: Number, required: true },
  // right：靠右、再往外推 shift 倍圖寬（被畫面右緣裁掉）；center：置中、再往右推 shift 倍圖寬
  align: { type: String, default: 'right' },
  shift: { type: Number, default: 0 },
  // 視差位移量，以「圖片寬度」的倍數表示；0 = 不做視差
  parallax: { type: Number, default: 0.12 },
  // 進場方向：'right' 從右邊滑入；'bottom' 從下往上浮起
  from: { type: String, default: 'right' }
})

const rootRef = ref(null)
const innerRef = ref(null)
const parallaxRef = ref(null)
const imgRef = ref(null)
let trigger = null
let tween = null
let parallaxTween = null

onMounted(() => {
  // 桌機整組是 display:none（lg:hidden），量不到位置，不必建 trigger
  if (window.matchMedia('(min-width: 1024px)').matches) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const { $gsap, $ScrollTrigger } = useNuxtApp()
  if (!$gsap || !$ScrollTrigger || !rootRef.value || !innerRef.value) return

  const offset = props.from === 'bottom' ? { yPercent: 25 } : { x: 32 }
  $gsap.set(innerRef.value, { opacity: 0, ...offset })
  trigger = $ScrollTrigger.create({
    trigger: rootRef.value,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      tween = $gsap.to(innerRef.value, { opacity: 1, x: 0, yPercent: 0, duration: 1.1, ease: 'power3.out' })
    },
  })

  if (props.parallax > 0 && parallaxRef.value) {
    // 位移量吃圖片「實際顯示」的寬度（min(vw, max)），resize / 換方向後要重算，
    // 所以用函式值 + invalidateOnRefresh。scrub 給一點延遲，捲動停下來時不會硬生生停住。
    parallaxTween = $gsap.fromTo(parallaxRef.value, { y: 0 }, {
      y: () => (imgRef.value?.offsetWidth || 0) * props.parallax,
      ease: 'none',
      scrollTrigger: {
        trigger: rootRef.value,
        start: 'top 90%',
        end: 'bottom top',
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    })
  }
})

onBeforeUnmount(() => {
  trigger?.kill()
  tween?.kill()
  parallaxTween?.scrollTrigger?.kill()
  parallaxTween?.kill()
})

const W = computed(() => `min(${props.size * 100}vw, ${props.max}px)`)
const boxStyle = computed(() => ({ height: `calc(${W.value} * ${props.reveal})` }))
const imgStyle = computed(() => {
  const push = `${props.shift * 100}%`

  return props.align === 'center'
    ? { width: W.value, left: '50%', transform: `translateX(calc(-50% + ${push}))` }
    : { width: W.value, right: '0', transform: `translateX(${push})` }
})
</script>

<template>
  <div
    v-bind="$attrs"
    ref="rootRef"
    class="pointer-events-none absolute inset-x-0 z-[-1] overflow-hidden lg:hidden"
    :style="boxStyle"
    aria-hidden="true"
  >
    <!-- 三種動畫各掛一層（見上面「視差」那段）：parallax 層 = 視差、inner 層 = 進場 -->
    <div ref="parallaxRef" class="absolute inset-0">
      <div ref="innerRef" class="absolute inset-0 z-1">
        <picture>
          <source :srcset="`${src}.webp`" type="image/webp">
          <img
            ref="imgRef"
            :src="`${src}.png`"
            alt=""
            :width="width"
            :height="height"
            loading="lazy"
            decoding="async"
            draggable="false"
            class="absolute top-0 h-auto max-w-none select-none"
            :style="imgStyle"
          >
        </picture>
      </div>
    </div>
  </div>
</template>
