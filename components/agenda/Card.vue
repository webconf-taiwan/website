<script setup lang="ts">
import type { AgendaItem } from '~/types'

defineProps<{
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

// 根據螢幕尺寸決定初始方塊大小 (行動版 20px, 桌面版 28px)
const initialSize = computed(() => (width.value >= 1280 ? 28 : 20))

// 計算 X 和 Y 軸各自需要的縮放比例，讓兩個方向同時到達邊界
const scaleX = computed(() => width.value / initialSize.value)
const scaleY = computed(() => height.value / initialSize.value)
</script>

<template>
  <div
    :class="{ 'lg:border-r-[0.5px]': index !== 2 }"
    class="relative grow border-b-[0.5px] border-webconf-gray/50"
  >
    <!-- 時間標記 (桌面版) -->
    <div
      v-if="showTime"
      class="sticky top-[124px] z-[5] ml-[-86px] hidden h-7 w-[86px] items-center justify-center bg-webconf-gray text-btn-16 text-webconf-blue lg:flex"
    >
      {{ time }}
    </div>

    <!-- 議程卡片 -->
    <NuxtLink
      ref="cardRef"
      class="group relative block h-full overflow-hidden bg-black transition-colors duration-300"
      :class="{
        'lg:-mt-7': showTime,
      }"
      :to="
        data.speakerInfo && data.speakerInfo.length > 0
          ? `/agendas/${data.speakerInfo.map((s) => s.speakerId).join('/')}`
          : '/agendas'
      "
      @click="setToggleModal(true)"
    >
      <!-- 縮放特效方塊 -->
      <div
        v-if="data.title !== '同步聯播' && data.title !== 'TBD'"
        class="absolute left-0 top-0 z-0 size-5 origin-top-left bg-webconf-blue transition-transform duration-300 ease-out group-hover:[transform:scale(var(--scale-x),var(--scale-y))] lg:block lg:size-7"
        :style="{
          '--scale-x': scaleX,
          '--scale-y': scaleY,
        }"
      ></div>

      <div class="h-full px-5 py-8 lg:px-10 xl:min-h-[285px]">
        <!-- 議程簡介 -->
        <div
          v-if="data.title !== '同步聯播' && data.title !== 'TBD'"
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

          <div class="flex items-end justify-between">
            <div class="flex items-end gap-3">
              <div class="flex gap-2">
                <div
                  v-for="speaker in data.speakerInfo"
                  :key="speaker.name"
                  class="relative"
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

              <div
                class="flex flex-col flex-wrap items-center gap-1 lg:flex-row lg:gap-2"
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

        <!-- 同步聯播 -->
        <div
          v-else
          class="flex h-full items-center justify-between"
        >
          <h2 class="grow text-h4-24 lg:text-center">
            {{ data.title }}
          </h2>

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

      <!-- 半透明遮罩 -->
      <div
        class="absolute inset-0 size-full bg-black opacity-0 duration-300"
        :class="{
          'block opacity-70': !isSelected,
          'hidden': isSelected,
        }"
      ></div>
    </NuxtLink>
  </div>
</template>
