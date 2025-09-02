export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('arrow', {
    mounted(el: HTMLElement, binding: any) {
      if (!import.meta.client)
        return

      const options = {
        count: 1,
        direction: 1, // 1 為右，-1 為左
        speed1: '10s',
        speed2: '2s',
        delay: 'calc(var(--arrow-speed-1) / 2)',
        color: 'white',
        ...binding.value,
      }

      el.classList.add('arrow-directive')
      el.style.setProperty('--arrow-count', options.count.toString())
      el.style.setProperty('--arrow-direction', options.direction.toString())
      el.style.setProperty('--arrow-speed-1', options.speed1)
      el.style.setProperty('--arrow-speed-2', options.speed2)
      el.style.setProperty('--arrow-delay', options.delay)
      el.style.setProperty('--arrow-color', options.color)
    },

    updated(el: HTMLElement, binding: any) {
      if (!import.meta.client)
        return

      const options = {
        count: 1,
        direction: 1,
        speed1: '10s',
        speed2: '2s',
        delay: 'calc(var(--arrow-speed-1) / 2)',
        color: 'white',
        ...binding.value,
      }

      el.style.setProperty('--arrow-count', options.count.toString())
      el.style.setProperty('--arrow-direction', options.direction.toString())
      el.style.setProperty('--arrow-speed-1', options.speed1)
      el.style.setProperty('--arrow-speed-2', options.speed2)
      el.style.setProperty('--arrow-delay', options.delay)
      el.style.setProperty('--arrow-color', options.color)
    },

    unmounted(el: HTMLElement) {
      if (!import.meta.client)
        return

      el.classList.remove('arrow-directive')
      const cssVars = [
        '--arrow-count',
        '--arrow-direction',
        '--arrow-speed-1',
        '--arrow-speed-2',
        '--arrow-delay',
        '--arrow-color',
      ]
      cssVars.forEach(variable => el.style.removeProperty(variable))
    },
  })
})
