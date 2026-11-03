<script setup lang="ts">
import type { AgendaTag, Speaker } from '~/types'

defineProps<{
  speaker: Speaker
  isSelected: boolean
  selectedTags: AgendaTag[]
  /**
   * 首屏的卡片：照片直接放進 HTML 並以 high 優先下載（加上 <link rel="preload">）。
   * 一般卡片用模糊小圖佔位，真正的照片要等 JS 接手後才開始抓，首屏用這種方式會晚好幾百毫秒
   */
  priority?: boolean
}>()

const emit = defineEmits<{
  tagClick: [tag: AgendaTag]
  /** 一般左鍵點開；父頁面據此先打開彈窗，不必等換頁完成 */
  open: []
}>()

function handleCardClick(event: MouseEvent) {
  // 標籤按鈕自己 stop.prevent 了；這裡再擋一次，避免點標籤也開彈窗
  if ((event.target as HTMLElement).closest('button'))
    return

  // Cmd／Ctrl／Shift／中鍵是開新分頁或新視窗，這一頁不開彈窗
  if (
    event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey
    || event.button !== 0
  ) {
    return
  }

  emit('open')
}
</script>

<template>
  <ShareGridCard
    :is-selected="isSelected"
    :show-square="false"
    :fill-effect="true"
  >
    <NuxtLink
      v-cursor="{
        scale: 0.5,
        duration: 0.5,
      }"
      :to="`/speakers/${speaker.speakerId}`"
      class="flex gap-3 p-5 lg:flex-col lg:p-6 xl:p-9"
      @click="handleCardClick"
    >
      <div class="relative shrink-0">
        <NuxtImg
          :src="speaker.avatarUrl"
          :alt="speaker.name"
          width="220"
          height="314"
          :placeholder="!priority"
          :loading="priority ? 'eager' : undefined"
          :fetchpriority="priority ? 'high' : undefined"
          :preload="priority ? { fetchPriority: 'high' } : false"
          class="aspect-speaker-img-full h-[144px] w-[100px] object-cover duration-300 group-hover:grayscale-0 lg:size-full lg:grayscale"
        />

        <ShareGradientMask class="hidden group-hover:opacity-0 lg:block" />
        <ShareNoiseMask class="hidden group-hover:opacity-0 lg:block" />
      </div>

      <div class="flex flex-col gap-3">
        <div>
          <h3 class="text-h4-24 leading-[1.4]">
            {{ speaker.name }}
          </h3>
          <p
            class="text-xs leading-[1.4] text-webconf-gray-500 group-hover:text-white"
          >
            {{ speaker.JobTitle }}
          </p>
        </div>

        <ul class="relative flex grow flex-wrap items-start gap-2">
          <li
            v-for="tag in speaker.tags"
            :key="`${speaker.name}-${tag}`"
          >
            <button
              type="button"
              :class="{
                'border-webconf-gray bg-webconf-gray text-webconf-blue':
                  selectedTags.includes(tag),
              }"
              class="relative border border-webconf-blue px-4 py-[6px] text-xs leading-[1.4] tracking-[0.02em] transition-colors duration-300 group-hover:border-webconf-gray hover:border-webconf-blue hover:bg-white hover:text-webconf-blue"
              @click.stop.prevent="emit('tagClick', tag)"
            >
              {{ tag }}
            </button>
          </li>
        </ul>
      </div>
    </NuxtLink>

    <template #floating-block>
      <ClientOnly>
        <ShareFloatingBlock />
      </ClientOnly>
    </template>
  </ShareGridCard>
</template>
