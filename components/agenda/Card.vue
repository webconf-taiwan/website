<script setup lang="ts">
import type { AgendaItem } from '~/types'

const props = defineProps<{
  data: AgendaItem
  index: number
  time?: string
  showTime?: boolean
  isSelected: boolean
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

// 計算屬性
const isSpecialCard = computed(() => {
  return props.data.title === '同步聯播' || props.data.title === 'TBD'
})

const cardLink = computed(() => {
  if (props.data.speakerInfo && props.data.speakerInfo.length > 0) {
    const speakerIds = props.data.speakerInfo.map(s => s.speakerId).join('/')
    return `/agenda/${speakerIds}`
  }
  return '/agenda'
})
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
      @click="setToggleModal(true)"
    >
      <div
        v-if="!isSpecialCard"
        class="pointer-events-none absolute left-0 top-0 z-10 size-5 bg-webconf-blue mix-blend-screen transition-all duration-300 ease-out lg:block lg:size-7 lg:group-hover:h-[var(--target-height)] lg:group-hover:w-[var(--target-width)]"
        :style="squareStyle"
      ></div>

      <div class="h-full px-5 py-8 lg:px-10 xl:min-h-[285px]">
        <div
          v-if="!isSpecialCard"
          class="relative flex h-full flex-col gap-4"
        >
          <h2 class="text-h4-24 leading-[1.4]">
            {{ data.title }}
          </h2>

          <ul
            v-if="data.tags"
            class="relative flex grow flex-wrap items-start gap-2"
          >
            <li
              v-for="tag in data.tags"
              :key="`${data.title}-${tag}`"
              class="relative border border-webconf-blue px-4 py-[6px] text-xs leading-[1.4] tracking-[0.02em] transition-colors duration-300 group-hover:border-webconf-gray"
            >
              {{ tag }}
            </li>
          </ul>

          <div class="flex items-end justify-between lg:z-10">
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

        <!-- 同步聯播 / TBD -->
        <div
          v-else
          class="flex h-full items-center justify-between"
        >
          <h2 class="grow text-h4-24 lg:text-center">
            {{ data.title }}
          </h2>

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

      <!-- 標籤選取遮罩 -->
      <div
        v-if="!isSelected"
        class="absolute inset-0 z-10 size-full bg-black opacity-70 duration-300"
      ></div>
    </NuxtLink>
  </div>
</template>
