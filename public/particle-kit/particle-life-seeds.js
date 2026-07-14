/* particle-life-seeds.js — initial spawn patterns shared by CPU + GPU engines
 *
 * Ported / adapted from DicSo92/SandboxScience helpers/utils/positionsGenerator.ts
 * (AGPL-3.0-or-later). Each generator takes a writer callback so the same code
 * works with both the CPU engine's SoA Float32Arrays and the GPU engine's
 * interleaved Float32Array(N*5).
 *
 * Writer signature:
 *   write(i, x, y, vx, vy, type)
 *
 * Generator signature:
 *   gen(write, N, T, W, H) -> void
 *
 * The "rainbow" variants colour by structural position (sector / radius /
 * arm) instead of by index modulo — visually striking at t=0 before the
 * simulation resolves the pattern. After a few seconds particle-life rules
 * take over and emergent forms appear, but the opening read is what people
 * see and remember.
 */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const rnd = Math.random;

  // ============================================================
  // Helpers
  // ============================================================
  const shuffleInPlace = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (rnd() * (i + 1)) | 0;
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  };

  // ============================================================
  // Patterns
  // ============================================================
  function random(write, N, T, W, H) {
    let t = 0;
    for (let i = 0; i < N; i++) {
      write(i, rnd() * W, rnd() * H, 0, 0, t);
      if (++t === T) t = 0;
    }
  }

  function disk(write, N, T, W, H) {
    const cx = W * 0.5, cy = H * 0.5;
    const R = 0.46 * Math.min(W, H);
    let t = 0;
    for (let i = 0; i < N; i++) {
      const th = rnd() * TAU;
      const r = Math.sqrt(rnd()) * R;
      write(i, cx + r * Math.cos(th), cy + r * Math.sin(th), 0, 0, t);
      if (++t === T) t = 0;
    }
  }

  // Disk where colour is determined by angular sector, sweeping a rotated
  // pie chart so each species occupies a contiguous wedge.
  function rainbowDisk(write, N, T, W, H) {
    if (T === 0) return;
    const cx = W * 0.5, cy = H * 0.5;
    const R = 0.46 * Math.min(W, H);
    const ROT = rnd() * TAU;
    const sector = TAU / T;
    const base = (N / T) | 0;
    let rem = N % T, i = 0;
    for (let t = 0; t < T; t++) {
      let k = base + (rem-- > 0 ? 1 : 0);
      if (k <= 0) continue;
      const dth = sector / k;
      const th0 = ROT + t * sector + rnd() * dth;
      const c = Math.cos(dth), s = Math.sin(dth);
      let ux = Math.cos(th0), uy = Math.sin(th0);
      for (let j = 0; j < k; j++, i++) {
        const r = R * Math.sqrt(rnd());
        write(i, cx + r * ux, cy + r * uy, 0, 0, t);
        const nx = ux * c - uy * s;
        uy = ux * s + uy * c;
        ux = nx;
      }
    }
  }

  function ring(write, N, T, W, H) {
    if (T === 0) return;
    const m = Math.min(W, H);
    const cx = W * 0.5, cy = H * 0.5;
    const R = 0.46 * m;
    const thick = R * 0.2;
    const ROT = rnd() * TAU;
    const dth = TAU / Math.max(1, N);
    const c = Math.cos(dth), s = Math.sin(dth);
    let ux = Math.cos(ROT), uy = Math.sin(ROT);
    let t = 0;
    for (let i = 0; i < N; i++) {
      const rr = R - rnd() * thick;
      write(i, cx + rr * ux, cy + rr * uy, 0, 0, t);
      const nx = ux * c - uy * s;
      uy = ux * s + uy * c;
      ux = nx;
      if (++t === T) t = 0;
    }
  }

  function rainbowRing(write, N, T, W, H) {
    if (T === 0) return;
    const m = Math.min(W, H);
    const cx = W * 0.5, cy = H * 0.5;
    const R = 0.46 * m;
    const thick = R * 0.2;
    const ROT = rnd() * TAU;
    const sector = TAU / T;
    const base = (N / T) | 0;
    let rem = N % T, i = 0;
    for (let t = 0; t < T; t++) {
      let k = base + (rem-- > 0 ? 1 : 0);
      if (k <= 0) continue;
      const dth = sector / k;
      const th0 = ROT + t * sector + rnd() * dth;
      const c = Math.cos(dth), s = Math.sin(dth);
      let ux = Math.cos(th0), uy = Math.sin(th0);
      for (let j = 0; j < k; j++, i++) {
        const rr = R - rnd() * thick;
        write(i, cx + rr * ux, cy + rr * uy, 0, 0, t);
        const nx = ux * c - uy * s;
        uy = ux * s + uy * c;
        ux = nx;
      }
    }
  }

  function rings(write, N, T, W, H) {
    if (T === 0) return;
    const m = Math.min(W, H);
    const cx = W * 0.5, cy = H * 0.5;
    const ringsCount = (2 + rnd() * 7) | 0;
    const maxR = 0.46 * m;
    const thick = 0.02 * maxR;
    const base = (N / ringsCount) | 0;
    let rem = N % ringsCount;
    let i = 0, t = 0;
    for (let r = 0; r < ringsCount; r++) {
      let k = base + (rem-- > 0 ? 1 : 0);
      if (k <= 0) continue;
      const f = 0.23 + (0.92 - 0.23) * (ringsCount === 1 ? 0 : r / (ringsCount - 1));
      const R = f * maxR;
      const step = TAU / k;
      for (let j = 0; j < k; j++, i++) {
        const th = step * j + rnd() * step;
        const rr = R + (rnd() * 2 - 1) * thick;
        write(i, cx + rr * Math.cos(th), cy + rr * Math.sin(th), 0, 0, t);
        if (++t === T) t = 0;
      }
    }
  }

  // Each concentric ring is one species — wide brand stripe effect.
  function rainbowRings(write, N, T, W, H) {
    if (T === 0) return;
    const m = Math.min(W, H);
    const cx = W * 0.5, cy = H * 0.5;
    const Rmax = 0.46 * m;
    const thick = 0.02 * Rmax;
    const ringsCount = T;
    const denom = Math.max(1, ringsCount - 1);
    const base = (N / ringsCount) | 0;
    let rem = N % ringsCount, i = 0;
    for (let r = 0; r < ringsCount; r++) {
      let k = base + (rem-- > 0 ? 1 : 0);
      if (k <= 0) continue;
      const R = Rmax * (0.23 + (0.92 - 0.23) * (r / denom));
      const step = TAU / k;
      for (let j = 0; j < k; j++, i++) {
        const th = j * step + rnd() * step;
        const rr = R + (rnd() * 2 - 1) * thick;
        write(i, cx + rr * Math.cos(th), cy + rr * Math.sin(th), 0, 0, r % T);
      }
    }
  }

  function spiral(write, N, T, W, H) {
    if (T === 0) return;
    const m = Math.min(W, H);
    const cx = W * 0.5, cy = H * 0.5;
    const R = 0.46 * m;
    const THICK = 0.0175 * m;
    const TURNS = 1.2 + rnd() * 2.4;
    const ROT = rnd() * TAU;
    const n1 = Math.max(1, N - 1);
    const dth = (TURNS * TAU) / n1;
    const c = Math.cos(dth), s = Math.sin(dth);
    let ux = Math.cos(ROT), uy = Math.sin(ROT);
    let t = 0;
    for (let i = 0; i < N; i++) {
      const u = i / n1;
      const r = u * R;
      const rr = Math.max(0, r + (rnd() * 2 - 1) * THICK);
      write(i, cx + rr * ux, cy + rr * uy, 0, 0, t);
      const nx = ux * c - uy * s;
      uy = ux * s + uy * c;
      ux = nx;
      if (++t === T) t = 0;
    }
  }

  // Spiral where colour shifts smoothly along the arc — rainbow trails out.
  function rainbowSpiral(write, N, T, W, H) {
    if (T === 0) return;
    const m = Math.min(W, H);
    const cx = W * 0.5, cy = H * 0.5;
    const R = 0.46 * m;
    const THICK = 0.0175 * m;
    const TURNS = 1.2 + rnd() * 2.4;
    const ROT = rnd() * TAU;
    const phase0 = rnd();
    const n1 = Math.max(1, N - 1);
    const dth = (TURNS * TAU) / n1;
    const c = Math.cos(dth), s = Math.sin(dth);
    const phaseStep = TURNS / n1;
    let ux = Math.cos(ROT), uy = Math.sin(ROT);
    for (let i = 0; i < N; i++) {
      const u = i / n1;
      const r = u * R;
      const rr = Math.max(0, r + (rnd() * 2 - 1) * THICK);
      const t = Math.floor(((phase0 + i * phaseStep) % 1) * T);
      write(i, cx + rr * ux, cy + rr * uy, 0, 0, t);
      const nx = ux * c - uy * s;
      uy = ux * s + uy * c;
      ux = nx;
    }
  }

  function twinSpirals(write, N, T, W, H) {
    if (T === 0) return;
    const m = Math.min(W, H);
    const cx = W * 0.5, cy = H * 0.5;
    const R = 0.46 * m;
    const THICK = 0.015 * m;
    const TURNS = 1.5 + rnd() * 1.5;
    const ROT = rnd() * TAU;
    const perm = Array.from({ length: T }, (_, i) => i);
    shuffleInPlace(perm);
    const mid = (T + 1) >> 1;
    const armColors = [perm.slice(0, mid), perm.slice(mid).length ? perm.slice(mid) : perm.slice(0, mid)];
    const base = (N / 2) | 0;
    let rem = N % 2, i = 0;
    for (let a = 0; a < 2; a++) {
      let k = base + (rem-- > 0 ? 1 : 0);
      if (k <= 0) continue;
      const palette = armColors[a];
      const plen = palette.length;
      let pi = (rnd() * plen) | 0;
      const th0 = ROT + a * Math.PI;
      const dth = (TURNS * TAU) / Math.max(1, k - 1);
      const c = Math.cos(dth), s = Math.sin(dth);
      let ux = Math.cos(th0), uy = Math.sin(th0);
      for (let n = 0; n < k; n++, i++) {
        const u = k > 1 ? n / (k - 1) : 0;
        const r = u * R;
        const rr = Math.max(0, r + (rnd() * 2 - 1) * THICK);
        write(i, cx + rr * ux, cy + rr * uy, 0, 0, palette[pi]);
        if (++pi === plen) pi = 0;
        const nx = ux * c - uy * s;
        uy = ux * s + uy * c;
        ux = nx;
      }
    }
  }

  // One arm per species, evenly spaced — pinwheel galaxy.
  function spiralArms(write, N, T, W, H) {
    if (T === 0) return;
    const m = Math.min(W, H);
    const cx = W * 0.5, cy = H * 0.5;
    const maxR = 0.46 * m;
    const TURNS = 2.5;
    const THICK_FRAC = Math.min(0.02, 0.07 / T);
    const THICK = THICK_FRAC * m;
    const armOrder = Array.from({ length: T }, (_, i) => i);
    shuffleInPlace(armOrder);
    const base = (N / T) | 0, rem = N % T;
    let i = 0;
    for (let a = 0; a < T; a++) {
      let k = base + (a < rem ? 1 : 0);
      if (k <= 0) continue;
      const tType = armOrder[a];
      const th0 = (a / T) * TAU;
      const dth = (TURNS * TAU) / Math.max(1, k - 1);
      const c = Math.cos(dth), s = Math.sin(dth);
      let ux = Math.cos(th0), uy = Math.sin(th0);
      for (let n = 0; n < k; n++, i++) {
        const u = k > 1 ? n / (k - 1) : 0;
        const r = u * maxR;
        const rr = Math.max(0, r + (rnd() * 2 - 1) * THICK);
        write(i, cx + rr * ux, cy + rr * uy, 0, 0, tType);
        const nx = ux * c - uy * s;
        uy = ux * s + uy * c;
        ux = nx;
      }
    }
  }

  // Poisson-ish placed circular colonies — each blob mostly one species.
  function softClusters(write, N, T, W, H) {
    if (T === 0) return;
    const m = Math.min(W, H);
    const MARGIN = 0.18;
    const minK = Math.max(2, Math.floor(T / 2));
    const maxK = Math.max(6, T);
    const k = Math.floor(minK + rnd() * (maxK - minK + 1));
    const radii = new Float32Array(k);
    const cx = new Float32Array(k);
    const cy = new Float32Array(k);
    const minX = W * MARGIN, minY = H * MARGIN;
    const spanX = W * (1 - 2 * MARGIN), spanY = H * (1 - 2 * MARGIN);
    const spacing = -0.075 * m;
    for (let c = 0; c < k; c++) {
      const R = (0.14 + rnd() * 0.06) * m;
      radii[c] = R;
      let placed = false;
      for (let att = 0; att < 500 && !placed; att++) {
        const x = minX + rnd() * spanX;
        const y = minY + rnd() * spanY;
        let ok = true;
        for (let j = 0; j < c; j++) {
          const dx = x - cx[j], dy = y - cy[j];
          const need = Math.max(0, radii[j] + R + spacing);
          if (dx * dx + dy * dy < need * need) { ok = false; break; }
        }
        if (ok) { cx[c] = x; cy[c] = y; placed = true; }
      }
      if (!placed) { cx[c] = minX + rnd() * spanX; cy[c] = minY + rnd() * spanY; }
    }
    const types = Array.from({ length: T }, (_, i) => i);
    shuffleInPlace(types);
    const clusterTypes = Array.from({ length: k }, () => []);
    const first = Math.min(T, k);
    for (let c = 0; c < first; c++) clusterTypes[c].push(types[c]);
    for (let t = first; t < T; t++) clusterTypes[(rnd() * k) | 0].push(types[t]);
    if (T < k) for (let c = T; c < k; c++) clusterTypes[c].push(types[(rnd() * T) | 0]);
    const base = (N / k) | 0;
    let rem = N % k, idx = 0;
    for (let c = 0; c < k; c++) {
      let cnt = base + (rem-- > 0 ? 1 : 0);
      if (cnt <= 0) continue;
      const Cx = cx[c], Cy = cy[c], R = radii[c];
      const pal = clusterTypes[c]; const plen = pal.length || 1;
      let ti = (rnd() * plen) | 0;
      for (let n = 0; n < cnt; n++, idx++) {
        const th = TAU * rnd();
        const r = R * Math.sqrt(rnd());
        write(idx, Cx + r * Math.cos(th), Cy + r * Math.sin(th), 0, 0, pal[ti]);
        if (++ti === plen) ti = 0;
      }
    }
  }

  // softClusters + bridges between nearest cluster pairs (graph backbone).
  function linkedClusters(write, N, T, W, H) {
    if (T === 0) return;
    const m = Math.min(W, H);
    const MARGIN = 0.18;
    const BRIDGE_FRAC = 0.18;
    const BRIDGE_WIDTH = 0.007 * m;
    const BRIDGE_ALONG = 0.05 * m;
    const BLEND_FRAC = 0.22;
    const BLEND_BANDS = 28;
    const minK = Math.max(2, Math.floor(T / 2));
    const maxK = Math.max(6, T);
    const k = (minK + rnd() * (maxK - minK + 1)) | 0;
    const minX = W * MARGIN, minY = H * MARGIN;
    const spanX = W - 2 * minX, spanY = H - 2 * minY;
    const cx = new Float32Array(k);
    const cy = new Float32Array(k);
    const R = new Float32Array(k);
    for (let c = 0; c < k; c++) {
      const Rc = (0.14 + rnd() * 0.06) * m;
      R[c] = Rc;
      let placed = false;
      for (let att = 0; att < 500 && !placed; att++) {
        const x = minX + rnd() * spanX;
        const y = minY + rnd() * spanY;
        let ok = true;
        for (let j = 0; j < c; j++) {
          const dx = x - cx[j], dy = y - cy[j];
          const need = R[j] + Rc + 0.01 * m;
          if (dx * dx + dy * dy < need * need) { ok = false; break; }
        }
        if (ok) { cx[c] = x; cy[c] = y; placed = true; }
      }
      if (!placed) { cx[c] = minX + rnd() * spanX; cy[c] = minY + rnd() * spanY; }
    }
    const types = Array.from({ length: T }, (_, i) => i);
    shuffleInPlace(types);
    const clusterTypes = Array.from({ length: k }, () => []);
    const first = Math.min(T, k);
    for (let c = 0; c < first; c++) clusterTypes[c].push(types[c]);
    for (let t = first; t < T; t++) clusterTypes[(rnd() * k) | 0].push(types[t]);
    if (T < k) for (let c = T; c < k; c++) clusterTypes[c].push(types[(rnd() * T) | 0]);
    const edges = [];
    const seen = new Set();
    for (let a = 0; a < k; a++) {
      let best = -1, bd = Infinity;
      for (let b = 0; b < k; b++) {
        if (a === b) continue;
        const dx = cx[a] - cx[b], dy = cy[a] - cy[b];
        const d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = b; }
      }
      const u = a < best ? a : best, v = a < best ? best : a;
      const key = u * k + v;
      if (!seen.has(key)) {
        seen.add(key);
        const palA = clusterTypes[u], palB = clusterTypes[v];
        edges.push({ a: u, b: v, tA: palA[(rnd() * palA.length) | 0], tB: palB[(rnd() * palB.length) | 0] });
      }
    }
    const bridges = Math.min(N, (N * BRIDGE_FRAC) | 0);
    const coreN = N - bridges;
    const base = (coreN / k) | 0;
    let rem = coreN % k, idx = 0;
    for (let c = 0; c < k; c++) {
      let cnt = base + (rem-- > 0 ? 1 : 0);
      if (cnt <= 0) continue;
      const Cx = cx[c], Cy = cy[c], Rc = R[c];
      const pal = clusterTypes[c], plen = pal.length || 1;
      let ti = (rnd() * plen) | 0;
      for (; cnt > 0; cnt--, idx++) {
        const th = TAU * rnd();
        const r = Rc * Math.sqrt(rnd());
        write(idx, Cx + r * Math.cos(th), Cy + r * Math.sin(th), 0, 0, pal[ti]);
        if (++ti === plen) ti = 0;
      }
    }
    if (bridges === 0 || edges.length === 0) return;
    const halfBlend = Math.max(0, Math.min(0.49, BLEND_FRAC * 0.5));
    const tLeft = 0.5 - halfBlend, tRight = 0.5 + halfBlend;
    const M = edges.length;
    const perEdgeBase = (bridges / M) | 0;
    let perEdgeRem = bridges % M;
    for (let ei = 0; ei < M; ei++) {
      const { a, b, tA, tB } = edges[ei];
      const ax = cx[a], ay = cy[a], bx = cx[b], by = cy[b];
      const dx = bx - ax, dy = by - ay;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
      let count = perEdgeBase + (perEdgeRem-- > 0 ? 1 : 0);
      if (count <= 0) continue;
      const inv = 1 / count;
      for (let j = 0; j < count; j++, idx++) {
        const tpos = (j + 0.5) * inv;
        const along = (rnd() * 2 - 1) * BRIDGE_ALONG;
        const off = (rnd() * 2 - 1) * BRIDGE_WIDTH;
        const x = ax + dx * tpos + ux * along + nx * off;
        const y = ay + dy * tpos + uy * along + ny * off;
        let type;
        if (tpos < tLeft) type = tA;
        else if (tpos > tRight) type = tB;
        else {
          const u = (tpos - tLeft) / (tRight - tLeft + 1e-6);
          type = ((Math.floor(u * BLEND_BANDS) & 1) === 0) ? tA : tB;
        }
        write(idx, x, y, 0, 0, type);
      }
    }
  }

  function yinYang(write, N, T, W, H) {
    if (T === 0) return;
    const m = Math.min(W, H);
    const cx = W * 0.5, cy = H * 0.5;
    const R = 0.46 * m, R2 = R * R;
    const r = 0.5 * R;
    const e = R / 6, e2 = e * e;
    const topCx = cx, topCy = cy - r;
    const botCx = cx, botCy = cy + r;
    const types = Array.from({ length: T }, (_, i) => i);
    shuffleInPlace(types);
    const mid = (T + 1) >> 1;
    const groupTop = types.slice(0, mid);
    const groupBot = types.slice(mid).length ? types.slice(mid) : types.slice(0, mid);
    const lenT = Math.max(1, groupTop.length), lenB = Math.max(1, groupBot.length);
    let it = 0, ib = 0;
    const d2 = (x, y, a, b) => { const dx = x - a, dy = y - b; return dx * dx + dy * dy; };
    let i = 0;
    while (i < N) {
      const th = rnd() * TAU;
      const rr = R * Math.sqrt(rnd());
      const x = cx + rr * Math.cos(th);
      const y = cy + rr * Math.sin(th);
      if (d2(x, y, cx, cy) > R2) continue;
      let useTop = (y <= cy);
      if (d2(x, y, topCx, topCy) <= e2) useTop = false;
      else if (d2(x, y, botCx, botCy) <= e2) useTop = true;
      const t = useTop ? groupTop[it % lenT] : groupBot[ib % lenB];
      if (useTop) it++; else ib++;
      write(i++, x, y, 0, 0, t);
    }
  }

  // Multi-petal rose — visually stunning at higher T.
  function chromaticFlower(write, N, T, W, H) {
    if (T === 0) return;
    const m = Math.min(W, H);
    const cx = W * 0.5, cy = H * 0.5;
    const Rmax = 0.46 * m;
    const jitter = 0.006 * m;
    const GA = Math.PI * (3 - Math.sqrt(5));
    const petals = 2 + ((rnd() * 6) | 0);
    const types = Array.from({ length: T }, (_, i) => i);
    shuffleInPlace(types);
    const raw = new Float32Array(T);
    for (let i = 0; i < T; i++) raw[i] = 0.62 + rnd() * 0.38;
    let smax = 0.62;
    for (let i = 0; i < T; i++) if (raw[i] > smax) smax = raw[i];
    const scale = new Float32Array(T);
    if (smax === 0.62) {
      for (let i = 0; i < T; i++) scale[i] = 0.62;
      scale[(rnd() * T) | 0] = 1;
    } else {
      const denom = smax - 0.62;
      for (let i = 0; i < T; i++) scale[i] = 0.62 + ((raw[i] - 0.62) / denom) * 0.38;
    }
    const phase = new Float32Array(T);
    for (let i = 0; i < T; i++) phase[i] = rnd() * TAU;
    const base = (N / T) | 0;
    let rem = N % T, idx = 0;
    for (let u = 0; u < T; u++) {
      const t = types[u];
      let k = base + (rem > 0 ? 1 : 0); if (rem > 0) rem--;
      let th = rnd() * TAU;
      const rMaxColor = Rmax * scale[t];
      const innerFrac = 0.01 + rnd() * 0.13;
      const rFloor = innerFrac * rMaxColor;
      while (k-- > 0 && idx < N) {
        const g = Math.abs(Math.cos(petals * th + phase[t]));
        const shaped = Math.pow(g, 1.35);
        const soft = (1 - Math.exp(-2 * shaped)) / (1 - Math.exp(-2));
        const rr = rFloor + (rMaxColor - rFloor) * soft;
        const x = cx + rr * Math.cos(th) + (rnd() * 2 - 1) * jitter;
        const y = cy + rr * Math.sin(th) + (rnd() * 2 - 1) * jitter;
        write(idx++, x, y, 0, 0, t);
        th += GA + (rnd() - 0.5) * 0.06;
        if (th >= TAU) th -= TAU;
        else if (th < 0) th += TAU;
      }
    }
  }

  // Horizontal sine bands — one species per band, phase-staggered.
  function wavyBands(write, N, T, W, H) {
    if (T === 0) return;
    const segH = H / T;
    const amp = 0.06 * H;
    const kx = (TAU / W) * (1 + (T % 3));
    const jitter = 0.02 * H;
    const types = new Int32Array(T);
    for (let i = 0; i < T; i++) types[i] = i;
    for (let i = T - 1; i > 0; i--) {
      const j = (rnd() * (i + 1)) | 0;
      const ti = types[i]; types[i] = types[j]; types[j] = ti;
    }
    const base = (N / T) | 0, rem = N % T;
    const basePhase = rnd() * TAU;
    let idx = 0;
    for (let i = 0; i < T; i++) {
      const t = types[i];
      let n = base + (i < rem ? 1 : 0);
      const y0 = (i + 0.5) * segH;
      const ph = basePhase + i * 0.7;
      while (n-- > 0) {
        const x = rnd() * W;
        let y = y0 + amp * Math.sin(kx * x + ph) + (rnd() * 2 - 1) * jitter;
        if (y < 0) y = 0; else if (y > H) y = H;
        write(idx++, x, y, 0, 0, t);
      }
    }
  }

  // Concentric eccentric ellipses — orrery feel.
  function orbitalBelts(write, N, T, W, H) {
    if (T === 0) return;
    const R = 0.46 * Math.min(W, H);
    const ecc = 0.35;
    const thick = 0.02 * R;
    const minBelts = Math.min(4, T);
    const maxBelts = Math.min(8, T);
    const belts = Math.floor(minBelts + rnd() * (maxBelts - minBelts + 1));
    const base = Math.floor(N / belts), rem = N % belts;
    const types = Array.from({ length: T }, (_, t) => t);
    shuffleInPlace(types);
    const typesPerBelt = Array.from({ length: belts }, () => []);
    const perBelt = Math.floor(T / belts);
    const extra = T % belts;
    let idx = 0;
    for (let b = 0; b < belts; b++) {
      const count = perBelt + (b < extra ? 1 : 0);
      for (let j = 0; j < count && idx < T; j++, idx++) typesPerBelt[b].push(types[idx]);
    }
    while (idx < T) typesPerBelt[(rnd() * belts) | 0].push(types[idx++]);
    let i = 0;
    for (let b = 0; b < belts; b++) {
      let k = base + (b < rem ? 1 : 0);
      const a = R * (0.25 + 0.7 * (b / Math.max(1, belts - 1)));
      const e = ecc * (0.6 + 0.8 * rnd());
      const c = a * e;
      const rot = rnd() * TAU;
      const Cr = Math.cos(rot), Sr = Math.sin(rot);
      const ccx = W * 0.5 + c * Cr;
      const ccy = H * 0.5 + c * Sr;
      const bAxis = a * Math.sqrt(1 - e * e);
      const pal = typesPerBelt[b];
      const plen = pal.length || 1;
      let ti = (rnd() * plen) | 0;
      while (k-- > 0) {
        const th = rnd() * TAU;
        const lr = a + (rnd() * 2 - 1) * thick;
        const lb = bAxis + (rnd() * 2 - 1) * thick;
        const lx = lr * Math.cos(th);
        const ly = lb * Math.sin(th);
        const x = ccx + lx * Cr - ly * Sr;
        const y = ccy + lx * Sr + ly * Cr;
        write(i++, x, y, 0, 0, pal[ti]);
        if (++ti === plen) ti = 0;
      }
    }
  }

  // Helical "Lissajous" bands sweeping across the field.
  function chaoticBands(write, N, T, W, H) {
    if (T === 0) return;
    const m = Math.min(W, H);
    const lanesMin = Math.min(3, T);
    const lanesMax = Math.min(10, Math.max(3, T));
    const ampMin = 0.005 * H, ampMax = 0.06 * H;
    const tubeMin = 0.012 * m, tubeMax = 0.028 * m;
    const edgeFrac = 0.18, noise = 0.02 * m;
    const lanes = (lanesMin + rnd() * (lanesMax - lanesMin + 1)) | 0;
    const base = (N / lanes) | 0, rem = N % lanes;
    const laneTypes = Array.from({ length: lanes }, () => []);
    const tArr = Array.from({ length: T }, (_, t) => t);
    shuffleInPlace(tArr);
    for (let i = 0; i < T; i++) laneTypes[(rnd() * lanes) | 0].push(tArr[i]);
    for (let l = 0; l < lanes; l++) {
      const want = 1 + ((rnd() * Math.min(4, T)) | 0);
      while (laneTypes[l].length < want) {
        const t = (rnd() * T) | 0;
        if (!laneTypes[l].includes(t)) laneTypes[l].push(t);
      }
    }
    let i = 0;
    for (let l = 0; l < lanes && i < N; l++) {
      let cnt = base + (l < rem ? 1 : 0);
      if (cnt <= 0) continue;
      const theta = rnd() * TAU, ux = Math.cos(theta), uy = Math.sin(theta);
      const nx = -uy, ny = ux;
      const amp = ampMin + rnd() * (ampMax - ampMin);
      const tube = tubeMin + rnd() * (tubeMax - tubeMin);
      const maxOff = amp * 1.2 + edgeFrac * tube + noise + 2;
      const minX = maxOff, maxX = W - maxOff, minY = maxOff, maxY = H - maxOff;
      if (minX >= maxX || minY >= maxY) break;
      const cx = minX + rnd() * (maxX - minX);
      const cy = minY + rnd() * (maxY - minY);
      // Find segment of line through (cx,cy) clipped to the safe rect
      let t0 = -Infinity, t1 = Infinity;
      const clip = (denom, num0, num1) => {
        if (Math.abs(denom) < 1e-9) { if (num0 > 0 || num1 < 0) return false; return true; }
        const tA = num0 / denom, tB = num1 / denom;
        const lo = Math.min(tA, tB), hi = Math.max(tA, tB);
        if (lo > t0) t0 = lo;
        if (hi < t1) t1 = hi;
        return t0 <= t1;
      };
      if (!clip(ux, minX - cx, maxX - cx) || !clip(uy, minY - cy, maxY - cy)) continue;
      const segLen = t1 - t0;
      if (segLen <= 1e-6) continue;
      const cycles = 1 + rnd() * 2;
      const k = (TAU * cycles) / segLen;
      const phase = rnd() * TAU;
      const wobK = 2 * k, wobPhase = rnd() * TAU;
      const step = segLen / cnt;
      let t = t0 + rnd() * step;
      let baseX = cx + ux * t, baseY = cy + uy * t;
      const dBX = ux * step, dBY = uy * step;
      const typesHere = laneTypes[l];
      while (cnt-- > 0 && i < N) {
        const a = k * (t - t0) + phase;
        const helix = amp * Math.sin(a);
        const wobb = 0.2 * amp * Math.sin(wobK * (t - t0) + wobPhase);
        const edgeSign = rnd() < 0.5 ? -1 : 1;
        const edgeBias = 0.5 + 0.5 * Math.pow(rnd(), 0.35);
        const offset = helix + wobb + edgeSign * edgeFrac * tube * edgeBias + (rnd() * 2 - 1) * noise;
        let x = baseX + nx * offset, y = baseY + ny * offset;
        if (x < 0) x = 0; else if (x > W) x = W;
        if (y < 0) y = 0; else if (y > H) y = H;
        const type = typesHere[(rnd() * typesHere.length) | 0];
        write(i++, x, y, 0, 0, type);
        baseX += dBX; baseY += dBY;
        t += step;
      }
    }
  }

  // ============================================================
  // Registry — `random` always exists as the safe default.
  // ============================================================
  const PATTERNS = {
    random,
    disk, rainbowDisk,
    ring, rainbowRing,
    rings, rainbowRings,
    spiral, rainbowSpiral, twinSpirals, spiralArms,
    softClusters, linkedClusters,
    yinYang, chromaticFlower,
    wavyBands, orbitalBelts, chaoticBands,
  };

  // Names sorted from "settles fast" to "takes longer to organise" — Hero
  // picks at random; this is the ordering used when "auto" is requested.
  const PATTERN_NAMES = Object.keys(PATTERNS);

  function run(name, write, N, T, W, H) {
    const fn = PATTERNS[name] || random;
    fn(write, N, T, W, H);
  }

  function pickRandom() {
    return PATTERN_NAMES[(Math.random() * PATTERN_NAMES.length) | 0];
  }

  window.PLSeeds = { run, pickRandom, names: PATTERN_NAMES.slice(), PATTERNS };
})();
