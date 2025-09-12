interface ArrowOptions {
  count?: number
  direction?: 1 | -1
  speed1?: string
  speed2?: string
  delay?: string
  color?: string
}

interface ArrowElement extends HTMLElement {
  _arrowOptions?: Required<ArrowOptions>
}

const DEFAULT_OPTIONS: Required<ArrowOptions> = {
  count: 1,
  direction: 1, // 1 為右，-1 為左
  speed1: '10s',
  speed2: '2s',
  delay: 'calc(var(--arrow-speed-1) / 2)',
  color: 'white',
} as const

const CSS_VARIABLES = [
  '--arrow-count',
  '--arrow-direction',
  '--arrow-speed-1',
  '--arrow-speed-2',
  '--arrow-delay',
  '--arrow-color',
] as const

const ARROW_CLASS = 'arrow-directive'

function mergeOptions(userOptions?: ArrowOptions): Required<ArrowOptions> {
  return { ...DEFAULT_OPTIONS, ...userOptions }
}

function hasOptionsChanged(newOptions: Required<ArrowOptions>, oldOptions?: Required<ArrowOptions>): boolean {
  if (!oldOptions)
    return true

  return (
    newOptions.count !== oldOptions.count
    || newOptions.direction !== oldOptions.direction
    || newOptions.speed1 !== oldOptions.speed1
    || newOptions.speed2 !== oldOptions.speed2
    || newOptions.delay !== oldOptions.delay
    || newOptions.color !== oldOptions.color
  )
}

function applyArrowStyles(el: ArrowElement, options: Required<ArrowOptions>): void {
  const styleUpdates = [
    ['--arrow-count', options.count.toString()],
    ['--arrow-direction', options.direction.toString()],
    ['--arrow-speed-1', options.speed1],
    ['--arrow-speed-2', options.speed2],
    ['--arrow-delay', options.delay],
    ['--arrow-color', options.color],
  ] as const

  // 使用 requestAnimationFrame 批次更新，避免多次重排
  requestAnimationFrame(() => {
    try {
      styleUpdates.forEach(([property, value]) => {
        el.style.setProperty(property, value)
      })
      // 快取當前選項
      el._arrowOptions = options
    }
    catch (error) {
      console.error('Failed to apply arrow styles:', error)
    }
  })
}

function removeArrowStyles(el: ArrowElement): void {
  requestAnimationFrame(() => {
    try {
      CSS_VARIABLES.forEach((variable) => {
        el.style.removeProperty(variable)
      })
    }
    catch (error) {
      console.error('Failed to remove arrow styles:', error)
    }
  })
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('arrow', {
    mounted(el: ArrowElement, binding: any) {
      if (!import.meta.client)
        return

      try {
        const options = mergeOptions(binding.value)

        el.classList.add(ARROW_CLASS)
        applyArrowStyles(el, options)
      }
      catch (error) {
        console.error('Failed to mount arrow directive:', error)
      }
    },

    updated(el: ArrowElement, binding: any) {
      if (!import.meta.client)
        return

      try {
        const newOptions = mergeOptions(binding.value)

        // 只有當選項真正改變時才更新
        if (!hasOptionsChanged(newOptions, el._arrowOptions)) {
          return
        }

        applyArrowStyles(el, newOptions)
      }
      catch (error) {
        console.error('Failed to update arrow directive:', error)
      }
    },

    unmounted(el: ArrowElement) {
      if (!import.meta.client)
        return

      try {
        el.classList.remove(ARROW_CLASS)
        removeArrowStyles(el)
        delete el._arrowOptions
      }
      catch (error) {
        console.error('Failed to unmount arrow directive:', error)
      }
    },
  })
})
