// 粒子「變形到圖片點雲」的共用工具。
//
// 這裡放的是 people.vue 那套 scrub 漸變裡「與頁面無關」的部分，抽出來讓首頁
// 背景場也能用，之後換成 shader seek 力（docs §8 路線 1）時也還能沿用。
//
// 換圖要順的四條規格（見 docs/point-cloud-effect.md §8）：
//   1. 每張圖取樣「同一個點數」—— 點數不同會有一撮粒子配不到對，行為會怪。
//   2. 每張圖「同樣的色盤長度」（7）—— species 在 morph 中不能改，setSpecies
//      會重建 bind group 並整場重生。
//   3. 換色用 setColors()，不要用 setPalette() —— 後者內含 rebuildBindGroups()，
//      逐幀呼叫會掉幀。setColors 只重寫 128 bytes 顏色 buffer。
//   4. 色盤插值在「線性光」空間做 —— naive sRGB 插值中點會發灰。
//
// 粒子順序不必對位：GPU 每幀 spatial sort 會打亂 index，但同色粒子可互換，
// 所以配對只在「同物種內」以掃描線順序就近配對，粒子走短路徑 → 看起來是
// 「流動變形」而不是「爆開重組」。

// --- 色盤：線性光空間插值 ---------------------------------------------------
export function srgbToLinear (v) {
  v /= 255
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

export function linearToByte (v) {
  v = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
  return Math.max(0, Math.min(255, Math.round(v * 255)))
}

export function paletteToLinear (pal) {
  return pal.map((h) => {
    const n = parseInt(h.slice(1), 16)
    return [srgbToLinear((n >> 16) & 255), srgbToLinear((n >> 8) & 255), srgbToLinear(n & 255)]
  })
}

export function lerpPaletteLinear (linA, linB, e) {
  const out = []
  const n = Math.min(linA.length, linB.length)
  for (let i = 0; i < n; i++) {
    const a = linA[i]; const b = linB[i]
    out.push('#'
      + linearToByte(a[0] + (b[0] - a[0]) * e).toString(16).padStart(2, '0')
      + linearToByte(a[1] + (b[1] - a[1]) * e).toString(16).padStart(2, '0')
      + linearToByte(a[2] + (b[2] - a[2]) * e).toString(16).padStart(2, '0'))
  }
  return out
}

// --- 圖片點雲 → 模擬座標 ----------------------------------------------------
// spec 的點位是正規化 0..1；這裡照 particle-image.js registerPattern 的
// contain-fit 置中規則換算成模擬空間座標，給 N 顆粒子各一個目標點。
// spec.count 小於 N 時循環重用（引擎 count 可以大於取樣點數）。
export function buildImageTargets (spec, N, W, H) {
  const boxW = W * spec.fit; const boxH = H * spec.fit
  const s = Math.min(boxW / spec.aspect, boxH)
  const drawW = s * spec.aspect; const drawH = s
  const x0 = (W - drawW) / 2; const y0 = (H - drawH) / 2
  const tx = new Float32Array(N)
  const ty = new Float32Array(N)
  const tt = new Uint8Array(N)
  const T = spec.palette.length
  for (let i = 0; i < N; i++) {
    const j = i % spec.count
    tx[i] = x0 + spec.px[j] * drawW
    ty[i] = y0 + spec.py[j] * drawH
    tt[i] = spec.types[j] % T
  }
  return { tx, ty, tt }
}

// --- 配對：目前粒子快照 ↔ 圖片目標點 ----------------------------------------
// snap 是 engine.readParticles() 的回傳（[{x,y,vx,vy,s}]）。
// 同物種內各自依掃描線順序排序後就近配對，回傳「排好序的起點/終點」陣列，
// 之後每幀只要做 O(N) 的 lerp，不必再排序。
export function pairSnapshotToTargets (snap, targets, T, W) {
  const N = snap.length
  const { tx, ty, tt } = targets
  const snapBy = Array.from({ length: T }, () => [])
  const tgtBy = Array.from({ length: T }, () => [])
  for (let i = 0; i < N; i++) snapBy[snap[i].s % T].push(i)
  for (let i = 0; i < N; i++) tgtBy[tt[i]].push(i)

  const orderKey = (x, y) => y * W + x
  const fromX = new Float32Array(N); const fromY = new Float32Array(N)
  const toX = new Float32Array(N); const toY = new Float32Array(N)
  const type = new Uint8Array(N)

  let cursor = 0
  const leftFrom = []; const leftTo = []
  for (let t = 0; t < T; t++) {
    const a = snapBy[t].sort((i, j) => orderKey(snap[i].x, snap[i].y) - orderKey(snap[j].x, snap[j].y))
    const b = tgtBy[t].sort((i, j) => orderKey(tx[i], ty[i]) - orderKey(tx[j], ty[j]))
    const n = Math.min(a.length, b.length)
    for (let k = 0; k < n; k++, cursor++) {
      fromX[cursor] = snap[a[k]].x; fromY[cursor] = snap[a[k]].y
      toX[cursor] = tx[b[k]]; toY[cursor] = ty[b[k]]; type[cursor] = t
    }
    for (let k = n; k < a.length; k++) leftFrom.push(a[k])
    for (let k = n; k < b.length; k++) leftTo.push(b[k])
  }
  // 物種比例對不上的殘餘：目標點優先填滿（沒填到的粒子留在原地）
  for (let k = 0; k < leftTo.length && cursor < N; k++, cursor++) {
    const si = leftFrom[k % Math.max(1, leftFrom.length)]
    const ti = leftTo[k]
    fromX[cursor] = si != null ? snap[si].x : tx[ti]
    fromY[cursor] = si != null ? snap[si].y : ty[ti]
    toX[cursor] = tx[ti]; toY[cursor] = ty[ti]; type[cursor] = tt[ti]
  }
  for (; cursor < N; cursor++) {
    const si = leftFrom[cursor % Math.max(1, leftFrom.length)]
    const sx = si != null ? snap[si].x : 0
    const sy = si != null ? snap[si].y : 0
    fromX[cursor] = sx; fromY[cursor] = sy
    toX[cursor] = sx; toY[cursor] = sy
    type[cursor] = si != null ? snap[si].s % T : 0
  }

  return { fromX, fromY, toX, toY, type, N }
}

// --- 路線 C：把配對結果攤成「以 slot 為索引」的 target 陣列 ------------------
// GPU 的 particleSort 每幀重排粒子，array index 不是穩定身分，但整個 Particle
// struct 會被搬移 —— 所以引擎在 struct 裡放了一個生成時指定、永不改變的 slot，
// shader 用 targets[slot] 查目標點。
//
// 這裡做的配對只影響「誰去哪個點」，一次算好即可：之後位置完全由 GPU 上的
// 物理決定，target 不會過期（這正是 C 沒有路線 B 那些跳動問題的原因）。
//
// 同物種內配對很重要 —— 粒子的 species 在生成後不能改，所以要讓每顆粒子去
// 「自己顏色」的目標點，最終形狀的配色才會跟原圖一致。
export function buildSlotTargets (snap, targets, T, W) {
  const N = snap.length
  const { tx, ty, tt } = targets
  const snapBy = Array.from({ length: T }, () => [])
  const tgtBy = Array.from({ length: T }, () => [])
  for (let i = 0; i < N; i++) snapBy[snap[i].s % T].push(i)
  for (let i = 0; i < N; i++) tgtBy[tt[i]].push(i)

  const orderKey = (x, y) => y * W + x
  const out = new Float32Array(N * 2)

  for (let t = 0; t < T; t++) {
    const a = snapBy[t].sort((i, j) => orderKey(snap[i].x, snap[i].y) - orderKey(snap[j].x, snap[j].y))
    const b = tgtBy[t].sort((i, j) => orderKey(tx[i], ty[i]) - orderKey(tx[j], ty[j]))
    if (!b.length) {
      // 這個物種在圖片裡沒有對應色 —— 讓它們留在原地，不要被拉去別色的位置
      for (let k = 0; k < a.length; k++) {
        const slot = snap[a[k]].slot
        out[slot * 2] = snap[a[k]].x
        out[slot * 2 + 1] = snap[a[k]].y
      }
      continue
    }
    for (let k = 0; k < a.length; k++) {
      const slot = snap[a[k]].slot
      // 兩邊數量不等時循環取用：同色點可互換，視覺上看不出來
      const m = b[Math.floor(k * b.length / a.length)]
      out[slot * 2] = tx[m]
      out[slot * 2 + 1] = ty[m]
    }
  }
  return out
}

export function useParticleMorph () {
  return {
    paletteToLinear,
    lerpPaletteLinear,
    buildImageTargets,
    pairSnapshotToTargets,
    buildSlotTargets,
  }
}
