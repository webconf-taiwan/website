import type { ContentCollectionItem } from '@nuxt/content'

/**
 * 講者彈窗要顯示哪些講者；由議程頁、講者頁（父頁面）呼叫，彈窗也渲染在父頁面。
 *
 * 點卡片時先用 open() 記下講者，彈窗立刻打開，網址交給 NuxtLink 照常換。
 * 不能等換頁完成才開：Nuxt 換到預渲染頁之前要先抓該頁的 _payload.json，
 * 網路一慢彈窗就要等好幾秒，使用者以為沒點到又點一次，前一次換頁被取消，就變成「點了沒反應」。
 * 講者資料（all-speakers）父頁面本來就有，彈窗不需要等那份 payload。
 *
 * 換頁完成後改由網址決定（直接開 /agenda/1、上一頁、下一頁都靠網址）。
 */
export function useSpeakerDialog(options: {
  /** 多人議程允許的講者組合；不在名單裡的多人網址不開彈窗。不傳就不檢查 */
  allowedGroups?: string[][]
} = {}) {
  const route = useRoute()
  const { setToggleModal } = useGlobalState()
  const { data: allSpeakers } = useAllSpeakers()

  /** 點下卡片、網址還沒換好之前的講者 */
  const pendingIds = ref<string[] | null>(null)

  const routeIds = computed(() => {
    const ids = (route.params as { speakerId?: string | string[] }).speakerId
    if (!ids)
      return []
    return Array.isArray(ids) ? ids : [ids]
  })

  const speakerIds = computed(() => pendingIds.value ?? routeIds.value)

  function isAllowed(ids: string[]) {
    if (ids.length <= 1 || !options.allowedGroups)
      return true

    return options.allowedGroups.some(group =>
      group.length === ids.length
      && group.every(id => ids.includes(id))
      && ids.every(id => group.includes(id)),
    )
  }

  const speakers = computed<ContentCollectionItem[]>(() => {
    const ids = speakerIds.value

    if (!ids.length || !allSpeakers.value || !isAllowed(ids))
      return []

    return allSpeakers.value.filter(speaker =>
      ids.includes(speaker.meta.speakerId as string),
    )
  })

  // 網址追上點擊的講者後就交還給網址；換頁被取消時 pendingIds 留著，彈窗照樣開著
  watch(routeIds, (ids) => {
    const pending = pendingIds.value
    if (pending && pending.length === ids.length && pending.every(id => ids.includes(id)))
      pendingIds.value = null
  })

  watch(
    () => speakers.value.length > 0,
    (isOpen) => {
      if (isOpen)
        setToggleModal(true)
    },
    { immediate: true },
  )

  /** 點卡片時呼叫；只記下講者，換網址仍交給 NuxtLink */
  function open(ids: string[]) {
    if (ids.length)
      pendingIds.value = [...ids]
  }

  /** 彈窗淡出完成後呼叫；換回列表網址由彈窗自己處理，這裡不再 push，避免同時送兩次導覽 */
  function close() {
    pendingIds.value = null
  }

  return { speakers, speakerIds, open, close }
}
