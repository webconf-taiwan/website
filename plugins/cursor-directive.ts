type IconPosition = 'arrow-left' | 'arrow-right'

interface CursorOptions {
  scale?: number
  duration?: number
  backgroundColor?: string
  text?: string | null
  icon?: IconPosition | null
}

interface CursorBinding {
  value: CursorOptions
}

interface CursorElement extends HTMLElement {
  _cursorCleanup?: () => void
}

const CURSOR_SELECTORS = {
  cursor: '[data-cursor]',
  inner: '[data-cursor-inner]',
  text: '[data-cursor-text]',
} as const

const DEFAULT_OPTIONS = {
  scale: 1,
  duration: 0.3,
  backgroundColor: '#E6E6E6',
  text: null,
  icon: null,
} as const

// SVG 快取
const svgCache = new Map<IconPosition, string>()

// 異步載入 SVG 檔案
async function loadSvg(iconName: IconPosition): Promise<string> {
  if (svgCache.has(iconName)) {
    return svgCache.get(iconName)!
  }

  try {
    const response = await fetch(`/images/icon/${iconName}.svg`)
    if (!response.ok) {
      throw new Error(`Failed to load SVG: ${iconName}`)
    }

    let svgContent = await response.text()

    svgContent = svgContent
      .replace('<svg', '<svg class="size-6 text-white"')

    svgCache.set(iconName, svgContent)
    return svgContent
  }
  catch (error) {
    console.warn(`Failed to load icon ${iconName}:`, error)
    return getFallbackIcon(iconName)
  }
}

function getFallbackIcon(iconName: IconPosition): string {
  const fallbacks = {
    'arrow-left': '<span class="inline-block text-white">←</span>',
    'arrow-right': '<span class="inline-block text-white">→</span>',
  }
  return fallbacks[iconName]
}

// 掛載 Icon
async function mountIcon(target: Element, iconName: IconPosition) {
  if (!target)
    return

  // 清空現有內容
  target.innerHTML = ''

  try {
    const svgContent = await loadSvg(iconName)
    if (svgContent) {
      target.innerHTML = svgContent
    }
  }
  catch (error) {
    console.warn('Error mounting icon:', error)
    target.innerHTML = getFallbackIcon(iconName)
  }
}

// 卸載 Icon
function unmountIcon(target: Element) {
  if (target) {
    target.innerHTML = ''
  }
}

export default defineNuxtPlugin(async (nuxtApp) => {
  if (import.meta.client) {
    const commonIcons: IconPosition[] = ['arrow-left', 'arrow-right']
    await Promise.allSettled(
      commonIcons.map(icon => loadSvg(icon)),
    )
  }

  // 快取 DOM 元素和 GSAP 實例
  let cachedElements: {
    cursor?: Element | null
    inner?: Element | null
    text?: Element | null
  } = {}

  let gsapInstance: any = null

  // 獲取並快取 DOM 元素
  function getCachedElements() {
    if (!cachedElements.cursor) {
      cachedElements = {
        cursor: document.querySelector(CURSOR_SELECTORS.cursor),
        inner: document.querySelector(CURSOR_SELECTORS.inner),
        text: document.querySelector(CURSOR_SELECTORS.text),
      }
    }
    return cachedElements
  }

  // 獲取 GSAP 實例
  function getGsapInstance() {
    if (!gsapInstance) {
      gsapInstance = useGsap()
    }
    return gsapInstance
  }

  // 動畫控制函數
  async function animateCursor(
    scale: number,
    backgroundColor: string,
    duration: number,
    showContent: boolean = false,
    text?: string | null,
    icon?: IconPosition | null,
  ) {
    const elements = getCachedElements()
    const gsap = getGsapInstance()

    if (!elements.inner || !gsap || !elements.text)
      return

    gsap.killTweensOf([elements.inner, elements.text])

    // 游標內部動畫
    gsap.to(elements.inner, {
      scale,
      duration,
      backgroundColor,
      ease: 'power2.out',
    })

    if (showContent && (text || icon)) {
      if (icon) {
        await mountIcon(elements.text, icon)
      }
      else if (text) {
        unmountIcon(elements.text)
        elements.text.textContent = text
      }

      // 顯示內容動畫
      gsap.to(elements.text, {
        opacity: 1,
        duration,
        ease: 'power2.out',
      })
    }
    else {
      // 隱藏動畫
      gsap.to(elements.text, {
        opacity: 0,
        duration,
        ease: 'power2.out',
        onComplete: () => {
          // 動畫完成後清空內容
          unmountIcon(elements.text!)
          elements.text!.textContent = ''
        },
      })
    }
  }

  function setupCursorEvents(el: CursorElement, binding: CursorBinding) {
    const options = { ...DEFAULT_OPTIONS, ...binding.value }
    const { scale, duration, backgroundColor, text, icon } = options

    const handleMouseEnter = () => {
      animateCursor(scale, backgroundColor, duration, true, text, icon)
    }

    const handleMouseLeave = () => {
      animateCursor(
        DEFAULT_OPTIONS.scale,
        DEFAULT_OPTIONS.backgroundColor,
        duration,
        false,
        text,
        icon,
      )
    }

    // 使用 passive 監聽器提升性能
    const eventOptions = { passive: true }
    el.addEventListener('mouseenter', handleMouseEnter, eventOptions)
    el.addEventListener('mouseleave', handleMouseLeave, eventOptions)

    // 清理函數
    el._cursorCleanup = () => {
      el.removeEventListener('mouseenter', handleMouseEnter)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }

  nuxtApp.vueApp.directive('cursor', {
    getSSRProps() {
      return {}
    },
    mounted(el: CursorElement, binding: CursorBinding) {
      // 只在客戶端執行
      if (!import.meta.client)
        return

      setupCursorEvents(el, binding)
    },

    updated(el: CursorElement, binding: CursorBinding) {
      // 清理舊的事件監聽器
      el._cursorCleanup?.()

      // 重新設置事件
      setupCursorEvents(el, binding)
    },

    beforeUnmount(el: CursorElement) {
      el._cursorCleanup?.()
      delete el._cursorCleanup
    },
  })
})
