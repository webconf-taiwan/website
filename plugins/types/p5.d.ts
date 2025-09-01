import type p5 from 'p5'

declare module '#app' {
  interface NuxtApp {
    $p5: typeof p5
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $p5: typeof p5
  }
}

export {}
