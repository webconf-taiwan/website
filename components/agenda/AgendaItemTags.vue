<script lang="ts" setup>
import type { AgendaTag } from '~/types/agendas'

const props = defineProps<{
  tags?: AgendaTag['id'][]
}>()

const tags = filterAgendaTags(props.tags)
</script>

<template>
  <div class="flex flex-wrap gap-2 overflow-y-clip">
    <div
      v-for="tag in tags"
      :key="tag.id"
      class="h-[30px] content-center rounded border border-primary-green/30 px-2 text-center font-['Mina'] text-sm tracking-wider text-primary-green"
    >
      #{{ tag.text }}
    </div>
  </div>
</template>
