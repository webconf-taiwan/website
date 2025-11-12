<script setup lang="ts">
import type {
  SpeakerDialogImageDesktop,
  SpeakerDialogImageMobile,
  SpeakerDialogIntro,
} from '#components'
import type { ContentCollectionItem } from '@nuxt/content'
import { onKeyStroke } from '@vueuse/core'
import { site } from '~/config/seo.config'
import { BACK_LINKS } from '~/constants/agenda'

const props = withDefaults(
  defineProps<{
    speaker: ContentCollectionItem[]
    type?: 'agendas' | 'speakers'
  }>(),
  {
    type: 'agendas',
  },
)

const emit = defineEmits(['close'])

const lenis = useLenis()

const router = useRouter()
const { gsap } = useGsap()
const { isModalOpen, setToggleModal } = useGlobalState()

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
const { renderableIntroSection, speakerInfo, meta, formattedDate }
  = useSpeakerSections(speakerRef, currentPageNumber)

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

function getPageTitle() {
  if (props.speaker?.length > 1) {
    return meta.value.topic || site.title
  }

  if (meta.value.name && meta.value.topic) {
    return `${meta.value.name} | ${meta.value.topic}`
  }

  return site.title
}

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
  const isMobile = window.innerWidth < 1024
  if (isMobile) {
    return mobileImageComponentRef.value?.mobileImageContainerRef || null
  }
  else {
    return desktopImageComponentRef.value?.imageContainerRef || null
  }
}

/* 動畫切換內容 - 只負責內容淡入淡出 */
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

  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false
    },
  })

  // 內容淡出
  tl.to(speakerDialogIntroComponentRef.value.contentRef, {
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
  tl.to(speakerDialogIntroComponentRef.value.contentRef, {
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
    duration: 0.8,
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
    duration: 0.8,
    ease: 'power2.inOut',
  })
}

/* 開始自動播放 */
function startAutoPlay() {
  if (!props.speaker || props.speaker.length <= 1)
    return

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

/* 處理滑鼠進入內容區 */
function handleMouseEnterContent() {
  pauseAutoPlay()
}

/* 處理滑鼠離開內容區 */
function handleMouseLeaveContent() {
  if (props.speaker && props.speaker.length > 1) {
    startAutoPlay()
  }
}

useSeoMeta({
  title: getPageTitle(),
  description: props.speaker?.[0]?.seo.description || site.description,
  twitterTitle:
    meta.value.name && meta.value.topic
      ? `${meta.value.name} | ${meta.value.topic}`
      : site.title,
  twitterDescription: props.speaker?.[0]?.seo.description || site.description,
  ogUrl: `https://webconf.tw/agenda?speakerId=${meta.value.id}`,
  author: (meta.value.name as string) || site.name,
  keywords: ((meta.value.tags as string[]).join(', ') as string) || '',
})

/** 處理 ESC 關閉事件監聽 */
onKeyStroke('Escape', () => {
  handleClose()
})

onMounted(() => {
  if (lenis) {
    lenis.stop()
  }
  // 淡入動畫
  if (isModalOpen.value) {
    nextTick(() => {
      gsap.fromTo(
        popoverRef.value,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => {
            if (props.speaker && props.speaker.length > 1) {
              startAutoPlay()
            }
          },
        },
      )
    })
  }
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
    class="fixed inset-0 z-40 flex min-h-screen flex-col overflow-y-auto bg-black/80 pt-[47px] scrollbar-none xs:pt-[55px] sm:pt-[57px] lg:flex-row lg:pt-[55px]"
    @keyup.esc="handleClose"
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
      class="txt order-1 flex-1 border-0 border-webconf-gray bg-black lg:order-2 lg:border-x"
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
        class="flex h-[calc(100%-72px)] flex-col lg:h-[calc(100%-76px)] lg:flex-row"
        @mouseenter="handleMouseEnterContent"
        @mouseleave="handleMouseLeaveContent"
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
          :renderable-intro-section="renderableIntroSection"
          :current-page-number="currentPageNumber"
        />
        <!-- 議程大綱區塊 -->
        <SpeakerDialogAgendaSummary
          :meta="meta"
          :formatted-date="formattedDate"
          :speaker-info="speakerInfo"
        />
      </div>
    </div>
  </div>
</template>
