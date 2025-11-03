<script setup lang="ts">
import type { ContentCollectionItem, MinimarkNode } from '@nuxt/content'
import { site } from '~/config/seo.config'

const props = defineProps<{
  speaker: ContentCollectionItem[]
}>()

const emit = defineEmits(['close'])
const route = useRoute()
const router = useRouter()
const { gsap } = useGsap()

const imageContainerRef = ref(null)
const mobileImageContainerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const isAutoPlaying = ref(false)
const isAnimating = ref(false)
const popoverRef = ref(null)
const currentPageNumber = ref(0)
const meta = computed(
  () => props.speaker?.[currentPageNumber.value].meta || {},
)
const pageNumber = computed(() => {
  return {
    current: props.speaker[currentPageNumber.value].meta,
    next:
      currentPageNumber.value < props.speaker.length - 1
        ? props.speaker[currentPageNumber.value + 1].meta
        : props.speaker[0].meta,
  }
})
const date
  = typeof meta.value.date === 'string'
    ? meta.value.date
    : new Date().toDateString()
const formattedDate = formatDate(date)
let autoPlayTween: gsap.core.Tween | null = null

const introSection = computed(() => {
  return props.speaker?.[currentPageNumber.value]?.body.value.find(
    node => node[0] === 'speaker-intro',
  )
})

const summarySection = props.speaker[0].body.value.find(
  node => node[0] === 'speaker-summary',
)

const audienceSection = props.speaker[0].body.value.find(
  node => node[0] === 'speaker-audience',
)

const earningsSection = props.speaker[0].body.value.find(
  node => node[0] === 'speaker-earnings',
)

const renderableIntroSection = computed(() =>
  toRenderableSection(introSection.value),
)

const speakerInfo = {
  introSection: toRenderableSection(introSection.value),
  summarySection: toRenderableSection(summarySection),
  speakerAudience: toRenderableSection(audienceSection),
  earningsSection: toRenderableSection(earningsSection),
}

function toRenderableSection(section: MinimarkNode | undefined) {
  return {
    body: {
      type: 'minimark',
      value: [section],
    },
  }
}

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

function resetRoute() {
  const { speakerId, ...rest } = route.query
  router.push({ query: rest })
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const weekday = weekdays[date.getDay()]

  return `${month}/${day} (${weekday}.)`
}

function getActiveImageContainer() {
  const isMobile = window.innerWidth < 1024
  return isMobile ? mobileImageContainerRef.value : imageContainerRef.value
}

function animateContentTransition(
  nextIndex: number,
  type: 'next' | 'prev',
  imageAnimationCallback: () => void,
) {
  if (isAnimating.value)
    return
  isAnimating.value = true

  if (!contentRef.value) {
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
    tl.to(contentRef.value, {
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
      .to(contentRef.value, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.in',
      })
  }
  else {
    tl.to(contentRef.value, {
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
      contentRef.value,
      {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.in',
      },
      '+=0.8',
    )
  }
}

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
    class="fixed inset-0 z-20 flex h-svh flex-col overflow-y-auto bg-black/80 pt-[46px] sm:pt-[54px] lg:flex-row lg:pt-[56px]"
  >
    <AgendaFloatingBlocks />

    <div class="pic order-2 hidden overflow-hidden lg:order-1 lg:block">
      <div
        class="relative border-b border-webconf-gray"
        @mouseover="pauseAutoPlay"
        @mouseleave="startAutoPlay"
        @touchstart="pauseAutoPlay"
        @touchend="startAutoPlay"
      >
        <!-- 圖片容器 -->
        <div class="max-w-[350px] overflow-hidden">
          <div
            ref="imageContainerRef"
            class="flex"
          >
            <!-- 當前講者照片 -->
            <NuxtImg
              :src="
                typeof pageNumber.current.image === 'string'
                  ? pageNumber.current.image
                  : '#'
              "
              width="350"
              height="498"
              alt="講者照片"
              class="shrink-0"
            />

            <!-- 下一張講者照片 -->
            <NuxtImg
              :src="
                typeof pageNumber.next.image === 'string'
                  ? pageNumber.next.image
                  : '#'
              "
              width="350"
              height="498"
              alt="下一位講者照片"
              class="shrink-0"
            />
          </div>
        </div>
        <div class="absolute -bottom-2 left-10 flex gap-4">
          <div class="size-4 bg-webconf-gray"></div>
          <div class="size-4 bg-webconf-gray"></div>
          <div class="size-4 bg-webconf-gray"></div>
        </div>
        <div
          v-if="props.speaker && props.speaker.length > 1"
          class="absolute bottom-[-66px] left-[234px] flex gap-3"
        >
          <button
            type="button"
            class="border border-webconf-gray bg-black p-2 text-webconf-gray transition-colors duration-500 hover:bg-webconf-gray hover:text-black"
            @click="handlePrev"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.6667 19L4 12M4 12L10.6667 5M4 12L20 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            class="border border-webconf-gray bg-black p-2 text-webconf-gray transition-colors duration-500 hover:bg-webconf-gray hover:text-black"
            @click="handleNext(props.speaker)"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.3333 5L20 12M20 12L13.3333 19M20 12L4 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div
      class="txt order-1 flex-1 border-0 border-webconf-gray bg-black lg:order-2 lg:border-x"
    >
      <div
        class="speaker-detail-header sticky inset-0 z-20 h-[72px] border-b border-webconf-gray lg:relative lg:h-[76px]"
      >
        <div
          class="absolute right-[28px] top-[18px] grid size-10 place-content-center bg-webconf-gray"
          @click="handleClose"
        >
          <NuxtImg
            src="/images/icon/black-close.svg"
            width="24"
            height="24"
            alt="close"
          />
        </div>
      </div>
      <div
        class="flex h-[calc(100%-72px)] flex-col lg:h-[calc(100%-76px)] lg:flex-row"
      >
        <!-- 講者圖片區塊(手機版) -->
        <div
          class="relative z-10 flex justify-center border-b border-webconf-gray lg:hidden"
          @mouseover="pauseAutoPlay"
          @mouseleave="startAutoPlay"
          @touchstart="pauseAutoPlay"
          @touchend="startAutoPlay"
        >
          <!-- 圖片容器 -->
          <div class="max-w-[210px] overflow-hidden">
            <div
              ref="mobileImageContainerRef"
              class="flex"
            >
              <!-- 當前講者照片 -->
              <NuxtImg
                :src="
                  typeof pageNumber.current.image === 'string'
                    ? pageNumber.current.image
                    : '#'
                "
                width="350"
                height="498"
                alt="講者照片"
                class="shrink-0"
              />

              <!-- 下一張講者照片 -->
              <NuxtImg
                :src="
                  typeof pageNumber.next.image === 'string'
                    ? pageNumber.next.image
                    : '#'
                "
                width="350"
                height="498"
                alt="下一位講者照片"
                class="shrink-0"
              />
            </div>
          </div>
          <div class="absolute -bottom-2 left-10 flex gap-4">
            <div class="size-4 bg-webconf-gray"></div>
            <div class="size-4 bg-webconf-gray"></div>
            <div class="size-4 bg-webconf-gray"></div>
          </div>
          <div
            v-if="props.speaker && props.speaker.length > 1"
            class="absolute left-[19px] top-1/2 flex w-[calc(100%-38px)] translate-y-[-50%] justify-between gap-3"
          >
            <button
              type="button"
              class="border border-webconf-gray bg-black p-2 text-webconf-gray transition-colors hover:bg-webconf-gray hover:text-black"
              @click="handlePrev"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.6667 19L4 12M4 12L10.6667 5M4 12L20 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              class="border border-webconf-gray bg-black p-2 text-webconf-gray transition-colors hover:bg-webconf-gray hover:text-black"
              @click="handleNext(props.speaker)"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.3333 5L20 12M20 12L13.3333 19M20 12L4 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <!-- 講者介紹區塊 -->
        <div
          ref="contentRef"
          data-lenis-prevent
          class="info w-full overflow-y-auto border-webconf-gray px-8 py-5 text-white lg:w-1/2 lg:px-12 lg:py-8"
          @mouseover="pauseAutoPlay"
          @mouseleave="startAutoPlay"
          @touchstart="pauseAutoPlay"
          @touchend="startAutoPlay"
        >
          <div class="mb-10">
            <div class="flex justify-between">
              <span
                class="mb-8 bg-webconf-gray px-4 py-[6px] text-xs font-semibold leading-[1.4] tracking-[0.02em] text-webconf-blue"
              >講者介紹</span>
              <span
                v-if="props.speaker && props.speaker.length > 1"
                class="text-body-16 text-webconf-gray-500"
              >
                {{ currentPageNumber + 1 }} | {{ props.speaker?.length }}
              </span>
            </div>
            <h2 class="mb-4 text-h3-40">
              {{ meta.name }}
            </h2>
            <span
              class="inline-block text-[18px] leading-[1.2] tracking-[0.02em] text-webconf-gray-500 lg:text-[20px]"
            >{{ meta.company }} / {{ meta.job_title }}</span>
          </div>
          <ContentRenderer :value="renderableIntroSection" />
          <ul class="flex gap-3">
            <li
              v-if="meta.facebook"
              class="border border-webconf-blue/90"
            >
              <a
                :href="typeof meta.facebook === 'string' ? meta.facebook : '#'"
                class="block p-[10px]"
                target="_blank"
              >
                <NuxtImg
                  src="/images/icon/fb.svg"
                  width="24"
                  height="24"
                  alt="fb"
                />
              </a>
            </li>
            <li
              v-if="meta.x"
              class="border border-webconf-blue/90"
            >
              <a
                :href="typeof meta.x === 'string' ? meta.x : '#'"
                class="block p-[10px]"
                target="_blank"
              >
                <NuxtImg
                  src="/images/icon/twitter.svg"
                  width="24"
                  height="24"
                  alt="twitter"
                />
              </a>
            </li>
            <li
              v-if="meta.other_link"
              class="border border-webconf-blue/90"
            >
              <a
                :href="
                  typeof meta.other_link === 'string' ? meta.other_link : '#'
                "
                class="block p-[10px]"
                target="_blank"
              >
                <NuxtImg
                  src="/images/icon/web.svg"
                  width="24"
                  height="24"
                  alt="web"
                />
              </a>
            </li>
            <li
              v-if="meta.ig"
              class="border border-webconf-blue/90"
            >
              <a
                :href="typeof meta.ig === 'string' ? meta.ig : '#'"
                class="block p-[10px]"
                target="_blank"
              >
                <NuxtImg
                  src="/images/icon/ig.svg"
                  width="24"
                  height="24"
                  alt="ig"
                />
              </a>
            </li>
          </ul>
        </div>
        <!-- 議程介紹區塊 -->
        <div
          data-lenis-prevent
          class="agentda w-full overflow-y-auto border-l-0 border-t border-webconf-gray px-12 text-white lg:w-1/2 lg:border-l lg:border-t-0"
        >
          <!-- 議程簡介 -->
          <div class="-mx-12 border-b-[0.5px] border-webconf-frame">
            <div class="px-8 py-5 lg:px-12 lg:py-8">
              <div class="mb-10">
                <span
                  class="mb-8 inline-block bg-webconf-gray px-4 py-[6px] text-xs font-semibold leading-[1.4] tracking-[0.02em] text-webconf-blue"
                >議程介紹</span>
                <h2 class="mb-5 text-h3-40 leading-[1.2]">
                  {{ meta.topic }}
                </h2>
                <div
                  class="mb-5 flex text-[18px] font-semibold leading-[1.2] tracking-[0.02em] text-webconf-gray lg:text-[20px]"
                >
                  <time
                    datetime="2025-08-12T09:00/10:50"
                    class="flex gap-3 after:border-r-[0.5px] after:border-webconf-gray after:content-['']"
                  >{{ formattedDate }} {{ meta.time }}</time><span class="inline-block pl-3">{{ meta.room }}</span>
                </div>
              </div>
              <div
                v-if="meta.doc && meta.slides"
                class="mb-10 flex gap-3 text-btn-16 text-webconf-gray"
              >
                <a
                  v-if="meta.doc"
                  href="#"
                  class="inline-block bg-webconf-blue px-6 py-2"
                >
                  共筆文件
                </a>
                <a
                  v-if="meta.doc"
                  :href="typeof meta.slides === 'string' ? meta.slides : '#'"
                  class="inline-block bg-webconf-blue px-[31px] py-2"
                >
                  投影片
                </a>
              </div>
              <ContentRenderer :value="speakerInfo.summarySection" />
              <div
                v-if="meta.tags"
                class="hidden flex-wrap gap-2 text-xs font-semibold leading-[1.4] tracking-[0.02em] text-webconf-gray lg:flex"
              >
                <div
                  v-for="tag in meta.tags"
                  :key="tag"
                  class="border border-webconf-blue px-4 py-[6px]"
                >
                  {{ tag }}
                </div>
              </div>
            </div>
          </div>
          <!-- 目標受眾 -->
          <div class="-mx-12 border-b-[0.5px] border-webconf-frame">
            <div class="px-8 py-5 lg:px-12 lg:py-8">
              <h3 class="mb-4 text-h4-24">
                目標受眾
              </h3>
              <ContentRenderer :value="speakerInfo.speakerAudience" />
            </div>
          </div>
          <!-- 預期收穫 -->
          <div class="-mx-12">
            <div class="px-8 py-5 lg:px-12 lg:py-8">
              <h3 class="mb-4 text-h4-24">
                預期收穫
              </h3>
              <ContentRenderer :value="speakerInfo.earningsSection" />
              <div
                v-if="meta.tags"
                class="flex flex-wrap gap-2 text-[12px] font-semibold leading-[1.4] tracking-[0.02em] text-webconf-gray lg:hidden"
              >
                <div
                  v-for="tag in meta.tags"
                  :key="tag"
                  class="bg-webconf-blue px-4 py-[6px]"
                >
                  {{ tag }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.speaker-detail-header {
  background-image: url("/images/speakerPopoverBg.webp");
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: auto 76px;
}

@media (min-width: 1440px) {
  .speaker-detail-header {
    background-size: 100% 76px;
  }
}
</style>
