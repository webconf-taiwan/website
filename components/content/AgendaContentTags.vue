<script setup lang="ts">
const agendasStore = useAgendasStore()

const tags = computed(() => agendasStore.currentAgendaMarkdownData?.tags)
</script>

<template>
  <AgendaItemTags
    class="mt-4"
    :tags="tags"
  />
</template>
