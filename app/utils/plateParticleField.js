// 內頁沿用首頁的 look、引擎與目標點工具；區域配置不回寫首頁設定。
import { buildColonyTargets } from './particleColonyTargets.js'

export const PLATE_RAIL_PALETTE = ['#7CC8F2', '#3E8FE0', '#E8E8E8', '#97DFF5', '#3E8FE0', '#E8E8E8', '#97DFF5']
const COLONIES = [
  [18, 138, 47], [198, 83, 51], [344, 39, 53], [249, 195, 52],
  [188, 346, 59], [360, 299, 55], [69, 462, 54], [373, 468, 57],
]

export function plateFieldSettings(variant, look, gallery) {
  if (variant === 'hero') return {
    species: look.rules.species, preset: look.rules.preset, seedPattern: look.rules.seedPattern,
    physics: look.physics, palette: look.palette, speed: look.speed.idle,
    zoom: look.camera.zoom, pointSize: look.visual.pointSize, opacity: look.visual.heroOpacity,
    budget: look.budget, pull: look.hold.pull, grip: look.hold.grip,
  }
  if (variant === 'gallery') return {
    species: gallery.sim.species, preset: gallery.behavior.preset,
    seedPattern: gallery.behavior.seedPattern, physics: gallery.physics,
    palette: gallery.look.palette, speed: gallery.sim.simSpeed, zoom: 1,
    pointSize: gallery.visual.pointSize, opacity: gallery.visual.particleOpacity,
    budget: { density: 0.022, min: 2400, max: 16000 }, pull: 24, grip: 90,
  }
  return {
    species: 7, preset: 'cellular', seedPattern: 'softClusters',
    physics: { ...look.physics, minR: 24 }, palette: PLATE_RAIL_PALETTE,
    speed: 0.3, zoom: 1, pointSize: 0.68, opacity: 0.9,
    budget: { density: 0.036, min: 1800, max: 8500 }, pull: 18, grip: 82,
  }
}

export function plateFieldTargets(variant, settings, N, W, H, buildSeedTargets) {
  if (variant === 'rail') {
    let seed = 20260915
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      return seed / 4294967296
    }
    const scale = Math.min(1, W / 484, H / 660)
    const usableHeight = Math.max(1, H - 170)
    return buildColonyTargets(N, settings.species, W, H, {
      centers: COLONIES.map(([x, y, radius]) => {
        const R = radius * scale * 0.8
        return { x: Math.max(R + 4, Math.min(W - R - 4, x * W / 484)), y: 110 + y / 533 * usableHeight, R }
      }),
      blobs: [14, 22], blobRadius: [0.10, 0.24], random,
    })
  }
  if (variant === 'gallery') {
    const boardWidth = Math.min(W, 1440)
    const radius = Math.min(boardWidth * 0.31, (H - 60) * 0.52)
    const size = radius * 2
    const target = buildSeedTargets(settings.seedPattern, N, settings.species, size, size)
    const cx = (W - boardWidth) / 2 + boardWidth * 0.76
    const cy = 60 + radius
    for (let i = 0; i < N; i++) {
      target.tx[i] += cx - size / 2
      target.ty[i] += cy - size / 2
    }
    return target
  }
  // 和首頁一樣用畫布真實寬高，不再把方形 seed 壓進 550px hero。
  return buildSeedTargets(settings.seedPattern, N, settings.species, W, H)
}
