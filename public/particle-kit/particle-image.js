/* particle-image.js — 圖片 → 點雲取樣模組（window.PLImage）
 *
 * 把一張（最好是去背的）圖片轉成粒子雲資料，並註冊成 PLSeeds 的
 * seed pattern，讓引擎直接用 seedPattern 名稱開場。
 *
 * 兩種來源：
 *   A. 圖片模式 — prepare(url)：執行期載圖取樣。換圖最快（丟新檔即可），
 *      但圖片本身會被公開下載。
 *   B. 資料模式 — prepareFromData(json)：吃 prepare() 產出的 spec.data
 *      （JSON 序列化點資料，Uint16 座標 base64 打包，32k 點約 200KB）。
 *      正式站建議用這個：不必公開原圖、檔案更小、載入不用解圖取樣。
 *
 * 產 JSON 工作流：在任何載了引擎腳本的頁面 console 執行
 *   const spec = await PLImage.prepare('/xxx.png', { count: 32000 });
 *   copy(JSON.stringify(spec.data))     // 貼存成 .json 檔
 *
 * 用法（在 makeEngine 之前）：
 *   const spec = await window.PLImage.prepare('/people/people-01.png', { count: 32000 });
 *   // 或： const spec = window.PLImage.prepareFromData(await (await fetch('/people/people-01.json')).json());
 *   const engine = await window.makeEngine(canvas, {
 *     seedPattern: spec.pattern,
 *     palette: spec.palette,          // 圖片主色量化出的 7 色
 *     species: spec.palette.length,
 *     count: spec.count,
 *     ...
 *   });
 *
 * prepare(url, opts)：
 *   count      取樣點數（預設 24000）。引擎 count 若更大會循環重用。
 *   colors     量化色數（預設 7，配合引擎物種上限）
 *   lumaBias   亮度權重混合（0 = 純輪廓均勻，1 = 全亮度加權；預設 0.6）
 *   fit        圖形佔畫布短邊的比例（預設 0.86）
 *   name       pattern 註冊名（預設 'image:' + url）
 *   sampleEdge 取樣解析度上限（預設 480px，夠細且快）
 *   seed       取樣 PRNG 種子（預設 1926；同圖同種子 → 同標本）
 */
(function () {
  'use strict';

  // 種子式 PRNG — 同一張圖每次取樣結果一致（可重現的「標本」）
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('PLImage: cannot load ' + url));
      img.src = url;
    });
  }

  // --- base64 <-> typed array（點資料 JSON 打包用） -------------------------
  function b64FromU8(u8) {
    let s = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < u8.length; i += CHUNK) {
      s += String.fromCharCode.apply(null, u8.subarray(i, i + CHUNK));
    }
    return btoa(s);
  }
  function u8FromB64(str) {
    const bin = atob(str);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }
  function packPos(f32) {          // Float32 0..1 → Uint16 → base64
    const u = new Uint16Array(f32.length);
    for (let i = 0; i < f32.length; i++) {
      u[i] = Math.round(Math.min(1, Math.max(0, f32[i])) * 65535);
    }
    return b64FromU8(new Uint8Array(u.buffer));
  }
  function unpackPos(b64, n) {     // base64 → Uint16 → Float32 0..1
    const u8 = u8FromB64(b64);
    const u16 = new Uint16Array(u8.buffer, 0, n);
    const f32 = new Float32Array(n);
    for (let i = 0; i < n; i++) f32[i] = u16[i] / 65535;
    return f32;
  }

  // k-means 色彩量化（RGB 空間、固定種子、少量迭代就夠）
  function quantize(colors, k, rnd) {
    const n = colors.length / 3;
    const cent = new Float32Array(k * 3);
    for (let c = 0; c < k; c++) {
      const i = (rnd() * n) | 0;
      cent[c * 3] = colors[i * 3];
      cent[c * 3 + 1] = colors[i * 3 + 1];
      cent[c * 3 + 2] = colors[i * 3 + 2];
    }
    const assign = new Uint8Array(n);
    for (let iter = 0; iter < 10; iter++) {
      for (let i = 0; i < n; i++) {
        const r = colors[i * 3], g = colors[i * 3 + 1], b = colors[i * 3 + 2];
        let bd = Infinity, bc = 0;
        for (let c = 0; c < k; c++) {
          const dr = r - cent[c * 3], dg = g - cent[c * 3 + 1], db = b - cent[c * 3 + 2];
          const d = dr * dr + dg * dg + db * db;
          if (d < bd) { bd = d; bc = c; }
        }
        assign[i] = bc;
      }
      const sum = new Float64Array(k * 4);
      for (let i = 0; i < n; i++) {
        const c = assign[i];
        sum[c * 4] += colors[i * 3];
        sum[c * 4 + 1] += colors[i * 3 + 1];
        sum[c * 4 + 2] += colors[i * 3 + 2];
        sum[c * 4 + 3]++;
      }
      for (let c = 0; c < k; c++) {
        const cnt = sum[c * 4 + 3];
        if (cnt > 0) {
          cent[c * 3] = sum[c * 4] / cnt;
          cent[c * 3 + 1] = sum[c * 4 + 1] / cnt;
          cent[c * 3 + 2] = sum[c * 4 + 2] / cnt;
        } else {
          const i = (rnd() * n) | 0;   // 空群重新播種
          cent[c * 3] = colors[i * 3];
          cent[c * 3 + 1] = colors[i * 3 + 1];
          cent[c * 3 + 2] = colors[i * 3 + 2];
        }
      }
    }
    return { cent, assign };
  }

  const hex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');

  // 共用：把點資料註冊成 seed pattern（contain-fit 置中）
  function registerPattern(name, px, py, types, count, aspect, fit) {
    if (!window.PLSeeds) throw new Error('PLImage: load particle-life-seeds.js first');
    window.PLSeeds.PATTERNS[name] = function (write, N, T, W, H) {
      const boxW = W * fit, boxH = H * fit;
      const s = Math.min(boxW / aspect, boxH);   // 圖高在模擬空間的尺寸
      const drawW = s * aspect, drawH = s;
      const x0 = (W - drawW) / 2, y0 = (H - drawH) / 2;
      for (let i = 0; i < N; i++) {
        const j = i % count;
        write(i, x0 + px[j] * drawW, y0 + py[j] * drawH, 0, 0, types[j] % T);
      }
    };
  }

  // --- 資料模式：吃 prepare() 產出的 spec.data ------------------------------
  function prepareFromData(data, opts = {}) {
    if (!data || data.v !== 1) throw new Error('PLImage: bad data (expect v:1)');
    const count = data.count;
    const px = unpackPos(data.x, count);
    const py = unpackPos(data.y, count);
    const types = u8FromB64(data.t);
    const name = opts.name || data.name || 'image:data';
    const fit = opts.fit || 0.86;
    registerPattern(name, px, py, types, count, data.aspect, fit);
    // px/py/types 一併回傳（0..1 正規化）— 讓呼叫端能做倒帶/morph 等
    // 需要目標座標的動畫
    return { pattern: name, palette: data.palette.slice(), aspect: data.aspect, count, fit, px, py, types };
  }

  // --- 圖片模式：執行期取樣 -------------------------------------------------
  async function prepare(url, opts = {}) {
    if (!window.PLSeeds) throw new Error('PLImage: load particle-life-seeds.js first');
    const count = opts.count || 24000;
    const K = opts.colors || 7;
    const lumaBias = typeof opts.lumaBias === 'number' ? opts.lumaBias : 0.6;
    const fit = opts.fit || 0.86;
    const name = opts.name || ('image:' + url);
    const sampleEdge = opts.sampleEdge || 480;

    const img = await loadImage(url);
    const scale = Math.min(1, sampleEdge / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    // --- 加權累積分布（alpha 為輪廓、亮度為密度） --------------------------
    const weights = new Float64Array(w * h);
    let total = 0;
    for (let p = 0; p < w * h; p++) {
      const a = data[p * 4 + 3] / 255;
      if (a < 0.5) continue;                      // 半透明邊緣不取，避免殘邊色
      const r = data[p * 4], g = data[p * 4 + 1], b = data[p * 4 + 2];
      const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const wgt = a * ((1 - lumaBias) + lumaBias * Math.pow(luma, 0.85));
      weights[p] = wgt;
      total += wgt;
    }
    if (total <= 0) throw new Error('PLImage: image has no opaque pixels');
    const cum = new Float64Array(w * h);
    let acc = 0;
    for (let p = 0; p < w * h; p++) { acc += weights[p]; cum[p] = acc; }

    // --- 重要性採樣 count 個點（固定種子 → 同圖同結果） ---------------------
    const rnd = mulberry32(opts.seed || 1926);
    const px = new Float32Array(count);   // 0..1（相對圖寬 / 圖高）
    const py = new Float32Array(count);
    const colorArr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const target = rnd() * acc;
      let lo = 0, hi = w * h - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] < target) lo = mid + 1; else hi = mid;
      }
      const x = lo % w, y = (lo / w) | 0;
      px[i] = (x + rnd()) / w;
      py[i] = (y + rnd()) / h;
      colorArr[i * 3] = data[lo * 4];
      colorArr[i * 3 + 1] = data[lo * 4 + 1];
      colorArr[i * 3 + 2] = data[lo * 4 + 2];
    }

    // --- 量化 K 色 → 色盤 + 每點物種 ----------------------------------------
    const { cent, assign } = quantize(colorArr, K, rnd);
    // 依亮度排序（亮 → 暗），物種 0 為最亮，配合「亮處密」的閱讀
    const order = Array.from({ length: K }, (_, c) => c).sort((a, b) => {
      const la = 0.2126 * cent[a * 3] + 0.7152 * cent[a * 3 + 1] + 0.0722 * cent[a * 3 + 2];
      const lb = 0.2126 * cent[b * 3] + 0.7152 * cent[b * 3 + 1] + 0.0722 * cent[b * 3 + 2];
      return lb - la;
    });
    const rank = new Uint8Array(K);
    order.forEach((c, i) => { rank[c] = i; });
    const palette = order.map((c) =>
      '#' + hex(cent[c * 3]) + hex(cent[c * 3 + 1]) + hex(cent[c * 3 + 2]));
    const types = new Uint8Array(count);
    for (let i = 0; i < count; i++) types[i] = rank[assign[i]];

    const aspect = w / h;
    registerPattern(name, px, py, types, count, aspect, fit);

    return {
      pattern: name,
      palette,
      aspect,
      count,
      fit,
      px, py, types,
      // 可序列化的點資料 — JSON.stringify(spec.data) 存檔後改用 prepareFromData
      data: {
        v: 1,
        name,
        count,
        aspect,
        palette,
        x: packPos(px),
        y: packPos(py),
        t: b64FromU8(types),
      },
    };
  }

  window.PLImage = { prepare, prepareFromData };
})();
