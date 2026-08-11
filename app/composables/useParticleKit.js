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

// 人像專用的「星雲擴散」力矩陣（見 docs/point-cloud-effect.md §7.4 的踩坑）：
// 任何正的自吸引（i===j 給正值）都會把人像凝結成一顆顆菌落圓點，五官就沒了。
// 氣體感要靠「正弦相位環流 + 全域微斥力」——沒有靜止解，所以粒子會一直緩緩流動，
// 但又不會塌陷成球。註冊到 window.PLRules.PRESETS 供 preset: 'nebula' 使用。
// ⚠️ people.vue 目前有一份自己的複本，之後該改成呼叫這裡（本次未動那頁）。
export function registerNebula () {
  if (!window.PLRules || window.PLRules.PRESETS.nebula) return
  window.PLRules.PRESETS.nebula = (n) => {
    const m = []
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) { m.push(-0.06); continue }
        const phase = 2 * Math.PI * (j - i) / n
        m.push(0.45 * Math.sin(phase) - 0.08)
      }
    }
    return m
  }
}

export function useParticleKit () {
  function loadParticleKit () {
    if (!pending) {
      pending = (async () => {
        for (const s of SCRIPTS) await loadScript(`${KIT}/${s}`)
      })()
    }
    return pending
  }

  return { loadParticleKit, registerNebula }
}
