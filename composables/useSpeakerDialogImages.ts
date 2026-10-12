import type { Priority } from '~/composables/useImagePreload'
import { useDevicePixelRatio } from '@vueuse/core'

/** 與 SpeakerDialogImageDesktop／Mobile 的 <NuxtImg> 尺寸一致 */
const DIALOG_PHOTO = { width: 350, height: 498 } as const

/**
 * 講者彈窗的照片預載。
 *
 * 彈窗的 <NuxtImg placeholder> 會依序要三張：模糊小圖、1x 原圖（onMounted 用 new Image() 抓，
 * 抓完才換掉模糊圖），換完才掛上 srcset，高密度螢幕會再要一張 2x。
 * 這裡產生的 URL 必須與元件內部完全一致，否則等於多下載一份。
 */
export function useSpeakerDialogImages() {
  const img = useImage()
  const { preload, warm } = useImagePreload()
  const { pixelRatio } = useDevicePixelRatio()
  const { data: allSpeakers } = useAllSpeakers()

  /** 一位講者在目前裝置上會用到的 URL，依載入順序排列 */
  function photoUrls(src: string) {
    const urls = [
      img(src, { width: 10, height: 10, quality: 50, blur: 3 }),
      img(src, DIALOG_PHOTO),
    ]

    if (pixelRatio.value > 1) {
      urls.push(img(src, {
        width: DIALOG_PHOTO.width * 2,
        height: DIALOG_PHOTO.height * 2,
      }))
    }

    return urls
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
