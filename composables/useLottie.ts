import type { AnimationItem } from 'lottie-web'

export function useLottie() {
  const { $lottie } = useNuxtApp()

  const animation = ref<AnimationItem | null>(null)
  const isLoaded = ref(false)

  const load = async (
    container: HTMLElement,
    options: {
      src?: string
      animationData?: any
      loop?: boolean
      autoplay?: boolean
      speed?: number
    },
  ) => {
    try {
      // 如果有 src，先載入 JSON 檔案
      let animationData = options.animationData
      if (!animationData && options.src) {
        const response = await fetch(options.src)
        animationData = await response.json()
      }

      // 銷毀舊的動畫
      if (animation.value) {
        $lottie.destroy(animation.value)
      }

      // 創建新動畫
      animation.value = $lottie.loadAnimation({
        container,
        animationData,
        loop: options.loop ?? true,
        autoplay: options.autoplay ?? true,
        renderer: 'svg',
      })

      if (options.speed && animation.value) {
        animation.value.setSpeed(options.speed)
      }

      // 設置載入完成狀態
      animation.value.addEventListener('DOMLoaded', () => {
        isLoaded.value = true
      })
    }
    catch (error) {
      console.error('Lottie 載入錯誤:', error)
    }
  }

  const play = () => {
    if (animation.value)
      $lottie.play(animation.value)
  }

  const pause = () => {
    if (animation.value)
      $lottie.pause(animation.value)
  }

  const stop = () => {
    if (animation.value)
      $lottie.stop(animation.value)
  }

  const destroy = () => {
    if (animation.value) {
      $lottie.destroy(animation.value)
      animation.value = null
      isLoaded.value = false
    }
  }

  // 自動清理
  onUnmounted(() => {
    destroy()
  })

  return {
    animation: readonly(animation),
    isLoaded: readonly(isLoaded),
    load,
    play,
    pause,
    stop,
    destroy,
  }
}
