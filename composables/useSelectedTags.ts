import type { AgendaTag } from '~/types'

export function useSelectedTags() {
  const selectedTags = ref<AgendaTag[]>([])

  function handleTagClick(tag: AgendaTag) {
    if (selectedTags.value.includes(tag)) {
      selectedTags.value = [...selectedTags.value.filter(t => t !== tag)]
    }
    else {
      selectedTags.value = [...selectedTags.value, tag]
    }
  }

  return {
    selectedTags,
    handleTagClick,
  }
}
