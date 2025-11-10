<script setup lang="ts">
import type { ContentCollectionItem } from '@nuxt/content'

type SpeakerSectionsReturn = ReturnType<typeof useSpeakerSections>

const props = defineProps<{
  speaker: ContentCollectionItem[]
  meta: ContentCollectionItem['meta']
  renderableIntroSection: SpeakerSectionsReturn['renderableIntroSection']['value']
  currentPageNumber: number
}>()

const contentRef = ref<HTMLElement | null>(null)

const socialLinks = computed(() =>
  [
    {
      key: 'fb',
      icon: '/images/icon/fb.svg',
      alt: 'Facebook',
      url: props.meta.fb,
    },
    {
      key: 'x',
      icon: '/images/icon/twitter.svg',
      alt: 'X (Twitter)',
      url: props.meta.x,
    },
    {
      key: 'other_link',
      icon: '/images/icon/web.svg',
      alt: 'Website',
      url: props.meta.other_link,
    },
    {
      key: 'ig',
      icon: '/images/icon/ig.svg',
      alt: 'Instagram',
      url: props.meta.ig,
    },
    {
      key: 'threads',
      icon: '/images/icon/threads.svg',
      alt: 'Threads',
      url: props.meta.threads,
    },
    {
      key: 'youtube',
      icon: '/images/icon/youtube.svg',
      alt: 'YouTube',
      url: props.meta.youtube,
    },
    {
      key: 'linkedin',
      icon: '/images/icon/linkedin.svg',
      alt: 'LinkedIn',
      url: props.meta.linkedin,
    },
  ].filter(link => link.url),
)

defineExpose({
  contentRef,
})
</script>

<template>
  <div
    ref="contentRef"
    data-lenis-prevent
    class="info w-full overflow-y-auto border-webconf-gray px-8 py-5 text-white scrollbar-none lg:w-1/2 lg:px-12 lg:py-8"
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
    <ul class="flex flex-wrap gap-3">
      <li
        v-for="link in socialLinks"
        :key="link.key"
        v-cursor="{
          scale: 0.5,
          duration: 0.5,
        }"
        class="border border-webconf-blue/90 transition-colors duration-500 hover:bg-webconf-blue"
      >
        <a
          :href="typeof link.url === 'string' ? link.url : '#'"
          class="block p-[10px]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <NuxtImg
            :src="link.icon"
            width="24"
            height="24"
            :alt="link.alt"
          />
        </a>
      </li>
    </ul>
  </div>
</template>
