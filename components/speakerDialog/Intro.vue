<script setup lang="ts">
import type { ContentCollectionItem } from '@nuxt/content'

type SpeakerSectionsReturn = ReturnType<typeof useSpeakerSections>

defineProps<{
  speaker: ContentCollectionItem[]
  meta: ContentCollectionItem['meta']
  renderableIntroSection: SpeakerSectionsReturn['renderableIntroSection']['value']
  currentPageNumber: number
}>()

const contentRef = ref<HTMLElement | null>(null)

defineExpose({
  contentRef,
})
</script>

<template>
  <div
    ref="contentRef"
    data-lenis-prevent
    class="info w-full overflow-y-auto border-webconf-gray px-8 py-5 text-white lg:w-1/2 lg:px-12 lg:py-8"
  >
    <div class="mb-10">
      <div class="flex justify-between">
        <span
          class="mb-8 bg-webconf-gray px-4 py-[6px] text-xs font-semibold leading-[1.4] tracking-[0.02em] text-webconf-blue"
        >講者介紹</span>
        <span
          v-if="speaker && speaker.length > 1"
          class="text-body-16 text-webconf-gray-500"
        >
          {{ currentPageNumber + 1 }} | {{ speaker?.length }}
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
        v-if="meta.fb"
        class="border border-webconf-blue/90"
      >
        <a
          :href="typeof meta.fb === 'string' ? meta.fb : '#'"
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
          :href="typeof meta.other_link === 'string' ? meta.other_link : '#'"
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
      <li
        v-if="meta.threads"
        class="border border-webconf-blue/90"
      >
        <a
          :href="typeof meta.threads === 'string' ? meta.threads : '#'"
          class="block p-[10px]"
          target="_blank"
        >
          <NuxtImg
            src="/images/icon/threads.svg"
            width="24"
            height="24"
            alt="threads"
          />
        </a>
      </li>
      <li
        v-if="meta.youtube"
        class="border border-webconf-blue/90"
      >
        <a
          :href="typeof meta.youtube === 'string' ? meta.youtube : '#'"
          class="block p-[10px]"
          target="_blank"
        >
          <NuxtImg
            src="/images/icon/youtube.svg"
            width="24"
            height="24"
            alt="youtube"
          />
        </a>
      </li>
      <li
        v-if="meta.linkedin"
        class="border border-webconf-blue/90"
      >
        <a
          :href="typeof meta.linkedin === 'string' ? meta.linkedin : '#'"
          class="block p-[10px]"
          target="_blank"
        >
          <NuxtImg
            src="/images/icon/linkedin.svg"
            width="24"
            height="24"
            alt="linkedin"
          />
        </a>
      </li>
    </ul>
  </div>
</template>
