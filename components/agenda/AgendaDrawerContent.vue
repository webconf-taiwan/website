<script lang="ts" setup>
defineProps<{
  socialLinks: {
    href: string
    icon: string
  }[]
}>()

const agendaDrawerContentTabsMap = [
  ['議程資訊'],
  ['講者介紹'],
]

const defaultContent = computed(() => {
  return agendaDrawerContentTabsMap[0][0]
})

const currentAgendaDate = ref(defaultContent.value)

const tabsRef = ref<HTMLDivElement | null>(null)
</script>

<template>
  <div class="space-y-5 text-justify leading-7 tracking-wide lg:flex-1">
    <div class="mt-[1px] w-full md:flex md:space-x-5">
      <div class="h-[320px] w-full shrink-0 ring-1 md:h-auto lg:w-[200px]">
        講者圖片
      </div>

      <div class="w-full">
        <p class="text-mina mt-5 border-b pb-[17px] text-sm">
          ex-Yahoo - Global Media Product Design - Sr. Design manager
        </p>

        <div class="lg:flex lg:justify-between lg:space-x-2 xl:space-x-10">
          <!-- 名稱＆連結 -->
          <div class="md:space-y-[60px]">
            <p class="text-mina mt-8 text-[32px] font-bold md:mt-4">
              郭藺瑩 Lydia
            </p>

            <ul class="mt-6 flex min-w-[216px] gap-x-2">
              <li
                v-for="link in socialLinks"
                :key="link.href"
                class="relative bg-primary-green/10"
              >
                <div
                  class="absolute left-1 top-1 size-[10px] border-l border-t border-primary-green"
                ></div>
                <div
                  class="absolute right-1 top-1 size-[10px] border-r border-t border-primary-green"
                ></div>
                <div
                  class="absolute bottom-1 right-1 size-[10px] border-b border-r border-primary-green"
                ></div>
                <div
                  class="absolute bottom-1 left-1 size-[10px] border-b border-l border-primary-green"
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
          </div>

          <!-- 共筆＆PPT -->
          <div class="mt-6 flex w-full max-w-[313px] items-end justify-center gap-x-2">
            <NuxtLink
              to="#"
              class="w-1/2 border border-primary-green py-2 text-center text-xl"
            >
              共筆文件
            </NuxtLink>
            <NuxtLink
              to="#"
              class="w-1/2 border border-primary-green py-2 text-center text-xl"
            >
              投影片
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 w-full">
      <Tabs
        ref="tabsRef"
        v-model="currentAgendaDate"
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
          <div class=" mt-[-1px] w-full border border-primary-green px-5 py-6 md:px-7">
            <!-- 基本資訊 -->
            <div>
              <p class="text-lg md:text-[28px]">
                以 Kotlin Multiplatform 制霸全平台
              </p>

              <ul class="mt-2 space-y-2 text-primary-green md:flex md:space-x-10 md:space-y-0">
                <li class="flex items-center gap-x-1">
                  <Icon
                    name="ic:round-access-time"
                    size="20"
                  />
                  <p>8/12 (sat.) 09:00~09:50</p>
                </li>
                <li class="flex items-center gap-x-1">
                  <Icon
                    name="heroicons:map-pin"
                    size="20"
                  />
                  <p>i 棟</p>
                </li>
              </ul>
            </div>

            <!-- 議程介紹 -->
            <div class="mt-4">
              <p>多年技術社群志工，積極參與 Kotlin User Group 運作，並建立 Kotlin 讀書會/練功場等活動。目前在 JetBrains 擔任技術傳教士，負責推廣 IDE 工具及技術。平時醉心於技術研究，期待能將複雜的技術名詞用通俗易懂的方式讓人人都能吸收。工作之餘是一位甜點愛好者。</p>
            </div>

            <!-- 議程標籤 -->
            <div class="mt-4">
              <AgendaTypeTag :tags="['FRONTEND', 'BACKEND']" />
            </div>

            <!-- 目標會眾 -->
            <div class="mt-4 space-y-2 border-t pt-4">
              <p class="text-lg">
                目標會眾
              </p>
              <p>對多平台開發有興趣的開發者。</p>
            </div>
          </div>

          <!-- <AgendaContent
            :agenda-time-slots="agendaData[date[0]]"
            :tabs-top="tabsTop"
            :agenda-content-footer-dates="agendaContentFooterDates"
            :current-agenda-date="currentAgendaDate"
            @update:current-agenda-date="changeCurrentAgendaDate"
          /> -->
        </TabsContent>
      </Tabs>
    </div>

    <div class="!mt-6 md:!mt-8">
      <Button
        type="button"
        variant="custom"
        size="custom"
        rounded="none"
        class=" max-w-none "
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
</style>
