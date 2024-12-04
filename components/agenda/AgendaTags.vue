<script setup lang="ts">
import type { AgendaTag } from '~/types/agendas'
import { agendaTags } from '~/constants/agendas'

const tagsStore = useTagsStore()

const filteredAgendaTags = computed(() => {
  return agendaTags.filter(tag => tagsStore.allTags.includes(tag.id))
})

function isSelected(tagId: AgendaTag['id']) {
  return tagsStore.selectedTags.includes(tagId)
}
</script>

<template>
  <div>
    <div
      class="absolute left-2 top-2 size-[10px] border-l border-t border-primary-green"
    ></div>
    <div
      class="absolute right-2 top-2 size-[10px] border-r border-t border-primary-green"
    ></div>
    <div
      class="absolute bottom-2 right-2 size-[10px] border-b border-r border-primary-green"
    ></div>
    <div
      class="absolute bottom-2 left-2 size-[10px] border-b border-l border-primary-green"
    ></div>

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
        @click="tagsStore.toggleTag(tag.id)"
      >
        <span>{{ tag.text }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
