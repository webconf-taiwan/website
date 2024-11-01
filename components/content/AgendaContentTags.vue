<script setup lang="ts">
const agendasStore = useAgendasStore()

const tags = computed(() => agendasStore.currentAgendaMarkdownData?.tags)
</script>

<template>
  <div>
    <AgendaItemTags :tags="tags" />
  </div>
</template>
