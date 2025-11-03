import type { GSAP } from 'gsap'
import type { ScrollTrigger } from 'gsap/ScrollTrigger'
import type Lenis from 'lenis'
import type p5 from 'p5'

declare module '#app' {
  interface NuxtApp {
    $gsap: GSAP
    $ScrollTrigger: typeof ScrollTrigger
    $p5: typeof p5
    $lenis: Lenis
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $gsap: GSAP
    $ScrollTrigger: typeof ScrollTrigger
    $p5: typeof p5
    $lenis: Lenis
  }
}

export {}
