import { useEventListener, useNetwork } from '@vueuse/core'

/**
 * 圖片預載的共用底層：送出請求、等解碼完成，以及空閒時的背景預熱。
 *
 * URL 一律由呼叫端用 useImage() 產生，跟 <NuxtImg> 走同一條 IPX 路徑，
 * 才會命中同一個快取項目，不會下載兩份。
 */

export type Priority = 'high' | 'low'

interface PreloadRequest {
  image: HTMLImageElement
  priority: Priority
  promise: Promise<boolean>
}

/**
 * 跨元件共用同一個請求與解碼結果。
 * 保留 Image 實例，避免瀏覽器在真正掛上 <img> 前就回收剛解碼好的 bitmap。
 */
const requests = new Map<string, PreloadRequest>()

/** 進行中的 high 請求；使用者碰到的圖還在下載時，背景預熱先讓出頻寬 */
let highInFlight = 0

/** 一次空閒送幾張；GSAP、p5 與 Lenis 的 rAF 讓真正的空閒很少，一次一張會拖太久 */
const WARM_BATCH = 4

/** requestIdleCallback 沒有 VueUse 對應，Safari 16.4 以前也沒有，退回 setTimeout */
function scheduleIdle(task: IdleRequestCallback) {
  return typeof requestIdleCallback === 'function'
    ? requestIdleCallback(task, { timeout: 1000 })
    : (setTimeout(task, 200) as unknown as number)
}

function cancelIdle(handle: number | undefined) {
  if (handle === undefined)
    return

  if (typeof cancelIdleCallback === 'function')
    cancelIdleCallback(handle)
  else clearTimeout(handle)
}

/** 追蹤 high 請求何時結束；從 low 升級上來的也算 */
function trackHigh(promise: Promise<boolean>) {
  highInFlight++
  void promise.finally(() => {
    highInFlight--
  })
}

export function useImagePreload() {
  // 跟著元件 scope 自動解除監聽；不支援 Network Information API 的瀏覽器兩個值都是 undefined
  const { saveData, effectiveType } = useNetwork()

  /** 使用者開了節省流量或網路太慢，就不要自作主張預熱 */
  function shouldSkipWarm() {
    return Boolean(
      saveData.value || /(?:^|-)2g$/.test(effectiveType.value ?? ''),
    )
  }

  /** 送出單張預載並等解碼完成；同一個 URL 只會請求一次 */
  function preload(url: string, priority: Priority): Promise<boolean> {
    if (!import.meta.client)
      return Promise.resolve(false)

    const existing = requests.get(url)

    if (existing) {
      // hover / focus 可能發生在背景 low 請求之後；不能因為 URL 已看過就吃掉 high
      if (priority === 'high' && existing.priority === 'low') {
        existing.priority = 'high'
        existing.image.setAttribute('fetchpriority', 'high')
        trackHigh(existing.promise)
      }

      return existing.promise
    }

    const image = new Image()
    // fetchpriority 要在 src 之前設定才會影響這次請求
    image.setAttribute('fetchpriority', priority)

    const promise = new Promise<boolean>((resolve) => {
      image.onload = async () => {
        try {
          await image.decode()
        }
        catch {
          // 少數瀏覽器會在已完成載入後拒絕 decode；此時仍可交給畫面顯示
        }

        resolve(true)
      }
      image.onerror = () => {
        requests.delete(url)
        resolve(false)
      }
    })

    requests.set(url, { image, priority, promise })
    image.src = url

    if (priority === 'high')
      trackHigh(promise)

    return promise
  }

  /**
   * 空閒時依序以 low 預熱一串圖，回傳停止函式（元件卸載時呼叫）。
   *
   * 頁面 load 之後才開始，不跟首屏搶頻寬；每次空閒最多送 WARM_BATCH 張。
   * 使用者碰到的圖走 preload(url, 'high')：已送出的會升級，還沒輪到的直接插隊；
   * 只要還有 high 在下載，這裡就先讓出去，等下一次空閒再接著送。
   */
  function warm(urls: string[]): () => void {
    if (!import.meta.client || !urls.length || shouldSkipWarm())
      return () => {}

    let index = 0
    let handle: number | undefined
    let stopped = false

    function step(deadline?: IdleDeadline) {
      if (stopped)
        return

      if (highInFlight === 0) {
        for (let sent = 0; sent < WARM_BATCH && index < urls.length; sent++) {
          // 每格空閒至少送一張：持續跑動畫的頁面每格空閒常不到 1ms，
          // 先檢查再送會永遠送不出去，timeout 也因為每格都有拿到空閒而不會觸發。
          // 之後這一格用完就先讓出去，didTimeout 代表等不到空閒、不再退讓
          if (sent > 0 && deadline && !deadline.didTimeout && deadline.timeRemaining() <= 1)
            break

          void preload(urls[index++]!, 'low')
        }
      }

      if (index < urls.length)
        handle = scheduleIdle(step)
    }

    function start() {
      if (!stopped)
        handle = scheduleIdle(step)
    }

    // 呼叫時不一定在 effect scope 裡，改用 useEventListener 回傳的移除函式，由停止函式自己收掉
    let stopLoad: (() => void) | undefined

    if (document.readyState === 'complete')
      start()
    else
      stopLoad = useEventListener(window, 'load', start, { once: true })

    return () => {
      stopped = true
      stopLoad?.()
      cancelIdle(handle)
    }
  }

  /**
   * 預熱 root 底下 loading="lazy" 的圖，讓首屏外的圖滑到前就抓好。
   * 網址直接取自 <img> 的 srcset，跟瀏覽器之後要抓的是同一張；
   * display: none 的圖（例如手機版隱藏的照片）跳過，免得抓了用不到。
   */
  function warmLazyImages(root: HTMLElement | null | undefined): () => void {
    if (!import.meta.client || !root)
      return () => {}

    const urls = [...root.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')]
      .filter(image => getComputedStyle(image).display !== 'none')
      .map(pickImageUrl)
      .filter((url): url is string => Boolean(url))

    return warm(urls)
  }

  return { preload, warm, warmLazyImages }
}

/** 依像素比從 srcset 的 1x、2x 挑出瀏覽器會用的那張；沒有 srcset 就用 src */
function pickImageUrl(image: HTMLImageElement) {
  const candidates = image.srcset
    .split(/,\s+/)
    .map((candidate) => {
      const [url, descriptor = '1x'] = candidate.trim().split(/\s+/)
      return { url, density: Number.parseFloat(descriptor) }
    })
    .filter(candidate => candidate.url && !Number.isNaN(candidate.density))
    .sort((a, b) => a.density - b.density)

  if (!candidates.length)
    return image.getAttribute('src')

  const ratio = window.devicePixelRatio || 1

  return (candidates.find(candidate => candidate.density >= ratio) ?? candidates.at(-1)!).url
}
