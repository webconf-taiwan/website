<script lang="ts" setup>
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
</script>

<template>
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
      <SpeakerCard
        :speaker="speaker"
        :agenda-data="agendaData"
      />
    </li>
  </TransitionGroup>
</template>

<style scoped>
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

/* 確保離開的項目不會影響佈局 */
.speaker-list-leave-active {
  position: absolute;
}
</style>
