export function useAllSpeakers() {
  return useAsyncData('all-speakers', () =>
    queryCollection('content').all())
}
