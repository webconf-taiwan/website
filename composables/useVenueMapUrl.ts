import { useDevicePixelRatio } from '@vueuse/core'

/** 與場域頁平面圖 <NuxtImg> 的尺寸一致；URL 要完全相同才會命中預熱的快取 */
const VENUE_MAP = { width: 1180, height: 550 } as const

/** <NuxtImg> 的 srcset 有 1x、2x 兩張，瀏覽器依像素比只會抓其中一張 */
export function useVenueMapUrl() {
  const img = useImage()
  const { pixelRatio } = useDevicePixelRatio()

  return (src: string) => {
    const density = pixelRatio.value > 1 ? 2 : 1

    return img(src, {
      width: VENUE_MAP.width * density,
      height: VENUE_MAP.height * density,
    })
  }
}
