<script setup lang="ts">
import type { AgendaItem, AgendaLocation } from '~/types/agendas'

const props = defineProps<{
  agenda: AgendaItem
  location: AgendaLocation
  isAgendaDisabled: boolean
}>()

const agendasStore = useAgendasStore()

const speakersData = agendasStore.findSpeakers(props.agenda.speakerCodes)

const combinedSpeakersDisplayName = speakersData.map(speaker => speaker.displayName).join(' / ')
</script>

<template>
  <div
    class="relative flex h-full flex-col p-3 transition-opacity lg:px-5 lg:py-4"
    :class="[isAgendaDisabled ? 'opacity-30' : 'opacity-100']"
  >
    <!-- Agenda title -->
    <h3 class="mb-2 line-clamp-2 text-start text-lg font-medium text-white">
      {{ agenda.title }}
    </h3>

    <!-- Agenda tags -->
    <AgendaItemTags :tags="agenda.tags" />

    <!-- Agenda speakers -->
    <div class="mt-3 grow content-end text-start">
      <div class="flex items-center gap-x-2">
        <div class="flex shrink-0 items-center -space-x-2">
          <!-- Speakers avatars -->
          <NuxtImg
            v-for="speaker in speakersData"
            :key="speaker.id"
            :src="speaker.avatar"
            :alt="speaker.displayName"
            placeholder="/speakers/avatar_placeholder.svg"
            class="size-10 overflow-hidden rounded-full border border-primary-green bg-gray-400 object-cover"
            format="webp"
            draggable="false"
          />
        </div>

        <!-- Speakers display names -->
        <span
          :title="combinedSpeakersDisplayName"
          class="line-clamp-2 grow tracking-wide"
        >{{ combinedSpeakersDisplayName }}</span>

        <div class="flex shrink-0 items-center gap-x-1 text-[hsla(182,25%,74%,1)] lg:hidden">
          <Icon
            name="i-heroicons-map-pin"
            size="16"
          />
          <span>{{ location }} 棟</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
