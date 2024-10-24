<script setup lang="ts">
import { agendaTags } from '~/constants/agendas'
import type { AgendaTag } from '~/types/agendas'

const agendasStore = useAgendasStore()

const filteredAgendaTags = computed(() => {
  return agendaTags.filter(tag => agendasStore.allTags.includes(tag.id))
})

function isSelected(tagId: AgendaTag['id']) {
  return agendasStore.selectedTags.includes(tagId)
}
</script>

<template>
  <div>
    <BorderDecoration :position-value="2" />

    <div class="flex flex-wrap content-center justify-center gap-3">
      <button
        v-for="tag in filteredAgendaTags"
        :key="tag.id"
        type="button"
        class="border border-primary-mid-green bg-transparent px-3 py-2 transition-colors"
        :class="[
          isSelected(tag.id)
            ? 'bg-gradient-to-t from-[rgba(0,255,204,0.5)] to-[rgba(0,255,204,0.1)] text-white'
            : 'text-primary-mid-green lg:hover:bg-[hsla(176,99%,29%,1)] lg:hover:text-white',
        ]"
        @click="agendasStore.toggleTag(tag.id)"
      >
        <span>{{ tag.text }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
