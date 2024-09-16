export const useTilesBackgroundStore = defineStore('tiles', () => {
  const isReduceTargetOpacity = ref(false)

  const tilesTargetOpacity = computed(() => isReduceTargetOpacity.value ? '0.025' : '0.1')

  return {
    isReduceTargetOpacity,
    tilesTargetOpacity,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useTilesBackgroundStore, import.meta.hot))
