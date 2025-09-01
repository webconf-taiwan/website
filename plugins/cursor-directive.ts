export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('cursor', {
    mounted(el, binding) {
      if (!import.meta.client)
        return

      const gsap = useGsap()
      const options = { ...binding.value }
      const defaultBackgroundColor = '#E6E6E6'
      const {
        scale = 1,
        duration = 0.3,
        backgroundColor = defaultBackgroundColor,
        text = null,
      } = options

      const handleMouseEnter = () => {
        const cursorElement = document.querySelector('[data-cursor]')
        const cursorInner = document.querySelector('[data-cursor-inner]')
        const textElement = document.querySelector('[data-cursor-text]')

        if (cursorElement && cursorInner && gsap) {
          gsap.to(cursorInner, {
            scale,
            duration,
            backgroundColor,
            ease: 'power2.out',
          })

          if (text && textElement) {
            textElement.textContent = text
            gsap.to(textElement, {
              opacity: 1,
              duration,
              ease: 'power2.out',
            })
          }
        }
      }

      const handleMouseLeave = () => {
        const cursorElement = document.querySelector('[data-cursor]')
        const cursorInner = document.querySelector('[data-cursor-inner]')
        const textElement = document.querySelector('[data-cursor-text]')

        if (cursorElement && cursorInner && gsap) {
          gsap.to(cursorInner, {
            scale: 1,
            duration,
            backgroundColor: defaultBackgroundColor,
            ease: 'power2.out',
          })

          if (text && textElement) {
            gsap.to(textElement, {
              opacity: 0,
              duration,
              ease: 'power2.out',
            })
          }
        }
      }

      el.addEventListener('mouseenter', handleMouseEnter, { passive: true })
      el.addEventListener('mouseleave', handleMouseLeave, { passive: true })

      el._cursorCleanup = () => {
        el.removeEventListener('mouseenter', handleMouseEnter, { passive: true })
        el.removeEventListener('mouseleave', handleMouseLeave, { passive: true })
      }
    },

    beforeUnmount(el) {
      el._cursorCleanup?.()
      delete el._cursorCleanup
    },
  })
})
