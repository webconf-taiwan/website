<script setup lang="ts">
const agendasStore = useAgendasStore()
const { currentContentTab } = storeToRefs(agendasStore)
</script>

<template>
  <div>
    <template v-if="currentContentTab === 'agenda-info'">
      <ContentSlot :use="$slots.agenda" />
    </template>

    <template v-if="currentContentTab === 'speaker-intro'">
      <ContentSlot :use="$slots.speaker" />
    </template>
  </div>
</template>
