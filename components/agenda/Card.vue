<script setup lang="ts">
import type { AgendaItem } from '~/types'

interface Props {
  data: AgendaItem
  index: number
  time?: string
  showTime?: boolean
}

defineProps<Props>()

const cardRef = ref<HTMLElement>()
const { width, height } = useElementSize(cardRef, undefined, {
  box: 'border-box',
})

// 計算 X 和 Y 軸各自需要的縮放比例，讓兩個方向同時到達邊界
const scaleX = computed(() => width.value / 28)
const scaleY = computed(() => height.value / 28)
</script>

<template>
  <div class="relative">
    <!-- 時間標記 (桌面版) -->
    <div
      v-if="showTime"
      class="sticky top-[124px] z-[5] ml-[-86px] hidden h-7 w-[86px] items-center justify-center bg-webconf-gray text-btn-16 text-webconf-blue xl:flex"
    >
      {{ time }}
    </div>

    <NuxtLink
      ref="cardRef"
      class="group relative block overflow-hidden border-b border-webconf-gray bg-black transition-colors duration-300"
      :class="{ 'xl:-mt-7': showTime }"
      to="/agenda/v2"
    >
      <!-- 縮放特效方塊 -->
      <div
        v-if="data.title !== '同步聯播'"
        class="absolute left-0 top-0 z-0 size-5 origin-top-left bg-webconf-blue transition-transform duration-300 ease-out group-hover:[transform:scale(var(--scale-x),var(--scale-y))] xl:block xl:size-7"
        :style="{
          '--scale-x': scaleX,
          '--scale-y': scaleY,
        }"
      ></div>

      <div class="px-5 py-8 xl:h-[285px] xl:px-10">
        <h2
          v-if="data.title === '同步聯播'"
          class="flex-center h-full text-h4-24"
        >
          {{ data.title }}
        </h2>

        <!-- 議程簡介 -->
        <div
          v-if="data.title !== '同步聯播'"
          class="relative flex h-full flex-col gap-4"
        >
          <h2 class="text-h4-24">
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

          <div class="flex items-end gap-3">
            <div class="relative">
              <NuxtImg
                src="/images/speakers/carousel-01_happy.webp"
                :alt="data.title"
                width="43"
                height="60"
                class="grayscale"
              />
              <ShareGradientMask />
              <ShareNoiseMask />
            </div>

            <div class="text-body-16">
              {{ data.speakerInfo![0].name }}
            </div>
          </div>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
