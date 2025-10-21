<script setup lang="ts">
import type { AgendaItem } from '~/types'

interface Props {
  data: AgendaItem
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
  <NuxtLink
    ref="cardRef"
    class="group relative col-span-1 overflow-hidden bg-black transition-colors duration-300 xl:h-[285px] xl:px-10 xl:py-8"
    to="/agenda/v2"
  >
    <!-- 縮放特效方塊 -->
    <div
      class="absolute left-0 top-0 size-7 origin-top-left bg-webconf-blue transition-transform duration-300 ease-out group-hover:[transform:scale(var(--scale-x),var(--scale-y))]"
      :style="{
        '--scale-x': scaleX,
        '--scale-y': scaleY,
      }"
    ></div>

    <!-- 議程簡介 -->
    <div
      v-if="data.title !== '同步聯播'"
      class="flex h-full flex-col gap-4"
    >
      <h2 class="relative z-10 text-h4-24">
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
  </NuxtLink>
</template>
