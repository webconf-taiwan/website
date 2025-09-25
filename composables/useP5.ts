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
      // 移除所有事件監聽器
      if (p5Instance.mouseMoved) {
        p5Instance.mouseMoved = () => {}
      }
      if (p5Instance.mouseDragged) {
        p5Instance.mouseDragged = () => {}
      }
      if (p5Instance.mousePressed) {
        p5Instance.mousePressed = () => {}
      }
      if (p5Instance.mouseReleased) {
        p5Instance.mouseReleased = () => {}
      }
      if (p5Instance.draw) {
        p5Instance.draw = () => {}
      }

      p5Instance.remove()
      p5Instance = null
    }
  }

  const createSketch = () => {
    if (p5Instance) {
      destroySketch()
    }

    if (container.value && $p5) {
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
