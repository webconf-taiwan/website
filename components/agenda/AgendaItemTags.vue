<script lang="ts" setup>
import type { AgendaTag } from '~/types/agendas'

const props = defineProps<{
  tags?: AgendaTag['id'][]
}>()

const tagsStore = useTagsStore()

const tags = tagsStore.filterAgendaTags(props.tags)
</script>

<template>
  <div class="flex flex-wrap gap-2 overflow-y-clip">
    <div
      v-for="tag in tags"
      :key="tag.id"
      class="rounded border border-primary-green/30 px-2 py-1 text-center font-['Mina'] text-sm text-primary-green"
    >
      #{{ tag.text }}
    </div>
  </div>
</template>
