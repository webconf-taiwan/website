import lottie from 'lottie-web'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('lottie', {
    mounted(el, binding) {
      const animation = lottie.loadAnimation({
        container: el,
        renderer: 'svg',
        loop: binding.value.loop !== false,
        autoplay: binding.value.autoplay !== false,
        animationData: binding.value.animationData,
        rendererSettings: binding.value.rendererSettings || {},
      })

      el._lottie = animation

      if (binding.value.speed) {
        animation.setSpeed(binding.value.speed)
      }
    },
    unmounted(el) {
      if (el._lottie) {
        el._lottie.destroy()
      }
    },
  })
})
