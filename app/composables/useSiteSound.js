// 背景音（plugins/sound.client.js 提供）。SSR 階段沒有 plugin，給一組什麼都不做的替身，
// 呼叫端不用每次判斷 import.meta.client。總開關（constants/sound.js）關著時 client 端也用這組。
import { SITE_SOUND_ENABLED } from '~/constants/sound'

const noop = () => {}
const serverStub = {
  enabled: ref(SITE_SOUND_ENABLED),
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
