export function useAllSpeakers() {
  return useAsyncData('all-speakers', () => {
    return queryCollection('content').all()
  }, { getCachedData: key => useNuxtApp().payload.data[key] ?? useNuxtApp().static.data[key] })
}
