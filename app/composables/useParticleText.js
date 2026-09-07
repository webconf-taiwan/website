// 文字 → 點雲。給「粒子排出字」的頁面用（pages/echo.vue）。
//
// 與 useParticleMorph 的分工：那邊是「圖片 / 開場構圖 → 目標點」，這邊是「一個字
// → 目標點」。兩邊回傳的都是可以直接餵給 engine.setTargets 的座標，差別在來源。
//
// ─── 為什麼是「一個字」而不是「一整句」────────────────────────────────────
// 直覺作法是把整句話畫在一張大 canvas 上再取樣。但字幕是一個字一個字長出來的，
// 每來一個新字就重畫整句 = 每顆粒子的目標點都變了 = 整面牆抖一次。實測那個抖動
// 讓字完全沒辦法讀。
//
// 所以改成「字元格」：版面切成固定的 COLS × ROWS 個格子，第 k 個字永遠落在第 k 格，
// 每個字自己取樣自己的點。加一個字只動到第 k+1 格的粒子，前面已經站好的粒子
// 一動都不動 —— 看起來就是字一個一個浮出來，而不是整句重排。
// 這也剛好是實體字幕機 / LED 點矩陣的邏輯，視覺語彙是對的。
//
// ⚠️ 代價：每格等寬，所以英文字母會排得很鬆（一個字母佔一個中文字的寬）。
//    這頁主要是中文，先接受；要處理的話得讓拉丁字母佔半格，但那會破壞
//    「第 k 個字在第 k 格」這個前綴穩定的前提，不是改個數字就能解決的事。

// 取樣用的離屏 canvas 解析度。128 足夠解析中文的筆畫（一個字約 6000～9000 個
// 墨水像素），再大只是讓 getImageData 變慢 —— 反正最後只取一千多個點。
const GLYPH_PX = 128

let glyphCanvas = null
let glyphCtx = null

// 字 → 墨水像素索引清單。同一個字在一句話裡常常重複出現，而每次重畫 + getImageData
// 大約 0.3ms，捲一次版面要重算 24 格就有感了。清單存下來，之後只要重抽點。
const inkCache = new Map()

// 目前快取是用哪一組字型算的。字型還沒載完就取樣的話，量到的是 fallback 字型的
// 形狀（筆畫粗細、字面大小都不一樣），而且會被永久快取起來 —— 所以 webfont 一到
// 就要把快取整個丟掉重來。
let cacheFont = ''

/**
 * 確保取樣用的字型真的可用。沒有這一步的話，第一批字會用 fallback 字型取樣，
 * 而且因為有快取，之後就算 webfont 載好了那幾個字也不會更新。
 *
 * @param {string} font ctx.font 的完整字串，例如 '600 100px "Noto Serif TC", serif'
 */
export async function ensureGlyphFont (font) {
  try {
    // document.fonts.load 要的是「不含 font-family 以外部分」也能解析的簡寫，
    // 直接把 ctx.font 丟進去即可（規格上是同一個 shorthand 文法）。
    await document.fonts?.load?.(font, '字A')
    await document.fonts?.ready
  } catch {
    // 沒有 FontFaceSet（或載入失敗）就照舊往下走，頂多是 fallback 字型
  }
  if (cacheFont !== font) {
    inkCache.clear()
    cacheFont = font
  }
}

// 把一個字畫進離屏 canvas，回傳所有不透明像素的索引。
// 索引是 GLYPH_PX × GLYPH_PX 這張圖上的位置，之後 sampleGlyph 再換算成 0..1。
function inkPixels (ch, font) {
  const hit = inkCache.get(ch)
  if (hit) return hit

  if (!glyphCanvas) {
    glyphCanvas = document.createElement('canvas')
    glyphCanvas.width = GLYPH_PX
    glyphCanvas.height = GLYPH_PX
    glyphCtx = glyphCanvas.getContext('2d', { willReadFrequently: true })
  }
  const ctx = glyphCtx
  ctx.clearRect(0, 0, GLYPH_PX, GLYPH_PX)
  ctx.fillStyle = '#fff'
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // ⚠️ 中文字的 middle baseline 略偏上（em box 與實際字面不同心），往下推一點
  // 才會在格子裡置中。這個 0.04 是照 Noto Serif TC 目測的。
  ctx.fillText(ch, GLYPH_PX / 2, GLYPH_PX * 0.54)

  const data = ctx.getImageData(0, 0, GLYPH_PX, GLYPH_PX).data
  const list = []
  for (let p = 0; p < GLYPH_PX * GLYPH_PX; p++) {
    // 半透明的抗鋸齒邊緣也收（門檻壓低），筆畫邊緣才不會被切成硬邊
    if (data[p * 4 + 3] > 60) list.push(p)
  }
  const out = new Uint32Array(list)
  inkCache.set(ch, out)
  return out
}

/**
 * 取樣一個字，把點寫進呼叫端的緩衝區。
 *
 * 點是均勻地從墨水像素裡抽的（不做重要性加權 —— 文字是單色的，沒有濃淡可言），
 * 每個點再在自己的像素內抖一下，粒子才不會排成看得出來的網格。
 *
 * @param {string} ch     要取樣的字（空白 / 找不到墨水時回傳 false）
 * @param {string} font   ctx.font 字串
 * @param {number} count  要幾個點
 * @param {Float32Array} out  寫入目標，長度至少 (offset + count) * 2
 * @param {number} offset 從 out 的第幾個「點」開始寫
 * @param {object} box    這個字在畫面上的框（正規化螢幕座標）{ x, y, w, h }
 * @returns {boolean} 有沒有寫出東西
 */
export function sampleGlyph (ch, font, count, out, offset, box) {
  if (!ch || ch === ' ' || ch === '　') return false
  const ink = inkPixels(ch, font)
  if (!ink.length) return false

  for (let i = 0; i < count; i++) {
    // 點數通常比墨水像素少，但標點符號（「、」之類）反過來 —— 這時候會有好幾顆
    // 粒子抽到同一個像素。那是想要的：點少的字就讓粒子疊厚一點，不要留一片空。
    const p = ink[(Math.random() * ink.length) | 0]
    const px = ((p % GLYPH_PX) + Math.random()) / GLYPH_PX
    const py = (((p / GLYPH_PX) | 0) + Math.random()) / GLYPH_PX
    const j = (offset + i) * 2
    out[j] = box.x + px * box.w
    out[j + 1] = box.y + py * box.h
  }
  return true
}

export function useParticleText () {
  return { ensureGlyphFont, sampleGlyph }
}
