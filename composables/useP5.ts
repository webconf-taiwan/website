import type p5 from 'p5'

interface P5SketchOptions {
  container: Ref<HTMLElement | null>
  sketch: (_p: p5) => void
}

export function useP5Sketch({ container, sketch }: P5SketchOptions) {
  const { $p5 } = useNuxtApp()
  let p5Instance: p5 | null = null

  const destroySketch = () => {
    if (p5Instance) {
      p5Instance.remove()
      p5Instance = null
    }
  }

  const createSketch = () => {
    if (!process.client)
      return

    if (!$p5)
      return

    if (p5Instance) {
      destroySketch()
    }

    if (container.value) {
      p5Instance = new $p5(sketch, container.value)
    }
  }

  onUnmounted(() => {
    destroySketch()
  })

  return {
    createSketch,
    destroySketch,
    p5Instance: readonly(ref(p5Instance)),
  }
}
