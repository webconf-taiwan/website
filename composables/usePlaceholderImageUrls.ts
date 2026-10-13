import { useDevicePixelRatio } from '@vueuse/core'

/**
 * 產生 <NuxtImg placeholder> 會依序要的網址：模糊小圖、1x 原圖（onMounted 用 new Image() 抓，
 * 抓完才換掉模糊圖），換完才掛上 srcset，高密度螢幕會再要一張 2x。
 * 預熱時 URL 必須與元件內部完全一致，否則等於多下載一份。
 */
export function usePlaceholderImageUrls() {
  const img = useImage()
  const { pixelRatio } = useDevicePixelRatio()

  return (src: string, size: { width: number, height: number }) => {
    const urls = [
      img(src, { width: 10, height: 10, quality: 50, blur: 3 }),
      img(src, size),
    ]

    if (pixelRatio.value > 1)
      urls.push(img(src, { width: size.width * 2, height: size.height * 2 }))

    return urls
  }
}
