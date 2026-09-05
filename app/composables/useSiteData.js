/**
 * 前端取資料的唯一入口。
 *
 * 全站資料都是靜態的（app/constants/data/*.json）—— 主辦方確定不做後台，資料改了
 * 本來就要重新部署，那就直接 import 進 bundle：少一層 API、chunk 有 hash 可以長快取，
 * 也不會像走 /api 那樣每次 SSR 都把整份資料序列化進 HTML 的 payload 裡重送一遍。
 *
 * ⚠️ 每一份資料只有一個來源，就是 app/constants/data 底下那個檔。
 * 別再在 server 端放一份同名的 —— 兩邊會不同步，而且「改了沒生效」極難查。
 *
 * ⚠️ 分檔規則（跟 chunk 切分直接相關，別隨手改）：
 *   · 每頁都要的（global）→ 用「靜態 import」，跟著共用 chunk 走，全站只下載一次。
 *   · 單一頁面才要的（index / speakers / sponsors）→ 一律用「動態 import」。
 *     這一支被 Header/Footer 帶進每一頁，靜態 import 會把首頁資料打進共用 chunk，
 *     連 /about、/people 都得下載。動態 import 才會被 Vite 切成獨立 chunk。
 *
 * ⚠️ 欄位是底線命名（snake_case），這裡刻意不轉成小駝峰：
 * 多一層轉換就多一份要同步維護的對照表，欄位一改兩邊就會對不起來。
 * 元件裡直接用 data.code_of_conduct 這種寫法就是正確的。
 */
import globalData from '~/constants/data/global.json'

// json 被改壞、少掉一整段時的骨架，讓元件不用到處寫 ?. 判斷
const GLOBAL_FALLBACK = {
  header: { logo: {}, nav_items: [] },
  footer: { logo: {}, paragraphs: [], menu_groups: [] }
}

const HOME_FALLBACK = {
  hero: {},
  about: {},
  speaker: { items: [] },
  venue: {},
  faq: { items: [] },
  ticket: { items: [] },
  sponsor: { items: [] },
  code_of_conduct: {}
}

// 講者、贊助商是「名單」，不是首頁專屬的文案：名單本身放整份，
// 首頁只挑 show_on_home 的出來。要把某一位／某一家從首頁收起來就改那個值，
// 不用把整筆資料剪下來另存一份（剪一剪就會有兩份名單對不起來）。
const onHome = (items = []) => items.filter(item => item.show_on_home)

/**
 * header / footer 資料。每頁都會用到。
 *
 * ⚠️ 回傳的是普通物件，不是 ref／computed —— 資料在 build 時就固定了，包一層
 * 反應式沒有任何東西會去更新它，只是讓每個用到的地方都要多寫 .value。
 * 元件端也不用 await（await 會讓 setup 變 async、多一層 Suspense）。
 */
export const useGlobalData = () => ({ ...GLOBAL_FALLBACK, ...globalData })

/**
 * 首頁各區塊資料。
 *
 * 版面文案在 index.json；講者、贊助商、FAQ 各自獨立成一份清單，在這裡併回
 * speaker.items / sponsor.items / faq.items，所以元件拿到的形狀跟以前完全一樣。
 */
export const useHomeData = async () => {
  const [index, speakers, sponsors, faq] = await Promise.all([
    import('~/constants/data/index.json'),
    import('~/constants/data/speakers.json'),
    import('~/constants/data/sponsors.json'),
    import('~/constants/data/faq.json')
  ])

  // 同樣回傳普通物件（見 useGlobalData）。async 是因為要等動態 import，不是因為資料會變。
  return {
    ...HOME_FALLBACK,
    ...index.default,
    speaker: { ...index.default.speaker, items: onHome(speakers.default.items) },
    sponsor: { items: onHome(sponsors.default.items) },
    faq: { ...index.default.faq, items: faq.default.items }
  }
}
