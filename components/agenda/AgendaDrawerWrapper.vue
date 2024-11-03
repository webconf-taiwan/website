<script lang="ts" setup>
import { useToast } from '@/components/ui/toast/use-toast'
import { breakpointsTailwind, useBreakpoints, useClipboard } from '@vueuse/core'
import { socialIconMap } from '~/constants'
import { agendaShareBaseUrl } from '~/constants/agendas'
import type { AgendaDrawerRenderData } from '~/types/agendas'
import type { SocialLinkType } from '~/types/speakers'
import AgendaDrawerOtherLinks from './AgendaDrawerOtherLinks.vue'

const agendasStore = useAgendasStore()
const {
  agendaDrawerContentTabsMap,
  agendaDrawerRenderData,
  currentContentTab,
  currentAgendaDrawerId,
  currentAgendaMarkdownData,
} = storeToRefs(agendasStore)

// Mapping 社群連結
function getSocialLinks(links: AgendaDrawerRenderData['socialLinks']) {
  return links.map(link => ({
    href: link.url,
    icon: socialIconMap[link.type as SocialLinkType] || '',
    type: link.type,
  }))
}

const tabsRef = ref<HTMLDivElement | null>(null)

const source = ref('')
const { toast } = useToast()
const { copy } = useClipboard({ source })
function getShareUrl(id: string) {
  const speakerNames = agendaDrawerRenderData.value
    .map(speaker => speaker.speakerName)
    .join('、')

  toast({
    title: '議程資訊連結｜複製成功',
    description: `${speakerNames}｜${agendaDrawerRenderData.value[0].agendaTitle}`,
  })
  return `${agendaShareBaseUrl}/${id}`
}

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerOrEqualMd = breakpoints.smallerOrEqual('md')
const maskClipPath = computed(() => {
  return isSmallerOrEqualMd.value
    ? 'M144,0 H320 V320 H0 V30 L100,30 Z'
    : 'M100,0 H200 V200 H0 V30 L58,30 L100 ,0 Z'
})
const svgViewBox = computed(() => {
  return isSmallerOrEqualMd.value
    ? '0 0 320 320'
    : '0 0 200 200'
})
</script>

<template>
  <div class="space-y-8 text-justify leading-7 tracking-wide lg:flex-1">
    <div
      v-for="(speaker, index) in agendaDrawerRenderData"
      :key="speaker.speakerName"
      class="mt-[1px] w-full md:flex md:space-x-5"
      :class="{ 'mt-8': index > 0 }"
    >
      <!-- 講者頭像 -->
      <div class="flex w-full shrink-0 items-center justify-center overflow-hidden md:h-full md:w-[200px]">
        <svg
          class="absolute"
          width="0"
          height="0"
        >
          <defs>
            <clipPath id="square-with-corner-cut">
              <path :d="maskClipPath" />
            </clipPath>
          </defs>
        </svg>
        <div class="relative mt-[1px] h-auto w-[320px] shrink-0 md:w-[200px]">
          <NuxtImg
            :src="speaker.speakerAvatar"
            :alt="`${speaker.speakerName} 講者圖片`"
            class="size-full object-cover"
            style="clip-path: url(#square-with-corner-cut);"
            placeholder="/speakers/avatar_placeholder.svg"
            format="webp"
            draggable="false"
          />

          <div class="absolute inset-x-0 bottom-0 z-10 h-1.5 bg-primary-green"></div>
          <div class="absolute top-[3px] z-10 h-[1px] w-[100px] bg-primary-green md:w-[70px]"></div>
          <div class="absolute top-[15px] z-10 h-[1px] w-[70px] bg-primary-green md:w-[50px]"></div>

          <svg
            class="pointer-events-none absolute left-0 top-0 size-full"
            :view-box="svgViewBox"
          >
            <path
              :d="maskClipPath"
              fill="none"
              stroke="var(--primary-green)"
              stroke-width="3"
            />
          </svg>
        </div>
      </div>

      <!-- 講者資訊 -->
      <div class="mt-5 w-full md:mt-0 lg:flex lg:flex-col lg:items-center lg:justify-between">
        <div class="w-full">
          <p class="text-mina border-b pb-4 text-sm">
            {{ speaker.jobTitle }}
          </p>
          <p class="text-mina mt-5 text-[32px] font-bold md:mt-4">
            {{ speaker.speakerName }}
          </p>
        </div>

        <div class="mt-6 w-full space-y-2 md:flex md:items-center md:justify-between md:space-x-6 md:space-y-0">
          <!-- 社群連結 -->
          <ul class="flex min-w-[216px] gap-x-2">
            <li
              v-for="link in getSocialLinks(speaker.socialLinks)"
              :key="link.type"
              class="group relative size-12 bg-primary-green/10"
            >
              <div
                class="absolute left-1 top-1 size-[10px] border-l border-t border-primary-green transition-all duration-150 lg:group-hover:left-0 lg:group-hover:top-0"
              ></div>
              <div
                class="absolute right-1 top-1 size-[10px] border-r border-t border-primary-green transition-all duration-150 lg:group-hover:right-0 lg:group-hover:top-0"
              ></div>
              <div
                class="absolute bottom-1 right-1 size-[10px] border-b border-r border-primary-green transition-all duration-150 lg:group-hover:bottom-0 lg:group-hover:right-0"
              ></div>
              <div
                class="absolute bottom-1 left-1 size-[10px] border-b border-l border-primary-green transition-all duration-150 lg:group-hover:bottom-0 lg:group-hover:left-0"
              ></div>

              <NuxtLink
                :to="link.href"
                target="_blank"
                class="relative flex size-full items-center justify-center"
              >
                <Icon
                  :name="link.icon"
                  size="24"
                  class="text-primary-green"
                />
              </NuxtLink>
            </li>
          </ul>

          <!-- 共筆＆PPT - 只在單講者時顯示 -->
          <AgendaDrawerOtherLinks
            v-if="agendaDrawerRenderData.length === 1"
            :agenda-other-links="speaker.agendaOtherLinks"
            class="justify-end"
          />
        </div>
      </div>
    </div>

    <!-- 多講者時的議程文件 -->
    <AgendaDrawerOtherLinks
      v-if="agendaDrawerRenderData.length > 1"
      :agenda-other-links="agendaDrawerRenderData[0].agendaOtherLinks"
      class="justify-start"
    />

    <div class="mt-6 w-full">
      <Tabs
        ref="tabsRef"
        v-model="currentContentTab"
        class="w-full"
      >
        <TabsList class="sticky left-0 top-0 z-20 flex h-[46px] w-full lg:relative lg:top-0 lg:h-[52px]">
          <TabsTrigger
            v-for="(tab, index) in agendaDrawerContentTabsMap"
            :key="tab[0]"
            :value="tab[0]"
            class="group absolute size-full w-[56%] bg-primary-deep-green font-['Mina'] text-xl font-bold leading-none text-white transition-all duration-300 data-[state=active]:z-[3] data-[state=active]:h-[calc(100%+6px)] data-[state=active]:w-[56%] data-[state=active]:bg-primary-green data-[state=active]:text-black lg:w-[52%] lg:text-[2rem] lg:data-[state=active]:h-[calc(100%+8px)] lg:data-[state=active]:w-[55%] lg:data-[state=inactive]:hover:bg-[hsla(176,99%,29%,1)]"
            :class="[index === 0 ? 'tabs-clip-right left-0 z-[2]' : 'tabs-clip-left right-0 z-[1]']"
          >
            <div
              class="relative flex items-center gap-x-2 truncate pt-1 tracking-wide lg:justify-center lg:pt-2"
              :class="[index === 0 ? 'justify-start pl-6' : 'justify-end pr-6']"
            >
              <span class="lg:text-[1.75rem]">{{ (tab[1]) }}</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          v-for="tab in agendaDrawerContentTabsMap"
          :key="tab[0]"
          :value="tab[0]"
          :force-mount="true"
        >
          <div class="mt-[-1px] w-full border border-primary-green px-5 py-6 md:px-7">
            <Transition
              name="fade"
              mode="out-in"
            >
              <template v-if="currentContentTab === 'agenda-info'">
                <div>
                  <ContentRenderer :value="currentAgendaMarkdownData">
                    <template #empty>
                      <p>沒有任何內容。</p>
                    </template>
                  </ContentRenderer>
                </div>
              </template>
              <template v-else>
                <div>
                  <ContentRenderer :value="currentAgendaMarkdownData">
                    <template #empty>
                      <p>沒有任何內容。</p>
                    </template>
                  </ContentRenderer>
                </div>
              </template>
            </Transition>
          </div>
        </TabsContent>
      </Tabs>
    </div>

    <div class="!my-6 md:!mt-8 lg:!mb-10">
      <Toaster
        :duration="2000"
      />
      <Button
        type="button"
        variant="custom"
        size="custom"
        rounded="none"
        class="max-w-none"
        @click="copy(getShareUrl(currentAgendaDrawerId))"
      >
        <span class="flex items-center gap-x-[10px] text-xl">
          分享資訊
          <Icon
            name="ic:round-share"
            class="text-2xl"
          />
        </span>
      </Button>
    </div>
  </div>
</template>

<style scoped>
.tabs-clip-right {
  clip-path: polygon(0% 0%, 100% 0%, calc(100% - 32px) 100%, 0% 100%);
}

.tabs-clip-left {
  clip-path: polygon(32px 0%, 100% 0%, 100% 100%, 0% 100%);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.slide-move,
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.slide-leave-active {
  position: absolute;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
