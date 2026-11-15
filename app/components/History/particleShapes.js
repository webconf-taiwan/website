// 歷屆回顧頁後兩區的粒子構圖，交給 CommonPlatePage → AgendaParticleField：
//   railShape  —— 回顧影片那區：側欄菌落換成橫越畫面的兩條橫帶（Figma ribbon.webp ＋ video-mask.svg 的輪廓）
//   outroShape —— 照片牆那區：尾段不散回自由場，收成贊助頁照片牆那朵花（mobile-orbit.png）
// 這裡只負責「目標點在哪」；粒子配對、持續流動（自由場力場＋菌落的握力與閃動）都在共用粒子場。
import { assetUrl } from '~/utils/url'

const RIBBON_HEIGHT = 342
const IMAGE = { count: 65536, colors: 7, sampleEdge: 960, minLuma: 0.06, lumaBias: 0.6, fit: 1 }

let ribbonTask = null
let flowerTask = null

function prepareRibbon () {
  if (!ribbonTask) ribbonTask = (async () => {
    const [image, maskResponse] = await Promise.all([
      window.PLImage.prepare(assetUrl('/figma/history/ribbon.webp'), {
        ...IMAGE, name: 'history:ribbon', crop: { x: 18.15179 / 1494.72, y: 97.82 / 793.8, width: 1440 / 1494.72, height: RIBBON_HEIGHT / 793.8 },
      }),
      fetch(assetUrl('/figma/history/video-mask.svg')),
    ])
    if (!maskResponse.ok) throw new Error('History ribbon outline could not be loaded')
    // 只留在橫帶輪廓裡的取樣點，圖上的暈染不算。
    const svg = new DOMParser().parseFromString(await maskResponse.text(), 'image/svg+xml')
    const path = new Path2D(svg.querySelector('path').getAttribute('d'))
    const ctx = document.createElement('canvas').getContext('2d')
    const points = []
    for (let i = 0; i < image.count; i++) {
      if (ctx.isPointInPath(path, image.px[i] * 1440 + 55, image.py[i] * RIBBON_HEIGHT + 0.486)) points.push(i)
    }
    if (!points.length) throw new Error('History ribbon has no points')
    return { image, points }
  })().catch((error) => { ribbonTask = null; throw error })
  return ribbonTask
}

function prepareFlower () {
  if (!flowerTask) flowerTask = window.PLImage.prepare(assetUrl('/figma/sponsors/mobile-orbit.png'), { ...IMAGE, name: 'history:gallery' })
    .catch((error) => { flowerTask = null; throw error })
  return flowerTask
}

// 橫帶固定在視窗正中（同側欄菌落定在視窗裡），寬度鋪滿整張畫布。
export const historyRibbonShape = {
  prepare: prepareRibbon,
  targets ({ image, points }, { N, species, W, H }) {
    const top = H / 2 - RIBBON_HEIGHT / 2
    const tx = new Float32Array(N)
    const ty = new Float32Array(N)
    const tt = new Uint8Array(N)
    for (let i = 0; i < N; i++) {
      const j = points[i % points.length]
      tx[i] = Math.max(1, Math.min(W - 1, image.px[j] * W))
      ty[i] = Math.max(1, Math.min(H - 1, top + image.py[j] * RIBBON_HEIGHT))
      tt[i] = image.types[j] % species
    }
    return { tx, ty, tt }
  },
}

// 花形對齊照片牆的 .photo-board（同舊版歷屆頁、贊助頁的位置比例）。
// 座標是「照片區的 y = center 對到模擬畫面的正中」，捲動位移交給粒子場的相機。
export const historyFlowerShape = {
  prepare: prepareFlower,
  board: '.photo-board',
  center: 360,
  targets (image, { N, species, W, H, board }) {
    const width = Math.min(board.width, 1440)
    const x = board.left + (board.width - width) / 2 + width * 348 / 1440
    const w = width * 1418 / 1440
    const h = width * 1001 / 1440
    const top = H / 2 - this.center
    const points = []
    for (let i = 0; i < image.count; i++) {
      const px = x + image.px[i] * w
      const py = top + image.py[i] * h
      // 引擎採環繞邊界；圖外的取樣點會繞回另一側，先排除。
      if (px > 1 && px < W - 1 && py > 1 && py < H - 1 && image.py[i] * h < 719) points.push(i)
    }
    if (!points.length) throw new Error('History flower has no visible points')
    const tx = new Float32Array(N)
    const ty = new Float32Array(N)
    const tt = new Uint8Array(N)
    for (let i = 0; i < N; i++) {
      const j = points[i % points.length]
      tx[i] = x + image.px[j] * w
      ty[i] = top + image.py[j] * h
      tt[i] = image.types[j] % species
    }
    return { tx, ty, tt }
  },
}
