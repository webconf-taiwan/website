<script lang="ts" setup>
import { agendaData } from '~/constants/agendas'
import { speakers } from '~/constants/speakers'
</script>

<template>
  <ul class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 lg:gap-y-16 xl:grid-cols-4">
    <li
      v-for="(speaker) in speakers"
      :key="speaker.id"
      class="group relative flex w-full flex-col items-center px-4 py-[26px] duration-200 lg:hover:bg-primary-green/10"
    >
      <SpeakerCard
        :speaker="speaker"
        :agenda-data="agendaData"
      />
    </li>
  </ul>
</template>
