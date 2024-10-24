<script setup lang="ts">
import type { AgendaItem } from '~/types/agendas'

const props = defineProps<{
  agenda: AgendaItem
}>()

const agendasStore = useAgendasStore()

const speakersData = agendasStore.findSpeakers(props.agenda.speakerCodes)

const combinedSpeakersDisplayName = speakersData.map(speaker => speaker.displayName).join(' / ')
</script>

<template>
  <div class="relative flex h-full flex-col px-5 py-4">
    <!-- Agenda title -->
    <h3 class="mb-2 line-clamp-2 text-start text-lg font-medium text-white">
      {{ agenda.title }}
    </h3>

    <!-- Agenda tags -->
    <AgendaTypeTag :tags="agenda.tags" />

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
      </div>
    </div>
  </div>
</template>

<style scoped></style>
