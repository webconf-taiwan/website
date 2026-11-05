// Figma 原圖的取景；只提供歷屆構圖，取樣與粒子配對沿用共用工具。
const RIBBON_TOP = (720 - 342) / 2
let prepared

export function prepareHistoryShapes(url) {
  if (!prepared) prepared = (async () => {
    const options = { count: 65536, colors: 7, sampleEdge: 960, minLuma: 0.06, lumaBias: 0.6, fit: 1 }
    const [hero, ribbon, gallery, maskResponse] = await Promise.all([
      window.PLImage.prepare(url('/figma/agenda/mobile-particle-source.webp'), {
        ...options, name: 'history:hero', crop: { x: 0, y: 228.384 / 1016.712, width: 1, height: 720 / 1016.712 },
      }),
      window.PLImage.prepare(url('/figma/history/ribbon.webp'), {
        ...options, name: 'history:ribbon', crop: { x: 18.15179 / 1494.72, y: 97.82 / 793.8, width: 1440 / 1494.72, height: 342 / 793.8 },
      }),
      window.PLImage.prepare(url('/figma/sponsors/mobile-orbit.png'), { ...options, name: 'history:gallery' }),
      fetch(url('/figma/history/video-mask.svg')),
    ])
    if (!maskResponse.ok) throw new Error('History ribbon outline could not be loaded')
    const svg = new DOMParser().parseFromString(await maskResponse.text(), 'image/svg+xml')
    const path = new Path2D(svg.querySelector('path').getAttribute('d'))
    const ctx = document.createElement('canvas').getContext('2d')
    const ribbonPoints = []
    for (let i = 0; i < ribbon.count; i++) {
      if (ctx.isPointInPath(path, ribbon.px[i] * 1440 + 55, ribbon.py[i] * 342 + 0.486)) ribbonPoints.push(i)
    }
    return { hero, ribbon, gallery, ribbonPoints }
  })().catch(error => { prepared = null; throw error })
  return prepared
}

export function historyShapeTargets(shapes, name, count, width, boardWidth = Math.min(width, 1440)) {
  const spec = shapes[name]
  let x = (width - 1440) / 2
  let y = 0
  let w = 1440
  let h = 720
  let indices = null
  if (name === 'ribbon') {
    x = 0; y = RIBBON_TOP; w = width; h = 342
    indices = shapes.ribbonPoints
  } else if (name === 'gallery') {
    x = (width - boardWidth) / 2 + boardWidth * 348 / 1440
    w = boardWidth * 1418 / 1440
    h = boardWidth * 1001 / 1440
    indices = []
    for (let i = 0; i < spec.count; i++) {
      // 引擎採環繞邊界；先排除圖外取樣，避免右側花形繞回左側標題。
      if (x + spec.px[i] * w < width - 1 && spec.py[i] * h < 719) indices.push(i)
    }
  }
  if (indices && !indices.length) throw new Error(`History ${name} has no visible points`)
  const tx = new Float32Array(count)
  const ty = new Float32Array(count)
  const tt = new Uint8Array(count)
  for (let i = 0; i < count; i++) {
    const j = indices ? indices[i % indices.length] : i % spec.count
    tx[i] = Math.max(1, Math.min(width - 1, x + spec.px[j] * w))
    ty[i] = Math.max(1, Math.min(719, y + spec.py[j] * h))
    tt[i] = spec.types[j]
  }
  return { tx, ty, tt }
}

export { RIBBON_TOP }
