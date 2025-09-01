import p5 from 'p5'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      p5,
    },
  }
})
