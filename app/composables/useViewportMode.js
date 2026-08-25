// 「電腦版才有一鏡到底」的斷點判斷（全 app 單例）。
//
// ─── 為什麼需要它 ──────────────────────────────────────────────────────────
// 首頁的粒子在桌機是「整頁一張 canvas、沿捲動連續變形」（HomeSameField）。那是
// 全程都在跑的 compute pass + 全螢幕 HDR render pass，在手機／平板上撐不住 ——
// 而且那些變形（收攏成 side.png、菌落場、faq 標本）在窄視窗的版面裡本來就看不到，
// 算了也是白算。
//
// 所以窄視窗改成「幾張各自獨立、而且只在自己那一區跑」的小 canvas：
//   · HomeSameMobileField      hero 的自由場，離場暫停、捲到票券區再醒回來
//   · HomeSameSpeakerPortrait  PL.III 觀景框裡的人像，只有換人時才有變化
//   · PL.II / PL.IV / PL.V     完全沒有 canvas（區塊底色改成不透明）
//
// ─── 斷點為什麼是 1024 ─────────────────────────────────────────────────────
// 專案現有的版面斷點全部寫在 Tailwind 的 lg（1024px）：講者三欄、hero 四角標本
// 標籤、about 的 Skills 觀察框、CommonChapterNav… 粒子的斷點跟版面對齊，才不會
// 出現「版面是桌機、canvas 是手機」的錯位。
//
// ⚠️ 這裡「不是」useParticleBudget 的 isMobile()（那個是 768，用途是決定 DPR 與
// 要不要開光暈，是純粹的填充率考量，兩者本來就該不同）。
//
// ─── SSR ───────────────────────────────────────────────────────────────────
// 伺服器端量不到視窗寬度，所以 isDesktop 在 SSR 期間一律 false、viewportReady 是
// false。呼叫端要把粒子那幾個元件包進 <ClientOnly>，用 viewportReady 當旗標 ——
// 不然 v-if 會在 hydration 時對不起來。canvas 本來就是 client-only 的東西
//（引擎在 onMounted 才建），包起來不影響 SEO 與首屏文字。

const DESKTOP_MIN_W = 1024

// 模組層級 ref = 全 app 單例。SSR 期間永遠是初始值（只有 client 程式碼會寫入），
// 所以不會有跨請求汙染。
const isDesktop = ref(false)
const viewportReady = ref(false)

let mql = null

function startWatching () {
  if (mql || typeof window === 'undefined') return
  mql = window.matchMedia(`(min-width: ${DESKTOP_MIN_W}px)`)
  isDesktop.value = mql.matches
  viewportReady.value = true
  // change 只在「跨過斷點」時發一次，不是每個 resize 都發 —— 不需要自己 debounce
  mql.addEventListener('change', (ev) => { isDesktop.value = ev.matches })
}

export function useViewportMode () {
  startWatching()
  return { isDesktop, viewportReady, DESKTOP_MIN_W }
}
