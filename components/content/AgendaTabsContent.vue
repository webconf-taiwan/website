<script setup lang="ts">
const agendasStore = useAgendasStore()
const {
  currentContentTab,
  agendaDrawerRenderData,
} = storeToRefs(agendasStore)
</script>

<template>
  <div>
    <template v-if="currentContentTab === 'agenda-info'">
      <ContentSlot :use="$slots.agenda" />
    </template>

    <template v-if="currentContentTab === 'speaker-intro'">
      <h3>{{ agendaDrawerRenderData.speakerName }}</h3>
      <ContentSlot :use="$slots.speaker" />
    </template>
  </div>
</template>
