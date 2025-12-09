import type p5 from 'p5'

interface P5SketchOptions {
  container: Ref<HTMLElement | null>
  sketch: (_p: p5) => void
}

export function useP5Sketch({ container, sketch }: P5SketchOptions) {
  const { $p5 } = useNuxtApp()
  const p5Instance = ref<p5 | null>(null)

  const destroySketch = () => {
    if (p5Instance.value) {
      p5Instance.value.noLoop()

      if (p5Instance.value.mouseMoved) {
        p5Instance.value.mouseMoved = () => {}
      }
      if (p5Instance.value.mouseDragged) {
        p5Instance.value.mouseDragged = () => {}
      }
      if (p5Instance.value.mousePressed) {
        p5Instance.value.mousePressed = () => {}
      }
      if (p5Instance.value.mouseReleased) {
        p5Instance.value.mouseReleased = () => {}
      }
      if (p5Instance.value.draw) {
        p5Instance.value.draw = () => {}
      }

      p5Instance.value.remove()
      p5Instance.value = null
    }
  }

  const createSketch = () => {
    if (!process.client)
      return

    if (!$p5)
      return

    if (p5Instance.value) {
      destroySketch()
    }

    if (container.value) {
      p5Instance.value = new $p5(sketch, container.value)
    }
  }

  onUnmounted(() => {
    destroySketch()
  })

  return {
    createSketch,
    destroySketch,
    p5Instance: readonly(p5Instance),
  }
}
