import p5 from 'p5'

export default defineNuxtPlugin(() => {
  (p5 as any).disableFriendlyErrors = true

  return {
    provide: {
      p5,
    },
  }
})
