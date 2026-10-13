import type { Priority } from '~/composables/useImagePreload'

/** 與 SpeakerDialogImageDesktop／Mobile 的 <NuxtImg> 尺寸一致 */
const DIALOG_PHOTO = { width: 350, height: 498 } as const

/** 講者彈窗的照片預載；彈窗照片用 <NuxtImg placeholder>，網址規則見 usePlaceholderImageUrls */
export function useSpeakerDialogImages() {
  const { preload, warm } = useImagePreload()
  const placeholderImageUrls = usePlaceholderImageUrls()
  const { data: allSpeakers } = useAllSpeakers()

  /** 一位講者在目前裝置上會用到的 URL，依載入順序排列 */
  function photoUrls(src: string) {
    return placeholderImageUrls(src, DIALOG_PHOTO)
  }

  /** 依 speakerId 找出彈窗照片；找不到或沒有照片的講者略過 */
  function photoSources(speakerIds: string[]) {
    return speakerIds.flatMap((id) => {
      const image = allSpeakers.value?.find(
        speaker => speaker.meta.speakerId === id,
      )?.meta.image

      return typeof image === 'string' ? [image] : []
    })
  }

  /** 碰到卡片時用 high，讓使用者點開前就抓好；多人議程一次抓全部講者 */
  function preloadSpeakerDialog(speakerIds: string[], priority: Priority = 'high') {
    return Promise.all(
      photoSources(speakerIds)
        .flatMap(photoUrls)
        .map(url => preload(url, priority)),
    )
  }

  /** 空閒時依傳入順序（呼叫端排成畫面上由上而下）預熱彈窗照片 */
  function warmSpeakerDialogs(speakerIds: string[]) {
    return warm(photoSources(speakerIds).flatMap(photoUrls))
  }

  return { preloadSpeakerDialog, warmSpeakerDialogs }
}
