// 講者頁 hover 粒子人像（Speakers/HoverPortrait）的引擎管理。
//
// 每張卡片各有一張 canvas，但引擎不是每張都留著：
//   · 卡片快進畫面時才建（預熱，建好就暫停，不畫）
//   · 同時最多 MAX_ALIVE 顆；超過就銷毀一顆 —— 先挑已經離開畫面附近的，
//     再挑最久沒碰的；hover 中的那顆永遠不動
//   · 同一時間只有 hover 中的那一張在跑
// WebGPU device 本來就是整頁共用的（particle-life-gpu.js 的 getSharedDevice），
// 每顆引擎多的只是自己的 pipeline 與 buffer（卡片尺寸下約幾 MB），所以限制存活數量就夠了。
//
// ⚠️ MAX_ALIVE 要大於「一個畫面內看得到的卡片數」再加上預熱範圍內的那幾張
// （桌機 1440×900 一次看得到 8 張）。太小的話畫面上的卡片會互相回收，hover 時引擎還沒好。

const MAX_ALIVE = 12

// { lastUsed, near: boolean, isActive: () => boolean, evict: () => void }
const alive = []

export function useHoverPortraitPool () {
  function touch (entry) {
    entry.lastUsed = performance.now()
    if (!alive.includes(entry)) alive.push(entry)
    if (alive.length <= MAX_ALIVE) return

    const victim = alive
      .filter(e => e !== entry && !e.isActive())
      .sort((a, b) => (a.near - b.near) || (a.lastUsed - b.lastUsed))[0]
    if (victim) {
      release(victim)
      victim.evict()
    }
  }

  function release (entry) {
    const i = alive.indexOf(entry)
    if (i >= 0) alive.splice(i, 1)
  }

  return { touch, release }
}
