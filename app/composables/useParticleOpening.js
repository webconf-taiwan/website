// 開場以「loading 已退場且這張場已準備好」起算，避免造型在遮罩下先散掉。
// ready() 不等待 introDone；否則 trackIntro(init()) 會互相等待。
export function useParticleOpening () {
  const { introDone } = useSiteIntro()
  let prepared = false
  let startedAt = null
  const start = () => {
    if (prepared && introDone.value && startedAt === null) startedAt = performance.now()
  }
  watch(introDone, start, { flush: 'sync' })
  return {
    ready () { prepared = true; start() },
    restart () { startedAt = null; start() },
    factor (now = performance.now()) {
      if (startedAt === null) return 0
      const progress = Math.max(0, Math.min(1, (now - startedAt - 1000) / 1500))
      return progress * progress * (3 - 2 * progress)
    },
  }
}
