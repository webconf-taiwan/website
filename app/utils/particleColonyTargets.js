// Targets for the agenda rail preserve the colony
// composition while Particle Life keeps the individual particles moving.
export function buildColonyTargets (N, T, W, H, options) {
  const { region, gap, colonies, radius, blobs: blobCount, blobRadius, random = Math.random } = options
  const tx = new Float32Array(N)
  const ty = new Float32Array(N)
  const tt = new Uint8Array(N)
  const m = Math.min(W, H)
  const col = options.centers || []
  const tau = Math.PI * 2

  if (!options.centers) {
    const minX = W * region.x0; const spanX = W * (region.x1 - region.x0)
    const minY = H * region.y0; const spanY = H * (region.y1 - region.y0)
    for (let c = 0; c < colonies; c++) {
      const R = (radius[0] + random() * (radius[1] - radius[0])) * m
      let x = 0; let y = 0
      for (let att = 0; att < 400; att++) {
        x = minX + R + random() * Math.max(1, spanX - 2 * R)
        y = minY + R + random() * Math.max(1, spanY - 2 * R)
        let ok = true
        for (const o of col) {
          const dx = x - o.x; const dy = y - o.y
          const need = o.R + R + gap * m
          if (dx * dx + dy * dy < need * need) { ok = false; break }
        }
        if (ok) break
      }
      col.push({ x, y, R })
    }
  }

  // Each colony contains separate, single-species lobes, with dark gaps.
  const blobs = []
  for (const c of col) {
    const k = blobCount[0] + ((random() * (blobCount[1] - blobCount[0] + 1)) | 0)
    for (let b = 0; b < k; b++) {
      const a = random() * tau
      const rr = c.R * 0.82 * Math.sqrt(random())
      blobs.push({
        x: c.x + Math.cos(a) * rr,
        y: c.y + Math.sin(a) * rr,
        R: c.R * (blobRadius[0] + random() * (blobRadius[1] - blobRadius[0])),
        t: (random() * T) | 0,
      })
    }
  }

  let area = 0
  for (const b of blobs) area += b.R * b.R
  let i = 0
  for (let bi = 0; bi < blobs.length; bi++) {
    const b = blobs[bi]
    const share = bi === blobs.length - 1 ? N - i : Math.round(N * (b.R * b.R) / area)
    for (let n = 0; n < share && i < N; n++, i++) {
      const a = random() * tau
      const rr = b.R * Math.sqrt(random())
      tx[i] = b.x + Math.cos(a) * rr
      ty[i] = b.y + Math.sin(a) * rr
      tt[i] = b.t
    }
  }
  return { tx, ty, tt }
}
