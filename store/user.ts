export const useUserStore = defineStore('user', () => {
  const savedName = ref<string>('')
  const previousNames = ref(new Set<string>())

  const usedNames = computed(() => Array.from(previousNames.value))
  const otherNames = computed(() => usedNames.value.filter(name => name !== savedName.value))

  function setNewName(name: string) {
    if (savedName.value)
      previousNames.value.add(savedName.value)

    savedName.value = name
  }

  return {
    savedName,
    otherNames,
    setNewName,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
