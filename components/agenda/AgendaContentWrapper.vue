<script setup lang="ts">
import { agendaData } from '~/constants/agendas'

const agendaDateTextMap = [
  ['2024-12-27', '(FRI.)'],
  ['2024-12-28', '(SAT.)'],
]

const agendaContentFooterDates = agendaDateTextMap.map(([date]) => date)

const defaultContent = computed(() => {
  return agendaDateTextMap[0][0]
})

const currentAgendaDate = ref(defaultContent.value)

const tabsRef = ref<HTMLDivElement | null>(null)
const { top: tabsTop } = useElementBounding(tabsRef)

function changeCurrentAgendaDate(date: string) {
  currentAgendaDate.value = date
}
</script>

<template>
  <Tabs
    ref="tabsRef"
    v-model="currentAgendaDate"
    class="w-full"
  >
    <TabsList class="sticky left-0 top-12 z-20 flex h-[46px] w-full lg:relative lg:top-0 lg:h-[52px]">
      <TabsTrigger
        v-for="(date, index) in agendaDateTextMap"
        :key="date[0]"
        :value="date[0]"
        class="group absolute size-full w-[56%] bg-primary-deep-green font-['Mina'] text-xl font-bold leading-none text-white transition-all duration-300 data-[state=active]:z-[3] data-[state=active]:h-[calc(100%+6px)] data-[state=active]:w-[56%] data-[state=active]:bg-primary-green data-[state=active]:text-black lg:w-[51%] lg:text-[2rem] lg:data-[state=active]:h-[calc(100%+8px)] lg:data-[state=active]:w-[53%] lg:data-[state=inactive]:hover:bg-[hsla(176,99%,29%,1)]"
        :class="[index === 0 ? 'tabs-clip-right left-0 z-[2]' : 'tabs-clip-left right-0 z-[1]']"
      >
        <div
          class="relative flex items-center gap-x-2 truncate pt-1 tracking-wide lg:justify-center lg:pt-2"
          :class="[index === 0 ? 'justify-start pl-4' : 'justify-end pr-4']"
        >
          <span>{{ useDateFormat(date[0], 'MM/DD') }}</span> <span class="lg:text-2xl">{{ date[1] }}</span>
        </div>
      </TabsTrigger>
    </TabsList>

    <TabsContent
      v-for="date in agendaDateTextMap"
      :key="date[0]"
      :value="date[0]"
      :force-mount="true"
    >
      <AgendaContent
        :agenda-time-slots="agendaData[date[0]]"
        :tabs-top="tabsTop"
        :agenda-content-footer-dates="agendaContentFooterDates"
        :current-agenda-date="currentAgendaDate"
        @update:current-agenda-date="changeCurrentAgendaDate"
      />
    </TabsContent>
  </Tabs>
</template>

<style scoped>
.tabs-clip-right {
  clip-path: polygon(0% 0%, 100% 0%, calc(100% - 32px) 100%, 0% 100%);
}

.tabs-clip-left {
  clip-path: polygon(32px 0%, 100% 0%, 100% 100%, 0% 100%);
}
</style>
