<script setup lang="ts">
import type {
  SpeakerDialogImageDesktop,
  SpeakerDialogImageMobile,
  SpeakerDialogIntro,
} from '#components'
import type { ContentCollectionItem } from '@nuxt/content'
import { onKeyStroke, useBreakpoints, useTimeoutFn } from '@vueuse/core'
import { BACK_LINKS } from '~/constants/agenda'

const props = withDefaults(
  defineProps<{
    speaker: ContentCollectionItem[]
    speakerIds?: string[]
    type?: 'agenda' | 'speakers'
  }>(),
  {
    type: 'agenda',
  },
)

const emit = defineEmits(['close'])

const lenis = useLenis()

const router = useRouter()
const { gsap } = useGsap()
const { setToggleModal } = useGlobalState()

const desktopImageComponentRef = ref<InstanceType<
  typeof SpeakerDialogImageDesktop
> | null>(null)
const mobileImageComponentRef = ref<InstanceType<
  typeof SpeakerDialogImageMobile
> | null>(null)
const speakerDialogIntroComponentRef = ref<InstanceType<
  typeof SpeakerDialogIntro
> | null>(null)
const popoverRef = ref(null)

const isAutoPlaying = ref(false)
const isAnimating = ref(false)
const currentPageNumber = ref(0)
const speakerRef = computed(() => props.speaker)
const { renderableIntroSections, speakerInfo, meta, formattedDate }
  = useSpeakerSections(speakerRef, currentPageNumber)

useSpeakerSeo(props.speaker, props.speakerIds, props.type)

const currentMeta = toValue(meta)

// 用於圖片顯示的索引
const displayImageIndex = ref(0)

const pageNumber = computed(() => {
  return {
    current: props.speaker[displayImageIndex.value].meta,
    next:
      displayImageIndex.value < props.speaker.length - 1
        ? props.speaker[displayImageIndex.value + 1].meta
        : props.speaker[0].meta,
  }
})

let autoPlayTween: gsap.core.Tween | null = null

// 講者圖片滑動的時間（秒）
const IMAGE_SLIDE_DURATION = 0.8
// 講者介紹滑到邊緣時的透明度
const CONTENT_EDGE_OPACITY = 0.4

// 觸控或捲動停止後，等待多久再恢復自動播放（毫秒）
const TOUCH_RESUME_DELAY = 5000
// 滑鼠停在內容區
const isHoveringContent = ref(false)
// 觸控或捲動中（停止後經過 TOUCH_RESUME_DELAY 才解除）
const isTouchInteracting = ref(false)
// 重複呼叫 start() 會重新計時；元件卸載時自動清除
const { start: scheduleTouchResume } = useTimeoutFn(
  () => {
    isTouchInteracting.value = false
    startAutoPlay()
  },
  TOUCH_RESUME_DELAY,
  { immediate: false },
)

// 行動裝置版面（圖片與介紹上下排列）
const breakpoints = useBreakpoints({
  lg: 1024,
})
const isMobileLayout = breakpoints.smaller('lg')

/* 處理關閉彈出視窗 */
function handleClose() {
  // 淡出動畫
  setToggleModal(false)
  gsap.to(popoverRef.value, {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.out',
    onComplete: () => {
      resetRoute()
      emit('close')
    },
  })
}

/* 重設路由到議程或講者列表 */
function resetRoute() {
  router.push({ path: BACK_LINKS[props.type].link })
}

/* 取得目前顯示圖片的容器(行動裝置 or 桌機) */
function getActiveImageContainer() {
  if (isMobileLayout.value) {
    return mobileImageComponentRef.value?.mobileImageContainerRef || null
  }
  else {
    return desktopImageComponentRef.value?.imageContainerRef || null
  }
}

/* 動畫切換內容 */
function animateContentTransition(nextIndex: number, type: 'next' | 'prev') {
  if (isAnimating.value)
    return
  isAnimating.value = true

  if (!speakerDialogIntroComponentRef.value?.contentRef) {
    // 沒有內容元素時，直接更新
    currentPageNumber.value = nextIndex
    displayImageIndex.value = nextIndex
    if (type === 'next') {
      animateImageTransition(nextIndex)
    }
    else {
      animateImageTransitionReverse(nextIndex)
    }
    isAnimating.value = false
    return
  }

  const contentEl = speakerDialogIntroComponentRef.value.contentRef
  if (isMobileLayout.value) {
    animateContentSlide(contentEl, nextIndex, type)
  }
  else {
    animateContentFade(contentEl, nextIndex, type)
  }
}

/* 手機版：文字跟著圖片滑動 */
function animateContentSlide(
  contentEl: HTMLElement,
  nextIndex: number,
  type: 'next' | 'prev',
) {
  // 文字跟著圖片往同一個方向滑：滑出、滑入各占圖片滑動時間的一半，兩者同時開始、同時結束。
  // 不讓整塊文字淡到全透明，手機版上下排列時那樣看起來會像閃爍
  const halfDuration = IMAGE_SLIDE_DURATION / 2
  // 下一位往左滑出、從右邊滑入；上一位相反
  const direction = type === 'next' ? -1 : 1

  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false
    },
  })

  // 啟動圖片動畫
  tl.call(
    () => {
      if (type === 'next') {
        animateImageTransition(nextIndex)
      }
      else {
        animateImageTransitionReverse(nextIndex)
      }
    },
    [],
    0,
  )

  // 內容滑出
  tl.to(
    contentEl,
    {
      xPercent: 100 * direction,
      opacity: CONTENT_EDGE_OPACITY,
      duration: halfDuration,
      ease: 'power2.in',
    },
    0,
  )

  // 圖片滑到一半時更新內容資料
  tl.call(
    () => {
      currentPageNumber.value = nextIndex
    },
    [],
    halfDuration,
  )

  // 新內容從另一側滑入
  tl.fromTo(
    contentEl,
    {
      xPercent: -100 * direction,
      opacity: CONTENT_EDGE_OPACITY,
    },
    {
      xPercent: 0,
      opacity: 1,
      duration: halfDuration,
      ease: 'power2.out',
      // 在時間軸中預設會立刻套用起始值，要等滑出結束才套用
      immediateRender: false,
    },
    halfDuration,
  )
}

/* 桌機版：文字淡出後切換圖片，再淡入 */
function animateContentFade(
  contentEl: HTMLElement,
  nextIndex: number,
  type: 'next' | 'prev',
) {
  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false
    },
  })

  // 內容淡出
  tl.to(contentEl, {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.out',
  })

  // 更新內容資料 + 啟動圖片動畫
  tl.call(() => {
    currentPageNumber.value = nextIndex
    if (type === 'next') {
      animateImageTransition(nextIndex)
    }
    else {
      animateImageTransitionReverse(nextIndex)
    }
  })

  // 內容淡入
  tl.to(contentEl, {
    opacity: 1,
    duration: 0.3,
    ease: 'power2.in',
  })
}

/* 處理下一位講者 */
function handleNext(speakers: ContentCollectionItem[]) {
  if (isAnimating.value)
    return
  const nextIndex
    = currentPageNumber.value < speakers.length - 1
      ? currentPageNumber.value + 1
      : 0
  animateContentTransition(nextIndex, 'next')
}

/* 處理上一位講者 */
function handlePrev() {
  if (isAnimating.value)
    return
  const prevIndex
    = currentPageNumber.value > 0
      ? currentPageNumber.value - 1
      : props.speaker!.length - 1
  animateContentTransition(prevIndex, 'prev')
}

/* 講者圖片切換動畫 - 接收目標索引作為參數 */
function animateImageTransition(targetIndex: number) {
  const container = getActiveImageContainer()
  if (!container)
    return

  pauseAutoPlay()

  const tl = gsap.timeline({
    onComplete: () => {
      // 重置位置
      gsap.set(container, { x: 0 })

      // 圖片動畫完成後，更新顯示索引
      displayImageIndex.value = targetIndex

      if (props.speaker && props.speaker.length > 1) {
        startAutoPlay()
      }
    },
  })

  // 向左滑動
  tl.to(container, {
    x: '-100%',
    duration: IMAGE_SLIDE_DURATION,
    ease: 'power2.inOut',
  })
}

/* 講者圖片切換動畫(反向) - 接收目標索引作為參數 */
function animateImageTransitionReverse(targetIndex: number) {
  const container = getActiveImageContainer()
  if (!container)
    return

  pauseAutoPlay()

  // 先更新顯示索引（因為要立即顯示目標圖片）
  displayImageIndex.value = targetIndex

  // 先將容器移到 -100% 位置
  gsap.set(container, { x: '-100%' })

  const tl = gsap.timeline({
    onComplete: () => {
      // 重置位置
      gsap.set(container, { x: 0 })

      if (props.speaker && props.speaker.length > 1) {
        startAutoPlay()
      }
    },
  })

  // 向右滑動到 0
  tl.to(container, {
    x: 0,
    duration: IMAGE_SLIDE_DURATION,
    ease: 'power2.inOut',
  })
}

/* 開始自動播放 */
function startAutoPlay() {
  if (!props.speaker || props.speaker.length <= 1)
    return
  // 使用者還在操作時不啟動，等操作結束再由對應的處理函式恢復
  if (isHoveringContent.value || isTouchInteracting.value)
    return

  pauseAutoPlay()
  isAutoPlaying.value = true

  autoPlayTween = gsap.delayedCall(5, () => {
    if (isAutoPlaying.value) {
      handleNext(props.speaker!)
    }
  })
}

/* 暫停自動播放 */
function pauseAutoPlay() {
  isAutoPlaying.value = false
  if (autoPlayTween) {
    autoPlayTween.kill()
    autoPlayTween = null
  }
}

/* 處理滑鼠進入內容區（觸控模擬出來的事件不算，交給觸控處理） */
function handlePointerEnterContent(event: PointerEvent) {
  if (event.pointerType !== 'mouse')
    return
  isHoveringContent.value = true
  pauseAutoPlay()
}

/* 處理滑鼠離開內容區 */
function handlePointerLeaveContent(event: PointerEvent) {
  if (event.pointerType !== 'mouse')
    return
  isHoveringContent.value = false
  startAutoPlay()
}

/* 處理觸控與捲動：暫停自動播放，停止操作一段時間後再恢復 */
function handleTouchInteraction() {
  isTouchInteracting.value = true
  pauseAutoPlay()
  scheduleTouchResume()
}

/** 處理 ESC 關閉事件監聽 */
onKeyStroke('Escape', () => {
  handleClose()
})

onMounted(() => {
  if (lenis) {
    lenis.stop()
  }
  gsap.to(popoverRef.value, {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.out',
    onComplete: () => {
      if (props.speaker && props.speaker.length > 1) {
        startAutoPlay()
      }
    },
  })
})

onUnmounted(() => {
  pauseAutoPlay()
  if (lenis) {
    lenis.start()
  }
})
</script>

<template>
  <div
    ref="popoverRef"
    data-lenis-prevent
    class="fixed inset-0 z-40 flex h-dvh flex-col overflow-y-auto bg-black/80 pt-[47px] opacity-0 scrollbar-none xs:pt-[55px] sm:pt-[57px] lg:flex-row lg:pt-[55px]"
    @keyup.esc="handleClose"
    @touchstart.passive="handleTouchInteraction"
    @scroll.capture.passive="handleTouchInteraction"
  >
    <AgendaFloatingBlocks />

    <!-- 講者圖片區塊(桌面版) -->
    <SpeakerDialogImageDesktop
      ref="desktopImageComponentRef"
      :speaker="speaker"
      :page-number="pageNumber"
      @prev="handlePrev"
      @next="handleNext"
    />
    <div
      class="txt order-1 flex-1 border-0 border-webconf-gray bg-black lg:order-2 lg:border-x lg:border-r-0"
    >
      <!-- Banner 區塊 -->
      <SpeakerDialogBanner
        :type="type"
        @close="handleClose"
      />
      <!-- 線條動畫 -->
      <div
        v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
        class="fixed z-30 w-full overflow-x-clip"
      ></div>
      <!-- 主要內容區塊 -->
      <div
        class="flex h-[calc(100%-72px)] flex-col overflow-x-clip lg:h-[calc(100%-76px)] lg:flex-row lg:overflow-x-visible"
        @pointerenter="handlePointerEnterContent"
        @pointerleave="handlePointerLeaveContent"
      >
        <!-- 講者圖片區塊(手機版) -->
        <SpeakerDialogImageMobile
          ref="mobileImageComponentRef"
          :speaker="speaker"
          :page-number="pageNumber"
          @prev="handlePrev"
          @next="handleNext"
        />
        <!-- 講者介紹區塊 -->
        <SpeakerDialogIntro
          ref="speakerDialogIntroComponentRef"
          :meta="meta"
          :speaker="speaker"
          :renderable-intro-sections="renderableIntroSections"
          :current-page-number="currentPageNumber"
        />
        <!-- 議程大綱區塊 -->
        <SpeakerDialogAgendaSummary
          :meta="currentMeta"
          :formatted-date="formattedDate"
          :speaker-info="speakerInfo"
        />
      </div>
    </div>
  </div>
</template>
