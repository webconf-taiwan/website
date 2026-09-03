// 粒子預算：依 canvas 的實際面積算點數，而不是各處寫死一組 magic number。
//
// ─── 為什麼不能寫死 ────────────────────────────────────────────────────────
// 引擎的力場計算是空間雜湊：每顆粒子掃自己周圍 (2·cellSubdivisions+1)² 個格子，
// 格子邊長是 max(8, rMax / cellSubdivisions) 模擬 px。所以每幀的候選對數大約是
//
//     N² × 搜尋窗面積 / canvas 面積
//
// —— 對 N 是「平方」，對 canvas 面積是「反比」。手機 canvas 的面積只有桌機的
// 1/4，同一個 N 密度就是 4 倍，每顆粒子要掃的鄰居也是 4 倍，總成本 4 倍。
// 「桌機用 52000、手機也用 52000」因此不是持平，是手機比桌機貴 4 倍。
//
// 實測（同一台 M 系列 Mac，只改視窗寬度，DPR 1）：
//   PL.IV/V 52000 顆 @1440×900 → 47M 候選 / 60fps
//   PL.IV/V 52000 顆 @390×844  → 185M 候選 / 13fps   ← 手機卡的就是這個
//
// ─── 改成固定「密度」 ──────────────────────────────────────────────────────
// 密度固定，每顆粒子要掃的鄰居數就固定，視覺上的疏密也固定 —— 兩邊同時對。
// density 的值就是各區塊「桌機 1440×900 下原本的點數 ÷ 面積」，所以桌機的行為
// 完全不變，只有比 1440×900 小的視窗會往下縮。
//
// ⚠️ max 一定要給，而且要等於原本那個桌機常數：沒有上限的話，2560×1440 的螢幕
// 會算出 148000 顆，反而把大螢幕搞爛。這個 helper 的契約是「只會減、不會加」。
//
// ⚠️ 引擎點數可以小於 PLImage 的取樣點數（SAMPLES），不用一起改：
// prepare() 是隨機重要性採樣，buildImageTargets 與 registerPattern 都用
// `i % spec.count` 取點，所以取前 N 個仍然是整張圖的均勻子集。
// 「同一個元件內每張圖的 SAMPLES 要一致」那條規則不受影響。

// HDR target 是 rgba16float，circle pass 與 compose pass 各要填一次全螢幕，
// 所以 DPR 的成本是平方的。手機 DPR 通常是 3，1.5 → 1.25 省 1.44 倍填充。
// ⚠️ 再往下壓到 1.0 會讓 pointSize < 1 的粒子核心變成次像素、開始閃爍，
// 要一起把 pointSize 加大才行 —— 目前先停在 1.25。
const DPR_DESKTOP = 1.5
const DPR_MOBILE = 1.25

// 與專案其他地方的手機判斷一致（Tailwind 的 md）
const MOBILE_MAX_W = 768

export function useParticleBudget () {
  function isMobile () {
    return typeof window !== 'undefined' && window.innerWidth < MOBILE_MAX_W
  }

  function maxDpr () {
    return isMobile() ? DPR_MOBILE : DPR_DESKTOP
  }

  /**
   * 依元素的實際 CSS 尺寸算點數。
   * @param {HTMLElement} el       通常就是那張 canvas（要先完成 layout）
   * @param {object} opts
   * @param {number} opts.density  目標密度（顆/CSS px²）= 桌機點數 ÷ 桌機面積
   * @param {number} opts.max      上限，填原本那個桌機常數
   * @param {number} opts.min      下限，避免極窄視窗把形狀稀釋到看不出來
   */
  function countFor (el, { density, max, min = 8000 }) {
    const rect = el?.getBoundingClientRect?.()
    const w = Math.round(rect?.width || 0)
    const h = Math.round(rect?.height || 0)
    // ⚠️ 量不到尺寸就退回 min，不要退回視窗大小。
    // 這裡以前是 `rect?.width || window.innerWidth` —— 方向反了，違反這個 helper
    // 自己的契約（「只會減、不會加」）。小 canvas 遇到佈局競態時會拿到「整個視窗」
    // 的預算再被 max 夾住，也就是拿到最壞情況：PL.III 的 342² 觀景區會算成
    // 390×844×0.075 = 24685 → 夾到 max 13000，是正確值 8772 的 1.48 倍點數
    // （成本 ∝ N²，等於 2.2 倍算力），而且完全靜默。
    // 退回 min 則最壞情況是「這一次開得比較稀」，下一次 resize 就會修正回來。
    if (!w || !h) return min
    return Math.max(min, Math.min(max, Math.round(w * h * density)))
  }

  return { isMobile, maxDpr, countFor }
}
