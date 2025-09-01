import type { AnimationItem } from 'lottie-web'
import lottie from 'lottie-web'

export default defineNuxtPlugin({
  name: 'lottie',
  setup() {
    const lottieInstance = {
      loadAnimation(config: any) {
        return lottie.loadAnimation(config)
      },

      destroy(animation: AnimationItem) {
        animation.destroy()
      },

      play(animation: AnimationItem) {
        animation.play()
      },

      pause(animation: AnimationItem) {
        animation.pause()
      },

      stop(animation: AnimationItem) {
        animation.stop()
      },
    }

    return {
      provide: {
        lottie: lottieInstance,
      },
    }
  },
})
