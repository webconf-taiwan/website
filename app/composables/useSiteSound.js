// 背景音（plugins/sound.client.js 提供）。SSR 階段沒有 plugin，給一組什麼都不做的替身，
// 呼叫端不用每次判斷 import.meta.client。
const noop = () => {}
const serverStub = {
  enabled: ref(true),
  audible: ref(false),
  toggle: noop,
  introStart: noop,
  introLock: noop,
  particlePush: noop,
  particleGather: noop,
}

export function useSiteSound () {
  return useNuxtApp().$sound || serverStub
}
