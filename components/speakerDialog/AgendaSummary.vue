<script lang="ts" setup>
import type { ContentCollectionItem } from '@nuxt/content'

type SpeakerSectionsReturn = ReturnType<typeof useSpeakerSections>

defineProps<{
  meta: ContentCollectionItem['meta']
  formattedDate: string
  speakerInfo: SpeakerSectionsReturn['speakerInfo']['value']
}>()

const toast = useToast()

async function handleShareClick() {
  const link = globalThis.location.href

  try {
    await navigator.clipboard.writeText(link)
    const copyRightText = '連結複製成功'
    toast.success({
      icon: '',
      close: false,
      closeOnClick: true,
      progressBar: false,
      backgroundColor: '#E6E6E6',
      displayMode: 1,
      class: 'custom-toast',
      timeout: 1500,
      message: `<div class="flex justify-center items-center text-btn-14 text text-black gap-1 py-[9px] pr-4 pl-6">
        <span>${copyRightText}</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.25 13.05L9.91667 18L19.25 9" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>`,
    })
  }
  catch (err) {
    console.error('複製失敗:', err)
    toast.error({
      message: '複製連結失敗,請重試',
    })
  }
}
</script>

<template>
  <!-- 議程介紹區塊 -->
  <div
    data-lenis-prevent
    class="w-full overflow-y-auto border-l-0 border-t border-webconf-gray px-12 text-white scrollbar-none lg:w-1/2 lg:border-l lg:border-t-0"
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
    <!-- 分享按鈕 -->
    <button
      v-cursor="{
        scale: 0.5,
        duration: 0.5,
      }"
      type="button"
      class="group fixed bottom-3 right-3 bg-webconf-blue p-2 text-webconf-gray transition-colors duration-500 hover:bg-webconf-gray hover:text-webconf-black lg:absolute lg:bottom-5 lg:right-0 lg:pb-3"
      @click="handleShareClick"
    >
      <Icon
        name="custom-icon:share"
        class="block size-6 lg:mb-[5px]"
      />
      <span
        class="hidden text-[16px] font-semibold leading-[1.2] tracking-[0.02em] [writing-mode:vertical-rl] lg:inline-block"
      >分享資訊</span>
    </button>
  </div>
</template>
