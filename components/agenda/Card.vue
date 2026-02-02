<script setup lang="ts">
import type { AgendaItem, AgendaTag } from '~/types'

const props = defineProps<{
  data: AgendaItem
  index: number
  time?: string
  showTime?: boolean
  isSelected: boolean
}>()

const emit = defineEmits<{
  tagClick: [tag: AgendaTag]
}>()

const cardRef = ref<HTMLElement>()
const { setToggleModal } = useGlobalState()
const { width, height } = useElementSize(cardRef, undefined, {
  box: 'border-box',
})

// 計算目標尺寸的 CSS 值
const squareStyle = computed(() => {
  const targetWidth
    = Math.ceil(width.value) * (props.data.space ?? 1)
      + (props.data.space ?? 0.5)
  const targetHeight = Math.ceil(height.value)
  return {
    '--target-width': `${targetWidth}px`,
    '--target-height': `${targetHeight}px`,
  }
})

const cardLink = computed(() => {
  if (props.data.speakerInfo && props.data.speakerInfo.length > 0) {
    const speakerIds = props.data.speakerInfo.map(s => s.speakerId).join('/')
    return `/agenda/${speakerIds}`
  }
  return '/agenda'
})

function handleTagClick(tag: AgendaTag) {
  emit('tagClick', tag)
}

function handleCardClick(event: MouseEvent) {
  // 如果點擊的是按鈕，不執行 modal 開啟
  const target = event.target as HTMLElement
  if (target.closest('button')) {
    event.preventDefault()
    return
  }
  setToggleModal(true)
}
</script>

<template>
  <div
    :class="{
      'lg:border-r-[0.5px]': index !== 2,
    }"
    class="relative grow border-b-[0.5px] border-webconf-gray/50"
  >
    <!-- 時間標記 (桌面版) -->
    <div
      v-if="showTime"
      class="sticky top-[124px] z-[5] ml-[-86px] hidden h-7 w-[86px] items-center justify-center bg-webconf-gray text-btn-16 text-webconf-blue lg:flex"
    >
      {{ time }}
    </div>

    <NuxtLink
      ref="cardRef"
      class="group relative block h-full bg-black transition-colors duration-300 lg:overflow-visible"
      :class="{
        'lg:-mt-7': showTime,
      }"
      :to="cardLink"
      @click="handleCardClick"
    >
      <div
        class="pointer-events-none absolute left-0 top-0 z-10 size-5 bg-webconf-blue mix-blend-screen transition-all duration-300 ease-out lg:block lg:size-7 lg:group-hover:h-[var(--target-height)] lg:group-hover:w-[var(--target-width)]"
        :style="squareStyle"
      ></div>

      <div class="h-full px-5 py-8 lg:px-8 xl:min-h-[285px] xl:px-10">
        <div class="relative flex h-full flex-col">
          <div class="min-w-0 grow">
            <div class="relative">
              <span
                v-if="data.isCoStream"
                class="float-left mr-3 shrink-0 bg-webconf-gray px-3 py-[6px] text-center text-body-16 font-semibold leading-none text-webconf-blue"
              >
                聯播
              </span>

              <h2 class="-mt-1 text-h4-24 leading-[1.4]">
                {{ data.title }}
              </h2>
            </div>

            <ul
              v-if="data.tags"
              class="relative z-[5] mt-3 flex flex-wrap items-start gap-2 lg:mt-4"
            >
              <li
                v-for="tag in data.tags"
                :key="`${data.title}-${tag}`"
              >
                <button
                  type="button"
                  class="relative border border-webconf-blue px-4 py-[6px] text-xs leading-[1.4] tracking-[0.02em] transition-colors duration-300 group-hover:border-webconf-gray hover:border-webconf-blue hover:bg-white hover:text-webconf-blue"
                  @click.stop.prevent="handleTagClick(tag)"
                >
                  {{ tag }}
                </button>
              </li>
            </ul>
          </div>

          <div
            class="mt-6 flex items-end justify-between"
            :class="{
              'lg:z-10': isSelected,
            }"
          >
            <div class="flex items-end gap-3">
              <!-- 講者頭像 -->
              <div class="flex shrink-0 gap-2">
                <div
                  v-for="(speaker, idx) in data.speakerInfo"
                  :key="speaker.name"
                  class="relative"
                  :style="{
                    transform:
                      data.speakerInfo?.length && data.speakerInfo.length > 2
                        ? `translateX(${-50 * idx}%)`
                        : undefined,
                  }"
                >
                  <NuxtImg
                    :src="speaker.avatarUrl"
                    :alt="speaker.name"
                    width="43"
                    height="60"
                  />
                  <ShareNoiseMask />
                </div>
              </div>

              <!-- 講者名稱 -->
              <div
                class="flex min-w-[50%] flex-col flex-wrap items-center gap-1 lg:flex-row lg:gap-[6px]"
                :class="{
                  'ml-[-43px]':
                    data.speakerInfo?.length && data.speakerInfo.length > 2,
                }"
              >
                <template
                  v-for="(speaker, idx) in data.speakerInfo"
                  :key="speaker.name"
                >
                  <p class="text-body-16">
                    {{ speaker.name }}
                  </p>
                  <p
                    v-if="data.speakerInfo && idx < data.speakerInfo.length - 1"
                    class="hidden text-[#999] lg:block"
                  >
                    |
                  </p>
                </template>
              </div>
            </div>

            <!-- 地點 (行動版) -->
            <div class="flex items-center gap-1 text-body-18 lg:hidden">
              <NuxtImg
                src="/images/icon/location.svg"
                alt="location"
                width="20"
                height="20"
              />
              {{ data.location }}
            </div>
          </div>
        </div>
      </div>

      <div
        :class="{
          'opacity-0': isSelected,
          'opacity-70': !isSelected,
        }"
        class="pointer-events-none absolute inset-0 z-[5] size-full bg-black duration-300"
      ></div>
    </NuxtLink>
  </div>
</template>
