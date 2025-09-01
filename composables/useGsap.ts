export function useGsap() {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$gsap
}
