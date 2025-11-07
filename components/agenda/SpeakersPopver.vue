<script setup lang="ts">
import type {
  SpeakerDialogImageDesktop,
  SpeakerDialogImageMobile,
  SpeakerDialogIntro,
} from '#components'
import type { ContentCollectionItem } from '@nuxt/content'
import { site } from '~/config/seo.config'
import { BACK_LINKS } from '~/constants/agendas'

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

const router = useRouter()
const { gsap } = useGsap()

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

const pageNumber = computed(() => {
  return {
    current: props.speaker[currentPageNumber.value].meta,
    next:
      currentPageNumber.value < props.speaker.length - 1
        ? props.speaker[currentPageNumber.value + 1].meta
        : props.speaker[0].meta,
  }
})

let autoPlayTween: gsap.core.Tween | null = null

/* 處理關閉彈出視窗 */
function handleClose() {
  // 淡出動畫
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

/* 動畫切換內容 */
function animateContentTransition(
  nextIndex: number,
  type: 'next' | 'prev',
  imageAnimationCallback: () => void,
) {
  if (isAnimating.value)
    return
  isAnimating.value = true

  if (!speakerDialogIntroComponentRef.value?.contentRef) {
    currentPageNumber.value = nextIndex
    imageAnimationCallback()
    return
  }
  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false
    },
  })

  if (type === 'next') {
    tl.to(speakerDialogIntroComponentRef.value.contentRef, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
    })
      .add('hideComplete')
      .call(imageAnimationCallback, null, 'hideComplete+=0')
      .call(
        () => {
          currentPageNumber.value = nextIndex
        },
        null,
        'hideComplete+=0.8',
      )
      .to(speakerDialogIntroComponentRef.value.contentRef, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.in',
      })
  }
  else {
    tl.to(speakerDialogIntroComponentRef.value.contentRef, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: async () => {
        currentPageNumber.value = nextIndex
        await nextTick()
        imageAnimationCallback()
      },
    })
    tl.to(
      speakerDialogIntroComponentRef.value.contentRef,
      {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.in',
      },
      '+=0.8',
    )
  }
}

/* 處理下一位講者 */
function handleNext(speakers: ContentCollectionItem[]) {
  if (isAnimating.value)
    return
  const nextIndex
    = currentPageNumber.value < speakers.length - 1
      ? currentPageNumber.value + 1
      : 0
  animateContentTransition(nextIndex, 'next', () => {
    animateImageTransition()
  })
}

/* 處理上一位講者 */
function handlePrev() {
  if (isAnimating.value)
    return
  const prevIndex
    = currentPageNumber.value > 0
      ? currentPageNumber.value - 1
      : props.speaker!.length - 1

  animateContentTransition(prevIndex, 'prev', () => {
    animateImageTransitionReverse()
  })
}

/* 講者圖片切換動畫 */
function animateImageTransition() {
  const container = getActiveImageContainer()
  if (!container)
    return

  pauseAutoPlay()

  const tl = gsap.timeline({
    onComplete: async () => {
      await nextTick()
      gsap.set(container, { x: 0 })

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

/* 講者圖片切換動畫(反向) */
function animateImageTransitionReverse() {
  const container = getActiveImageContainer()
  if (!container)
    return

  pauseAutoPlay()

  gsap.set(container, { x: '-100%' })

  const tl = gsap.timeline({
    onComplete: async () => {
      await nextTick()
      gsap.set(container, { x: 0 })

      if (props.speaker && props.speaker.length > 1) {
        startAutoPlay()
      }
    },
  })

  // 向右滑動到 0，露出第一張圖片
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

useSeoMeta({
  title: `${meta.value.name} | ${meta.value.topic}` || site.title,
  description:
    props.speaker?.[currentPageNumber.value]?.seo.description
    || site.description,
  twitterTitle: `${meta.value.name} | ${meta.value.topic}` || site.title,
  twitterDescription:
    props.speaker?.[currentPageNumber.value]?.seo.description
    || site.description,
  ogUrl: `https://webconf.tw/agenda?speakerId=${meta.value.speakerId}`,
  author: (meta.value.name as string) || site.name,
  keywords: ((meta.value.tags as string[]).join(', ') as string) || '',
})

onMounted(() => {
  const lenis = useLenis()
  if (lenis) {
    lenis.stop()
  }

  // 淡入動畫
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

onUnmounted(() => {
  pauseAutoPlay()

  const lenis = useLenis()
  if (lenis) {
    lenis.start()
  }
})
</script>

<template>
  <div
    ref="popoverRef"
    data-lenis-prevent
    class="fixed inset-0 z-20 flex h-svh flex-col overflow-y-auto bg-black/80 pt-[47px] xs:pt-[55px] sm:pt-[57px] lg:flex-row lg:pt-[55px]"
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
