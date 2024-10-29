<script lang="ts" setup>
import { useToast } from '@/components/ui/toast/use-toast'
import { breakpointsTailwind, useBreakpoints, useClipboard } from '@vueuse/core'
import { socialIconMap } from '~/constants'
import { agendaShareBaseUrl } from '~/constants/agendas'
import type { SocialLinkType } from '~/types/speakers'

const agendasStore = useAgendasStore()
const { agendaDrawerRenderData } = storeToRefs(agendasStore)

// Mapping 社群連結
const socialLinks = computed(() => {
  return agendaDrawerRenderData.value.socialLinks.map(link => ({
    href: link.url,
    icon: socialIconMap[link.type as SocialLinkType] || '',
    type: link.type,
  }))
})

// 組合議程共筆＆PPT連結
const agendaPaperLinks = computed(() => {
  return agendaDrawerRenderData.value.agendaPaperLinks.map(link => ({
    title: link.type === 'note' ? '共筆文件' : '投影片',
    icon: link.type === 'note' ? 'heroicons:document-text' : 'heroicons:presentation-chart-line',
    href: link.href,
  }))
})

const agendaDrawerContentTabsMap = [
  ['議程資訊'],
  ['講者介紹'],
]

const defaultContentTab = computed(() => {
  return agendaDrawerContentTabsMap[0][0]
})
const currentContentTab = ref(defaultContentTab.value)
const tabsRef = ref<HTMLDivElement | null>(null)

const source = ref('')
const { toast } = useToast()
const { copy } = useClipboard({ source })
function getShareUrl(id: string) {
  toast({
    title: '議程資訊連結｜複製成功',
    description: `${agendaDrawerRenderData.value.speakerName}｜${agendaDrawerRenderData.value.agendaTitle}`,
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
  <div class="space-y-5 text-justify leading-7 tracking-wide lg:flex-1">
    <div class="mt-[1px] w-full md:flex md:space-x-5">
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
            :src="agendaDrawerRenderData.speakerAvatar"
            alt="講者圖片"
            class="size-full object-cover"
            style="clip-path: url(#square-with-corner-cut);"
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

      <div class="mt-5 w-full md:mt-0 lg:flex lg:flex-col lg:items-center lg:justify-between">
        <div class="w-full">
          <p class="text-mina border-b pb-[17px] text-sm">
            {{ agendaDrawerRenderData.jobTitle }}
          </p>
          <p class="text-mina mt-5 text-[32px] font-bold md:mt-4">
            {{ agendaDrawerRenderData.speakerName }}
          </p>
        </div>

        <div class="mt-6 w-full space-y-2 md:flex md:items-center md:justify-between md:space-x-6 md:space-y-0">
          <!-- 連結 -->
          <ul class="flex min-w-[216px] gap-x-2">
            <li
              v-for="link in socialLinks"
              :key="link.type"
              class="group relative bg-primary-green/10"
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
                class="flex size-12 items-center justify-center"
              >
                <Icon
                  :name="link.icon"
                  size="24"
                  class="text-primary-green"
                />
              </NuxtLink>
            </li>
          </ul>

          <!-- 共筆＆PPT -->
          <div class="flex w-full items-end justify-center gap-x-2 lg:max-w-[380px] ">
            <NuxtLink
              v-for="link in agendaPaperLinks"
              :key="link.href"
              :to="link.href"
              target="_blank"
              class="flex w-1/2 items-center justify-center gap-x-2 border border-primary-green px-1 py-2 text-center text-xl duration-150 lg:hover:bg-primary-dark-green"
            >
              {{ link.title }}
              <Icon
                :name="link.icon"
                size="24"
                class="hidden xl:block"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 w-full">
      <Tabs
        ref="tabsRef"
        v-model="currentContentTab"
        class="w-full"
      >
        <TabsList class="sticky left-0 top-2 z-20 flex h-[46px] w-full lg:relative lg:top-0 lg:h-[52px]">
          <TabsTrigger
            v-for="(date, index) in agendaDrawerContentTabsMap"
            :key="date[0]"
            :value="date[0]"
            class="group absolute size-full w-[56%] bg-primary-deep-green font-['Mina'] text-xl font-bold leading-none text-white transition-all duration-300 data-[state=active]:z-[3] data-[state=active]:h-[calc(100%+6px)] data-[state=active]:w-[56%] data-[state=active]:bg-primary-green data-[state=active]:text-black lg:w-[51%] lg:text-[2rem] lg:data-[state=active]:h-[calc(100%+8px)] lg:data-[state=active]:w-[53%] lg:data-[state=inactive]:hover:bg-[hsla(176,99%,29%,1)]"
            :class="[index === 0 ? 'tabs-clip-right left-0 z-[2]' : 'tabs-clip-left right-0 z-[1]']"
          >
            <div
              class="relative flex items-center gap-x-2 truncate pt-1 tracking-wide lg:justify-center lg:pt-2"
              :class="[index === 0 ? 'justify-start pl-4' : 'justify-end pr-4']"
            >
              <span>{{ (date[0]) }}</span> <span class="lg:text-2xl">{{ (date[1]) }}</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          v-for="date in agendaDrawerContentTabsMap"
          :key="date[0]"
          :value="date[0]"
          :force-mount="true"
        >
          <div class="mt-[-1px] w-full border border-primary-green px-5 py-6 md:px-7">
            <Transition
              name="fade"
              mode="out-in"
            >
              <template v-if="currentContentTab === '議程資訊'">
                <AgendaDrawerContent />
              </template>
              <template v-else>
                <AgendaDrawerSpeakerContent />
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
        @click="copy(getShareUrl('123456'))"
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
