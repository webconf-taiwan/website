// 手機端粒子的「效能檔位」對照表。純資料，判斷邏輯在 useParticleQuality。
//（與 particleFieldLooks.js 同樣的「表與邏輯分離」慣例。）
//
// ─── 為什麼要分檔而不是一套參數 ────────────────────────────────────────────
// 手機的 GPU 差距比桌機大得多，而且在 web 上量不出來。有 WebGPU 的 iPhone 最舊是
// iPhone 11（A13），最新是 iPhone 17 —— GPU 差 5~8 倍，但 Safari 沒有 deviceMemory、
// 沒有 connection、UA 一律只回 "iPhone"，沒有任何 API 分得出來。
// 所以只能：保守起步 → 實際跑起來量 → 往下調。
//
// ─── 這張表怎麼算出來的 ────────────────────────────────────────────────────
// 成本模型與 useParticleBudget 檔頭同一條（那裡有原始實測數字）：
//
//     每幀候選對 ≈ N² × 搜尋窗面積 / canvas 面積
//     搜尋窗邊長 = (2·cellSubdivisions + 1) × max(8, rMax / cellSubdivisions)
//
// 也就是對 N 平方、對 rMax 平方、對 canvas 面積反比。
//
// ⚠️ 下面每一檔的「相對成本」欄位是用這條公式**推算**的，不是實機量測值。
// 借到一台舊 iPhone 之後（USB 接 Mac 的 Safari Web Inspector → Timelines，
// 各檔跑 60 秒），請把實測的 p50 幀時間補在這裡取代推算值。
// 完整的量測方法與取捨記錄在 docs/particle-performance.md。
//
// ─── ⚠️ 三個常被誤認為效能旋鈕、實際上完全不省算力的東西 ──────────────────
//   simSpeed   只是 dt 的乘數，每幀照跑全部 7 個 pass（particle-life-gpu.js:1403 起）
//   ambient    純 setTimeout 排程，每 1.2~18 秒發一次 disturb，沒有 per-frame 成本
//   pause 交錯 「隔一幀暫停」在 W > vsync 的卡頓區會讓 fps 更低而不是更高
//              （W=33ms 時：33 → 33+16.7=49.7ms，30fps 掉到 20fps）。別試。
// 真正有效的只有三個：count（∝N²）、rMax（∝rMax²）、DPR（只影響 render pass 6/7）。

export const TIER_COUNT = 4
export const TIER_FLOOR = 0

// ⚠️ 預設是「滿檔」而不是中間檔，這是刻意的：
// 目前只有 pre-flight（靠 navigator 訊號往下鎖），還沒有執行期量測。
// 若預設就給 t2，等於所有手機 —— 包括跑得很順的 —— 都被無條件降級，而且沒有任何
// 機制把它們升回來。所以現階段的契約跟 useParticleBudget 一樣：**只會減、不會加**，
// 有負面訊號才往下走，沒訊號就維持今天的行為。
// 等執行期量測（見 docs/particle-performance.md 階段 3）上線、能真的把降下去的
// 檔位判斷出來之後，這個值才應該改成 2 並配合開場的一次性升檔。
export const TIER_DEFAULT = TIER_COUNT - 1

/**
 * ⚠️ t0 不是「關掉粒子」。設計上明確要求最低檔也要留著粒子，寧可極稀。
 * 所以 t0 仍然有 2000+ 顆、仍然會動、仍然做換人的炸開重組 ——
 * 只是密度低、點大、更新慢。不 destroy、不換靜態圖。
 */
export const TIER_PROFILES = {
  // ── HomeSame/MobileField（滿版自由場）─────────────────────────────────
  // 基準是 biolum-drift @390×844（look.budget.density = 0.037 → 12179 顆）。
  // countScale 乘在 look 自己的 density 上，所以五組 look 的相對疏密關係保留。
  mobileField: [
    // t0 底檔 —— 沒有 WebGPU、或 deviceMemory ≤2
    {
      countScale: 0.18, rMaxScale: 0.65, pointScale: 1.70, opacityScale: 1.20,
      dprCap: 1.0, cellSub: 3, ambientGain: 0.35, driftMs: 5200,
      // N 2192 / rMax 47 → 相對 t3 約 2.8%（推算）
    },
    // t1 低檔 —— prefers-reduced-motion、saveData、deviceMemory ≤4
    {
      countScale: 0.32, rMaxScale: 0.80, pointScale: 1.35, opacityScale: 1.10,
      dprCap: 1.0, cellSub: 3, ambientGain: 0.60, driftMs: 3600,
      // N 3897 / rMax 58 → 相對 t3 約 14%（推算）
    },
    // t2 中檔 —— 目前沒有任何訊號會判到這一檔，留給執行期量測用
    {
      countScale: 0.50, rMaxScale: 1.00, pointScale: 1.15, opacityScale: 1.00,
      dprCap: 1.5, cellSub: 2, ambientGain: 1.0, driftMs: 2400,
      // N 6089 / rMax 72 → 相對 t3 約 51%（推算）
    },
    // t3 滿檔 —— ⚠️ 必須與現行線上完全相同，否則這個機制就不是「只會減」了。
    // countScale 0.70 就是原本寫在 MobileField.vue 的 MOBILE_COUNT_SCALE。
    {
      countScale: 0.70, rMaxScale: 1.00, pointScale: 1.00, opacityScale: 1.00,
      dprCap: 1.5, cellSub: 2, ambientGain: 1.0, driftMs: 2400,
      // N 8525 / rMax 72（推算候選對約 4.2 M）
    },
  ],

  // ── HomeSame/SpeakerPortrait（觀景區裡的人像）─────────────────────────
  // ⚠️ 這一區的效能「不從 density 買」。理由：
  //   成本 ∝ d²，但感知細節只 ∝ √d（點畫的解析度就是平均粒距 = 1/√d）。
  //   而這張人像在模擬空間只有約 294px，眼睛與眼鏡框只剩 10~19px 寬
  //  （見元件裡 SHIMMER_AMP 那段的實測），粒距必須 ≤ 3.7px 才有約 3 顆粒子
  //   橫跨一條眼鏡框。d = 0.075 → 粒距 3.65px，已經卡在那條線上。
  //   → 頂檔的效能是從 rMax 買的（55 → 30，視覺等價已實測，見 docs）。
  //
  // 低檔位才動 density，而且是有意識的降級順序：先保臉的輪廓與光影，
  // 最後才放棄五官。t0 的 3509 顆仍然是一張認得出來的人臉剪影，不是空白。
  //
  // ⚠️ samples 必須在第一次 PLImage.prepare() 之前定案且此後不變
  //   （「每張圖都要同一個取樣點數」，見元件檔頭）。這是 SpeakerPortrait 要
  //   await 到檔位定案才建引擎、而不是中途換檔的原因之一。
  speakerPortrait: [
    // t0：只剩臉的輪廓與大塊明暗，五官細節放棄。粒距 5.77px
    { density: 0.030, countMin: 2400, countMax: 5200, samples: 6000,
      rMax: 22, pointSize: 1.40, dprCap: 1.0, shimmerMs: 2000, shimmerAmp: 2.2 },
    // t1：粒距 4.71px，開始失去眼鏡框
    { density: 0.045, countMin: 3800, countMax: 8000, samples: 9000,
      rMax: 26, pointSize: 1.15, dprCap: 1.0, shimmerMs: 1400, shimmerAmp: 1.8 },
    // t2：粒距 4.02px，五官仍在
    { density: 0.062, countMin: 5200, countMax: 11000, samples: 12000,
      rMax: 30, pointSize: 1.00, dprCap: 1.5, shimmerMs: 1000, shimmerAmp: 1.5 },
    // t3：⚠️ 必須與現行線上完全相同
    { density: 0.075, countMin: 7000, countMax: 13000, samples: 16000,
      rMax: 30, pointSize: 0.90, dprCap: 1.5, shimmerMs: 1000, shimmerAmp: 1.5 },
  ],
}

// ⚠️ 沒有 WebGPU 時的硬上限。
//
// 這條跟檔位是兩件事，不能只靠 t0 的 countScale 解決 —— 因為那條路走的是完全
// 不同的引擎（particle-life.js），成本結構也完全不同：
//   · 空間雜湊與繪圖都在 JS 主執行緒上跑，canvas2d 逐顆 drawImage
//   · dpr 硬寫 min(devicePixelRatio, 2)，**完全不看我們傳的 maxDpr**（:122/:202）
//   · 它自己的預設 count 是 1400（GPU 版是 30000），那才是它被設計來跑的量級
// 而我們一直照樣傳 8000+ 顆進去。這不是「比較慢」，是量級錯誤。
//
// 1800 是「比它的預設稍寬、但仍在同一個量級」。⚠️ 需要實機驗證再調。
export const CPU_FALLBACK_MAX_COUNT = 1800

/**
 * 取某個 profile 在某一檔的旋鈕值。
 *
 * @param {'mobileField'|'speakerPortrait'} profile
 * @param {number} tier 0..3，超出範圍會被夾住
 * @returns {object|null}
 */
export function tierKnobs (profile, tier) {
  const table = TIER_PROFILES[profile]
  if (!table) return null

  const i = Math.max(0, Math.min(table.length - 1, tier | 0))

  return table[i]
}
