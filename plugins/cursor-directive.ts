interface CursorOptions {
  scale?: number
  duration?: number
  backgroundColor?: string
  text?: string | null
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
} as const

export default defineNuxtPlugin((nuxtApp) => {
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
  function animateCursor(
    scale: number,
    backgroundColor: string,
    duration: number,
    textOpacity: number = 0,
    text?: string | null,
  ) {
    const elements = getCachedElements()
    const gsap = getGsapInstance()

    if (!elements.inner || !gsap)
      return

    // 游標內部動畫
    gsap.to(elements.inner, {
      scale,
      duration,
      backgroundColor,
      ease: 'power2.out',
    })

    // 文字動畫
    if (text && elements.text) {
      if (textOpacity > 0) {
        elements.text.textContent = text
      }

      gsap.to(elements.text, {
        opacity: textOpacity,
        duration,
        ease: 'power2.out',
      })
    }
  }

  function setupCursorEvents(el: CursorElement, binding: CursorBinding) {
    const options = { ...DEFAULT_OPTIONS, ...binding.value }
    const { scale, duration, backgroundColor, text } = options

    const handleMouseEnter = () => {
      animateCursor(scale, backgroundColor, duration, text ? 1 : 0, text)
    }

    const handleMouseLeave = () => {
      animateCursor(
        DEFAULT_OPTIONS.scale,
        DEFAULT_OPTIONS.backgroundColor,
        duration,
        0,
        text,
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
