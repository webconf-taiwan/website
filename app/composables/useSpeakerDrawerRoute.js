// 講者抽屜的開關都記在網址的 ?speaker=<id>，連結可以直接分享（設計稿要求）。講者頁與議程頁共用。
// 從頁面上點開是 push 一筆歷史，關閉就 back —— 手機按返回鍵也是關抽屜；
// 直接開分享連結進來的沒有上一筆可退，關閉改成把 query 拿掉。
// ⚠️ 每個 to 都要帶 path: route.path —— 只給 query 的話 router 會解析成沒有結尾斜線的
// /speakers，跟目前的 /speakers/ 算不同路徑，LayoutPageTransition 就會蓋上黑幕，
// 而同一頁不會觸發 page:finish，黑幕就永遠拿不掉。
//
// 用法：
//   const { current, linkTo, markOpened, close, select } = useSpeakerDrawerRoute(items)
//   <NuxtLink :to="linkTo(id)" @click="markOpened">…</NuxtLink>
//   <SpeakersDrawer :items="items" :current="current" @close="close" @select="select" />
export function useSpeakerDrawerRoute (items) {
  const route = useRoute()
  const router = useRouter()

  const current = computed(() => {
    const id = route.query.speaker
    return typeof id === 'string' && unref(items)?.some(p => p.id === id) ? id : ''
  })

  const linkTo = id => ({ path: route.path, query: { ...route.query, speaker: id } })

  let openedHere = false
  const markOpened = () => { openedHere = true }

  function close () {
    if (openedHere) {
      openedHere = false
      router.back()
    } else {
      const { speaker, ...query } = route.query
      router.replace({ path: route.path, query })
    }
  }

  // 抽屜裡切換對談講者：換掉網址的 speaker，不多疊一筆歷史
  const select = id => router.replace(linkTo(id))

  return { current, linkTo, markOpened, close, select }
}
