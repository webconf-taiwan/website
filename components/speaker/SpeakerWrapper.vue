<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { agendaData, agendaTags } from '~/constants/agendas'
import { speakers } from '~/constants/speakers'

const tagsStore = useTagsStore()

// 取得每個講者的標籤並做映射
const speakersWithTags = computed(() => {
  return speakers.map((speaker) => {
    const tags = getPersonalTags(speaker.code)
    const mappedTags = tags.map((tag) => {
      const agendaTag = agendaTags.find(t => t.id === tag)
      return agendaTag?.text || tag
    })
    return {
      ...speaker,
      tags: mappedTags,
    }
  })
})

// 使用講者 code 取得議程資料
function getAgendaDataBySpeakerCode(speakerCode: string) {
  const speakerAgenda = Object.values(agendaData)
    .flat()
    .filter(slot => slot.type === 'agenda')
    .flatMap((slot) => {
      const agendas = slot.agendas || {}
      if (slot.isBroadcast) {
        return [agendas.M]
      }
      return Object.values(agendas)
    })
    .find(agenda => agenda?.speakerCodes.includes(speakerCode))

  return speakerAgenda
}

// 根據選擇的標籤過濾講者
const filteredSpeakers = computed(() => {
  if (!tagsStore.selectedTags.length)
    return speakersWithTags.value

  return speakersWithTags.value.filter((speaker) => {
    return tagsStore.selectedTags.some((selectedTag) => {
      const mappedSelectedTag = agendaTags.find(t => t.id === selectedTag)?.text || selectedTag
      return speaker.tags.includes(mappedSelectedTag)
    })
  })
})

// 依據 Speaker Code 取得個人標籤
function getPersonalTags(speakerCode: string): string[] {
  const tagsSet = new Set<string>()

  Object.values(agendaData).forEach((daySchedule) => {
    daySchedule.forEach((timeSlot) => {
      if (timeSlot.type === 'agenda' && timeSlot.agendas) {
        Object.values(timeSlot.agendas).forEach((agenda) => {
          if (agenda.speakerCodes.includes(speakerCode)) {
            agenda.tags.forEach(tag => tagsSet.add(tag))
          }
        })
      }
    })
  })

  return Array.from(tagsSet)
}

const agendasStore = useAgendasStore()
const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')
const agendaDrawer = useTemplateRef('speakerDrawer')

const drawerSlideDirection = computed(() => {
  return isSmallerLg.value ? 'slide-up-full' : 'slide-left'
})

function triggerAgenda(speakerCode: string) {
  const speakerAgenda = getAgendaDataBySpeakerCode(speakerCode)

  if (speakerAgenda) {
    agendasStore.currentAgendaDrawerId = speakerAgenda.id
    agendasStore.setAgendaDrawerRenderData(speakerAgenda)
    agendaDrawer.value?.open()
  }
}
</script>

<template>
  <div>
    <TransitionGroup
      tag="ul"
      name="speaker-list"
      class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 lg:gap-y-16 xl:grid-cols-4"
    >
      <li
        v-for="speaker in filteredSpeakers"
        :key="speaker.id"
        class="group relative flex w-full flex-col items-center px-4 py-[26px] duration-200 lg:hover:bg-primary-green/10"
      >
        <button
          type="button"
          @click="triggerAgenda(speaker.code)"
        >
          <SpeakerCard
            :speaker="speaker"
            :agenda-data="agendaData"
          />
        </button>
      </li>
    </TransitionGroup>

    <Teleport to="body">
      <Drawer
        ref="speakerDrawer"
        :slide-direction="drawerSlideDirection"
        drawer-class="lg:w-[60dvw]"
        @close="agendasStore.resetContentTab"
      >
        <DrawerContentLayout>
          <template #content>
            <AgendaDrawerWrapper />
          </template>
        </DrawerContentLayout>
      </Drawer>
    </Teleport>
  </div>
</template>

<style scoped>
@media (min-width: 1024px) {
  .speaker-list-move,
  .speaker-list-enter-active,
  .speaker-list-leave-active {
    transition: all 0.5s ease;
  }

  .speaker-list-enter-from,
  .speaker-list-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }

  .speaker-list-leave-active {
    position: absolute;
  }
}
</style>
