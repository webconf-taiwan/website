// particle-kit 是零依賴的 IIFE，掛在 window 上（無 build step、無框架綁定），
// 所以只能用 <script> 依序載入 —— 順序不可換，後面的檔案會讀前面掛好的全域物件。
// 見 docs/point-cloud-effect.md §11。

const KIT = '/particle-kit'

const SCRIPTS = [
  'particle-life-seeds.js',
  'particle-life-rules.js',
  'particle-life.js',
  'particle-life-gpu.js',
  'particle-palettes.js',
  'particle-ambient.js',
  'particle-image.js',      // 圖片 → 點雲取樣（首頁第二區塊的收攏目標）
]

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      if (existing.dataset.loaded) return resolve()
      existing.addEventListener('load', resolve)
      existing.addEventListener('error', reject)
      return
    }
    const el = document.createElement('script')
    el.src = src
    el.onload = () => { el.dataset.loaded = '1'; resolve() }
    el.onerror = () => reject(new Error(`failed to load ${src}`))
    document.head.appendChild(el)
  })
}

// 多個元件同時掛載時共用同一次載入（第二個以後拿到同一個 promise）
let pending = null

export function useParticleKit () {
  function loadParticleKit () {
    if (!pending) {
      pending = (async () => {
        for (const s of SCRIPTS) await loadScript(`${KIT}/${s}`)
      })()
    }
    return pending
  }

  return { loadParticleKit }
}
